import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

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

    // Strip data URI prefix if present and get the URL
    const base64Data = imageBase64.includes(",")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    let systemPrompt =
      "You are an expert OCR system. Extract ALL visible text from the provided image exactly as it appears. Preserve line breaks, punctuation, and formatting as faithfully as possible. Return only the extracted text, nothing else.";

    if (targetLanguage) {
      const langName =
        SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage)?.name ??
        targetLanguage;
      systemPrompt =
        `You are an expert OCR and translation system. First extract ALL visible text from the provided image exactly as it appears. ` +
        `Then translate the extracted text to ${langName}. Return only the translated text, nothing else. Do not include the original text.`;
    }

    const sourceHint = sourceLanguage
      ? ` The source text is likely in ${SUPPORTED_LANGUAGES.find((l) => l.code === sourceLanguage)?.name ?? sourceLanguage}.`
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 4096,
      messages: [
        {
          role: "system",
          content: systemPrompt + sourceHint,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: base64Data },
            },
            {
              type: "text",
              text: targetLanguage
                ? "Extract the text from this image and translate it."
                : "Extract all text from this image.",
            },
          ],
        },
      ],
    });

    const transcribedText =
      response.choices[0]?.message?.content?.trim() ?? "";

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
