import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { registerZapiTools } from "./tools/zapi.tools.js";
import { credsStorage } from "./context.js";

const server = new McpServer({
  name: "zapi-mcp-server",
  version: "1.0.0",
});

registerZapiTools(server);

async function runHTTP(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", server: "zapi-mcp-server", version: "1.0.0" });
  });

  app.get("/debug/headers", (req, res) => {
    res.json({ headers: req.headers });
  });

  const mcpHandler = async (req: express.Request, res: express.Response) => {
    const h = req.headers;
    const pick = (k: string) => {
      const v = h[k.toLowerCase()];
      return Array.isArray(v) ? v[0] : v ?? "";
    };

    // Priority 1: URL path params (/mcp/:instanceId/:token/:clientToken)
    let instanceId = req.params.instanceId || "";
    let token = req.params.token || "";
    let clientToken = req.params.clientToken || "";

    // Priority 2: separate headers
    if (!instanceId) instanceId = pick("x-zapi-instance-id");
    if (!token) token = pick("x-zapi-token");
    if (!clientToken) clientToken = pick("x-zapi-client-token");

    // Priority 3: single combined header X-Zapi-Auth = "instanceId:token:clientToken"
    const combined = pick("x-zapi-auth");
    if (combined && (!instanceId || !token)) {
      const parts = combined.split(":");
      instanceId = instanceId || parts[0] || "";
      token = token || parts[1] || "";
      clientToken = clientToken || parts[2] || "";
    }

    console.error(
      `[mcp] auth source: ${req.params.instanceId ? "url-path" : instanceId ? "header" : "NONE"}`
    );

    const creds = { instanceId, token, clientToken };

    await credsStorage.run(creds, async () => {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      res.on("close", () => transport.close());
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    });
  };

  // URL-embedded credentials (works for platforms that don't forward custom headers)
  app.post("/mcp/:instanceId/:token/:clientToken", mcpHandler);
  // Original endpoint — credentials via headers or env
  app.post("/mcp", mcpHandler);

  const port = parseInt(process.env.PORT ?? "3000");
  app.listen(port, "0.0.0.0", () => {
    console.error(`zapi-mcp-server running on 0.0.0.0:${port}`);
  });
}

async function runStdio(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("zapi-mcp-server started via stdio");
}

const transport = process.env.TRANSPORT ?? "stdio";

if (transport === "http") {
  runHTTP().catch((err: Error) => {
    console.error("Failed to start HTTP server:", err.message);
    process.exit(1);
  });
} else {
  runStdio().catch((err: Error) => {
    console.error("Failed to start stdio server:", err.message);
    process.exit(1);
  });
}
