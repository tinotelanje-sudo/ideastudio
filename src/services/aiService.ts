import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateArduinoCode = async (prompt: string) => {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are an expert Arduino developer. 
  Generate high-quality, efficient C++ code for Arduino based on the user's request.
  Return ONLY the code, no markdown formatting or explanations unless requested.
  Ensure the code includes setup() and loop() functions.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return response.text || "// Failed to generate code";
};

export const studyDevice = async (deviceInfo: string) => {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are a hardware innovation expert. 
  Analyze the provided device specifications and firmware information.
  Suggest 3 innovative upgrades for the firmware, OS, or UI.
  Provide technical details on how to implement these upgrades.
  Format the response in clear Markdown.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Study this device: ${deviceInfo}`,
    config: {
      systemInstruction,
    },
  });

  return response.text || "No innovation suggestions available.";
};
