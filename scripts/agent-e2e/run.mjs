import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from "@vscode/test-electron";
import { spawn, spawnSync } from "node:child_process";
import { cpSync, createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer } from "node:net";
import { basename, dirname, resolve } from "node:path";
import process from "node:process";

const root=resolve(import.meta.dirname,"../..");
const vsix=resolve(process.argv[2]??"");
const modelWorkspace=process.env.SWOBU_VSCODE_E2E_WORKSPACE??"local";
const modelRoute=process.env.SWOBU_VSCODE_E2E_ROUTE??"local";
const modelIdentifier=`swobu/${modelWorkspace}/${modelRoute}`;
if(!process.argv[2]||!existsSync(vsix)){
  console.error("usage: node scripts/agent-e2e/run.mjs <path-to.vsix>");
  process.exit(2);
}

const state=resolve(root,".vscode-agent-e2e");
const profile=resolve(state,"profile");
const extensions=resolve(state,"extensions");
const shared=resolve(state,"shared");
rmSync(state,{recursive:true,force:true});
for(const path of [profile,extensions,shared,resolve(profile,"User")])mkdirSync(path,{recursive:true});
writeFileSync(resolve(profile,"User/settings.json"),JSON.stringify({
  "chat.agentHost.allowSignedOutWhenUsable":true,
  "chat.agentHost.byokModels.enabled":true,
  "chat.byokUtilityModelDefault":"mainAgent",
  "chat.tools.global.autoApprove":true,
  "chat.allowAnonymousAccess":true,
  "github.copilot.chat.githubMcpServer.enabled":false,
  "chat.agentHost.unsafeTestToken":"swobu-e2e-local-token",
  "chat.agentHost.ahpJsonlLoggingEnabled":true,
  "telemetry.telemetryLevel":"off",
},null,2)+"\n");

const executable=await downloadAndUnzipVSCode("1.135.0");
terminateProfileProcesses("SIGKILL");
await waitForProfileProcessesToExit(5_000);
installVsix(executable);
await runJourney(executable);

function installVsix(executablePath){
  const [command,...baseArgs]=resolveCliArgsFromVSCodeExecutablePath(executablePath);
  const result=spawnSync(command,[...baseArgs,"--user-data-dir",profile,"--extensions-dir",extensions,"--install-extension",vsix,"--force"],{
    cwd:root,encoding:"utf8",env:{...process.env,DONT_PROMPT_WSL_INSTALL:"1"},
  });
  if(result.status!==0)throw new Error(`VSIX installation failed (${result.status}):\n${result.stdout}\n${result.stderr}`);
}

async function runJourney(executablePath){
  terminateProfileProcesses("SIGKILL");
  await waitForProfileProcessesToExit(5_000);
  const runId=new Date().toISOString().replaceAll(":","-").replaceAll(".","-");
  const artifacts=resolve(root,"test/e2e/agent/_artifacts",runId);
  const workspace=resolve(artifacts,"workspace");
  mkdirSync(artifacts,{recursive:true});
  cpSync(resolve(root,"test/e2e/agent/fixture"),workspace,{recursive:true});
  const port=await freePort();
  const capi=await hostileCapi(resolve(artifacts,"step-000.capi-requests.jsonl"));
  const log=writeFile(resolve(artifacts,"step-001.vscode-process.log"));
  const child=spawn("xvfb-run",["-a",executablePath,workspace,...launchArgs(port)],{
    cwd:root,detached:true,env:{
      ...process.env,
      DONT_PROMPT_WSL_INSTALL:"1",
      GITHUB_COPILOT_API_TOKEN:"swobu-e2e-local-token",
      COPILOT_API_URL:capi.url,
      COPILOT_DEBUG_GITHUB_API_URL:capi.url,
      VSCODE_AGENT_HOST_CAPI_URL_OVERRIDE:capi.url,
      COPILOT_ENABLE_ALT_PROVIDERS:"true",
    },stdio:["ignore","pipe","pipe"],
  });
  child.stdout.pipe(log);child.stderr.pipe(log);
  let cdp;
  let rpcTrace;
  try{
    cdp=await connectCdp(port,30_000);
    await cdp.call("Page.enable");
    await cdp.call("Runtime.enable");
    rpcTrace=captureRpcTrace(cdp,resolve(artifacts,"step-001.extension-host-rpc.log"));
    const selected=await prepareSwobuAgent(cdp);
    await snapshot(cdp,artifacts,"step-002.model-ready");
    await press(cdp,"Escape","Escape");
    const input=await evaluate(cdp,`document.querySelector('[role="textbox"][aria-label^="Chat Input (Agent)"]')?.getAttribute('aria-label')`);
    if(!input?.includes(selected))throw new Error(`Chat Agent input does not identify selected model ${JSON.stringify(selected)}`);
    const prompt="Inspect the failing test in this workspace. Fix the implementation, run the test, and do not stop until it prints SWOBU_VSCODE_AGENT_E2E_PASS.";
    await focusAndType(cdp,'[role="textbox"][aria-label^="Chat Input (Agent)"]',prompt);
    const composed=await evaluate(cdp,`document.querySelector('[role="textbox"][aria-label^="Chat Input (Agent)"]')?.textContent`);
    if(composed!==prompt)throw new Error("Chat input did not retain the E2E prompt");
    await press(cdp,"Enter","Enter");
    await waitFor(cdp,async()=>{
      const text=await body(cdp);
      return text.includes(prompt)&&/(Evaluating|Working|Analyzing|Thinking|Chat Request Sent)/.test(text);
    },10_000,"Chat did not submit the prompt");
    await snapshot(cdp,artifacts,"step-003.request-sent");
    await waitFor(cdp,async()=>{
      await approveVisibleAction(cdp);
      const text=await body(cdp);
      if(/Sorry, your request failed|Sign in to use GitHub Copilot|Continue with GitHub/.test(text))throw new Error(`Agent request stopped before Swobu completed:\n${tail(text,2500)}`);
      const visibleMarkers=text.split("SWOBU_VSCODE_AGENT_E2E_PASS").length-1;
      return readFileSync(resolve(workspace,"calculator.js"),"utf8")==="export function add(a, b) {\n  return a + b;\n}\n"
        &&text.includes("Ran node calculator.test.js")
        &&text.includes("Finished with")
        &&visibleMarkers>=3;
    },180_000,"Agent did not repair and verify the fixture");
    await snapshot(cdp,artifacts,"step-004.success");
    const test=spawnSync(process.execPath,[resolve(workspace,"calculator.test.js")],{encoding:"utf8",cwd:workspace});
    writeFileSync(resolve(artifacts,"step-005.independent-verification.txt"),`${test.stdout}${test.stderr}`);
    if(test.status!==0||!test.stdout.includes("SWOBU_VSCODE_AGENT_E2E_PASS"))throw new Error("Independent fixture verification failed");
    if(capi.inferenceRequests.length)throw new Error(`Agent inference escaped Swobu to the hostile CAPI server: ${capi.inferenceRequests.join(", ")}`);
    assertProviderToolLoop(resolve(artifacts,"step-001.extension-host-rpc.log"),modelIdentifier);
    writeFileSync(resolve(artifacts,"step-006.meta.txt"),`actor=VS Code Chat/Agent UI\nvsix=${basename(vsix)}\nselected_model=${selected}\noutcome=pass\n`);
    console.log(`PASS: real VS Code Agent repaired and verified the fixture through Swobu model ${selected}.`);
    console.log(`Artifacts: ${artifacts}`);
  }catch(error){
    if(cdp)await snapshot(cdp,artifacts,"step-999.failure").catch(()=>{});
    writeFileSync(resolve(artifacts,"step-999.failure.txt"),`${error?.stack??error}\n`);
    console.error(`FAIL: ${error?.message??error}`);
    console.error(`Artifacts: ${artifacts}`);
    process.exitCode=1;
  }finally{
    rpcTrace?.dispose();
    preserveVsCodeLogs(artifacts);
    cdp?.close();
    try{process.kill(-child.pid,"SIGTERM");}catch{}
    terminateProfileProcesses("SIGKILL");
    await Promise.race([exited(child),new Promise(resolve=>setTimeout(resolve,3_000))]);
    try{process.kill(-child.pid,"SIGKILL");}catch{}
    child.stdout.destroy();child.stderr.destroy();
    log.end();
    await capi.close();
  }
}

async function prepareSwobuAgent(cdp){
  await waitFor(cdp,()=>body(cdp).then(text=>text?.includes("Build with Agent")),30_000,"Chat UI did not become ready");
  await command(cdp,"Swobu: Refresh Models");
  await waitForAgentHostModel(modelIdentifier,30_000);
  await selectRenderedModel(cdp,modelRoute,modelRoute);
  await command(cdp,"Chat: Manage Language Models");
  await waitFor(cdp,()=>body(cdp).then(text=>/Language Models/i.test(text)&&/Context Size/i.test(text)),15_000,"Language Model manager did not render");
  const managerText=await body(cdp);
  const selectedBefore=await selectedModel(cdp);
  if(!selectedBefore||selectedBefore==="Models")throw new Error("VS Code did not expose a candidate Swobu route");
  if(!managerText.includes(selectedBefore))throw new Error(`Language Model manager did not associate selected route ${JSON.stringify(selectedBefore)} with its rendered provider list`);
  await press(cdp,"Escape","Escape");
  await waitFor(cdp,()=>body(cdp).then(text=>text.includes("Build with Agent")),10_000,"Agent Chat did not return after provenance check");
  const selected=await selectedModel(cdp);
  if(!selected||selected==="Models")throw new Error("VS Code did not select a Swobu model");
  const input=await evaluate(cdp,`document.querySelector('[role="textbox"][aria-label^="Chat Input (Agent)"]')?.getAttribute('aria-label')`);
  if(!input?.includes(selected))throw new Error(`Chat Agent input does not identify selected Swobu model ${JSON.stringify(selected)}`);
  return selected;
}

async function selectRenderedModel(cdp,name,detail){
  if(await selectedModel(cdp)===name)return;
  const deadline=Date.now()+30_000;
  let point;
  while(Date.now()<deadline&&!point){
    await press(cdp,"Escape","Escape");
    await click(cdp,'[aria-label^="Models,"]');
    await waitFor(cdp,()=>evaluate(cdp,`Boolean(document.querySelector('input[placeholder="Search models"]'))`),5_000,"Model search input did not render");
    await focusAndType(cdp,'input[placeholder="Search models"]',name);
    await pause(500);
    point=await evaluate(cdp,`(()=>{const rows=[...document.querySelectorAll('.monaco-list-row,[role="option"],[role="menuitem"]')].filter(row=>row.offsetWidth&&row.offsetHeight);const row=rows.find(value=>{const title=value.querySelector('.title')?.textContent?.trim()??value.textContent?.trim();const description=value.querySelector('.description')?.textContent?.trim()??'';return title===${JSON.stringify(name)}&&description===${JSON.stringify(detail)}})??rows.find(value=>value.querySelector('.title')?.textContent?.trim()===${JSON.stringify(name)});if(!row)return null;const r=row.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    if(!point)await pause(500);
  }
  if(!point)throw new Error(`Rendered model row not found for ${detail}/${name} after Agent Host imported it`);
  await cdp.call("Input.dispatchMouseEvent",{type:"mousePressed",...point,button:"left",clickCount:1});
  await cdp.call("Input.dispatchMouseEvent",{type:"mouseReleased",...point,button:"left",clickCount:1});
  await waitFor(cdp,()=>selectedModel(cdp).then(value=>value===name),10_000,`Agent did not select rendered model ${detail}/${name}`);
}

async function waitForAgentHostModel(identifier,timeout){
  const end=Date.now()+timeout;
  while(Date.now()<end){
    for(const path of filesUnder(resolve(profile,"logs"),value=>value.endsWith(".jsonl")&&value.includes("/ahp/"))){
      try{if(readFileSync(path,"utf8").includes(`\"byokModelIdentifier\":\"${identifier}\"`))return;}catch{}
    }
    await pause(250);
  }
  throw new Error(`Agent Host did not import ${identifier}`);
}


function launchArgs(port){
  const args=[`--user-data-dir=${profile}`,`--extensions-dir=${extensions}`,`--shared-data-dir=${shared}`,"--wait","--enable-smoke-test-driver","--password-store=basic","--log","trace","--logExtensionHostCommunication","--disable-gpu","--no-sandbox","--skip-welcome","--skip-release-notes","--disable-workspace-trust","--disable-updates","--disable-telemetry","--force-renderer-accessibility"];
  if(port)args.push(`--remote-debugging-port=${port}`);
  return args;
}

async function command(cdp,name){
  const deadline=Date.now()+30_000;
  let point;
  while(Date.now()<deadline&&!point){
    await chord(cdp,["Control","Shift","P"]);
    await waitFor(cdp,()=>evaluate(cdp,`[...document.querySelectorAll('.quick-input-widget')].some(value=>value.offsetWidth&&value.offsetHeight)`),5_000,"Command Palette did not open");
    await cdp.call("Input.insertText",{text:name});
    await pause(500);
    point=await evaluate(cdp,`(()=>{const e=[...document.querySelectorAll('[role="option"],.quick-input-list .monaco-list-row')].find(value=>value.offsetWidth&&value.offsetHeight&&value.textContent?.includes(${JSON.stringify(name)}));if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
    if(!point){await press(cdp,"Escape","Escape");await pause(500);}
  }
  if(!point)throw new Error(`Command did not appear within 30 seconds: ${name}`);
  await cdp.call("Input.dispatchMouseEvent",{type:"mousePressed",...point,button:"left",clickCount:1});
  await cdp.call("Input.dispatchMouseEvent",{type:"mouseReleased",...point,button:"left",clickCount:1});
  await waitFor(cdp,()=>evaluate(cdp,`![...document.querySelectorAll('.quick-input-widget')].some(value=>value.offsetWidth&&value.offsetHeight)`),5_000,`Command Palette did not close after invoking ${name}`);
}
async function selectedModel(cdp){return evaluate(cdp,`document.querySelector('[aria-label^="Models,"]')?.textContent?.trim()`);}
async function focusAndType(cdp,selector,text){
  const point=await evaluate(cdp,`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return null;e.focus();const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  if(!point)throw new Error(`UI element not found: ${selector}`);
  await cdp.call("Input.dispatchMouseEvent",{type:"mousePressed",...point,button:"left",clickCount:1});
  await cdp.call("Input.dispatchMouseEvent",{type:"mouseReleased",...point,button:"left",clickCount:1});
  await cdp.call("Input.insertText",{text});
}
async function click(cdp,selector){
  const point=await evaluate(cdp,`(()=>{const e=[...document.querySelectorAll(${JSON.stringify(selector)})].find(value=>value.offsetWidth&&value.offsetHeight);if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  if(!point)throw new Error(`UI element not found: ${selector}`);
  await cdp.call("Input.dispatchMouseEvent",{type:"mousePressed",...point,button:"left",clickCount:1});
  await cdp.call("Input.dispatchMouseEvent",{type:"mouseReleased",...point,button:"left",clickCount:1});
}
async function approveVisibleAction(cdp){
  const point=await evaluate(cdp,`(()=>{const labels=['Continue','Allow','Run','Accept','Enable'];const e=[...document.querySelectorAll('[role="button"],button,a')].find(x=>x.offsetWidth&&labels.includes(x.textContent?.trim()));if(!e)return null;const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  if(!point)return;
  await cdp.call("Input.dispatchMouseEvent",{type:"mousePressed",...point,button:"left",clickCount:1});
  await cdp.call("Input.dispatchMouseEvent",{type:"mouseReleased",...point,button:"left",clickCount:1});
}
async function chord(cdp,keys){
  const codes={Control:"ControlLeft",Shift:"ShiftLeft",P:"KeyP"},virtual={Control:17,Shift:16,P:80};let modifiers=0;
  for(const key of keys){if(key==="Control")modifiers|=2;if(key==="Shift")modifiers|=8;await cdp.call("Input.dispatchKeyEvent",{type:"rawKeyDown",key,code:codes[key],windowsVirtualKeyCode:virtual[key],nativeVirtualKeyCode:virtual[key],modifiers});}
  for(const key of [...keys].reverse()){await cdp.call("Input.dispatchKeyEvent",{type:"keyUp",key,code:codes[key],windowsVirtualKeyCode:virtual[key],nativeVirtualKeyCode:virtual[key],modifiers});if(key==="Control")modifiers&=~2;if(key==="Shift")modifiers&=~8;}
}
async function press(cdp,key,code){const virtual=key==="Enter"?13:key==="Escape"?27:0;await cdp.call("Input.dispatchKeyEvent",{type:"rawKeyDown",key,code,windowsVirtualKeyCode:virtual,nativeVirtualKeyCode:virtual});await cdp.call("Input.dispatchKeyEvent",{type:"keyUp",key,code,windowsVirtualKeyCode:virtual,nativeVirtualKeyCode:virtual});}
async function body(cdp){return evaluate(cdp,"document.body.innerText");}
async function evaluate(cdp,expression){const reply=await cdp.call("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(reply.exceptionDetails)throw new Error(reply.exceptionDetails.text);return reply.result.result.value;}
async function snapshot(cdp,artifacts,prefix){
  writeFileSync(resolve(artifacts,`${prefix}.txt`),await body(cdp));
  const shot=await cdp.call("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
  writeFileSync(resolve(artifacts,`${prefix}.png`),Buffer.from(shot.result.data,"base64"));
}
async function waitFor(cdp,predicate,timeout,message){const end=Date.now()+timeout;let last;while(Date.now()<end){try{if(await predicate())return;}catch(error){throw error;}await pause(500);}throw new Error(last?`${message}: ${last}`:message);}
async function hostileCapi(logPath){
  const requests=[];
  const inferenceRequests=[];
  const server=createHttpServer((request,response)=>{
    const record={method:request.method,url:request.url};
    requests.push(record);
    writeFileSync(logPath,requests.map(value=>JSON.stringify(value)).join("\n")+"\n");
    if(request.method==="POST"&&/(responses|chat\/completions|messages)/.test(request.url??""))inferenceRequests.push(`${request.method} ${request.url}`);
    request.resume();
    if(request.method==="GET"&&request.url==="/copilot_internal/user"){
      response.writeHead(200,{"content-type":"application/json"});
      response.end(JSON.stringify({
        access_type_sku:"free_limited_copilot",
        analytics_tracking_id:"swobu-e2e",
        chat_enabled:true,
        copilot_plan:"individual",
        organization_list:[],
        sku:"free_limited_copilot",
      }));
      return;
    }
    if(request.method==="GET"&&request.url==="/models"){
      response.writeHead(200,{"content-type":"application/json"});
      response.end(JSON.stringify({data:[]}));
      return;
    }
    response.writeHead(500,{"content-type":"application/json"});
    response.end(JSON.stringify({error:"Hostile local CAPI: Agent inference must use the selected Swobu BYOK model."}));
  });
  await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(0,"127.0.0.1",resolve);});
  const address=server.address();
  return{url:`http://127.0.0.1:${address.port}`,inferenceRequests,close:()=>new Promise((resolve,reject)=>server.close(error=>error?reject(error):resolve()))};
}
async function connectCdp(port,timeout){
  const end=Date.now()+timeout;let page;
  while(Date.now()<end){try{const list=await fetch(`http://127.0.0.1:${port}/json/list`).then(r=>r.json());page=list.find(value=>value.type==="page");if(page)break;}catch{}await pause(250);}
  if(!page)throw new Error("VS Code DevTools endpoint did not become ready");
  const socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise((ok,no)=>{socket.onopen=ok;socket.onerror=no;});let id=0;const pending=new Map;
  const listeners=new Map;
  socket.onmessage=event=>{const value=JSON.parse(event.data);if(value.id){const resolve=pending.get(value.id);if(resolve)resolve(value);pending.delete(value.id);return;}for(const listener of listeners.get(value.method)??[])listener(value.params);};
  return{call(method,params={}){return new Promise((resolve,reject)=>{const requestId=++id;const timer=setTimeout(()=>{pending.delete(requestId);reject(new Error(`CDP timeout: ${method}`));},10_000);pending.set(requestId,value=>{clearTimeout(timer);if(value.error)reject(new Error(value.error.message));else resolve(value);});socket.send(JSON.stringify({id:requestId,method,params}));});},on(method,listener){const values=listeners.get(method)??new Set;values.add(listener);listeners.set(method,values);return{dispose(){values.delete(listener);}};},close(){socket.close();}};
}
async function freePort(){return new Promise((resolve,reject)=>{const server=createServer();server.listen(0,"127.0.0.1",()=>{const address=server.address();server.close(error=>error?reject(error):resolve(address.port));});server.on("error",reject);});}
function writeFile(path){mkdirSync(dirname(path),{recursive:true});return createWriteStream(path);}
function exited(child){return new Promise(resolve=>child.once("exit",code=>resolve(code)));}
function pause(ms){return new Promise(resolve=>setTimeout(resolve,ms));}
function tail(value,length){return value.slice(Math.max(0,value.length-length));}
function terminateProfileProcesses(signal="SIGTERM"){
  if(process.platform!=="linux")return;
  for(const entry of readdirSync("/proc").filter(value=>/^\d+$/.test(value))){
    const pid=Number(entry);if(pid===process.pid)continue;
    try{
      const command=readFileSync(`/proc/${entry}/cmdline`,"utf8").split("\0");
      if(command.some(value=>value.includes(profile))&&command.some(value=>value.includes("vscode-linux-x64-1.135.0")))process.kill(pid,signal);
    }catch{}
  }
}
async function waitForProfileProcessesToExit(timeout){
  const end=Date.now()+timeout;
  while(Date.now()<end){
    if(!hasProfileProcesses())return;
    await pause(100);
  }
  throw new Error(`Could not stop existing VS Code processes for isolated profile ${profile}`);
}
function hasProfileProcesses(){
  if(process.platform!=="linux")return false;
  for(const entry of readdirSync("/proc").filter(value=>/^\d+$/.test(value))){
    try{
      const command=readFileSync(`/proc/${entry}/cmdline`,"utf8").split("\0");
      if(command.some(value=>value.includes(profile))&&command.some(value=>value.includes("vscode-linux-x64-1.135.0")))return true;
    }catch{}
  }
  return false;
}
function filesUnder(path,predicate){
  if(!existsSync(path))return[];
  const found=[];
  const pending=[path];
  while(pending.length){
    const current=pending.pop();
    for(const entry of readdirSync(current)){const child=resolve(current,entry);if(statSync(child).isDirectory())pending.push(child);else if(predicate(child))found.push(child);}
  }
  return found;
}
function captureRpcTrace(cdp,path){
  const lines=[];
  const providerRequests=new Set;
  return cdp.on("Runtime.consoleAPICalled",event=>{
    const line=(event.args??[]).map(value=>value.value??value.description??"").join(" ");
    const request=line.match(/\s(\d+) - request: ExtHostChatProvider\.\$startChatRequest/);
    if(request)providerRequests.add(request[1]);
    const ack=line.match(/\s(\d+) - ack/);
    if(!request&&!/\[LM\] report response|ByokLmProxyService/.test(line)&&!(ack&&providerRequests.has(ack[1])))return;
    lines.push(line);
    writeFileSync(path,lines.join("\n")+"\n");
  });
}
function assertProviderToolLoop(path,identifier){
  const trace=readFileSync(path,"utf8");
  const requests=trace.split("\n").flatMap(line=>{const match=line.match(/\s(\d+) - request: ExtHostChatProvider\.\$startChatRequest\([^\n]*? (swobu\/\S+) (\d+) /);return match&&/len:\s*[1-9]\d{4,}/.test(line)?[{rpc:match[1],model:match[2],lm:match[3]}]:[];}).filter(request=>request.model===identifier);
  const completed=requests.filter(request=>new RegExp(`Ext → Win[^\\n]*\\s${request.rpc} - ack`).test(trace)&&new RegExp(`\\[LM\\] report response PART true ${request.lm} `).test(trace)&&new RegExp(`\\[LM\\] report response DONE true ${request.lm}(?: |$)`).test(trace));
  if(completed.length<2)throw new Error(`Expected at least two completed Agent-sized Swobu LM requests; found ${completed.length}`);
}
function preserveVsCodeLogs(artifacts){
  const logs=resolve(profile,"logs");
  if(existsSync(logs))cpSync(logs,resolve(artifacts,"vscode-logs"),{recursive:true});
}
