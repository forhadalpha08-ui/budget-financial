import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support image payloads up to 25MB
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Initialize Gemini safely
  function getGeminiClient(): GoogleGenAI | null {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Receipt Scanner endpoint
  app.post('/api/scan-receipt', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', knownCategories = [] } = req.body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Missing or invalid imageBase64 in request body' });
        return;
      }

      // Clean base64 string
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

      const ai = getGeminiClient();

      if (!ai) {
        // Mock / heuristic fallback if API key is not configured in local environment
        res.json({
          merchant: 'Sample Supermarket',
          date: new Date().toISOString().slice(0, 10),
          total: 42.85,
          subtotal: 39.50,
          tax: 3.35,
          tip: 0,
          category: 'Groceries',
          paymentMethod: 'Credit Card',
          items: [
            { name: 'Organic Milk 1 Gallon', quantity: 1, price: 5.49 },
            { name: 'Artisan Sourdough Bread', quantity: 1, price: 6.25 },
            { name: 'Fresh Strawberries 1lb', quantity: 2, price: 8.98 },
            { name: 'Greek Yogurt 32oz', quantity: 1, price: 6.79 },
            { name: 'Free-range Eggs Dozen', quantity: 1, price: 5.99 },
            { name: 'Avocados Bag', quantity: 1, price: 6.00 }
          ],
          confidence: 0.92,
          notes: 'Processed using default template (Gemini API key not yet set in Settings)',
          isSimulated: true,
        });
        return;
      }

      const categoriesList = knownCategories.length > 0
        ? knownCategories.join(', ')
        : 'Groceries, Dining Out, Utilities, Transportation, Entertainment, Shopping, Health & Medical, Housing, Personal Care, General';

      const prompt = `You are an expert OCR and financial data extraction model. Carefully inspect this receipt image and extract structured data.
Existing user budget categories: [${categoriesList}].
Select the most accurate category from this list, or choose the best fit if none match exactly.

Rules:
1. "merchant": The store or restaurant or provider name (e.g. "Trader Joe's", "Starbucks", "Shell").
2. "date": ISO format YYYY-MM-DD. If year is missing or ambiguous, use the current year (2026).
3. "total": The grand total charged.
4. "subtotal": Subtotal before tax/tip if visible, otherwise null or equal to total.
5. "tax": Tax amount if visible, otherwise null.
6. "tip": Tip amount if visible, otherwise null.
7. "category": Pick best matching category from [${categoriesList}].
8. "paymentMethod": e.g. "Credit Card", "Debit Card", "Cash", "Apple Pay", "Unknown".
9. "items": List individual line items with item name, quantity (default 1), and price per item or line price.
10. "confidence": A float from 0.0 to 1.0 estimating your confidence in the OCR accuracy.
11. "notes": Any additional notes such as receipt number or discounts.`;

      const imagePart = {
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: cleanBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [imagePart, { text: prompt }],
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              merchant: { type: Type.STRING },
              date: { type: Type.STRING, description: 'YYYY-MM-DD' },
              total: { type: Type.NUMBER },
              subtotal: { type: Type.NUMBER },
              tax: { type: Type.NUMBER },
              tip: { type: Type.NUMBER },
              category: { type: Type.STRING },
              paymentMethod: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              notes: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    price: { type: Type.NUMBER },
                  },
                  required: ['name', 'price'],
                },
              },
            },
            required: ['merchant', 'date', 'total', 'category'],
          },
        },
      });

      const rawText = response.text || '{}';
      const parsedData = JSON.parse(rawText);

      res.json({
        merchant: parsedData.merchant || 'Unknown Merchant',
        date: parsedData.date || new Date().toISOString().slice(0, 10),
        total: typeof parsedData.total === 'number' ? parsedData.total : 0,
        subtotal: typeof parsedData.subtotal === 'number' ? parsedData.subtotal : parsedData.total,
        tax: typeof parsedData.tax === 'number' ? parsedData.tax : 0,
        tip: typeof parsedData.tip === 'number' ? parsedData.tip : 0,
        category: parsedData.category || 'General',
        paymentMethod: parsedData.paymentMethod || 'Credit Card',
        items: Array.isArray(parsedData.items) ? parsedData.items : [],
        confidence: typeof parsedData.confidence === 'number' ? parsedData.confidence : 0.95,
        notes: parsedData.notes || '',
        isSimulated: false,
      });
    } catch (err: any) {
      console.error('Receipt scanning error:', err);
      res.status(500).json({
        error: 'Failed to scan receipt with Gemini AI: ' + (err?.message || 'Internal error'),
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
