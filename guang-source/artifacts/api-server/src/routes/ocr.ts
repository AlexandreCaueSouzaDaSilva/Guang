import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const router = Router();

const SUPPORTED_LANGUAGES = [
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "it", name: "Italian", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "中文 (简体)" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands" },
  { code: "pl", name: "Polish", nativeName: "Polski" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

router.get("/languages", (_req, res) => {
  res.json(SUPPORTED_LANGUAGES);
});

router.post("/ocr/transcribe", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { imageBase64, targetLanguage, sourceLanguage } = req.body as {
      imageBase64?: string;
      targetLanguage?: string | null;
      sourceLanguage?: string | null;
    };

    if (!imageBase64) {
      res.status(400).json({ error: "imageBase64 is required" });
      return;
    }

    const base64Data = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    let prompt = "Extract ALL visible text from this image exactly as it appears. Return only the extracted text, nothing else.";

    if (targetLanguage) {
      const langName = SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage)?.name ?? targetLanguage;
      prompt = `Extract ALL visible text from this image and translate it to ${langName}. Return only the translated text, nothing else.`;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: base64Data } },
    ]);

    const transcribedText = result.response.text().trim();

    res.json({
      transcribedText,
      detectedLanguage: sourceLanguage ?? "unknown",
      targetLanguage: targetLanguage ?? null,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to process image" });
  }
});

export default router;