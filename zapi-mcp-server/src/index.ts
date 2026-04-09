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

  app.post("/mcp", async (req, res) => {
    const h = req.headers;
    const pick = (k: string) => {
      const v = h[k.toLowerCase()];
      return Array.isArray(v) ? v[0] : v ?? "";
    };
    // Supports either 3 separate headers OR a single "X-Zapi-Auth" header
    // with format: "instanceId:token:clientToken"
    let instanceId = pick("x-zapi-instance-id");
    let token = pick("x-zapi-token");
    let clientToken = pick("x-zapi-client-token");
    const combined = pick("x-zapi-auth");
    if (combined && (!instanceId || !token)) {
      const parts = combined.split(":");
      instanceId = instanceId || parts[0] || "";
      token = token || parts[1] || "";
      clientToken = clientToken || parts[2] || "";
    }
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
  });

  const port = parseInt(process.env.PORT ?? "3000");
  app.listen(port, () => {
    console.error(`zapi-mcp-server running at http://localhost:${port}/mcp`);
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
