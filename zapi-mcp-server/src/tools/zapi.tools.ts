import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { zapiService } from "../zapi.service.js";

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
});
const fail = (e: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: `Error: ${e instanceof Error ? e.message : String(e)}`,
    },
  ],
  isError: true,
});

export function registerZapiTools(server: McpServer): void {
  server.registerTool(
    "send_text_message",
    {
      title: "Send WhatsApp Text Message",
      description:
        "Send a plain text WhatsApp message via Z-API. Phone format: country code + DDD + number, digits only (e.g. 5511999999999).",
      inputSchema: {
        phone: z.string().describe("Phone with country code, digits only"),
        message: z.string().describe("Text message content"),
      },
    },
    async ({ phone, message }) => {
      try {
        return ok(await zapiService.sendText(phone, message));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "send_image_message",
    {
      title: "Send WhatsApp Image",
      description:
        "Send an image via WhatsApp. `image` accepts a public URL or base64 data URI.",
      inputSchema: {
        phone: z.string(),
        image: z.string().describe("Image URL or base64 data URI"),
        caption: z.string().optional(),
      },
    },
    async ({ phone, image, caption }) => {
      try {
        return ok(await zapiService.sendImage(phone, image, caption));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "send_document",
    {
      title: "Send WhatsApp Document",
      description:
        "Send a document/file. Provide file extension (e.g. 'pdf', 'docx', 'xlsx').",
      inputSchema: {
        phone: z.string(),
        document: z.string().describe("Document URL or base64 data URI"),
        extension: z.string().describe("File extension without dot, e.g. 'pdf'"),
        fileName: z.string().optional(),
      },
    },
    async ({ phone, document, extension, fileName }) => {
      try {
        return ok(
          await zapiService.sendDocument(phone, document, extension, fileName)
        );
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "send_audio",
    {
      title: "Send WhatsApp Audio",
      description: "Send an audio message (voice note). URL or base64 data URI.",
      inputSchema: {
        phone: z.string(),
        audio: z.string().describe("Audio URL or base64 data URI"),
      },
    },
    async ({ phone, audio }) => {
      try {
        return ok(await zapiService.sendAudio(phone, audio));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "send_button_message",
    {
      title: "Send WhatsApp Button Message",
      description:
        "Send an interactive message with clickable buttons. Max 3 buttons recommended.",
      inputSchema: {
        phone: z.string(),
        message: z.string().describe("Body text above the buttons"),
        buttons: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
            })
          )
          .describe("List of buttons with id and label"),
      },
    },
    async ({ phone, message, buttons }) => {
      try {
        return ok(await zapiService.sendButtonMessage(phone, message, buttons));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "get_chat_messages",
    {
      title: "Get Chat Messages",
      description: "Retrieve recent messages from a WhatsApp chat.",
      inputSchema: {
        phone: z.string(),
        amount: z.number().int().positive().max(100).default(20).optional(),
      },
    },
    async ({ phone, amount }) => {
      try {
        return ok(await zapiService.getChatMessages(phone, amount));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "check_number_exists",
    {
      title: "Check WhatsApp Number Exists",
      description: "Verify whether a phone number is registered on WhatsApp.",
      inputSchema: {
        phone: z.string(),
      },
    },
    async ({ phone }) => {
      try {
        return ok(await zapiService.checkNumberExists(phone));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "get_contacts",
    {
      title: "Get Contacts",
      description: "List contacts from the WhatsApp instance.",
      inputSchema: {
        page: z.number().int().positive().default(1).optional(),
        pageSize: z.number().int().positive().max(500).default(100).optional(),
      },
    },
    async ({ page, pageSize }) => {
      try {
        return ok(await zapiService.getContacts(page, pageSize));
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "disconnect_instance",
    {
      title: "Disconnect Z-API Instance",
      description:
        "Disconnect (logout) the WhatsApp session from the Z-API instance.",
      inputSchema: {},
    },
    async () => {
      try {
        return ok(await zapiService.disconnectInstance());
      } catch (e) {
        return fail(e);
      }
    }
  );

  server.registerTool(
    "get_instance_status",
    {
      title: "Get Instance Status",
      description:
        "Return the current connection status of the Z-API WhatsApp instance.",
      inputSchema: {},
    },
    async () => {
      try {
        return ok(await zapiService.getInstanceStatus());
      } catch (e) {
        return fail(e);
      }
    }
  );
}
