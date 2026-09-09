import * as vscode from "vscode";
import * as path from "node:path";
export interface ModelOverride { maxInputTokens?:number; maxOutputTokens?:number; toolCalling?:boolean; imageInput?:boolean }
export function parseEndpoint(raw:string):URL { let value:URL;try{value=new URL(raw);}catch{throw new Error(vscode.l10n.t("Swobu endpoint must be a valid URL."));}if(!/^https?:$/.test(value.protocol))throw new Error(vscode.l10n.t("Swobu endpoint must use HTTP or HTTPS."));if(!["127.0.0.1","localhost","[::1]"].includes(value.hostname))throw new Error(vscode.l10n.t("Swobu endpoint must be loopback."));if(value.username||value.password||value.search||value.hash||value.pathname!=="/")throw new Error(vscode.l10n.t("Swobu endpoint must be a loopback origin without credentials, a path, a query, or a fragment."));return value; }
export function endpoint():URL { return parseEndpoint(vscode.workspace.getConfiguration("swobu").get<string>("endpoint","http://127.0.0.1:7926")); }
export function daemonAddress(value:URL):string { return value.host; }
export function executable():string|undefined { const value=vscode.workspace.getConfiguration("swobu").get<string>("executable","").trim();if(!value)return undefined;if(!path.isAbsolute(value))throw new Error(vscode.l10n.t("The configured Swobu executable must be an absolute path on this extension host."));return value; }
export function overrides():Record<string,ModelOverride> { return vscode.workspace.getConfiguration("swobu").get<Record<string,ModelOverride>>("modelOverrides",{}); }
