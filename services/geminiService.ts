
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, YogaClass } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getYogaAdvice = async (history: ChatMessage[], availableClasses: YogaClass[]) => {
  const context = availableClasses.map(c => `- ${c.title} (${c.category})`).join('\n');
  const instruction = `Você é Maya, guia de yoga. Recomende uma destas aulas: ${context}. Seja zen e breve.`;
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(m => ({role: m.role, parts: [{text: m.text}]})),
      config: { systemInstruction: instruction }
    });
    return res.text;
  } catch { return "Sinta sua respiração e escolha a aula que seu coração pedir."; }
};
