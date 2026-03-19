import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import type { SkinAnalysisResult } from "@/types/analysis";

const systemPrompt = `Ты — профессиональный дерматолог-AI, анализирующий фотографии кожи лица. 
Проанализируй изображение и предоставь детальный анализ в формате JSON.

Определи:
1. Тип кожи (dry, oily, combination, normal, sensitive)
2. Проблемные зоны с координатами (x, y в процентах: 0=левый/верх, 100=правый/низ)
3. Состояние кожи и проблемы с оценкой тяжести
4. Возможные причины проблем
5. Конкретные рекомендации по уходу
6. Нужна ли консультация дерматолога

ВАЖНО: Отвечай ТОЛЬКО валидным JSON без markdown, без \`\`\`json. Формат ответа строго такой:
{
  "skinType": "combination",
  "skinTypeDescription": "Описание типа кожи на русском",
  "conditions": [
    { "name": "Название проблемы", "description": "Описание на русском", "severity": "mild" }
  ],
  "problemZones": [
    { "x": 30, "y": 40, "problem": "Описание зоны на русском", "severity": "mild" }
  ],
  "possibleCauses": ["Причина 1", "Причина 2"],
  "recommendations": [
    { "title": "Рекомендация", "description": "Описание", "category": "skincare" }
  ],
  "shouldSeeDermatologist": false,
  "dermatologistReason": "",
  "overallHealth": 75,
  "summary": "Краткое резюме на русском"
}`;

function base64ToGenerativePart(base64DataUrl: string) {
    // base64DataUrl looks like: data:image/jpeg;base64,/9j/4AAQ...
    const [header, data] = base64DataUrl.split(",");
    const mimeType = header.split(":")[1].split(";")[0];
    return { inlineData: { data, mimeType } };
}

export async function analyzeSkinWithGemini(imageBase64: string): Promise<SkinAnalysisResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY не задан в .env файле");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        ],
    });

    const imagePart = base64ToGenerativePart(imageBase64);

    try {
        const result = await model.generateContent([systemPrompt, imagePart]);
        const response = await result.response;
        let text = response.text().trim();

        // Strip markdown code fences if present
        if (text.startsWith("```json")) text = text.slice(7);
        else if (text.startsWith("```")) text = text.slice(3);
        if (text.endsWith("```")) text = text.slice(0, -3);
        text = text.trim();

        return JSON.parse(text) as SkinAnalysisResult;
    } catch (error: any) {
        console.warn("Gemini API Error, using mock fallback:", error);

        // Broaden fallback for Quota (429) OR Model Not Found (404) OR General Fetch Errors
        const errorMessage = error.message?.toLowerCase() || "";
        if (
            errorMessage.includes("429") ||
            errorMessage.includes("quota") ||
            errorMessage.includes("404") ||
            errorMessage.includes("not found")
        ) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
            return {
                skinType: "combination",
                skinTypeDescription: "Демо-анализ (API недоступен): Комбинированный тип кожи, склонный к жирности в Т-зоне.",
                conditions: [
                    { name: "Легкое покраснение", description: "Наблюдается небольшое раздражение в области щек.", severity: "mild" },
                    { name: "Расширенные поры", description: "Поры в области носа расширены, что характерно для данного типа.", severity: "moderate" }
                ],
                problemZones: [
                    { x: 45, y: 35, problem: "Покраснение", severity: "mild" },
                    { x: 50, y: 45, problem: "Жирный блеск", severity: "moderate" }
                ],
                possibleCauses: ["Недостаточное увлажнение", "Агрессивное очищение"],
                recommendations: [
                    { title: "Мягкое очищение", description: "Используйте бессульфатные гели для умывания.", category: "skincare" },
                    { title: "Увлажняющий гель", description: "Легкие текстуры с гиалуроновой кислотой.", category: "skincare" }
                ],
                shouldSeeDermatologist: false,
                overallHealth: 82,
                summary: "В целом кожа выглядит здоровой, но требует более деликатного ухода за чувствительными зонами."
            };
        }
        throw error;
    }
}
