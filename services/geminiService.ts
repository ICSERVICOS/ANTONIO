
import { GoogleGenAI, Type } from "@google/genai";
import { StockData } from "../types";

export const fetchStockData = async (ticker: string): Promise<{ data: StockData; sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Forneça dados financeiros detalhados e em tempo real para o ticker: ${ticker}.
    Preciso de:
    1. Preço Atual, LPA (EPS), VPA (BVPS), Dividend Yield atual (%).
    2. Média de dividendos anuais pagos nos últimos 5 anos.
    3. Nome da Empresa, Moeda e Região (Brasil B3 ou Europa).
    4. MONITOR DE DIVIDENDOS:
       - Data do próximo pagamento previsto ou data ex recente (se houver).
       - Frequência de pagamento (ex: Mensal, Trimestral, Semestral).
       - Histórico dos últimos 3 pagamentos (data, valor e tipo como 'Dividendo' ou 'JCP').
    
    Retorne os dados com precisão baseando-se nas informações atuais do mercado.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          ticker: { type: Type.STRING },
          name: { type: Type.STRING },
          currency: { type: Type.STRING },
          currentPrice: { type: Type.NUMBER },
          eps: { type: Type.NUMBER },
          bvps: { type: Type.NUMBER },
          dividendYield: { type: Type.NUMBER },
          avgDividend5Years: { type: Type.NUMBER },
          region: { type: Type.STRING },
          lastUpdated: { type: Type.STRING },
          nextDividendDate: { type: Type.STRING, description: "Data do próximo dividendo" },
          payoutFrequency: { type: Type.STRING, description: "Frequência de pagamento" },
          dividendHistory: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                date: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                type: { type: Type.STRING }
              }
            }
          }
        },
        required: ["ticker", "name", "currency", "currentPrice", "eps", "bvps", "avgDividend5Years"]
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  try {
    const data = JSON.parse(response.text) as StockData;
    return { data, sources };
  } catch (e) {
    throw new Error("Falha ao processar os dados da ação retornados pelo modelo.");
  }
};
