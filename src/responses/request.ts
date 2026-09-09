import * as vscode from "vscode";

export interface ResponsesRequest { model:string; stream:true; input:unknown[]; tools?:unknown[]; tool_choice?:"auto"|"required" }

// encodeRequest preserves the Responses item grammar: messages carry only
// message parts, while calls and results remain top-level history items.
export function encodeRequest(model:string,messages:readonly vscode.LanguageModelChatRequestMessage[],options:vscode.ProvideLanguageModelChatResponseOptions):ResponsesRequest {
  const input:unknown[]=[];
  for(const message of messages) {
    if(message.name!==undefined)throw new Error(vscode.l10n.t("Named VS Code messages are not supported."));
    let content:unknown[]=[];
    const flush=()=>{if(content.length){input.push({type:"message",role:role(message.role),content});content=[];}};
    for(const part of message.content) {
      if(part instanceof vscode.LanguageModelTextPart) content.push({type:message.role===vscode.LanguageModelChatMessageRole.Assistant?"output_text":"input_text",text:part.value});
      else if(part instanceof vscode.LanguageModelDataPart) content.push(encodeData(part));
      else if(part instanceof vscode.LanguageModelToolCallPart){flush();input.push({type:"function_call",call_id:part.callId,name:part.name,arguments:JSON.stringify(part.input)});}
      else if(part instanceof vscode.LanguageModelToolResultPart){flush();input.push({type:"function_call_output",call_id:part.callId,output:toolOutput(part)});}
      else throw new Error(vscode.l10n.t("Unsupported VS Code language-model part: {0}.",Object.prototype.toString.call(part)));
    }
    flush();
  }
  const tools=options.tools?.map(tool=>({type:"function",name:tool.name,description:tool.description,parameters:tool.inputSchema??{type:"object",properties:{}}}));
  const result:ResponsesRequest={model,stream:true,input};
  if(tools?.length) result.tools=tools;
  if(options.toolMode===vscode.LanguageModelChatToolMode.Required){if(!tools?.length)throw new Error(vscode.l10n.t("Required tool mode requires at least one declared tool."));result.tool_choice="required";} else if(tools?.length) result.tool_choice="auto";
  return result;
}
function role(value:vscode.LanguageModelChatMessageRole):"user"|"assistant" { if(value===vscode.LanguageModelChatMessageRole.User)return "user";if(value===vscode.LanguageModelChatMessageRole.Assistant)return "assistant";throw new Error(vscode.l10n.t("Unsupported VS Code message role.")); }
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
