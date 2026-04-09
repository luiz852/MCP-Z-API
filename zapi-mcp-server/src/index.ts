import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { registerZapiTools } from "./tools/zapi.tools.js";

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
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
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
