import { spawn, type ChildProcess } from "node:child_process";
import { access } from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { ControlPlaneClient, requireCompatibleStatus, type StatusPayload } from "./controlPlane.js";
import { endpoint, executable } from "./settings.js";
let pending: Promise<StatusPayload> | undefined;
export function bundledExecutable(context: vscode.ExtensionContext): string { const file=process.platform === "win32" ? "swobu.exe" : "swobu"; return path.join(context.extensionPath,"runtime",`${process.platform}-${process.arch}`,file); }
export async function ensureRuntime(context: vscode.ExtensionContext, signal?: AbortSignal): Promise<StatusPayload> { pending ??= attachOrStart(context, signal).finally(()=>{pending=undefined;}); return pending; }
async function attachOrStart(context: vscode.ExtensionContext, signal?: AbortSignal): Promise<StatusPayload> {
  const url=endpoint(), client=new ControlPlaneClient(url);
  try { const status=await client.status(signal); requireCompatibleStatus(status); return status; } catch (error) { if (error instanceof Error && error.message.includes("incompatible")) throw error; }
  const binary=executable() ?? bundledExecutable(context); await access(binary);
  const child=spawn(binary,["daemon","--addr",url.host],{shell:false,stdio:"ignore",detached:false});
  return waitUntilReady(client,child,signal);
}
async function waitUntilReady(client: ControlPlaneClient, child: ChildProcess, signal?: AbortSignal): Promise<StatusPayload> {
  const deadline=Date.now()+15_000;
  while(Date.now()<deadline) {
    if(signal?.aborted){ if(child.exitCode===null) child.kill(); throw new vscode.CancellationError(); }
    if(child.exitCode!==null) throw new Error(`Swobu exited before readiness (${child.exitCode})`);
    try { const status=await client.status(signal); requireCompatibleStatus(status); return status; } catch (error) { if(error instanceof Error && error.message.includes("incompatible")) throw error; }
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  throw new Error("Swobu daemon readiness timed out");
}
