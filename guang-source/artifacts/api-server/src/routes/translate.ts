import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";

const router = Router();

const SUPPORTED_LANGUAGES = [
  { code: "pt", name: "Portuguese" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "hi", name: "Hindi" },
];

router.post("/translate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body as {
      text?: string;
      targetLanguage?: string;
      sourceLanguage?: string;
    };

    if (!text || !text.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }
    if (!targetLanguage) {
      res.status(400).json({ error: "targetLanguage is required" });
      return;
    }

    const targetName =
      SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage)?.name ?? targetLanguage;
    const sourceHint = sourceLanguage
      ? ` The source text is in ${SUPPORTED_LANGUAGES.find((l) => l.code === sourceLanguage)?.name ?? sourceLanguage}.`
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `You are an expert translator. Translate the provided text to ${targetName}.${sourceHint} Return only the translated text, nothing else. Preserve formatting and line breaks.`,
        },
        {
          role: "user",
          content: text.trim(),
        },
      ],
    });

    const translatedText = response.choices[0]?.message?.content?.trim() ?? "";
    res.json({ translatedText, targetLanguage });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Translation failed" });
  }
});

export default router;
