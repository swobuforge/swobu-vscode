import * as vscode from "vscode";
interface Event { type?:string; delta?:string; item?:{type?:string;call_id?:string;name?:string;arguments?:string}; response?:{error?:{message?:string}}; error?:{message?:string} }
export async function consumeSSE(body:ReadableStream<Uint8Array>,progress:vscode.Progress<vscode.LanguageModelResponsePart>):Promise<void>{
 const reader=body.getReader(); let buffer="", event="", data:string[]=[]; const calls=new Map<string,{name:string,args:string}>();
 const dispatch=()=>{ if(!data.length){event="";return;} const raw=data.join("\n"); data=[]; let value:Event; try{value=JSON.parse(raw) as Event;}catch{throw new Error("Swobu returned malformed SSE JSON");} const type=value.type??event; event="";
  if(type==="response.output_text.delta"&&typeof value.delta==="string")progress.report(new vscode.LanguageModelTextPart(value.delta));
  else if(type==="response.output_item.added"&&value.item?.type==="function_call"&&value.item.call_id)calls.set(value.item.call_id,{name:value.item.name??"",args:value.item.arguments??""});
  else if(type==="response.function_call_arguments.delta"&&typeof value.delta==="string"){const last=[...calls.keys()].at(-1);if(!last)throw new Error("Tool argument delta arrived before its call");calls.get(last)!.args+=value.delta;}
  else if(type==="response.output_item.done"&&value.item?.type==="function_call"&&value.item.call_id){const call=calls.get(value.item.call_id)??{name:value.item.name??"",args:value.item.arguments??"{}"}; progress.report(new vscode.LanguageModelToolCallPart(value.item.call_id,call.name,JSON.parse(value.item.arguments ?? (call.args || "{}")) as object));calls.delete(value.item.call_id);}
  else if(type==="error"||type==="response.failed")throw new Error(value.error?.message??value.response?.error?.message??"Swobu request failed");
 };
 while(true){const {done,value}=await reader.read();if(done)break;buffer+=new TextDecoder().decode(value,{stream:true});let i;while((i=buffer.indexOf("\n"))>=0){const line=buffer.slice(0,i).replace(/\r$/,"");buffer=buffer.slice(i+1);if(!line){dispatch();continue;}if(line.startsWith("event:"))event=line.slice(6).trim();else if(line.startsWith("data:"))data.push(line.slice(5).trimStart());}} dispatch();
}
