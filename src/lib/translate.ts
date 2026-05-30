import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type Locale = "zh" | "fr" | "en";

export interface TranslateInput {
  sourceLocale: Locale;
  targetLocales: Locale[];
  fields: {
    name: string;
    description: string;
  };
}

export interface TranslateResult {
  locale: Locale;
  name: string;
  description: string;
}

const LOCALE_NAMES: Record<Locale, string> = {
  zh: "Chinese (Simplified)",
  fr: "French",
  en: "English",
};

/**
 * Translate product name + description from source locale to target locales.
 * Uses Claude API to produce high-quality translations.
 */
export async function translateProduct(
  input: TranslateInput
): Promise<TranslateResult[]> {
  const results: TranslateResult[] = [];

  for (const targetLocale of input.targetLocales) {
    if (targetLocale === input.sourceLocale) continue;

    const sourceLang = LOCALE_NAMES[input.sourceLocale];
    const targetLang = LOCALE_NAMES[targetLocale];

    const prompt = `You are a professional e-commerce translator specializing in product listings.
Translate the following product information from ${sourceLang} to ${targetLang}.

Rules:
- Keep product names concise and natural for ${targetLang} speakers
- Preserve measurements, model numbers, brand names, and technical specifications exactly
- Maintain formatting (line breaks, bullet points) in the description
- Output ONLY a valid JSON object with keys "name" and "description"
- Do not add explanations, comments, or markdown code fences

Source product name: ${input.fields.name}

Source product description:
${input.fields.description}

Output JSON:`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    // Strip markdown code fences if present
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    let parsed: { name: string; description: string };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error(
        `Translation API returned invalid JSON for locale ${targetLocale}: ${rawText.slice(0, 200)}`
      );
    }

    results.push({
      locale: targetLocale,
      name: parsed.name,
      description: parsed.description,
    });
  }

  return results;
}

/**
 * Batch translate multiple products (sequential to avoid rate limits).
 */
export async function translateProductBatch(
  inputs: TranslateInput[]
): Promise<Map<number, TranslateResult[]>> {
  const resultMap = new Map<number, TranslateResult[]>();
  for (let i = 0; i < inputs.length; i++) {
    resultMap.set(i, await translateProduct(inputs[i]));
  }
  return resultMap;
}
