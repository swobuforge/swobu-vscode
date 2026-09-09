import * as assert from "node:assert/strict";
import {createServer} from "node:http";
import {spawn,spawnSync} from "node:child_process";
import {mkdtemp,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";

// Development proof may opt into a local binary; release proof must pass the
// inspected installed binary path. Neither path is downloaded at runtime.
export interface RunningRuntimeFixture {endpoint:string;close:()=>Promise<void>;waitForCancellationStart:()=>Promise<void>;waitForCancellation:()=>Promise<void>}
export interface ExtensionRuntimeFixture extends RunningRuntimeFixture {executable:string;populate:()=>Promise<RunningRuntimeFixture>}
export function prepareRuntimeFixture(binary:string,start:"extension"):Promise<ExtensionRuntimeFixture>;
export function prepareRuntimeFixture(binary:string,start?:"harness"):Promise<RunningRuntimeFixture>;
export async function prepareRuntimeFixture(binary:string,start:"harness"|"extension"="harness"){
 let cancellationStarted!:()=>void,cancellationObserved!:()=>void;
 const started=new Promise<void>(resolve=>{cancellationStarted=resolve;}),cancelled=new Promise<void>(resolve=>{cancellationObserved=resolve;});
 const upstream=createServer(async(req,res)=>{
  if(req.url?.startsWith("/fail")){res.statusCode=503;res.end(JSON.stringify({error:{message:"fixture unavailable",type:"server_error"}}));return;}
  let body="";for await(const chunk of req)body+=chunk;
  const request=JSON.parse(body) as {input:Array<{type:string;output?:unknown}>;tools?:Array<{name:string}>};
  const toolName=request.tools?.[0]?.name??"read_file";
  const second=Array.isArray(request.input)&&request.input.some(item=>item.type==="function_call_output");
  res.setHeader("content-type","text/event-stream");
  let sequence=0;
  const send=(event:Record<string,unknown>)=>res.write(`event: ${event.type}\ndata: ${JSON.stringify({...event,sequence_number:sequence++})}\n\n`);
  const response={id:second?"resp_2":"resp_1",object:"response",created_at:1,model:"fixture",status:"in_progress",output:[]};
  send({type:"response.created",response});
  if(JSON.stringify(request.input).includes("Cancel this request")){
   cancellationStarted();
   res.on("close",cancellationObserved);
   return;
  }
  if(!second){
   for(let i=0;i<2;i++)send({type:"response.output_item.added",output_index:i,item:{type:"function_call",id:`fc_${i}`,call_id:`call_${i}`,name:toolName,arguments:"",status:"in_progress"}});
   for(let i=0;i<2;i++)send({type:"response.function_call_arguments.delta",output_index:i,item_id:`fc_${i}`,delta:JSON.stringify({path:`file${i}.txt`})});
   const output=[0,1].map(i=>({type:"function_call",id:`fc_${i}`,call_id:`call_${i}`,name:toolName,arguments:JSON.stringify({path:`file${i}.txt`}),status:"completed"}));
   for(let i=0;i<2;i++){send({type:"response.function_call_arguments.done",output_index:i,item_id:`fc_${i}`,arguments:output[i]!.arguments});send({type:"response.output_item.done",output_index:i,item:output[i]});}
   send({type:"response.completed",response:{...response,status:"completed",output,usage:{input_tokens:10,output_tokens:5,total_tokens:15}}});
  }else{
   const result=request.input.find(item=>item.type==="function_call_output")?.output;
   assert.deepEqual(result,[{type:"input_text",text:"before"},{type:"input_image",image_url:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="},{type:"input_text",text:"after"}],"real Swobu preserves ordered image tool result");
   const item={type:"message",id:"msg_2",role:"assistant",status:"in_progress",content:[]};
   send({type:"response.output_item.added",output_index:0,item});
   send({type:"response.content_part.added",output_index:0,item_id:"msg_2",content_index:0,part:{type:"output_text",text:"",annotations:[]}});
   send({type:"response.output_text.delta",output_index:0,item_id:"msg_2",content_index:0,delta:"Done 世界 🙂"});
   const part={type:"output_text",text:"Done 世界 🙂",annotations:[]};
   send({type:"response.output_text.done",output_index:0,item_id:"msg_2",content_index:0,text:part.text});
   send({type:"response.content_part.done",output_index:0,item_id:"msg_2",content_index:0,part});
   const output=[{...item,status:"completed",content:[part]}];send({type:"response.output_item.done",output_index:0,item:output[0]});
   send({type:"response.completed",response:{...response,status:"completed",output,usage:{input_tokens:20,output_tokens:5,total_tokens:25}}});
  }
  res.end();
 });
 await new Promise<void>(resolve=>upstream.listen(0,"127.0.0.1",resolve));
 const upstreamAddress=upstream.address();assert.ok(upstreamAddress&&typeof upstreamAddress!=="string");
 const reserve=createServer();await new Promise<void>(resolve=>reserve.listen(0,"127.0.0.1",resolve));const address=reserve.address();assert.ok(address&&typeof address!=="string");await new Promise<void>(resolve=>reserve.close(()=>resolve()));
 const endpoint=`http://127.0.0.1:${address.port}`,inheritedHome=start==="extension"?process.env.SWOBU_TEST_RUNTIME_HOME:undefined;
 if(start==="extension")assert.ok(inheritedHome,"extension-start fixture requires outer-runner isolation");
 const home=inheritedHome??await mkdtemp(join(tmpdir(),"swobu-host-")),ownsHome=!inheritedHome;
 const child=start==="harness"?spawn(binary,["daemon","--addr",`127.0.0.1:${address.port}`],{env:{...process.env,SWOBU_HOME:home,SWOBU_CONFIG_PATH:join(home,"swobu.yaml"),SWOBU_TELEMETRY:"0"},stdio:["ignore","pipe","pipe"]}):undefined;
 child?.stderr?.on("data",data=>console.error("fixture daemon:",String(data)));
 const wait=(proof:Promise<void>,name:string)=>Promise.race([proof,new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error(`${name} timeout`)),5_000))]);
 const fixtureProof={waitForCancellationStart:()=>wait(started,"cancellation start"),waitForCancellation:()=>wait(cancelled,"cancellation observation")};
 const close=async()=>{if(child){const exited=new Promise<void>(resolve=>child.once("exit",()=>resolve()));child.kill();await exited;}else spawnSync(binary,["daemon","down","--addr",`127.0.0.1:${address.port}`],{stdio:"ignore",shell:false});await new Promise<void>(resolve=>upstream.close(()=>resolve()));if(ownsHome)await rm(home,{recursive:true,force:true});};
 const populate=async()=>{
 try{
  let ready=false;for(let i=0;i<100;i++){try{const response=await fetch(`${endpoint}/_swobu/status`);if(response.ok){ready=true;break;}}catch{/* readiness retry */}await new Promise(resolve=>setTimeout(resolve,100));}
  assert.ok(ready,"real daemon readiness");
  const created=await fetch(`${endpoint}/_swobu/workspaces`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({slug:"fixture",initial_route:"code",target:{id:"fixture",model:"fixture",protocol:"responses_stream",connection:{custom:{base_url:`http://127.0.0.1:${upstreamAddress.port}`}}}})});
  assert.equal(created.status,201,await created.text());
  const target=(id:string,suffix:string)=>({id,model:"fixture",protocol:"responses_stream",connection:{custom:{base_url:`http://127.0.0.1:${upstreamAddress.port}${suffix}`}}});
  const route=await fetch(`${endpoint}/_swobu/workspaces/fixture/routes/code`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({tiers:[{targets:[target("unavailable","/fail")]},{targets:[target("fixture","")]}]})});
  assert.equal(route.status,200,await route.text());
  return{endpoint,close,...fixtureProof};
 }catch(error){await close();throw error;}
 };
 if(start==="harness")return populate();
 return{endpoint,executable:binary,populate,close,...fixtureProof};
}

export async function startRealRuntime(binary:string){return prepareRuntimeFixture(binary,"harness");}
