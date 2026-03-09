import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { ExtractionResult } from "../types";

/**
 * System instruction for the Gemini model to ensure accurate and structured data extraction.
 */
const SYSTEM_INSTRUCTION = `
Extract grocery data from Norwegian receipts.
1. Extract items, standardize names, extract store metadata.
2. Ignore VAT columns. Use final line price for price_total.
3. Set "comparisons" to an empty object {}. We use a database for this.
4. IMPORTANT: "product_id" MUST be a standardized, lowercase, underscore-separated ID that uniquely identifies the product regardless of the store (e.g., "tine_melk_hel_1l", "gilde_kjottdeig_400g"). Be consistent.

JSON ONLY. No talk.
Date: 2026-03-03.

Structure:
{
  "store": { "store_name": "", "store_chain": "", "store_location": "", "purchase_date": "", "purchase_time": "" },
  "currency": "NOK",
  "comparison_date": "2026-03-03",
  "items": [{
    "original_name": "", "standardized_name": "", "product_id": "", "category": "",
    "quantity": 1, "unit": "pcs/kg", "price_total": 0, "discount": null,
    "comparisons": {},
    "confidence": 0.9
  }]
}
`;

/**
 * Extracts structured data from a grocery receipt image using Google Gemini AI.
 * 
 * @param base64Image - The base64 encoded image data.
 * @param mimeType - The MIME type of the image (e.g., 'image/jpeg').
 * @returns A promise that resolves to an ExtractionResult object.
 */
export async function extractReceiptData(base64Image: string, mimeType: string): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API-nøkkel mangler. Vennligst sjekk konfigurasjonen i AI Studio.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Create a promise that rejects after a timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Tilkoblingen tok for lang tid. Prøv igjen.")), 90000)
  );

  try {
    const apiCall = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Extract receipt data fast. JSON only." },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        temperature: 0.1, // Lower temperature for faster, more deterministic output
      },
    });

    // Race the API call against the timeout
    const response = await Promise.race([apiCall, timeoutPromise]) as any;

    const text = response.text;
    if (!text) {
      throw new Error("Modellen ga ingen svar. Prøv et tydeligere bilde.");
    }
    
    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error:", text);
      throw new Error("Klarte ikke å tolke dataene fra kvitteringen.");
    }
  } catch (error: any) {
    console.error("Extraction error:", error);
    if (error.message?.includes("fetch")) {
      throw new Error("Nettverksfeil. Sjekk internettforbindelsen din.");
    }
    throw error;
  }
}
