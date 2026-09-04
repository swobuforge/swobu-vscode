import type * as vscode from "vscode";
import type { ControlPlaneClient } from "./controlPlane.js";
import type { ModelOverride } from "./settings.js";
export interface SwobuModel extends vscode.LanguageModelChatInformation { workspace: string; route: string }
export async function discoverModels(client: ControlPlaneClient, overrides: Record<string,ModelOverride>, signal?: AbortSignal): Promise<SwobuModel[]> {
 const summaries=await client.workspaces(signal), result: SwobuModel[]=[];
 for(const summary of [...summaries].sort((a,b)=>a.slug.localeCompare(b.slug))){ const workspace=await client.workspace(summary.slug,signal); const routes=[...workspace.routes].sort((a,b)=>a.name.localeCompare(b.name)); if(!routes.some(r=>r.name==="default")) routes.unshift({name:"default"});
  for(const {name:route} of routes){ const id=`${workspace.slug}/${route}`, o=overrides[id]??{}; result.push({id,name:route,family:"swobu",version:"1",detail:workspace.slug,tooltip:`Swobu route ${route} in ${workspace.slug}`,maxInputTokens:o.maxInputTokens??32768,maxOutputTokens:o.maxOutputTokens??4096,capabilities:{toolCalling:o.toolCalling??false,imageInput:o.imageInput??false},workspace:workspace.slug,route}); }
 }
 return result;
}
