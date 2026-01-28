import type { AnalysisObservations, MakeupLook, AnalysisToggles } from "@/lib/db/schema"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not defined - AI features will not work")
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

  // Use Gemini 2.0 Flash (supports vision tasks)
  // Note: "gemini-2.0-flash-exp" was experimental and may not be available
  // Use stable version instead
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-001"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

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

    // Handle rate limit errors with helpful message
    if (response.status === 429) {
      throw new Error(
        "A Gemini API napi kvótája kimerült. Kérlek próbáld újra később, vagy frissítsd az API kulcsot fizetős verzióra."
      )
    }

    throw new Error(`Gemini elemzés sikertelen (hibakód: ${response.status})`)
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

// Skin condition analysis interface
export interface SkinConditionAnalysis {
  hydration: { level: string; description: string }
  texture: { level: string; description: string }
  pores: { level: string; description: string }
  oiliness: { level: string; description: string }
  pigmentation: { level: string; description: string }
  fineLines: { level: string; description: string }
  sensitivity: { level: string; description: string }
  makeupImplications: string
  prepTips: string[]
}

const SKIN_ANALYSIS_PROMPT = `Te egy professzionális kozmetikus és bőrápolási szakértő vagy.

Elemezd a feltöltött portréfotót és adj részletes, NON-MEDICAL bőrállapot-elemzést.

FONTOS SZABÁLYOK:
- Ez NEM ORVOSI DIAGNÓZIS, kizárólag kozmetikai megfigyelés
- Csak vizuális indikátorok alapján dolgozz
- A cél a smink eredményének optimalizálása és a bőr előkészítése
- Minden kimenet MAGYAR nyelven legyen
- Légy támogató, barátságos és magabiztos hangvételű

Elemezd a következő kategóriákat:
1. Hidratáltság szintje
2. Bőrfelszín egyenletessége
3. Pórusok láthatósága
4. Faggyútermelés / fénylés
5. Pigmentáció és bőrtónus egységessége
6. Finom vonalak / mimikai ráncok
7. Bőrpír / érzékenység jelei

Válaszolj KIZÁRÓLAG a következő JSON formátumban:

{
  "hydration": {
    "level": "alacsony/közepes/magas",
    "description": "rövid, barátságos magyarázat"
  },
  "texture": {
    "level": "egyenetlen/közepes/sima",
    "description": "rövid, barátságos magyarázat"
  },
  "pores": {
    "level": "alig látható/közepes/látható",
    "description": "rövid, barátságos magyarázat"
  },
  "oiliness": {
    "level": "száraz/normál/olajos",
    "description": "rövid, barátságos magyarázat"
  },
  "pigmentation": {
    "level": "egyenletes/közepes/egyenetlen",
    "description": "rövid, barátságos magyarázat"
  },
  "fineLines": {
    "level": "alig látható/közepes/látható",
    "description": "rövid, barátságos magyarázat"
  },
  "sensitivity": {
    "level": "alacsony/közepes/magas",
    "description": "rövid, barátságos magyarázat"
  },
  "makeupImplications": "2-3 mondat arról, hogy ezek a bőrtulajdonságok hogyan befolyásolják az alapozó választását, finish-t és előkészítést",
  "prepTips": [
    "Hidratálás: konkrét tanács",
    "Primer: konkrét tanács",
    "Kerülendő: konkrét tanács",
    "További 1-2 releváns tanács"
  ]
}`

/**
 * Analyze skin condition from portrait image
 */
export async function analyzeSkinCondition(
  imageBase64: string,
  mimeType: string
): Promise<SkinConditionAnalysis> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-001"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: SKIN_ANALYSIS_PROMPT },
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
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
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
    console.error("Gemini skin analysis error:", response.status, errorText)
    throw new Error(`Bőrállapot elemzés sikertelen (hibakód: ${response.status})`)
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    console.error("No content in Gemini skin analysis response")
    throw new Error("No response from Gemini")
  }

  return parseSkinAnalysisResponse(content)
}

/**
 * Parse skin analysis JSON response
 */
function parseSkinAnalysisResponse(content: string): SkinConditionAnalysis {
  let jsonStr = content.trim()

  // Remove markdown code blocks
  jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/, "")
  jsonStr = jsonStr.replace(/\n?\s*```\s*$/, "")
  jsonStr = jsonStr.trim()

  // Try to find JSON object
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    jsonStr = jsonMatch[0]
  }

  try {
    const parsed = JSON.parse(jsonStr)

    return {
      hydration: parsed.hydration || { level: "közepes", description: "Nem értékelhető" },
      texture: parsed.texture || { level: "közepes", description: "Nem értékelhető" },
      pores: parsed.pores || { level: "közepes", description: "Nem értékelhető" },
      oiliness: parsed.oiliness || { level: "normál", description: "Nem értékelhető" },
      pigmentation: parsed.pigmentation || { level: "egyenletes", description: "Nem értékelhető" },
      fineLines: parsed.fineLines || { level: "alig látható", description: "Nem értékelhető" },
      sensitivity: parsed.sensitivity || { level: "alacsony", description: "Nem értékelhető" },
      makeupImplications: parsed.makeupImplications || "",
      prepTips: parsed.prepTips || [],
    }
  } catch (e) {
    console.error("Failed to parse skin analysis response:", content)
    throw new Error("Failed to parse skin analysis response")
  }
}
