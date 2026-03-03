import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const SYSTEM_INSTRUCTION = `
SYSTEM ROLE
You are an AI system that extracts structured grocery pricing data from Norwegian supermarket receipts and provides competitive price comparisons.

PRIMARY TASK
1. Extract all purchased items from the receipt.
2. Standardize product names.
3. Extract store metadata.
4. For each item, estimate the current price at these specific Norwegian chains: Meny, Kiwi, Bunnpris, Rema 1000, and Coop Extra. Use realistic market data. If a price is unavailable or highly uncertain, use null.

EXTRACTION RULES
- The receipt often has a VAT percentage column (e.g., 15%, 10%, 25%). IGNORE THIS COLUMN. Do not confuse it with the price.
- For weight-based items (e.g., "0,418kg x kr 11,90"), the "price_total" is the final amount on the right (e.g., 4,49).
- "price_total" must be the exact amount paid for that specific line item as shown on the receipt.

STORE INFORMATION
Extract: store_name, store_chain, store_location, purchase_date, purchase_time.

ITEM EXTRACTION
Each item must include:
- original_name: The exact text from the receipt.
- standardized_name: A clean, readable name (e.g., "Mandler 250g").
- product_id: lowercase_with_underscores.
- category: Fruit, Vegetables, Meat, Fish, Dairy, Bread, Frozen, Snacks, Drinks, Household, Other.
- quantity: The number of units or the weight in kg.
- unit: "pcs" or "kg".
- price_total: The final price for this item on the receipt.
- discount: Any discount shown for this item.
- comparisons: An object with keys "Meny", "Kiwi", "Bunnpris", "Rema 1000", "Coop Extra" and their respective estimated prices (numbers or null).
- confidence: Score between 0 and 1.

STRICT RULES
- Return ONLY valid JSON.
- No explanations.
- comparison_date: Include a field "comparison_date" at the root (use 2026-03-03).

JSON STRUCTURE
{
  "store": { ... },
  "currency": "NOK",
  "comparison_date": "2026-03-03",
  "items": [
    {
      "original_name": "",
      "standardized_name": "",
      "product_id": "",
      "category": "",
      "quantity": 1,
      "unit": "",
      "price_total": 0,
      "discount": null,
      "comparisons": {
        "Meny": 25.50,
        "Kiwi": 22.90,
        "Bunnpris": 26.00,
        "Rema 1000": 22.50,
        "Coop Extra": 23.00
      },
      "confidence": 0.95
    }
  ]
}
`;

export async function extractReceiptData(base64Image: string, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("API-nøkkel mangler. Vennligst sjekk konfigurasjonen i AI Studio.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Create a promise that rejects after a timeout
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Tilkoblingen tok for lang tid. Prøv igjen.")), 120000)
  );

  try {
    const apiCall = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Extract data from this Norwegian grocery receipt according to the system instructions. Return ONLY JSON." },
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
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
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
