import assert from "node:assert/strict";
import test from "node:test";
import {
  requireCompatibleStatus,
  CONTROL_PLANE_PROTOCOL,
  ControlPlaneClient,
} from "../src/controlPlane.js";
test("Node status uses the canonical route once without legacy fallback", async () => {
  for (const available of [true, false]) {
    const paths: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      const path = new URL(String(input)).pathname;
      paths.push(path);
      if (path === "/api/v1/status" && !available)
        return new Response("missing canonical status", { status: 404 });
      return Response.json({ state: "healthy", control_plane_protocol: CONTROL_PLANE_PROTOCOL });
    };
    const client = new ControlPlaneClient(new URL("http://127.0.0.1:7926"), fetcher);
    if (available) assert.equal((await client.status()).state, "healthy");
    else await assert.rejects(client.status(), /HTTP 404/);
    assert.deepEqual(paths, ["/api/v1/status"]);
  }
});
test("Workspace discovery uses canonical reads without legacy fallback", async () => {
  const summary = { slug: "research", default_route: "code", route_count: 1 };
  const workspace = { slug: "research", default_route: "code", routes: [{ name: "code" }] };
  for (const available of [true, false]) {
    const paths: string[] = [];
    const signals: Array<AbortSignal | null | undefined> = [];
    const fetcher: typeof fetch = async (input, init) => {
      const path = new URL(String(input)).pathname;
      paths.push(path);
      signals.push(init?.signal);
      if (path.startsWith("/api/v1/") && !available)
        return new Response("missing canonical Workspace", { status: 404 });
      return Response.json(path.endsWith("/workspaces") ? [summary] : workspace);
    };
    const client = new ControlPlaneClient(new URL("http://127.0.0.1:7926"), fetcher);
    const signal = new AbortController().signal;
    if (available) {
      assert.deepEqual(await client.workspaces(signal), [summary]);
      assert.deepEqual(await client.workspace("research", signal), workspace);
    } else {
      await assert.rejects(client.workspaces(signal), /HTTP 404/);
      await assert.rejects(client.workspace("research", signal), /HTTP 404/);
    }
    assert.deepEqual(paths, ["/api/v1/workspaces", "/api/v1/workspaces/research"]);
    assert.deepEqual(signals, [signal, signal]);
  }
});
test("supported protocol is the sole compatibility authority", () => {
  assert.equal(CONTROL_PLANE_PROTOCOL, 14);
  assert.doesNotThrow(() =>
    requireCompatibleStatus({
      state: "healthy",
      control_plane_protocol: CONTROL_PLANE_PROTOCOL,
    }),
  );
  for (const swobu_version of [
    "1.9.4",
    "2.0.3",
    "dev",
    "2.1.0-rc1",
    "git-abc123",
    "whatever",
  ])
    assert.doesNotThrow(() =>
      requireCompatibleStatus({
        state: "healthy",
        control_plane_protocol: CONTROL_PLANE_PROTOCOL,
        swobu_version,
      }),
    );
});
test("missing and unsupported protocols fail regardless of version", () => {
  assert.throws(
    () => requireCompatibleStatus({ state: "healthy", swobu_version: "9.0.0" }),
    /incompatible/,
  );
  assert.throws(
    () =>
      requireCompatibleStatus({
        state: "healthy",
        control_plane_protocol: 8,
        swobu_version: "9.0.0",
      }),
    /incompatible/,
  );
  assert.throws(
    () =>
      requireCompatibleStatus({
        state: "healthy",
        control_plane_protocol: CONTROL_PLANE_PROTOCOL + 1,
        swobu_version: "1.9.4",
      }),
    /incompatible/,
  );
});
