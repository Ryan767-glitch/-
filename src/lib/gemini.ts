import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export { ai };

// ---------- Structured output schema for fraud detection ----------

export const fraudDetectionSchema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: {
      type: Type.STRING,
      enum: ["safe", "caution", "danger"],
      description:
        "safe=安全, caution=要注意, danger=危険（詐欺の可能性が高い）",
    },
    reason: {
      type: Type.STRING,
      description: "判定理由を高齢者にもわかるように日本語で短く説明",
    },
    advice: {
      type: Type.STRING,
      description: "高齢者への具体的なアドバイスを日本語で短く説明",
    },
  },
  required: ["riskLevel", "reason", "advice"],
};

// ---------- Text (SMS) analysis ----------

export async function analyzeSms(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `あなたは詐欺検出の専門家です。以下のSMS・メッセージが詐欺かどうかを判定してください。
高齢者を狙った特殊詐欺（オレオレ詐欺、還付金詐欺、架空請求、フィッシング等）に特に注意してください。

メッセージ:
${text}`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: fraudDetectionSchema,
    },
  });

  return JSON.parse(response.text ?? "{}") as {
    riskLevel: "safe" | "caution" | "danger";
    reason: string;
    advice: string;
  };
}

// ---------- Image analysis ----------

export async function analyzeImage(base64Data: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `あなたは詐欺検出の専門家です。この画像に詐欺やフィッシングの兆候がないか分析してください。
スクリーンショット、手紙、はがき、ウェブサイトなど、詐欺に使われるあらゆる画像を判定してください。
高齢者を狙った特殊詐欺に特に注意してください。`,
          },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: fraudDetectionSchema,
    },
  });

  return JSON.parse(response.text ?? "{}") as {
    riskLevel: "safe" | "caution" | "danger";
    reason: string;
    advice: string;
  };
}
