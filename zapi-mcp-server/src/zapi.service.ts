import axios, { AxiosInstance, AxiosError } from "axios";

const INSTANCE_ID = process.env.ZAPI_INSTANCE_ID ?? "";
const TOKEN = process.env.ZAPI_TOKEN ?? "";
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN ?? "";

const BASE_URL = `https://api.z-api.io/instances/${INSTANCE_ID}/token/${TOKEN}`;

function client(): AxiosInstance {
  if (!INSTANCE_ID || !TOKEN) {
    throw new Error(
      "Z-API credentials missing. Set ZAPI_INSTANCE_ID and ZAPI_TOKEN env vars."
    );
  }
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(CLIENT_TOKEN ? { "Client-Token": CLIENT_TOKEN } : {}),
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
};
