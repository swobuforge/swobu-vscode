import assert from "node:assert/strict";import test from "node:test";import {estimateTokens} from "../src/tokenCount.js";
test("estimator is deterministic and nonzero",()=>{assert.equal(estimateTokens("hello"),estimateTokens("hello"));assert.ok(estimateTokens("")>=1);assert.ok(estimateTokens("こんにちは")>estimateTokens("hello"));});
