import * as vscode from "vscode";
export interface ModelOverride { maxInputTokens?: number; maxOutputTokens?: number; toolCalling?: boolean; imageInput?: boolean }
export function endpoint(): URL { const raw=vscode.workspace.getConfiguration("swobu").get<string>("endpoint", "http://127.0.0.1:7926"); const value=new URL(raw); if (!/^https?:$/.test(value.protocol)) throw new Error("Swobu endpoint must use HTTP or HTTPS"); return value; }
export function executable(): string | undefined { const value=vscode.workspace.getConfiguration("swobu").get<string>("executable", "").trim(); return value || undefined; }
export function overrides(): Record<string, ModelOverride> { return vscode.workspace.getConfiguration("swobu").get<Record<string, ModelOverride>>("modelOverrides", {}); }
