import { AsyncLocalStorage } from "node:async_hooks";

export interface ZapiCreds {
  instanceId: string;
  token: string;
  clientToken: string;
}

export const credsStorage = new AsyncLocalStorage<ZapiCreds>();

export function getCreds(): ZapiCreds {
  const fromReq = credsStorage.getStore();
  const instanceId = fromReq?.instanceId || process.env.ZAPI_INSTANCE_ID || "";
  const token = fromReq?.token || process.env.ZAPI_TOKEN || "";
  const clientToken = fromReq?.clientToken || process.env.ZAPI_CLIENT_TOKEN || "";
  if (!instanceId || !token) {
    throw new Error(
      "Z-API credentials missing. Send X-Zapi-Instance-Id and X-Zapi-Token headers, or set env vars."
    );
  }
  return { instanceId, token, clientToken };
}
