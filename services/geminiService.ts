
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, YogaClass } from "../types";

export const getYogaAdvice = async (history: ChatMessage[], availableClasses: YogaClass[]) => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY não configurada nas variáveis de ambiente.");
    return "Maya está meditando no momento (configure a API KEY). Escolha uma aula que te traga paz!";
  }

  const ai = new GoogleGenAI({ apiKey });
  const context = availableClasses.map(c => `- ${c.title} (${c.category}, ${c.level})`).join('\n');
  const instruction = `Você é Maya, uma guia de yoga experiente e acolhedora. Seu tom é calmo, poético e breve. Seu objetivo é recomendar uma das seguintes aulas do catálogo: \n${context}\nBaseie sua recomendação no que o aluno sente ou busca. Não mencione detalhes técnicos do catálogo, apenas sugira a aula pelo nome.`;

  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(m => ({role: m.role, parts: [{text: m.text}]})),
      config: { 
        systemInstruction: instruction,
        temperature: 0.7
      }
    });
    return res.text || "Deixe sua intuição guiar sua escolha hoje.";
  } catch (error) { 
    console.error("Erro na Maya IA:", error);
    return "Sinta o ritmo da sua respiração. Qual prática te chama agora?"; 
  }
};
