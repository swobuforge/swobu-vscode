import * as vscode from "vscode";
export const CONTROL_PLANE_PROTOCOL = 9;
export interface StatusPayload { state: "healthy" | "uninitialized" | "degraded"; workspace_count?: number; control_plane_protocol?: number; swobu_version?: string }
export interface WorkspaceSummary { slug: string; default_route: string; route_count: number }
export interface Route { name: string }
export interface Workspace { slug: string; default_route: string; routes: Route[] }
export class ControlPlaneError extends Error {}
export class CompatibilityError extends ControlPlaneError { constructor(readonly foundProtocol:number|undefined){super(vscode.l10n.t("Swobu control-plane protocol {0} is incompatible; this extension requires {1}.",foundProtocol??vscode.l10n.t("missing"),CONTROL_PLANE_PROTOCOL));} }
export class ControlPlaneClient {
  constructor(readonly endpoint: URL, private readonly fetcher: typeof fetch = fetch) {}
  async status(signal?: AbortSignal): Promise<StatusPayload> { return this.get("/_swobu/status", signal); }
  async workspaces(signal?: AbortSignal): Promise<WorkspaceSummary[]> { return this.get("/_swobu/workspaces", signal); }
  async workspace(slug: string, signal?: AbortSignal): Promise<Workspace> { return this.get(`/_swobu/workspaces/${encodeURIComponent(slug)}`, signal); }
  private async get<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await this.fetcher(new URL(path, this.endpoint), signal ? { signal } : undefined);
    if (!response.ok) throw new ControlPlaneError(vscode.l10n.t("Swobu control plane returned HTTP {0}.",response.status));
    return response.json() as Promise<T>;
  }
}
export function requireCompatibleStatus(value: StatusPayload): void {
  if (value.control_plane_protocol !== CONTROL_PLANE_PROTOCOL) throw new CompatibilityError(value.control_plane_protocol);
}
