import assert from "node:assert/strict";
import test from "node:test";
import { updateOverride } from "../src/configureModel.js";

test("defaults delete overrides, reset preserves other routes",()=>{
 const original={"work/code":{toolCalling:false,imageInput:true},"work/review":{maxInputTokens:65536}};
 const next=updateOverride(original,"work/code","toolCalling",undefined);
 assert.deepEqual(next["work/code"],{imageInput:true});
 assert.deepEqual(updateOverride(next,"work/code","reset",undefined),{"work/review":{maxInputTokens:65536}});
 assert.equal(original["work/code"].toolCalling,false);
});
test("empty overrides disappear and numeric advertisements are positive integers",()=>{
 assert.deepEqual(updateOverride({x:{imageInput:true}},"x","imageInput",undefined),{});
 for(const n of [0,-1,1.5,Infinity])assert.throws(()=>updateOverride({},"x","maxInputTokens",n));
 assert.deepEqual(updateOverride({},"x","maxOutputTokens",8192),{x:{maxOutputTokens:8192}});
});
