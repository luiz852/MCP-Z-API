# zapi-mcp-server

MCP server for [Z-API](https://developer.z-api.io/en/) (WhatsApp API).

## Tools

- `send_text_message`
- `send_image_message`
- `send_document`
- `send_audio`
- `send_button_message`
- `get_chat_messages`
- `check_number_exists`
- `get_contacts`
- `disconnect_instance`
- `get_instance_status`

## Env vars

- `ZAPI_INSTANCE_ID` — your Z-API instance id
- `ZAPI_TOKEN` — instance token
- `ZAPI_CLIENT_TOKEN` — account security token (sent as `Client-Token` header)
- `TRANSPORT` — `http` (for Railway) or `stdio` (default, for local MCP clients)
- `PORT` — HTTP port (Railway injects automatically)

## Local (stdio)

```bash
cd zapi-mcp-server
npm install
npm run build
ZAPI_INSTANCE_ID=... ZAPI_TOKEN=... ZAPI_CLIENT_TOKEN=... node dist/index.js
```

## Railway deploy

1. Push this repo to GitHub (the outer folder containing `zapi-mcp-server/`).
2. Create a new Railway project → Deploy from Repo.
3. Railway will pick up the `Dockerfile` at the repo root.
4. Set env vars: `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`.
   `TRANSPORT=http` is already set in the Dockerfile.
5. Expose the service — MCP endpoint will be `https://<your-app>.up.railway.app/mcp`.

Same layout as the `vitruvio-mcp-server`.
