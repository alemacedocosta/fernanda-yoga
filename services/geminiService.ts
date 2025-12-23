
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, YogaClass } from "../types";

/**
 * Service to fetch personalized yoga advice from Maya (Gemini).
 * Adheres to @google/genai SDK best practices and required configurations.
 */
export const getYogaAdvice = async (history: ChatMessage[], availableClasses: YogaClass[]) => {
  // Always initialize with the structured apiKey object from environment variables.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const context = availableClasses.map(c => `- ${c.title} (${c.category}, ${c.level})`).join('\n');
  const instruction = `Você é Maya, uma guia de yoga experiente e acolhedora. Seu tom é calmo, poético e breve. Seu objetivo é recomendar uma das seguintes aulas do catálogo: \n${context}\nBaseie sua recomendação no que o aluno sente ou busca. Não mencione detalhes técnicos do catálogo, apenas sugira a aula pelo nome.`;

  try {
    // Query GenAI with both the model name and prompt (or conversation history).
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })),
      config: { 
        systemInstruction: instruction,
        temperature: 0.7
      }
    });

    // Access the .text property directly (not a method).
    return response.text || "Deixe sua intuição guiar sua escolha hoje.";
  } catch (error) { 
    console.error("Erro na Maya IA:", error);
    return "Sinta o ritmo da sua respiração. Qual prática te chama agora?"; 
  }
};
