import type { AnalysisObservations, MakeupLook, AnalysisToggles } from "@/lib/db/schema"

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not defined - AI features will not work")
}

// Style labels and descriptions in Hungarian
const STYLE_CONFIGS: Record<string, { label: string; description: string }> = {
  everyday: {
    label: "Hétköznapi",
    description: "Természetes, fresh look minden napra. Hangsúlyozd a frissességet és a természetességet."
  },
  date: {
    label: "Randi",
    description: "Romantikus, lágy smink különleges pillanatokra. Hangsúlyozd a nőiességet és a lágy vonalakat."
  },
  party: {
    label: "Buli",
    description: "Merész, csillogó smink bulizáshoz. Használj shimmer-t, glitter-t, és intenzív színeket."
  },
  smokey: {
    label: "Smokey",
    description: "Intenzív, drámai szemsmink. Klasszikus smokey eyes árnyalásokkal és fokozatos átmenetekkel."
  },
  elegant: {
    label: "Elegáns",
    description: "Kifinomult, elegáns megjelenés. Időtlen, szofisztikált színek és technikák."
  },
}

// Analysis prompt
const ANALYSIS_PROMPT = `Te egy professzionális sminkes és szépségszakértő vagy, aki személyre szabott sminktanácsokat ad.

Elemezd a feltöltött portréfotót és adj részletes, személyre szabott sminkjavaslatot a választott stílushoz.

FONTOS SZABÁLYOK:
- Kizárólag kozmetikai megfigyeléseket tégy, NE adj orvosi tanácsot
- Az eredeti arcformát, vonásokat NE változtasd meg
- A természetes bőrtextúrát őrizd meg
- Minden kimenet MAGYAR nyelven legyen
- Légy támogató és pozitív a megfogalmazásban

VÁLASZTOTT STÍLUS: {style}
STÍLUS LEÍRÁS: {styleDescription}
SZEMÜVEGES: {hasGlasses}
ÉRZÉKENY BŐR: {hasSensitiveSkin}

Az elemzés alapján adj meg:
1. Megfigyeléseket az arcról (arcforma, bőrtónus, alaptónus, kontraszt, szemforma, szemöldök, ajkak)
2. EGY részletes sminket a választott stílushoz, amely tökéletesen illeszkedik az arc sajátosságaihoz

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
      "id": "{styleId}",
      "title": "Smink címe a választott stílushoz",
      "why": "3-4 mondat arról, hogy ez a smink miért illik tökéletesen ehhez az archoz és a választott stílushoz",
      "steps": [
        "1. Bőrelőkészítés: részletes leírás",
        "2. Alapozás: részletes leírás a bőrtípushoz",
        "3. Kontúrozás: részletes leírás az arcformához",
        "4. Szemsmink: részletes, lépésről-lépésre leírás",
        "5. Szemöldök: részletes leírás",
        "6. Pirosító és highlighter: részletes leírás",
        "7. Ajkak: részletes leírás",
        "8. Fixálás: részletes leírás"
      ],
      "products": {
        "base": ["konkrét alapozó típus és finish", "korrektor árnyalat", "primer típus"],
        "eyes": ["konkrét szemhéjpúder színek és elhelyezésük", "eyeliner típus", "szempillaspirál típus"],
        "brows": ["szemöldök ceruza/púder", "fixáló gél"],
        "lips": ["ajakszín típus", "konkrét árnyalat javaslat", "ajakceruza ha szükséges"],
        "face": ["pirosító árnyalat", "highlighter elhelyezés", "kontúr termék ha releváns", "fixáló spray"]
      }
    }
  ]
}

Ügyelj arra, hogy:
- A smink PONTOSAN illeszkedjen a választott stílushoz
- Szemüvegeseknek adj speciális tippeket a szemsminkhez (kerüld a túl sötét alsó vízvonalon, inkább a felső szemhéjon dolgozz)
- Érzékeny bőrre adj kíméletes, hipoallergén termékjavaslatokat
- Minden lépés legyen részletes és könnyen követhető
- A termékjavaslatok legyenek konkrétak (színek, textúrák, típusok)`

interface AnalysisResult {
  observations: AnalysisObservations
  looks: MakeupLook[]
}

/**
 * Analyze an image using OpenAI GPT-4 Vision
 */
export async function analyzeImage(
  imageBase64: string,
  mimeType: string,
  occasion: string,
  toggles: AnalysisToggles
): Promise<AnalysisResult> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  // Use GPT-4 Vision for image analysis
  const model = process.env.OPENAI_MODEL || "gpt-4o"
  const url = "https://api.openai.com/v1/chat/completions"

  // Get style configuration
  const styleConfig = STYLE_CONFIGS[occasion] || STYLE_CONFIGS.everyday

  // Build prompt with context
  const prompt = ANALYSIS_PROMPT
    .replace("{style}", styleConfig.label)
    .replace("{styleDescription}", styleConfig.description)
    .replace("{styleId}", occasion)
    .replace("{hasGlasses}", toggles.hasGlasses ? "Igen" : "Nem")
    .replace("{hasSensitiveSkin}", toggles.hasSensitiveSkin ? "Igen" : "Nem")

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: "high",
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("OpenAI API error:", response.status, errorText)

    // Handle rate limit errors with helpful message
    if (response.status === 429) {
      throw new Error(
        "Az OpenAI API kvótája kimerült. Kérlek próbáld újra később, vagy ellenőrizd az API kulcsot."
      )
    }

    throw new Error(`OpenAI elemzés sikertelen (hibakód: ${response.status})`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    console.error("No content in OpenAI response:", JSON.stringify(data))
    throw new Error("No response from OpenAI")
  }

  return parseAnalysisResponse(content)
}

/**
 * Parse JSON response from OpenAI
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
