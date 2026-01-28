/**
 * MAD (Makeup Anyone) Service
 * Makeup transfer using Fal.ai Makeup Application API
 */

const FAL_API_KEY = process.env.FAL_API_KEY

if (!FAL_API_KEY) {
  console.warn("FAL_API_KEY is not defined - MAD service will not work")
}

export interface MakeupTransferRequest {
  sourceImageBase64: string // Before image (base64)
  sourceImageMimeType: string
  style: string // Style ID (everyday, date, party, smokey, elegant)
  styleDescription: string // Detailed style description
  observations: {
    skinTone?: string
    undertone?: string
    eyeShape?: string
    faceShape?: string
  }
}

export interface MakeupTransferResult {
  afterImageUrl: string | null
  success: boolean
  error?: string
}

// Map our style IDs to Fal.ai makeup styles
// Using medium intensity to better preserve facial proportions
const STYLE_MAP: Record<string, { style: string; intensity: string }> = {
  everyday: { style: "natural", intensity: "heavy" },
  date: { style: "glamorous", intensity: "heavy" },
  party: { style: "dramatic", intensity: "heavy" },
  smokey: { style: "smoky_eyes", intensity: "heavy" },
  elegant: { style: "professional", intensity: "heavy" },
}

/**
 * Generate makeup transfer using Fal.ai Makeup Application API
 */
export async function generateMakeupTransfer(
  request: MakeupTransferRequest
): Promise<MakeupTransferResult> {
  if (!FAL_API_KEY) {
    return {
      afterImageUrl: null,
      success: false,
      error: "FAL_API_KEY not configured"
    }
  }

  try {
    // Convert base64 to data URL for Fal.ai
    const imageDataUrl = `data:${request.sourceImageMimeType};base64,${request.sourceImageBase64}`

    // Get makeup style and intensity
    const styleConfig = STYLE_MAP[request.style] || STYLE_MAP.everyday

    // Call Fal.ai makeup application API
    const response = await fetch('https://fal.run/fal-ai/image-apps-v2/makeup-application', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageDataUrl,
        makeup_style: styleConfig.style,
        intensity: styleConfig.intensity,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Fal.ai makeup application failed:", response.status, errorText)

      return {
        afterImageUrl: null,
        success: false,
        error: `Makeup application failed (${response.status})`,
      }
    }

    const data = await response.json()

    // Extract image URL from response
    if (data.images && data.images[0]?.url) {
      // Download the image and convert to base64
      const imageResponse = await fetch(data.images[0].url)
      const imageBlob = await imageResponse.blob()
      const imageBuffer = await imageBlob.arrayBuffer()
      const base64 = Buffer.from(imageBuffer).toString('base64')
      const imageUrl = `data:image/png;base64,${base64}`

      return {
        afterImageUrl: imageUrl,
        success: true,
      }
    }

    console.log("No image data in Fal.ai response")
    return {
      afterImageUrl: null,
      success: false,
      error: "No image generated",
    }
  } catch (error) {
    console.error("MAD service error:", error)
    return {
      afterImageUrl: null,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Build detailed prompt for makeup transfer
 */
function buildMakeupPrompt(request: MakeupTransferRequest): string {
  const { style, styleDescription, observations } = request

  const stylePrompts: Record<string, string> = {
    everyday: `Apply a natural, fresh everyday makeup look:
- Light, dewy foundation matching the skin tone
- Soft neutral eyeshadow (beige, soft brown, champagne)
- Natural mascara for volume
- Groomed, natural brows
- Peach or rosy blush for a healthy glow
- Nude or light pink lip color
- Minimal contouring
- Natural highlight on cheekbones`,

    date: `Apply a romantic, date-night makeup look:
- Flawless, radiant foundation
- Soft pink and mauve eyeshadow with subtle shimmer
- Defined eyeliner with a soft wing
- Volumizing mascara
- Defined, arched brows
- Rosy blush with soft glow
- Rose or berry lip color with gloss
- Soft highlight on high points of face`,

    party: `Apply a bold, party-ready makeup look:
- Full coverage, matte foundation
- Vibrant, shimmery eyeshadow (metallics, glitter)
- Dramatic eyeliner or graphic liner
- False lashes or dramatic mascara
- Bold, defined brows
- Bronzer and strong contour
- Intense highlighter for glow
- Bold lip color (red, fuchsia, or dark berry)`,

    smokey: `Apply a classic smokey eye makeup look:
- Matte foundation with good coverage
- Dark smokey eyeshadow (charcoal, black, deep brown)
- Intense black eyeliner on upper and lower lash line
- Volumizing black mascara
- Well-defined, strong brows
- Subtle blush
- Nude or berry lip color
- Subtle highlight`,

    elegant: `Apply an elegant, sophisticated makeup look:
- Flawless, semi-matte foundation
- Neutral, matte eyeshadow (taupe, soft brown, champagne)
- Precise winged eyeliner
- Classic black mascara
- Perfectly groomed brows
- Subtle peach or mauve blush
- Classic red or nude lip color
- Subtle, refined highlight on cheekbones`,
  }

  const basePrompt = stylePrompts[style] || stylePrompts.everyday

  return `Apply professional ${styleDescription} makeup to this face. Make the makeup VISIBLE and BOLD.

${basePrompt}

Important details:
- Skin tone: ${observations.skinTone || "natural"}
- Undertone: ${observations.undertone || "neutral"}

Make sure the makeup is clearly visible:
- Eyes should have obvious eyeshadow, eyeliner, and mascara
- Cheeks should show blush or bronzer
- Lips should be colored with lipstick
- Face should have foundation and highlighter

Keep the same person, pose, and background - only add noticeable makeup.`
}
