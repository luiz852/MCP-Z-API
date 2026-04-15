import { AsyncLocalStorage } from "node:async_hooks";

export interface ZapiCreds {
  instanceId: string;
  token: string;
  clientToken: string;
}

export const credsStorage = new AsyncLocalStorage<ZapiCreds>();

export function getCreds(): ZapiCreds {
  const fromReq = credsStorage.getStore();
  // When running via HTTP (multi-tenant), credentials MUST come from request headers.
  // Env vars are only used as fallback if running via stdio (no request context at all).
  const useEnvFallback = !fromReq;
  const instanceId =
    fromReq?.instanceId || (useEnvFallback ? process.env.ZAPI_INSTANCE_ID : "") || "";
  const token =
    fromReq?.token || (useEnvFallback ? process.env.ZAPI_TOKEN : "") || "";
  const clientToken =
    fromReq?.clientToken || (useEnvFallback ? process.env.ZAPI_CLIENT_TOKEN : "") || "";
  if (!instanceId || !token) {
    throw new Error(
      "Z-API credentials missing. Send X-Zapi-Instance-Id, X-Zapi-Token and X-Zapi-Client-Token headers on each MCP request."
    );
  }
  return { instanceId, token, clientToken };
}
