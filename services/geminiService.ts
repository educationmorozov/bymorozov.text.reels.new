
import { GoogleGenAI } from "@google/genai";
import { TextFormat } from "../types";
import { FORMAT_DETAILS } from "../constants";

export class GeminiService {
  /**
   * Generates text based on format and idea using gemini-3-flash-preview.
   */
  async generateInitialText(format: TextFormat, idea: string): Promise<string> {
    try {
      // Correct initialization using named parameter as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const detail = FORMAT_DETAILS[format];
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Тема: ${idea}`,
        config: {
          systemInstruction: detail.systemInstruction,
          temperature: 0.8,
        }
      });
      // Correct extraction of text output from response object
      return response.text || '';
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Ошибка генерации. Попробуйте еще раз.";
    }
  }

  /**
   * Generates a vertical image background using gemini-2.5-flash-image.
   */
  async generateImageBackground(prompt: string): Promise<string> {
    try {
      // Correct initialization using named parameter
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `High-quality atmospheric 9:16 vertical background for text content, minimalistic, cinematic lighting, ${prompt}` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16"
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        // Correctly handle the inlineData from the parts to find generated images
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return "";
    } catch (error) {
      console.error("Image Gen Error:", error);
      return "";
    }
  }
}
