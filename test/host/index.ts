import { prepareRuntimeFixture,startRealRuntime } from "./runtime.js";
import * as assert from "node:assert/strict";
import * as vscode from "vscode";
import { createServer } from "node:http";

export async function run():Promise<void>{
 const server=createServer((req,res)=>{
  res.setHeader("content-type","application/json");
  if(req.url==="/_swobu/status")res.end(JSON.stringify({state:"healthy",control_plane_protocol:9,swobu_version:"2.0.0"}));
  else if(req.url==="/_swobu/workspaces")res.end(JSON.stringify([{slug:"fixture",default_route:"code",route_count:1}]));
  else if(req.url==="/_swobu/workspaces/fixture")res.end(JSON.stringify({slug:"fixture",default_route:"code",routes:[{name:"code"}]}));
  else if(req.url==="/c/fixture/v1/responses"){
   res.setHeader("content-type","text/event-stream");
   res.end('data: {"type":"response.output_text.delta","delta":"Hello 世界"}\n\ndata: {"type":"response.completed"}\n\n');
  }else{res.statusCode=404;res.end("{}");}
 });
 await new Promise<void>(resolve=>server.listen(0,"127.0.0.1",resolve));
 const address=server.address();assert.ok(address&&typeof address!=="string");
 const extensionStarts=process.env.SWOBU_TEST_RUNTIME_MODE==="extension-start";
 const prepared=process.env.SWOBU_TEST_BINARY&&extensionStarts?await prepareRuntimeFixture(process.env.SWOBU_TEST_BINARY,"extension"):undefined;
 const real=process.env.SWOBU_TEST_BINARY&&!extensionStarts?await startRealRuntime(process.env.SWOBU_TEST_BINARY):undefined;
 const config=vscode.workspace.getConfiguration("swobu");
 await config.update("endpoint",prepared?.endpoint??real?.endpoint??`http://127.0.0.1:${address.port}`,vscode.ConfigurationTarget.Global);
 await config.update("modelOverrides",{"fixture/code":{imageInput:true,maxInputTokens:65536}},vscode.ConfigurationTarget.Global);
 if(prepared)await config.update("executable",prepared.executable,vscode.ConfigurationTarget.Global);
 try{
  const extension=vscode.extensions.getExtension("swobu.swobu");assert.ok(extension,"installed extension identity");await extension.activate();
  const commands=await vscode.commands.getCommands();assert.ok(commands.includes("swobu.configureModel"));
  assert.ok(commands.includes("workbench.action.chat.manage"),"native model-management command exists");
  const population=prepared?.populate();
  let models=await vscode.lm.selectChatModels({vendor:"swobu"});
  await population;
  if(prepared){await vscode.commands.executeCommand("swobu.refreshModels");models=await vscode.lm.selectChatModels({vendor:"swobu"});}
  const model=models.find(model=>model.id.includes("fixture/code"));assert.ok(model,"route discovered through real provider registration");
  assert.equal(model.maxInputTokens,65536,"machine-scoped context override refreshes registered model metadata");
  if(real||prepared){
   const user=vscode.LanguageModelChatMessage.User("Read both files");
   const tools=[{name:"read_file",description:"Read a file",inputSchema:{type:"object",properties:{path:{type:"string"}},required:["path"]}}];
   const first=await model.sendRequest([user],{tools,toolMode:vscode.LanguageModelChatToolMode.Required});
   const calls:vscode.LanguageModelToolCallPart[]=[];for await(const part of first.stream)if(part instanceof vscode.LanguageModelToolCallPart)calls.push(part);
   assert.equal(calls.length,2);
   const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=","base64");
   const results=calls.map((call,index)=>new vscode.LanguageModelToolResultPart(call.callId,index===0?[new vscode.LanguageModelTextPart("before"),vscode.LanguageModelDataPart.image(png,"image/png"),new vscode.LanguageModelTextPart("after")]:[new vscode.LanguageModelTextPart("file contents")]));
   const second=await model.sendRequest([user,vscode.LanguageModelChatMessage.Assistant(calls),vscode.LanguageModelChatMessage.User(results)]);
   let text="";for await(const chunk of second.text)text+=chunk;assert.equal(text,"Done 世界 🙂");
   const cancellation=new vscode.CancellationTokenSource();
   const held=await model.sendRequest([vscode.LanguageModelChatMessage.User("Cancel this request")],{},cancellation.token);
   const pending=(async()=>{const stream=held.stream[Symbol.asyncIterator]();while(!(await stream.next()).done){/* consume until cancellation */}})();
   await (real??prepared)!.waitForCancellationStart();cancellation.cancel();
   await assert.rejects(pending,error=>error instanceof vscode.CancellationError||error instanceof Error&&error.name==="AbortError");
   await (real??prepared)!.waitForCancellation();cancellation.dispose();
   const evidence=await fetch(`${(real??prepared)!.endpoint}/_swobu/status-projection?scope=all`);
   const projection=await evidence.json() as {recent_traffic:Array<{client_handler?:string;client_family:string;client_protocol:string;status_code:number;fallback_recovered:boolean;token_usage?:{input_tokens:number}}>};
   assert.ok(projection.recent_traffic.some(row=>row.client_handler?.startsWith("swobu-vscode/")&&row.client_protocol==="responses"&&row.status_code===200&&row.fallback_recovered&&!!row.token_usage),"canonical client identity, fallback and usage evidence");
  }else{
   const response=await model.sendRequest([vscode.LanguageModelChatMessage.User("Hello")]);
   let text="";for await(const chunk of response.text)text+=chunk;assert.equal(text,"Hello 世界");
  }
 }finally{await real?.close();await prepared?.close();await config.update("endpoint",undefined,vscode.ConfigurationTarget.Global);await config.update("executable",undefined,vscode.ConfigurationTarget.Global);await config.update("modelOverrides",undefined,vscode.ConfigurationTarget.Global);await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
}
