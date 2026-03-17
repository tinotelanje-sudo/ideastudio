import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export interface CodeGenerationParams {
  prompt: string;
  language: string;
  optimizationLevel?: 'none' | 'balanced' | 'size' | 'speed';
  targetHardware?: string;
  targetBoardVariant?: string;
  libraries?: string[];
  model?: string;
}

export const generateCode = async (params: CodeGenerationParams) => {
  const ai = getAI();
  const modelName = params.model || "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are an expert developer specializing in ${params.language === 'kotlin' ? 'Android and Kotlin' : 'embedded systems'}. 
  Generate high-quality, efficient code based on the user's request.
  Target Language: ${params.language}
  Target Hardware: ${params.targetHardware || 'Generic'}
  Board Variant: ${params.targetBoardVariant || 'Default'}
  Optimization Level: ${params.optimizationLevel || 'balanced'}
  Required Libraries: ${params.libraries?.join(', ') || 'None specified'}

  Return ONLY the code, no markdown formatting or explanations unless requested.
  Ensure the code is complete and ready to compile/run for the target platform.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: params.prompt,
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
