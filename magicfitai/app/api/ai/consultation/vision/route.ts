import { NextRequest, NextResponse } from "next/server"

/**
 * Vision Analysis API Route
 *
 * Analyzes a portrait photo to extract facial attributes for makeup consultation.
 * Uses Google Gemini as the primary vision model.
 *
 * Only returns attributes with confidence >= 0.75
 */

// Types for vision analysis
export interface VisionConfidence {
  skinDepth?: number
  undertone?: number
  hairColor?: number
  eyeColor?: number
}

export interface VisionAnalysisResult {
  skinDepth?: "light" | "lightMedium" | "medium" | "deep"
  undertone?: "cool" | "warm" | "neutral"
  hairColor?: "blonde" | "brown" | "black" | "red" | "gray" | "other"
  eyeColor?: "blue" | "green" | "brown" | "hazel" | "gray" | "other"
  confidence: VisionConfidence
}

// Confidence threshold - only include attributes above this
const CONFIDENCE_THRESHOLD = 0.75

// Max file size: 6MB
const MAX_FILE_SIZE = 6 * 1024 * 1024

// Vision model prompt
const VISION_PROMPT = `You are a professional makeup consultation assistant analyzing a portrait photo.

Your task is to identify the following facial attributes from the image:
1. Skin depth (light, lightMedium, medium, deep)
2. Undertone (cool, warm, neutral)
3. Hair color (blonde, brown, black, red, gray, other)
4. Eye color (blue, green, brown, hazel, gray, other)

CRITICAL RULES:
- Be CONSERVATIVE. Only report what you can clearly see.
- If you are not confident about an attribute, DO NOT include it.
- Prefer omission over guessing.
- If the face is not clearly visible, return empty results.
- If heavy makeup obscures natural features, note lower confidence.
- If lighting distorts colors, note lower confidence.

For each attribute you identify, provide a confidence score between 0 and 1.

Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "skinDepth": "light" | "lightMedium" | "medium" | "deep" | null,
  "undertone": "cool" | "warm" | "neutral" | null,
  "hairColor": "blonde" | "brown" | "black" | "red" | "gray" | "other" | null,
  "eyeColor": "blue" | "green" | "brown" | "hazel" | "gray" | "other" | null,
  "confidence": {
    "skinDepth": 0.0-1.0,
    "undertone": 0.0-1.0,
    "hairColor": 0.0-1.0,
    "eyeColor": 0.0-1.0
  }
}

Use null for any attribute you cannot determine with reasonable confidence.
Analyze this portrait photo for a makeup consultation. Identify skin depth, undertone, hair color, and eye color. Be conservative - only report what you can clearly see.`

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null

    if (!imageFile) {
      return NextResponse.json(
        { error: "Nincs kép feltöltve." },
        { status: 400 }
      )
    }

    // Validate file type
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Csak képfájlok engedélyezettek." },
        { status: 400 }
      )
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "A kép mérete nem haladhatja meg a 6MB-ot." },
        { status: 400 }
      )
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(arrayBuffer).toString("base64")
    const mimeType = imageFile.type

    // Check for Gemini API key (primary)
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY

    if (!geminiKey) {
      console.error("No Gemini API key configured. Set GEMINI_API_KEY in environment.")
      return NextResponse.json(
        { error: "A képelemzés jelenleg nem elérhető." },
        { status: 503 }
      )
    }

    // Analyze with Gemini
    const analysisResult = await analyzeWithGemini(base64Image, mimeType, geminiKey)

    // Filter results by confidence threshold
    const filteredResult = filterByConfidence(analysisResult)

    return NextResponse.json(filteredResult)
  } catch (error) {
    console.error("Vision analysis error:", error)
    return NextResponse.json(
      { error: "Nem sikerült elemezni a képet. Kérjük, próbálja újra." },
      { status: 500 }
    )
  }
}

/**
 * Analyze image using Google Gemini Vision
 */
async function analyzeWithGemini(
  base64Image: string,
  mimeType: string,
  apiKey: string
): Promise<VisionAnalysisResult> {
  // Use Gemini 2.0 Flash for fast, high-quality vision analysis
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
            {
              text: VISION_PROMPT,
            },
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
        temperature: 0.1,
        topK: 1,
        topP: 0.8,
        maxOutputTokens: 500,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Gemini API error:", response.status, errorText)
    throw new Error(`Gemini vision analysis failed: ${response.status}`)
  }

  const data = await response.json()

  // Extract text from Gemini response
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!content) {
    console.error("No content in Gemini response:", JSON.stringify(data))
    throw new Error("No response from Gemini vision model")
  }

  return parseVisionResponse(content)
}

/**
 * Parse the JSON response from the vision model
 */
function parseVisionResponse(content: string): VisionAnalysisResult {
  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = content.trim()

  // Remove markdown code blocks if present
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "")
  }

  // Try to find JSON object in the response
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    jsonStr = jsonMatch[0]
  }

  try {
    const parsed = JSON.parse(jsonStr)

    return {
      skinDepth: parsed.skinDepth || undefined,
      undertone: parsed.undertone || undefined,
      hairColor: parsed.hairColor || undefined,
      eyeColor: parsed.eyeColor || undefined,
      confidence: {
        skinDepth: parsed.confidence?.skinDepth ?? 0,
        undertone: parsed.confidence?.undertone ?? 0,
        hairColor: parsed.confidence?.hairColor ?? 0,
        eyeColor: parsed.confidence?.eyeColor ?? 0,
      },
    }
  } catch (e) {
    console.error("Failed to parse vision response:", content)
    return {
      confidence: {},
    }
  }
}

/**
 * Filter results to only include attributes above confidence threshold
 */
function filterByConfidence(result: VisionAnalysisResult): VisionAnalysisResult {
  const filtered: VisionAnalysisResult = {
    confidence: {},
  }

  if (result.skinDepth && (result.confidence.skinDepth ?? 0) >= CONFIDENCE_THRESHOLD) {
    filtered.skinDepth = result.skinDepth
    filtered.confidence.skinDepth = result.confidence.skinDepth
  }

  if (result.undertone && (result.confidence.undertone ?? 0) >= CONFIDENCE_THRESHOLD) {
    filtered.undertone = result.undertone
    filtered.confidence.undertone = result.confidence.undertone
  }

  if (result.hairColor && (result.confidence.hairColor ?? 0) >= CONFIDENCE_THRESHOLD) {
    filtered.hairColor = result.hairColor
    filtered.confidence.hairColor = result.confidence.hairColor
  }

  if (result.eyeColor && (result.confidence.eyeColor ?? 0) >= CONFIDENCE_THRESHOLD) {
    filtered.eyeColor = result.eyeColor
    filtered.confidence.eyeColor = result.confidence.eyeColor
  }

  return filtered
}
