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
    "send_video",
    {
      title: "Send WhatsApp Video",
      description: "Send a video. URL or base64 data URI.",
      inputSchema: {
        phone: z.string(),
        video: z.string(),
        caption: z.string().optional(),
      },
    },
    async ({ phone, video, caption }) => {
      try { return ok(await zapiService.sendVideo(phone, video, caption)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "send_sticker",
    {
      title: "Send WhatsApp Sticker",
      description: "Send a sticker. URL or base64 (webp).",
      inputSchema: { phone: z.string(), sticker: z.string() },
    },
    async ({ phone, sticker }) => {
      try { return ok(await zapiService.sendSticker(phone, sticker)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "send_location",
    {
      title: "Send WhatsApp Location",
      description: "Send a geographic location.",
      inputSchema: {
        phone: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        title: z.string().optional(),
        address: z.string().optional(),
      },
    },
    async ({ phone, latitude, longitude, title, address }) => {
      try { return ok(await zapiService.sendLocation(phone, latitude, longitude, title, address)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "send_contact",
    {
      title: "Send WhatsApp Contact (vCard)",
      description: "Share a contact card.",
      inputSchema: {
        phone: z.string(),
        contactName: z.string(),
        contactPhone: z.string(),
        contactBusinessDescription: z.string().optional(),
      },
    },
    async ({ phone, contactName, contactPhone, contactBusinessDescription }) => {
      try { return ok(await zapiService.sendContact(phone, contactName, contactPhone, contactBusinessDescription)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "send_link",
    {
      title: "Send WhatsApp Link with Preview",
      description: "Send a URL with rich link preview (thumbnail, title, description).",
      inputSchema: {
        phone: z.string(),
        message: z.string(),
        image: z.string().describe("Preview image URL"),
        linkUrl: z.string(),
        title: z.string(),
        linkDescription: z.string().optional(),
      },
    },
    async ({ phone, message, image, linkUrl, title, linkDescription }) => {
      try { return ok(await zapiService.sendLink(phone, message, image, linkUrl, title, linkDescription)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "send_poll",
    {
      title: "Send WhatsApp Poll",
      description: "Send a poll with multiple options.",
      inputSchema: {
        phone: z.string(),
        message: z.string().describe("Poll question"),
        poll: z.array(z.string()).describe("Array of option texts"),
      },
    },
    async ({ phone, message, poll }) => {
      try { return ok(await zapiService.sendPoll(phone, message, poll)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "delete_message",
    {
      title: "Delete WhatsApp Message",
      description: "Delete a previously sent message.",
      inputSchema: {
        phone: z.string(),
        messageId: z.string(),
        owner: z.string().describe("Message owner phone (usually the instance number)"),
      },
    },
    async ({ phone, messageId, owner }) => {
      try { return ok(await zapiService.deleteMessage(phone, messageId, owner)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "react_to_message",
    {
      title: "React to WhatsApp Message",
      description: "Add an emoji reaction to a message. Use empty string to remove.",
      inputSchema: {
        phone: z.string(),
        messageId: z.string(),
        reaction: z.string().describe("Single emoji, e.g. '👍'"),
      },
    },
    async ({ phone, messageId, reaction }) => {
      try { return ok(await zapiService.reactToMessage(phone, messageId, reaction)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "mark_as_read",
    {
      title: "Mark Chat as Read",
      description: "Mark messages in a chat as read.",
      inputSchema: {
        phone: z.string(),
        messageId: z.string().optional(),
      },
    },
    async ({ phone, messageId }) => {
      try { return ok(await zapiService.markAsRead(phone, messageId)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "send_option_list",
    {
      title: "Send WhatsApp Option List",
      description: "Send an interactive message with a selectable option list (more options than buttons).",
      inputSchema: {
        phone: z.string(),
        message: z.string(),
        title: z.string().describe("List header title"),
        buttonLabel: z.string().describe("Label shown on the tap-to-open button"),
        options: z.array(
          z.object({
            title: z.string(),
            description: z.string().optional(),
            id: z.string().optional(),
          })
        ),
      },
    },
    async ({ phone, message, title, buttonLabel, options }) => {
      try { return ok(await zapiService.sendOptionList(phone, message, title, buttonLabel, options)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "create_group",
    {
      title: "Create WhatsApp Group",
      description: "Create a new group with given participants.",
      inputSchema: {
        groupName: z.string(),
        phones: z.array(z.string()).describe("Participant phone numbers"),
      },
    },
    async ({ groupName, phones }) => {
      try { return ok(await zapiService.createGroup(groupName, phones)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "add_group_participant",
    {
      title: "Add Group Participant",
      description: "Add one or more participants to a group.",
      inputSchema: {
        groupId: z.string(),
        phones: z.array(z.string()),
      },
    },
    async ({ groupId, phones }) => {
      try { return ok(await zapiService.addGroupParticipant(groupId, phones)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "remove_group_participant",
    {
      title: "Remove Group Participant",
      description: "Remove one or more participants from a group.",
      inputSchema: {
        groupId: z.string(),
        phones: z.array(z.string()),
      },
    },
    async ({ groupId, phones }) => {
      try { return ok(await zapiService.removeGroupParticipant(groupId, phones)); } catch (e) { return fail(e); }
    }
  );

  server.registerTool(
    "leave_group",
    {
      title: "Leave Group",
      description: "Leave a WhatsApp group.",
      inputSchema: { groupId: z.string() },
    },
    async ({ groupId }) => {
      try { return ok(await zapiService.leaveGroup(groupId)); } catch (e) { return fail(e); }
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
