
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIRecommendations = async (cartItems: Product[], allProducts: Product[]): Promise<string[]> => {
  if (cartItems.length === 0) return [];

  const cartNames = cartItems.map(i => i.name).join(", ");
  const productContext = allProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}`).join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on these items in the user's cart: [${cartNames}], recommend 2 additional product IDs from this list:
      ${productContext}
      Return ONLY a JSON array of IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini AI recommendation failed", error);
    return [];
  }
};

export const getSmartSearchResults = async (query: string, allProducts: Product[]): Promise<string[]> => {
  const productContext = allProducts.map(p => `ID: ${p.id}, Name: ${p.name}, Desc: ${p.description}`).join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User is searching for: "${query}". Based on this product catalog, return the IDs of the products that most closely match the user's intent:
      ${productContext}
      Return ONLY a JSON array of IDs.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini AI search failed", error);
    return [];
  }
};
