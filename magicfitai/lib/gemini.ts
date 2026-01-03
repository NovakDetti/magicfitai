import type { AnalysisObservations, MakeupLook, AnalysisToggles } from "@/lib/db/schema"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined - AI features will not work")
}

// Occasion labels in Hungarian
const OCCASION_LABELS: Record<string, string> = {
  everyday: "hétköznapi",
  work: "munkahelyi",
  evening: "esti",
  special: "különleges alkalom",
}

// Analysis prompt
const ANALYSIS_PROMPT = `Te egy professzionális sminkes és szépségszakértő vagy, aki személyre szabott sminktanácsokat ad.

Elemezd a feltöltött portréfotót és adj részletes, személyre szabott sminkjavaslatokat.

FONTOS SZABÁLYOK:
- Kizárólag kozmetikai megfigyeléseket tégy, NE adj orvosi tanácsot
- Az eredeti arcformát, vonásokat NE változtasd meg
- A természetes bőrtextúrát őrizd meg
- Minden kimenet MAGYAR nyelven legyen
- Légy támogató és pozitív a megfogalmazásban

Az elemzés alapján adj meg:
1. Megfigyeléseket az arcról (arcforma, bőrtónus, alaptónus, kontraszt, szemforma, szemöldök, ajkak)
2. Három különböző sminkvariációt az adott alkalomhoz

ALKALOM: {occasion}
SZEMÜVEGES: {hasGlasses}
ÉRZÉKENY BŐR: {hasSensitiveSkin}

Válaszolj KIZÁRÓLAG a következő JSON formátumban, semmilyen más szöveget ne adj hozzá:

{
  "observations": {
    "faceShape": "arcforma leírása (pl. ovális, kerek, szögletes)",
    "skinTone": "bőrtónus leírása (világos, közepes, mély stb.)",
    "undertone": "alaptónus (hideg, meleg, semleges)",
    "contrast": "kontraszt szint (alacsony, közepes, magas)",
    "eyeShape": "szemforma leírása",
    "brows": "szemöldök jellemzői",
    "lips": "ajkak jellemzői",
    "notes": "egyéb megfigyelések, különleges vonások kiemelése"
  },
  "looks": [
    {
      "id": "natural",
      "title": "Természetes ragyogás",
      "why": "2-3 mondat, miért illik ez a look az arcához",
      "steps": [
        "1. lépés leírása",
        "2. lépés leírása",
        "..."
      ],
      "products": {
        "base": ["alapozó típus", "korrektor típus"],
        "eyes": ["szemhéjpúder árnyalatok", "szempillaspirál"],
        "brows": ["szemöldök termék"],
        "lips": ["ajakszín típus és árnyalat"],
        "face": ["pirosító", "highlighter", "bronzosító ha releváns"]
      }
    },
    {
      "id": "elegant",
      "title": "Elegáns harmónia",
      "why": "...",
      "steps": ["..."],
      "products": {
        "base": ["..."],
        "eyes": ["..."],
        "brows": ["..."],
        "lips": ["..."],
        "face": ["..."]
      }
    },
    {
      "id": "bold",
      "title": "Merész karakter",
      "why": "...",
      "steps": ["..."],
      "products": {
        "base": ["..."],
        "eyes": ["..."],
        "brows": ["..."],
        "lips": ["..."],
        "face": ["..."]
      }
    }
  ]
}

Ügyelj arra, hogy:
- A három look különböző intenzitású legyen (természetes → elegáns → merész)
- Az alkalomhoz igazítsd a javaslatokat
- Szemüvegeseknek adj speciális tippeket a szemsminkhez
- Érzékeny bőrre adj kíméletes termékjavaslatokat
- Minden termékjavaslat legyen konkrét és praktikus`

interface AnalysisResult {
  observations: AnalysisObservations
  looks: MakeupLook[]
}

/**
 * Analyze an image using Gemini
 */
export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  occasion: string,
  toggles: AnalysisToggles
): Promise<AnalysisResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const model = "gemini-2.0-flash"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  // Build prompt with context
  const prompt = ANALYSIS_PROMPT
    .replace("{occasion}", OCCASION_LABELS[occasion] || occasion)
    .replace("{hasGlasses}", toggles.hasGlasses ? "Igen" : "Nem")
    .replace("{hasSensitiveSkin}", toggles.hasSensitiveSkin ? "Igen" : "Nem")

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Gemini API error:", response.status, errorText)
    throw new Error(`Gemini analysis failed: ${response.status}`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    console.error("No content in Gemini response:", JSON.stringify(data))
    throw new Error("No response from Gemini")
  }

  return parseAnalysisResponse(content)
}

/**
 * Parse JSON response from Gemini
 */
function parseAnalysisResponse(content: string): AnalysisResult {
  let jsonStr = content.trim()

  // Remove markdown code blocks if present (handles various whitespace patterns)
  // Match opening ```json or ``` at the start
  jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "")
  // Match closing ``` at the end (with possible whitespace)
  jsonStr = jsonStr.replace(/\n?\s*```\s*$/, "")

  jsonStr = jsonStr.trim()

  // Try to find JSON object if there's still extra content
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    jsonStr = jsonMatch[0]
  }

  try {
    const parsed = JSON.parse(jsonStr)

    // Validate structure
    if (!parsed.observations || !parsed.looks || !Array.isArray(parsed.looks)) {
      throw new Error("Invalid response structure")
    }

    return {
      observations: {
        faceShape: parsed.observations.faceShape || "Nem meghatározható",
        skinTone: parsed.observations.skinTone || "Nem meghatározható",
        undertone: parsed.observations.undertone || "Nem meghatározható",
        contrast: parsed.observations.contrast || "Közepes",
        eyeShape: parsed.observations.eyeShape || "Nem meghatározható",
        brows: parsed.observations.brows || "Nem meghatározható",
        lips: parsed.observations.lips || "Nem meghatározható",
        notes: parsed.observations.notes || "",
      },
      looks: parsed.looks.map((look: MakeupLook, index: number) => ({
        id: look.id || `look-${index + 1}`,
        title: look.title || `Look ${index + 1}`,
        why: look.why || "",
        steps: look.steps || [],
        products: {
          base: look.products?.base || [],
          eyes: look.products?.eyes || [],
          brows: look.products?.brows || [],
          lips: look.products?.lips || [],
          face: look.products?.face || [],
        },
      })),
    }
  } catch (e) {
    console.error("Failed to parse analysis response:", content)
    throw new Error("Failed to parse AI response")
  }
}

/**
 * Generate makeup preview image using Gemini
 */
export async function generateMakeupPreviewImage(
  look: MakeupLook
): Promise<string | null> {
  if (!GEMINI_API_KEY) {
    return null
  }

  const model = "gemini-2.0-flash-exp-image-generation"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  const prompt = `Create a professional makeup look portrait photo.
The makeup style is: ${look.title}
Description: ${look.why}

Key makeup elements:
- Eyes: ${look.products.eyes.join(", ")}
- Lips: ${look.products.lips.join(", ")}
- Face: ${look.products.face.join(", ")}

Requirements:
- Professional studio lighting
- Front-facing portrait
- Natural skin texture preserved
- Elegant and sophisticated look
- High quality beauty photography style

DO NOT alter facial features or structure. Only show makeup application.`

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["image", "text"],
          responseMimeType: "image/png",
        },
      }),
    })

    if (!response.ok) {
      console.error("Image generation failed:", response.status)
      return null
    }

    const data = await response.json()

    // Extract image from response
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData
    )

    if (imagePart?.inlineData?.data) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
    }

    return null
  } catch (error) {
    console.error("Image generation error:", error)
    return null
  }
}

/**
 * Process a full analysis including image generation
 */
export async function processFullAnalysis(
  imageBase64: string,
  mimeType: string,
  occasion: string,
  toggles: AnalysisToggles
): Promise<{
  observations: AnalysisObservations
  looks: MakeupLook[]
  afterImages: (string | null)[]
}> {
  // First, run the analysis
  const { observations, looks } = await analyzeImage(
    imageBase64,
    mimeType,
    occasion,
    toggles
  )

  // Then generate preview images for each look
  const afterImages: (string | null)[] = []
  for (const look of looks) {
    try {
      const image = await generateMakeupPreviewImage(look)
      afterImages.push(image)
    } catch (error) {
      console.error(`Failed to generate image for look ${look.id}:`, error)
      afterImages.push(null)
    }
  }

  return {
    observations,
    looks,
    afterImages,
  }
}
