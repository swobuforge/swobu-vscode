import * as vscode from "vscode";
import { ControlPlaneClient } from "./controlPlane.js";
import { discoverModels } from "./models.js";
import { ensureRuntime } from "./runtime.js";
import { endpoint, overrides, type ModelOverride } from "./settings.js";

type Field = keyof ModelOverride;
const defaults: Required<ModelOverride> = { imageInput:false, toolCalling:true, maxInputTokens:32768, maxOutputTokens:4096 };

// Default means absence, not a copied value: future advertisement defaults remain
// effective until the user explicitly pins this route's client-facing limit.
export function updateOverride(current:Record<string,ModelOverride>,id:string,field:Field|"reset",value:boolean|number|undefined):Record<string,ModelOverride> {
  const next={...current};
  if(field==="reset"){delete next[id];return next;}
  const route={...next[id]};
  if(value===undefined)delete route[field];
  else if(field==="imageInput"||field==="toolCalling"){
    if(typeof value!=="boolean")throw new Error(vscode.l10n.t("Expected a boolean model advertisement."));
    route[field]=value;
  }else{
    if(typeof value!=="number"||!Number.isSafeInteger(value)||value<=0)throw new Error(vscode.l10n.t("Expected a positive integer model advertisement."));
    route[field]=value;
  }
  if(Object.keys(route).length)next[id]=route;else delete next[id];
  return next;
}

export async function configureModel(context:vscode.ExtensionContext,refresh:()=>void):Promise<void>{
  await ensureRuntime(context);
  const models=await discoverModels(new ControlPlaneClient(endpoint()),overrides());
  if(!models.length){const open=vscode.l10n.t("Open Swobu"),choice=await vscode.window.showInformationMessage(vscode.l10n.t("No Swobu routes are available yet."),open);if(choice===open)await vscode.commands.executeCommand("swobu.open");return;}
  const route=await vscode.window.showQuickPick(models.map(model=>({label:model.id})),{title:vscode.l10n.t("Configure Model"),placeHolder:vscode.l10n.t("Choose a Swobu route")});
  if(!route)return;
  for(;;){
    const current=overrides()[route.label]??{};
    const labels:Record<Field,string>={imageInput:vscode.l10n.t("Images"),toolCalling:vscode.l10n.t("Tool calling"),maxInputTokens:vscode.l10n.t("Context window"),maxOutputTokens:vscode.l10n.t("Max output")};
    const items=(Object.keys(defaults) as Field[]).map(field=>({label:labels[field],field:field as Field|"reset",description:current[field]===undefined?vscode.l10n.t("Default · {0}",String(defaults[field])):String(current[field])}));
    items.push({label:vscode.l10n.t("Reset overrides"),field:"reset",description:""});
    const selected=await vscode.window.showQuickPick(items,{title:route.label});if(!selected)return;
    let value:boolean|number|undefined;
    if(selected.field!=="reset"){
      const boolean=selected.field==="imageInput"||selected.field==="toolCalling";
      const choices:Array<{label:string;value:boolean|number|"default"|"custom"}>=[{label:vscode.l10n.t("Default"),value:"default"}];
      if(boolean)choices.push({label:vscode.l10n.t("On"),value:true},{label:vscode.l10n.t("Off"),value:false});
      else {for(const n of selected.field==="maxInputTokens"?[32768,65536,131072,200000]:[4096,8192,16384,32768])choices.push({label:n.toLocaleString(),value:n});choices.push({label:vscode.l10n.t("Custom…"),value:"custom"});}
      const choice=await vscode.window.showQuickPick(choices,{title:selected.label});if(!choice)continue;
      if(choice.value==="custom"){
        const text=await vscode.window.showInputBox({title:selected.label,prompt:vscode.l10n.t("Enter a positive integer"),validateInput:text=>/^\d+$/.test(text)&&Number.isSafeInteger(Number(text))&&Number(text)>0?undefined:vscode.l10n.t("Enter a positive integer")});
        if(text===undefined)continue;value=Number(text);
      }else if(choice.value!=="default")value=choice.value;
    }
    await vscode.workspace.getConfiguration("swobu").update("modelOverrides",updateOverride(overrides(),route.label,selected.field,value),vscode.ConfigurationTarget.Global);
    refresh();
  }
}
