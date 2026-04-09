import axios, { AxiosInstance, AxiosError } from "axios";
import { getCreds } from "./context.js";

function client(): AxiosInstance {
  const { instanceId, token, clientToken } = getCreds();
  return axios.create({
    baseURL: `https://api.z-api.io/instances/${instanceId}/token/${token}`,
    headers: {
      "Content-Type": "application/json",
      ...(clientToken ? { "Client-Token": clientToken } : {}),
    },
    timeout: 30000,
  });
}

function handleError(err: unknown): never {
  const e = err as AxiosError<any>;
  const status = e.response?.status;
  const data = e.response?.data;
  const msg =
    (data && (data.error || data.message)) || e.message || "Unknown Z-API error";
  throw new Error(`Z-API error${status ? ` (${status})` : ""}: ${JSON.stringify(msg)}`);
}

export interface ButtonItem {
  id: string;
  label: string;
}

export const zapiService = {
  async sendText(phone: string, message: string) {
    try {
      const { data } = await client().post("/send-text", { phone, message });
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async sendImage(phone: string, image: string, caption?: string) {
    try {
      const { data } = await client().post("/send-image", {
        phone,
        image,
        caption,
      });
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async sendDocument(
    phone: string,
    document: string,
    extension: string,
    fileName?: string
  ) {
    try {
      const { data } = await client().post(`/send-document/${extension}`, {
        phone,
        document,
        fileName,
      });
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async sendAudio(phone: string, audio: string) {
    try {
      const { data } = await client().post("/send-audio", { phone, audio });
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async sendButtonMessage(
    phone: string,
    message: string,
    buttonList: ButtonItem[]
  ) {
    try {
      const { data } = await client().post("/send-button-list", {
        phone,
        message,
        buttonList: { buttons: buttonList },
      });
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async getChatMessages(phone: string, amount = 20) {
    try {
      const { data } = await client().get(`/chat-messages/${phone}`, {
        params: { amount },
      });
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async checkNumberExists(phone: string) {
    try {
      const { data } = await client().get(`/phone-exists/${phone}`);
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async getContacts(page = 1, pageSize = 100) {
    try {
      const { data } = await client().get("/contacts", {
        params: { page, pageSize },
      });
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async disconnectInstance() {
    try {
      const { data } = await client().get("/disconnect");
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async getInstanceStatus() {
    try {
      const { data } = await client().get("/status");
      return data;
    } catch (e) {
      handleError(e);
    }
  },

  async sendVideo(phone: string, video: string, caption?: string) {
    try {
      const { data } = await client().post("/send-video", { phone, video, caption });
      return data;
    } catch (e) { handleError(e); }
  },

  async sendSticker(phone: string, sticker: string) {
    try {
      const { data } = await client().post("/send-sticker", { phone, sticker });
      return data;
    } catch (e) { handleError(e); }
  },

  async sendLocation(phone: string, latitude: number, longitude: number, title?: string, address?: string) {
    try {
      const { data } = await client().post("/send-location", { phone, latitude, longitude, title, address });
      return data;
    } catch (e) { handleError(e); }
  },

  async sendContact(phone: string, contactName: string, contactPhone: string, contactBusinessDescription?: string) {
    try {
      const { data } = await client().post("/send-contact", {
        phone,
        contactName,
        contactPhone,
        contactBusinessDescription,
      });
      return data;
    } catch (e) { handleError(e); }
  },

  async sendLink(phone: string, message: string, image: string, linkUrl: string, title: string, linkDescription?: string) {
    try {
      const { data } = await client().post("/send-link", {
        phone,
        message,
        image,
        linkUrl,
        title,
        linkDescription,
      });
      return data;
    } catch (e) { handleError(e); }
  },

  async sendPoll(phone: string, message: string, poll: string[]) {
    try {
      const { data } = await client().post("/send-poll", {
        phone,
        message,
        poll,
      });
      return data;
    } catch (e) { handleError(e); }
  },

  async deleteMessage(phone: string, messageId: string, owner: string) {
    try {
      const { data } = await client().delete("/messages", {
        params: { phone, messageId, owner },
      });
      return data;
    } catch (e) { handleError(e); }
  },

  async reactToMessage(phone: string, messageId: string, reaction: string) {
    try {
      const { data } = await client().post("/send-reaction", {
        phone,
        messageId,
        reaction,
      });
      return data;
    } catch (e) { handleError(e); }
  },

  async markAsRead(phone: string, messageId?: string) {
    try {
      const { data } = await client().post("/read-message", { phone, messageId });
      return data;
    } catch (e) { handleError(e); }
  },

  async sendOptionList(phone: string, message: string, title: string, buttonLabel: string, options: Array<{ title: string; description?: string; id?: string }>) {
    try {
      const { data } = await client().post("/send-option-list", {
        phone,
        message,
        optionList: {
          title,
          buttonLabel,
          options,
        },
      });
      return data;
    } catch (e) { handleError(e); }
  },

  async createGroup(groupName: string, phones: string[]) {
    try {
      const { data } = await client().post("/create-group", { groupName, phones });
      return data;
    } catch (e) { handleError(e); }
  },

  async addGroupParticipant(groupId: string, phones: string[]) {
    try {
      const { data } = await client().post("/add-participant", { groupId, phones });
      return data;
    } catch (e) { handleError(e); }
  },

  async removeGroupParticipant(groupId: string, phones: string[]) {
    try {
      const { data } = await client().post("/remove-participant", { groupId, phones });
      return data;
    } catch (e) { handleError(e); }
  },

  async leaveGroup(groupId: string) {
    try {
      const { data } = await client().post("/leave-group", { groupId });
      return data;
    } catch (e) { handleError(e); }
  },
};
