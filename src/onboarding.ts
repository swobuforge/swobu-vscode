import * as vscode from "vscode";
import { ControlPlaneClient } from "./controlPlane.js";
import { endpoint } from "./settings.js";
export async function offerSetup(context:vscode.ExtensionContext):Promise<void>{
 if(context.globalState.get("swobu.onboarding.seen"))return;
 let ready=false;
 try{ready=(await new ControlPlaneClient(endpoint()).workspaces(AbortSignal.timeout(2000))).some(workspace=>workspace.route_count>0);}catch{/* Unavailable runtime follows the existing setup flow. */}
 const setup=vscode.l10n.t("Set up Swobu"),models=vscode.l10n.t("Manage Language Models");
 const actions=[ready?models:setup];
 const claude=vscode.l10n.t("Connect Claude Code"),codex=vscode.l10n.t("Connect Codex");
 if(vscode.extensions.getExtension("anthropic.claude-code"))actions.push(claude);
 if(vscode.extensions.getExtension("openai.chatgpt"))actions.push(codex);
 const choice=await vscode.window.showInformationMessage(ready?vscode.l10n.t("Swobu routes are ready. Select one in Manage Language Models."):vscode.l10n.t("Use your Swobu routes in VS Code"),...actions);
 await context.globalState.update("swobu.onboarding.seen",true);
 if(choice===setup)await vscode.commands.executeCommand("swobu.setup");
 else if(choice===models)await vscode.commands.executeCommand("workbench.action.chat.manage");
 else if(choice===claude)await vscode.commands.executeCommand("swobu.connectClaude");
 else if(choice===codex)await vscode.commands.executeCommand("swobu.connectCodex");
}
