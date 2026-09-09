import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const {version}=JSON.parse(readFileSync("package.json","utf8"));
const file=`swobu-${version}.vsix`;
for(const [command,args]of [["node_modules/.bin/vsce",["package","--no-dependencies","--out",file]],[process.execPath,["scripts/check-vsix.mjs",file]]]){
 const result=spawnSync(command,args,{stdio:"inherit",shell:false});
 if(result.status!==0)process.exit(result.status??1);
}
