import assert from "node:assert/strict";
import test from "node:test";
import * as vscode from "vscode";
import {projectError} from "../src/responses/errors.js";

test("structured Swobu errors retain their actionable public detail",()=>{
 const error=projectError(400,JSON.stringify({error:{type:"invalid_request_error",code:"invalid_value",message:"The previous response does not belong to this route."}}));
 assert.equal(error.message,"Swobu request failed (HTTP 400). The previous response does not belong to this route. (invalid_value)");
});

test("known HTTP statuses retain VS Code language-model error classification",()=>{
 for(const status of [401,403,404,429])assert.ok(projectError(status,JSON.stringify({error:{message:"Action required."}})) instanceof vscode.LanguageModelError);
});

test("malformed or empty bodies do not expose raw transport content",()=>{
 assert.equal(projectError(400,"<html>private proxy failure</html>").message,"Swobu request failed (HTTP 400).");
 assert.equal(projectError(500,JSON.stringify({error:{message:"  "}})).message,"Swobu request failed (HTTP 500).");
});
