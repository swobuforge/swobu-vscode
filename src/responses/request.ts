import * as vscode from "vscode";
export interface ResponsesRequest { model:string; stream:true; input: unknown[]; tools?: unknown[]; tool_choice?: "auto"|"required" }
export function encodeRequest(model:string,messages:readonly vscode.LanguageModelChatRequestMessage[],options:vscode.ProvideLanguageModelChatResponseOptions):ResponsesRequest{
 const input=messages.map(message=>({role:role(message.role),content:message.content.map(encodePart)}));
 const tools=options.tools?.map(tool=>({type:"function",name:tool.name,description:tool.description,parameters:tool.inputSchema??{type:"object",properties:{}}}));
 const result:ResponsesRequest={model,stream:true,input}; if(tools?.length) result.tools=tools; if(options.toolMode===vscode.LanguageModelChatToolMode.Required) result.tool_choice="required"; else if(tools?.length) result.tool_choice="auto"; return result;
}
function role(value:vscode.LanguageModelChatMessageRole):string { if(value===vscode.LanguageModelChatMessageRole.User)return "user"; if(value===vscode.LanguageModelChatMessageRole.Assistant)return "assistant"; throw new Error("Unsupported VS Code message role"); }
function encodePart(part:unknown):unknown{
 if(part instanceof vscode.LanguageModelTextPart)return {type:"input_text",text:part.value};
 if(part instanceof vscode.LanguageModelToolCallPart)return {type:"function_call",call_id:part.callId,name:part.name,arguments:JSON.stringify(part.input)};
 if(part instanceof vscode.LanguageModelToolResultPart)return {type:"function_call_output",call_id:part.callId,output:part.content.map(p=>{if(p instanceof vscode.LanguageModelTextPart)return p.value; throw new Error("Unsupported tool result part");}).join("")};
 if(part instanceof vscode.LanguageModelDataPart){ if(!["image/png","image/jpeg","image/webp"].includes(part.mimeType))throw new Error(`Unsupported data part: ${part.mimeType}`); return {type:"input_image",image_url:`data:${part.mimeType};base64,${Buffer.from(part.data).toString("base64")}`}; }
 throw new Error(`Unsupported VS Code language-model part: ${Object.prototype.toString.call(part)}`);
}
