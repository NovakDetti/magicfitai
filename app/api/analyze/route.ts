import { NextRequest, NextResponse } from "next/server"

/**
 * AI Makeup Analysis API Route
 *
 * Analyzes a portrait photo and generates personalized makeup recommendations
 * using Google Gemini for vision analysis and text generation.
 *
 * Input: multipart form-data with:
 *   - image: File (portrait photo)
 *   - occasion: string (everyday, work, evening, special)
 *   - hasGlasses: boolean
 *   - hasSensitiveSkin: boolean
 *
 * Output: JSON with observations and 3 look recommendations
 */

// Types
interface MakeupProducts {
  base: string[]
  eyes: string[]
  brows: string[]
  lips: string[]
  face: string[]
}

interface MakeupLook {
  id: string
  title: string
  why: string
  steps: string[]
  products: MakeupProducts
  imageAfter?: string // Base64 image or null if generation fails
}

interface Observations {
  faceShape: string
  skinTone: string
  undertone: string
  contrast: string
  eyeShape: string
  brows: string
  lips: string
  notes: string
}

interface AnalysisResult {
  observations: Observations
  looks: MakeupLook[]
}

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Occasion labels in Hungarian
const OCCASION_LABELS: Record<string, string> = {
  everyday: "hétköznapi",
  work: "munkahelyi",
  evening: "esti",
  special: "különleges alkalom",
}

// System prompt for Gemini
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null
    const occasion = formData.get("occasion") as string | null
    const hasGlasses = formData.get("hasGlasses") === "true"
    const hasSensitiveSkin = formData.get("hasSensitiveSkin") === "true"

    // Validate image
    if (!imageFile) {
      return NextResponse.json(
        { error: "Kép feltöltése kötelező." },
        { status: 400 }
      )
    }

    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Csak képfájlok (JPG, PNG, WebP) engedélyezettek." },
        { status: 400 }
      )
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "A kép mérete nem haladhatja meg a 10MB-ot." },
        { status: 400 }
      )
    }

    // Validate occasion
    if (!occasion || !OCCASION_LABELS[occasion]) {
      return NextResponse.json(
        { error: "Érvényes alkalom megadása kötelező." },
        { status: 400 }
      )
    }

    // Check for API key
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

    if (!geminiKey) {
      console.error("No Gemini API key configured")
      return NextResponse.json(
        { error: "Az AI elemzés jelenleg nem elérhető." },
        { status: 503 }
      )
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString("base64")
    const mimeType = imageFile.type

    // Build the prompt
    const prompt = ANALYSIS_PROMPT
      .replace("{occasion}", OCCASION_LABELS[occasion])
      .replace("{hasGlasses}", hasGlasses ? "Igen" : "Nem")
      .replace("{hasSensitiveSkin}", hasSensitiveSkin ? "Igen" : "Nem")

    // Call Gemini API
    const analysisResult = await analyzeWithGemini(
      base64Image,
      mimeType,
      prompt,
      geminiKey
    )

    // Generate "after" images for each look
    const looksWithImages = await generateLookImages(
      base64Image,
      mimeType,
      analysisResult.looks,
      geminiKey
    )

    return NextResponse.json({
      observations: analysisResult.observations,
      looks: looksWithImages,
    })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Nem sikerült elemezni a képet. Kérjük, próbálja újra." },
      { status: 500 }
    )
  }
}

/**
 * Analyze image using Gemini
 */
async function analyzeWithGemini(
  base64Image: string,
  mimeType: string,
  prompt: string,
  apiKey: string
): Promise<AnalysisResult> {
  const model = "gemini-2.0-flash"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

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
                data: base64Image,
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

  // Remove markdown code blocks if present
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
  }

  // Try to find JSON object
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
 * Generate "after" makeup images for each look
 * Note: Gemini doesn't support image editing directly, so we use image generation
 * with a detailed prompt based on the original image description
 */
async function generateLookImages(
  _originalBase64: string,
  _mimeType: string,
  looks: MakeupLook[],
  apiKey: string
): Promise<MakeupLook[]> {
  // Try to generate images using Gemini's image generation
  // If it fails, we'll return looks without images
  const looksWithImages: MakeupLook[] = []

  for (const look of looks) {
    try {
      const imageBase64 = await generateMakeupPreviewImage(look, apiKey)
      looksWithImages.push({
        ...look,
        imageAfter: imageBase64,
      })
    } catch (error) {
      console.error(`Failed to generate image for look ${look.id}:`, error)
      // Return look without image - UI will handle this gracefully
      looksWithImages.push({
        ...look,
        imageAfter: undefined,
      })
    }
  }

  return looksWithImages
}

/**
 * Generate a makeup preview image using Gemini Imagen
 */
async function generateMakeupPreviewImage(
  look: MakeupLook,
  apiKey: string
): Promise<string | undefined> {
  // Use Gemini's image generation capability
  const model = "gemini-2.0-flash-exp-image-generation"
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

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
      return undefined
    }

    const data = await response.json()

    // Extract image from response
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData
    )

    if (imagePart?.inlineData?.data) {
      return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
    }

    return undefined
  } catch (error) {
    console.error("Image generation error:", error)
    return undefined
  }
}
