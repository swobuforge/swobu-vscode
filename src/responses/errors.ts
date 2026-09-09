import * as vscode from "vscode";

interface ErrorEnvelope { error?:{message?:unknown;code?:unknown;type?:unknown}; message?:unknown }

// Swobu's public wire error is already the client-safe explanation. Keeping it
// only as Error.cause makes VS Code discard the repair-relevant part and leaves
// users with an HTTP number instead.
export function projectError(status:number,body:string):Error {
 const detail=publicErrorDetail(body);
 const summary=vscode.l10n.t("Swobu request failed (HTTP {0}).",status);
 const message=detail?`${summary} ${detail}`:summary;
 if(status===404)return vscode.LanguageModelError.NotFound(message);
 if(status===401||status===403)return vscode.LanguageModelError.NoPermissions(message);
 if(status===429)return vscode.LanguageModelError.Blocked(message);
 return new Error(message);
}

function publicErrorDetail(body:string):string|undefined {
 let envelope:ErrorEnvelope;
 try{envelope=JSON.parse(body) as ErrorEnvelope;}catch{return undefined;}
 const raw=envelope.error?.message??envelope.message;
 if(typeof raw!=="string")return undefined;
 const message=raw.trim();
 if(!message)return undefined;
 const code=typeof envelope.error?.code==="string"?envelope.error.code.trim():"";
 return code&&code!==message?`${message} (${code})`:message;
}
