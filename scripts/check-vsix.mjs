import { readFile } from "node:fs/promises";
import yauzl from "yauzl";
const [file]=process.argv.slice(2);if(!file)throw new Error("Pass the portable VSIX path");
const entries=new Map();
const archive=await readFile(file);
await new Promise((resolve,reject)=>yauzl.fromBuffer(archive,{lazyEntries:true},(error,zip)=>{
 if(error)return reject(error);let total=0;
 zip.on("error",reject);zip.on("end",resolve);zip.on("entry",entry=>{
  if(entry.fileName.endsWith("/")){zip.readEntry();return;}
  if(entries.has(entry.fileName)||entry.fileName.split("/").includes("..")){zip.close();reject(new Error("Unsafe duplicate or traversal entry"));return;}
  total+=entry.uncompressedSize;if(total>200*1024*1024){zip.close();reject(new Error("VSIX exceeds 200 MiB inspection budget"));return;}
  zip.openReadStream(entry,(error,stream)=>{if(error)return reject(error);const chunks=[];stream.on("error",reject);stream.on("data",chunk=>chunks.push(chunk));stream.on("end",()=>{entries.set(entry.fileName,Buffer.concat(chunks));zip.readEntry();});});
 });zip.readEntry();
}));
function required(path){const value=entries.get(path);if(!value)throw new Error(`Missing ${path}`);return value;}
const xml=required("extension.vsixmanifest").toString();if(xml.includes("TargetPlatform="))throw new Error("VSIX must be platform-independent");
for(const name of entries.keys())if(name.startsWith("extension/runtime/")||name==="extension/runtime-manifest.json")throw new Error(`Private Swobu runtime residue: ${name}`);
for(const name of ["dist/extension.js","readme.md","changelog.md","LICENSE.txt","assets/icon.png","assets/screenshots/model-picker.png","assets/screenshots/fallback-proof.png","package.nls.json"])required(`extension/${name}`);
for(const name of entries.keys())if(/(?:^|\/)(?:\.git|\.env|\.out|checkpoint|docs|node_modules|scripts|tasks|test|src)(?:\/|$)|\.key$|\.ts$/.test(name))throw new Error(`Forbidden package entry ${name}`);
for(const locale of ["zh-cn","ja","pt-br","id","ko","es","de","fr","ru","uk"]){required(`extension/package.nls.${locale}.json`);required(`extension/l10n/bundle.l10n.${locale}.json`);}
console.log("PASS: one platform-independent VSIX with no private Swobu runtime");
