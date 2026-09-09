import assert from "node:assert/strict";import test from "node:test";import * as vscode from "vscode";import {SwobuProvider} from "../src/provider.js";
const model={id:"work/code",name:"code",family:"swobu",version:"1",maxInputTokens:32768,maxOutputTokens:4096,capabilities:{toolCalling:true,imageInput:false},workspace:"work",route:"code"};
test("cancellation aborts the one in-flight Responses request",async()=>{const original=globalThis.fetch;let cancel=()=>{};let requestSignal:AbortSignal|undefined;let calls=0;globalThis.fetch=async(_input,init)=>{calls++;if(calls===1)return new Response(JSON.stringify({state:"healthy",control_plane_protocol:9,swobu_version:"2.0.0"}),{status:200});requestSignal=init?.signal as AbortSignal;return new Promise<Response>((_resolve,reject)=>requestSignal!.addEventListener("abort",()=>reject(new DOMException("aborted","AbortError")),{once:true}));};const token={get isCancellationRequested(){return false;},onCancellationRequested(listener:()=>void){cancel=listener;return{dispose(){}};}} as vscode.CancellationToken;const provider=new SwobuProvider({extension:{packageJSON:{version:"0.1.0"}}} as vscode.ExtensionContext);const pending=provider.provideLanguageModelChatResponse(model,[],{toolMode:vscode.LanguageModelChatToolMode.Auto},{report(){}},token);await new Promise(resolve=>setTimeout(resolve,0));cancel();await assert.rejects(pending,error=>error instanceof DOMException&&error.name==="AbortError");assert.equal(requestSignal?.aborted,true);globalThis.fetch=original;provider.dispose();});

test("already-cancelled request never probes or submits to Swobu",async()=>{const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>{calls++;throw new Error("unexpected request");};const token={isCancellationRequested:true,onCancellationRequested(){return{dispose(){}};}} as vscode.CancellationToken;const provider=new SwobuProvider({extension:{packageJSON:{version:"0.1.0"}}} as vscode.ExtensionContext);try{await assert.rejects(provider.provideLanguageModelChatResponse(model,[],{toolMode:vscode.LanguageModelChatToolMode.Auto},{report(){}},token),error=>error instanceof vscode.CancellationError);assert.equal(calls,0);}finally{globalThis.fetch=original;provider.dispose();}});

test("image-enabled provider submits ordered tool result once without extension retries",async()=>{
 const original=globalThis.fetch;const bodies:unknown[]=[];
 globalThis.fetch=async(_input,init)=>{
  if(init?.method!=="POST")return new Response(JSON.stringify({state:"healthy",control_plane_protocol:9,swobu_version:"2.0.0"}));
  bodies.push(JSON.parse(String(init.body)));
  return new Response('data: {"type":"response.output_text.delta","delta":"done"}\n\ndata: {"type":"response.completed"}\n\n');
 };
 const provider=new SwobuProvider({extension:{packageJSON:{version:"0.1.0"}}} as vscode.ExtensionContext);
 const token={isCancellationRequested:false,onCancellationRequested(){return{dispose(){}};}} as vscode.CancellationToken;
 try {
  const output:vscode.LanguageModelResponsePart[]=[];
  await provider.provideLanguageModelChatResponse({...model,capabilities:{toolCalling:true,imageInput:true}},[
   {role:vscode.LanguageModelChatMessageRole.User,name:undefined,content:[new vscode.LanguageModelToolResultPart("screen",[new vscode.LanguageModelTextPart("before"),vscode.LanguageModelDataPart.image(Uint8Array.of(1,2,3),"image/png"),new vscode.LanguageModelTextPart("after")])]}
  ],{toolMode:vscode.LanguageModelChatToolMode.Auto},{report:part=>output.push(part)},token);
  assert.equal(bodies.length,1);
  assert.deepEqual((bodies[0] as {input:unknown[]}).input,[{type:"function_call_output",call_id:"screen",output:[{type:"input_text",text:"before"},{type:"input_image",image_url:"data:image/png;base64,AQID"},{type:"input_text",text:"after"}]}]);
  assert.equal((output[0] as vscode.LanguageModelTextPart).value,"done");
 }finally{globalThis.fetch=original;provider.dispose();}
});

test("provider does not retry backend failure",async()=>{
 const original=globalThis.fetch;let posts=0;
 globalThis.fetch=async(_input,init)=>{if(init?.method!=="POST")return new Response(JSON.stringify({state:"healthy",control_plane_protocol:9,swobu_version:"2.0.0"}));posts++;return new Response("unavailable",{status:503});};
 const provider=new SwobuProvider({extension:{packageJSON:{version:"0.1.0"}}} as vscode.ExtensionContext);
 const token={isCancellationRequested:false,onCancellationRequested(){return{dispose(){}};}} as vscode.CancellationToken;
 try{await assert.rejects(provider.provideLanguageModelChatResponse(model,[],{toolMode:vscode.LanguageModelChatToolMode.Auto},{report(){}},token));assert.equal(posts,1);}finally{globalThis.fetch=original;provider.dispose();}
});
