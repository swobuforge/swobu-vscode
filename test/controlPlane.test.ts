import assert from "node:assert/strict";import test from "node:test";import {requireCompatibleStatus,CONTROL_PLANE_PROTOCOL} from "../src/controlPlane.js";
test("compatible protocol passes",()=>assert.doesNotThrow(()=>requireCompatibleStatus({state:"healthy",control_plane_protocol:CONTROL_PLANE_PROTOCOL})));
test("missing and stale protocols fail",()=>{assert.throws(()=>requireCompatibleStatus({state:"healthy"}),/incompatible/);assert.throws(()=>requireCompatibleStatus({state:"healthy",control_plane_protocol:8}),/incompatible/);});
