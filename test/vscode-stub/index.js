class LanguageModelTextPart{constructor(value){this.value=value;}}
class LanguageModelToolCallPart{constructor(callId,name,input){this.callId=callId;this.name=name;this.input=input;}}
class LanguageModelToolResultPart{constructor(callId,content){this.callId=callId;this.content=content;}}
class LanguageModelDataPart{constructor(data,mimeType){this.data=data;this.mimeType=mimeType;}static image(data,mime){return new LanguageModelDataPart(data,mime);}}
class EventEmitter{constructor(){this.listeners=[];this.event=(listener)=>{this.listeners.push(listener);return{dispose(){}};};}fire(value){for(const listener of this.listeners)listener(value);}dispose(){this.listeners=[];}}
class CancellationError extends Error{}
class LanguageModelError extends Error{static NotFound(message){return new LanguageModelError(message);}static NoPermissions(message){return new LanguageModelError(message);}static Blocked(message){return new LanguageModelError(message);}}
const values={endpoint:"http://127.0.0.1:7926",executable:"",modelOverrides:{}};
const l10n={t(message,...args){return message.replace(/\{(\d+)\}/g,(_,index)=>String(args[Number(index)]));}};
const window={showErrorMessage:async()=>undefined,showInformationMessage:async()=>undefined,createOutputChannel(){return{error(){},show(){},dispose(){}};}};
module.exports={LanguageModelTextPart,LanguageModelToolCallPart,LanguageModelToolResultPart,LanguageModelDataPart,LanguageModelError,CancellationError,EventEmitter,l10n,window,commands:{executeCommand:async()=>undefined},ConfigurationTarget:{Global:1},LanguageModelChatMessageRole:{User:1,Assistant:2,System:3},LanguageModelChatToolMode:{Auto:1,Required:2},workspace:{getConfiguration(){return{get(key,fallback){return values[key]??fallback;},async update(key,value){values[key]=value;}}}},__setConfiguration(key,value){values[key]=value;}};
