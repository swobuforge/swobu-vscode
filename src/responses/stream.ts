import * as vscode from "vscode";
interface Event { type?:string; output_index?:number; delta?:string; item?:{type?:string;call_id?:string;name?:string;arguments?:string}; response?:{id?:string;error?:{message?:string}}; error?:{message?:string} }
interface PendingCall { callId:string; name:string; arguments:string }

// consumeSSE retains one UTF-8 decoder across byte chunks and keys progressive
// tool state by Responses output_index so parallel calls cannot cross-wire.
export async function consumeSSE(body:ReadableStream<Uint8Array>,progress:vscode.Progress<vscode.LanguageModelResponsePart>,modelId?:string):Promise<void> {
  const reader=body.getReader(),decoder=new TextDecoder();let buffer="",event="",data:string[]=[];const calls=new Map<number,PendingCall>();
  const dispatch=()=>{if(!data.length){event="";return;}const raw=data.join("\n");data=[];let value:Event;try{value=JSON.parse(raw) as Event;}catch{throw new Error(vscode.l10n.t("Swobu returned malformed streaming JSON."));}const type=value.type??event;event="";
    if(type==="response.created"&&modelId&&value.response?.id)progress.report(new vscode.LanguageModelDataPart(Buffer.from(`${modelId}\\${value.response.id}`),"stateful_marker"));
    else if(type==="response.output_text.delta"&&typeof value.delta==="string") progress.report(new vscode.LanguageModelTextPart(value.delta));
    else if(type==="response.output_item.added"&&value.item?.type==="function_call"){const index=requireIndex(value);if(!value.item.call_id)throw new Error(vscode.l10n.t("Function call is missing its call ID."));calls.set(index,{callId:value.item.call_id,name:value.item.name??"",arguments:value.item.arguments??""});}
    else if(type==="response.function_call_arguments.delta"&&typeof value.delta==="string"){const call=calls.get(requireIndex(value));if(!call)throw new Error(vscode.l10n.t("Tool arguments arrived before their function call."));call.arguments+=value.delta;}
    else if(type==="response.output_item.done"&&value.item?.type==="function_call"){const index=requireIndex(value),call=calls.get(index);if(!call)throw new Error(vscode.l10n.t("Completed function call has no streaming state."));const name=value.item.name??call.name;if(!name)throw new Error(vscode.l10n.t("Function call is missing its name."));const args=value.item.arguments ?? (call.arguments || "{}");let parsed:unknown;try{parsed=JSON.parse(args);}catch{throw new Error(vscode.l10n.t("Function call arguments must be a JSON object."));}if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error(vscode.l10n.t("Function call arguments must be a JSON object."));progress.report(new vscode.LanguageModelToolCallPart(value.item.call_id??call.callId,name,parsed));calls.delete(index);}
    else if((type==="response.output_item.added"||type==="response.output_item.done")&&value.item?.type==="reasoning"){/* Reasoning state is opaque continuation context, not visible answer text. */}
    else if((type==="response.output_item.added"||type==="response.output_item.done")&&value.item?.type&&value.item.type!=="message")throw new Error(vscode.l10n.t("Unsupported streamed output item: {0}.",value.item.type));
    else if(type==="error"||type==="response.failed") throw new Error(value.error?.message??value.response?.error?.message??vscode.l10n.t("Swobu request failed."));
  };
  const consumeLines=()=>{let i;while((i=buffer.indexOf("\n"))>=0){const line=buffer.slice(0,i).replace(/\r$/,"");buffer=buffer.slice(i+1);if(!line){dispatch();continue;}if(line.startsWith("event:"))event=line.slice(6).trim();else if(line.startsWith("data:"))data.push(line.slice(5).trimStart());}};
  while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});consumeLines();}buffer+=decoder.decode();consumeLines();dispatch();
}
function requireIndex(value:Event):number { if(!Number.isInteger(value.output_index))throw new Error(vscode.l10n.t("Streaming tool event is missing its output index."));return value.output_index!; }
