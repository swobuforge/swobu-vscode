import * as vscode from "vscode";

export interface ResponsesRequest { model:string; stream:true; input:unknown[]; previous_response_id?:string; tools?:unknown[]; tool_choice?:"auto"|"required" }

// encodeRequest preserves the Responses item grammar: messages carry only
// message parts, while calls and results remain top-level history items.
export function encodeRequest(modelId:string,route:string,messages:readonly vscode.LanguageModelChatRequestMessage[],options:vscode.ProvideLanguageModelChatResponseOptions):ResponsesRequest {
  const input:unknown[]=[];
  const continuation=findContinuation(messages,modelId);
  for(const message of messages.slice(continuation?.messageIndex===undefined?0:continuation.messageIndex+1)) {
    // VS Code's Agent bridge assigns an empty name to user-role tool-result
    // messages. It is a role-conversion sentinel, not participant identity.
    if(message.name!==undefined&&message.name!=="")throw new Error(vscode.l10n.t("Named VS Code messages are not supported."));
    let content:unknown[]=[];
    const messageRole=role(message.role);
    const flush=()=>{if(content.length){input.push({type:"message",role:messageRole,content});content=[];}};
    for(const part of message.content) {
      if(part instanceof vscode.LanguageModelTextPart) content.push({type:messageRole==="assistant"?"output_text":"input_text",text:part.value});
      else if(part instanceof vscode.LanguageModelDataPart&&part.mimeType==="stateful_marker"){/* Opaque state owned by a different selected model is not prompt content. */}
      else if(part instanceof vscode.LanguageModelDataPart) content.push(encodeData(part));
      else if(part instanceof vscode.LanguageModelToolCallPart){flush();input.push({type:"function_call",call_id:part.callId,name:part.name,arguments:JSON.stringify(part.input)});}
      else if(part instanceof vscode.LanguageModelToolResultPart){flush();input.push({type:"function_call_output",call_id:part.callId,output:toolOutput(part)});}
      else throw new Error(vscode.l10n.t("Unsupported VS Code language-model part: {0}.",Object.prototype.toString.call(part)));
    }
    flush();
  }
  const tools=options.tools?.map(tool=>({type:"function",name:tool.name,description:tool.description,parameters:tool.inputSchema??{type:"object",properties:{}}}));
  const result:ResponsesRequest={model:route,stream:true,input};
  if(continuation)result.previous_response_id=continuation.responseId;
  if(tools?.length) result.tools=tools;
  if(options.toolMode===vscode.LanguageModelChatToolMode.Required){if(!tools?.length)throw new Error(vscode.l10n.t("Required tool mode requires at least one declared tool."));result.tool_choice="required";} else if(tools?.length) result.tool_choice="auto";
  return result;
}
interface Continuation { messageIndex:number; responseId:string }

// VS Code retains opaque provider state inside the assistant response that
// produced it, alongside that response's text, thinking, and tool calls. The
// response itself is already owned by previous_response_id, so only history
// after the newest matching marker may be sent again.
function findContinuation(messages:readonly vscode.LanguageModelChatRequestMessage[],modelId:string):Continuation|undefined {
  for(let messageIndex=messages.length-1;messageIndex>=0;messageIndex--){
    const message=messages[messageIndex]!;
    for(const part of message.content){
      if(!(part instanceof vscode.LanguageModelDataPart)||part.mimeType!=="stateful_marker")continue;
      if(message.role!==vscode.LanguageModelChatMessageRole.Assistant)throw new Error(vscode.l10n.t("Invalid VS Code stateful marker."));
      const marker=decodeStatefulMarker(part);
      if(marker.modelId===modelId)return{messageIndex,responseId:marker.responseId};
    }
  }
  return undefined;
}
function decodeStatefulMarker(part:vscode.LanguageModelDataPart):{modelId:string;responseId:string} {const marker=Buffer.from(part.data).toString("utf8"),separator=marker.indexOf("\\");if(separator<1||!marker.slice(separator+1))throw new Error(vscode.l10n.t("Invalid VS Code stateful marker."));return{modelId:marker.slice(0,separator),responseId:marker.slice(separator+1)};}
function role(value:vscode.LanguageModelChatMessageRole):"user"|"assistant"|"system" { if(value===vscode.LanguageModelChatMessageRole.User)return "user";if(value===vscode.LanguageModelChatMessageRole.Assistant)return "assistant";if(value===3)return "system";throw new Error(vscode.l10n.t("Unsupported VS Code message role.")); }
function encodeData(part:vscode.LanguageModelDataPart):unknown { if(!["image/png","image/jpeg","image/webp"].includes(part.mimeType))throw new Error(vscode.l10n.t("Unsupported data part: {0}.",part.mimeType));return {type:"input_image",image_url:`data:${part.mimeType};base64,${Buffer.from(part.data).toString("base64")}`}; }
// Tool results use the same ordered Responses content grammar as user input.
// Concatenation would erase text boundaries and cannot represent screenshots.
function toolOutput(part:vscode.LanguageModelToolResultPart):unknown[] {
  return part.content.map(value=>{
    if(value instanceof vscode.LanguageModelTextPart)return {type:"input_text",text:value.value};
    if(value instanceof vscode.LanguageModelDataPart)return encodeData(value);
    throw new Error(vscode.l10n.t("Unsupported tool result part."));
  });
}
