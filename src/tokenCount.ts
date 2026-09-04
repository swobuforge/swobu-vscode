import type * as vscode from "vscode";
export function estimateTokens(input:string|vscode.LanguageModelChatRequestMessage):number { const text=typeof input==="string"?input:input.content.map(value=>JSON.stringify(value)).join(""); let units=0; for(const char of text) units+=char.codePointAt(0)!>127?2:1; return Math.max(1,Math.ceil(units/4)+4); }
