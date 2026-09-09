import assert from "node:assert/strict";
import test from "node:test";
import {clientConnectArgs} from "../src/connect.js";

test("Claude Code and Codex delegate exact workspace and address to ordinary Swobu",()=>{
 assert.deepEqual(clientConnectArgs("claude","work","127.0.0.1:7926"),["connect","claude","--workspace","work","--addr","127.0.0.1:7926"]);
 assert.deepEqual(clientConnectArgs("codex","review","127.0.0.1:8123"),["connect","codex","--workspace","review","--addr","127.0.0.1:8123"]);
});
