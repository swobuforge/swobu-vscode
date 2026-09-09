import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync,readdirSync} from "node:fs";
const locales=["zh-cn","ja","pt-br","id","ko","es","de","fr","ru","uk"];
test("manifest and runtime localization retain complete key and placeholder sets",()=>{
 for(const [base,prefix]of [["package.nls.json","package.nls"],["l10n/bundle.l10n.json","l10n/bundle.l10n"]]){
  const source=JSON.parse(readFileSync(base!,"utf8")) as Record<string,string>;
  for(const locale of locales){const translated=JSON.parse(readFileSync(`${prefix}.${locale}.json`,"utf8")) as Record<string,string>;assert.deepEqual(Object.keys(translated).sort(),Object.keys(source).sort());for(const key of Object.keys(source)){assert.ok(translated[key]);assert.deepEqual(translated[key]!.match(/\{\d+\}/g),source[key]!.match(/\{\d+\}/g));if(prefix==="package.nls"&&(key==="displayName"||key==="description"||key.startsWith("configuration.")))assert.notEqual(translated[key],source[key],`${locale}: untranslated ${key}`);}}
 }
});
test("manifest-visible prose is owned by package localization",()=>{const manifest=JSON.parse(readFileSync("package.json","utf8")) as {displayName:string;description:string};assert.equal(manifest.displayName,"%displayName%");assert.equal(manifest.description,"%description%");});
test("every literal runtime localization key is in the English bundle",()=>{const bundle=JSON.parse(readFileSync("l10n/bundle.l10n.json","utf8")) as Record<string,string>;const files=readdirSync("src",{recursive:true}).map(String).filter(file=>file.endsWith(".ts")).map(file=>`src/${file}`);for(const file of files){const source=readFileSync(file,"utf8");for(const match of source.matchAll(/vscode\.l10n\.t\("([^"]+)"/g))assert.ok(bundle[match[1]!],`${file}: missing ${match[1]}`);assert.doesNotMatch(source,/new\s+[A-Za-z]*Error\s*\(\s*[`'"]/,`${file}: literal error bypasses localization`);}});
