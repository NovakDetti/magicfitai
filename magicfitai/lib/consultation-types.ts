// Consultation data types and constants

// ============================================
// Core Types
// ============================================

export type DesiredAppearance = "natural" | "elegant" | "warm" | "bold"
export type SkinDepth = "light" | "light-medium" | "medium" | "medium-deep" | "deep"
export type SkinUndertone = "cool" | "warm" | "neutral" | "unknown"
export type PersonalFocus = "eyes" | "complexion" | "face-shape" | "lips" | "overall"
export type UsageContext = "everyday" | "professional" | "evening" | "special" | "varied"
export type HairColor = "light-blonde" | "golden-blonde" | "brown" | "red" | "dark-brown" | "gray" | "dyed"
export type EyeColor = "blue-gray" | "green-hazel" | "brown" | "dark-brown"
export type PaletteRecommendation = "nude" | "desert" | "passion"

// ============================================
// Vision Analysis Types (from image)
// ============================================

// Values returned by the vision API (slightly different format)
export type VisionSkinDepth = "light" | "lightMedium" | "medium" | "deep"
export type VisionUndertone = "cool" | "warm" | "neutral"
export type VisionHairColor = "blonde" | "brown" | "black" | "red" | "gray" | "other"
export type VisionEyeColor = "blue" | "green" | "brown" | "hazel" | "gray" | "other"

export interface VisionConfidence {
  skinDepth?: number
  undertone?: number
  hairColor?: number
  eyeColor?: number
}

export interface ImageInsights {
  skinDepth?: VisionSkinDepth
  undertone?: VisionUndertone
  hairColor?: VisionHairColor
  eyeColor?: VisionEyeColor
  confidence: VisionConfidence
}

// ============================================
// Consultation Answers (merged from image + questions)
// ============================================

export interface ConsultationAnswers {
  // From image analysis OR manual questions
  skinDepth?: SkinDepth
  skinUndertone?: SkinUndertone
  hairColor?: HairColor
  eyeColor?: EyeColor
  // Always from questions (preference-based)
  desiredAppearance?: DesiredAppearance
  personalFocus?: PersonalFocus[]
  usageContext?: UsageContext[]
}

// ============================================
// Mapping functions: Vision values -> Consultation values
// ============================================

export function mapVisionSkinDepth(vision: VisionSkinDepth): SkinDepth {
  const mapping: Record<VisionSkinDepth, SkinDepth> = {
    light: "light",
    lightMedium: "light-medium",
    medium: "medium",
    deep: "deep",
  }
  return mapping[vision] || "medium"
}

export function mapVisionUndertone(vision: VisionUndertone): SkinUndertone {
  // Direct mapping - same values
  return vision
}

export function mapVisionHairColor(vision: VisionHairColor): HairColor {
  const mapping: Record<VisionHairColor, HairColor> = {
    blonde: "light-blonde",
    brown: "brown",
    black: "dark-brown",
    red: "red",
    gray: "gray",
    other: "brown", // Default fallback
  }
  return mapping[vision] || "brown"
}

export function mapVisionEyeColor(vision: VisionEyeColor): EyeColor {
  const mapping: Record<VisionEyeColor, EyeColor> = {
    blue: "blue-gray",
    green: "green-hazel",
    brown: "brown",
    hazel: "green-hazel",
    gray: "blue-gray",
    other: "brown", // Default fallback
  }
  return mapping[vision] || "brown"
}

/**
 * Convert ImageInsights to ConsultationAnswers (partial)
 * Only includes fields that have sufficient confidence
 */
export function imageInsightsToAnswers(insights: ImageInsights): Partial<ConsultationAnswers> {
  const answers: Partial<ConsultationAnswers> = {}

  if (insights.skinDepth) {
    answers.skinDepth = mapVisionSkinDepth(insights.skinDepth)
  }
  if (insights.undertone) {
    answers.skinUndertone = mapVisionUndertone(insights.undertone)
  }
  if (insights.hairColor) {
    answers.hairColor = mapVisionHairColor(insights.hairColor)
  }
  if (insights.eyeColor) {
    answers.eyeColor = mapVisionEyeColor(insights.eyeColor)
  }

  return answers
}

// ============================================
// Question Skip Logic
// ============================================

/**
 * Question IDs that can be skipped if image provides the data
 */
export const IMAGE_DERIVED_QUESTION_IDS = ["skinDepth", "skinUndertone"] as const

/**
 * Question IDs that should NEVER be skipped (preference-based)
 */
export const PREFERENCE_QUESTION_IDS = ["desiredAppearance", "personalFocus", "usageContext"] as const

/**
 * Check if a question should be skipped based on image insights
 */
export function shouldSkipQuestion(questionId: string, insights: ImageInsights): boolean {
  // Never skip preference questions
  if ((PREFERENCE_QUESTION_IDS as readonly string[]).includes(questionId)) {
    return false
  }

  // Check if image provides this data
  if (questionId === "skinDepth" && insights.skinDepth) {
    return true
  }
  if (questionId === "skinUndertone" && insights.undertone) {
    return true
  }

  return false
}

/**
 * Get the list of questions to ask, filtered by image insights
 */
export function getFilteredQuestions(insights: ImageInsights): ConsultationQuestion[] {
  return consultationQuestions.filter((q) => !shouldSkipQuestion(q.id, insights))
}

export interface QuestionOption {
  value: string
  label: string
  description?: string
}

export interface ConsultationQuestion {
  id: string
  theme: string // For progress indicator
  question: string
  microcopy?: string
  type: "single" | "multiple" | "optional-group"
  options: QuestionOption[]
  allowMultiple?: boolean
}

// Question definitions
export const consultationQuestions: ConsultationQuestion[] = [
  {
    id: "desiredAppearance",
    theme: "Megjelenési preferencia",
    question: "Milyen megjelenésre vágyik?",
    microcopy: "Nincs helyes vagy helytelen válasz. Ez az Ön személyes preferenciája.",
    type: "single",
    options: [
      {
        value: "natural",
        label: "Természetes harmónia",
        description: "Mintha sminket sem viselnék, csak ragyogóbb lennék",
      },
      {
        value: "elegant",
        label: "Visszafogott elegancia",
        description: "Kifinomult, de nem feltűnő",
      },
      {
        value: "warm",
        label: "Meleg ragyogás",
        description: "Napfényes, élénk, de természetes",
      },
      {
        value: "bold",
        label: "Határozott jelenlét",
        description: "Karakteres, magabiztos megjelenés",
      },
    ],
  },
  {
    id: "skinDepth",
    theme: "Bőrszín meghatározása",
    question: "Hogyan jellemezné bőrszínének mélységét?",
    microcopy: "Gondoljon arra, hogyan reagál bőre a napfényre.",
    type: "single",
    options: [
      {
        value: "light",
        label: "Világos",
        description: "Könnyen pirul, ritkán barnul",
      },
      {
        value: "light-medium",
        label: "Világos-közepes",
        description: "Enyhén barnul, de inkább világos marad",
      },
      {
        value: "medium",
        label: "Közepes",
        description: "Egyenletesen barnul",
      },
      {
        value: "medium-deep",
        label: "Közepes-mély",
        description: "Könnyen és tartósan barnul",
      },
      {
        value: "deep",
        label: "Mély",
        description: "Természetesen gazdag, meleg tónus",
      },
    ],
  },
  {
    id: "skinUndertone",
    theme: "Alaptónus azonosítása",
    question: "Milyen árnyalatot lát az ereiben, csuklója belső felén?",
    microcopy: "Természetes fényben nézze meg. Ha bizonytalan, válassza a semlegeset.",
    type: "single",
    options: [
      {
        value: "cool",
        label: "Kékes-lilás",
        description: "Hideg alaptónus",
      },
      {
        value: "warm",
        label: "Zöldes-olívás",
        description: "Meleg alaptónus",
      },
      {
        value: "neutral",
        label: "Mindkettő keveredik",
        description: "Semleges alaptónus",
      },
      {
        value: "unknown",
        label: "Nem tudom eldönteni",
        description: "Segítünk azonosítani",
      },
    ],
  },
  {
    id: "personalFocus",
    theme: "Személyes fókusz",
    question: "Mit szeretne leginkább kiemelni?",
    microcopy: "Válasszon egyet vagy kettőt. A smink feladata, hogy az Ön természetes erősségeit hangsúlyozza.",
    type: "multiple",
    allowMultiple: true,
    options: [
      {
        value: "eyes",
        label: "Szemek",
        description: "Tekintet, mélység, kifejezés",
      },
      {
        value: "complexion",
        label: "Arcszín",
        description: "Frissesség, ragyogás",
      },
      {
        value: "face-shape",
        label: "Arcforma",
        description: "Kontúr, struktúra",
      },
      {
        value: "lips",
        label: "Ajkak",
        description: "Szín, forma",
      },
      {
        value: "overall",
        label: "Összhatás",
        description: "Kiegyensúlyozott, egységes megjelenés",
      },
    ],
  },
  {
    id: "usageContext",
    theme: "Használati kontextus",
    question: "Milyen alkalmakra készül elsősorban?",
    microcopy: "Választhat többet is. Az ajánlásokat ehhez igazítjuk.",
    type: "multiple",
    allowMultiple: true,
    options: [
      {
        value: "everyday",
        label: "Mindennapi viselet",
        description: "Munka, hétköznapok",
      },
      {
        value: "professional",
        label: "Hivatalos alkalmak",
        description: "Üzleti találkozók, prezentációk",
      },
      {
        value: "evening",
        label: "Esti megjelenés",
        description: "Vacsorák, rendezvények",
      },
      {
        value: "special",
        label: "Különleges események",
        description: "Esküvő, ünnepségek",
      },
      {
        value: "varied",
        label: "Változatos",
        description: "Több alkalomtípusra is szeretnék útmutatást",
      },
    ],
  },
]

export const refinementOptions = {
  hairColor: {
    label: "Hajszín",
    options: [
      { value: "light-blonde", label: "Világos szőke" },
      { value: "golden-blonde", label: "Aranyszőke" },
      { value: "brown", label: "Barna árnyalatok" },
      { value: "red", label: "Vörös / Réz" },
      { value: "dark-brown", label: "Sötétbarna / Fekete" },
      { value: "gray", label: "Ősz / Ezüst" },
      { value: "dyed", label: "Festett — eltér a természetestől" },
    ],
  },
  eyeColor: {
    label: "Szemszín",
    options: [
      { value: "blue-gray", label: "Kék / Szürke" },
      { value: "green-hazel", label: "Zöld / Mogyoró" },
      { value: "brown", label: "Barna / Mézbarna" },
      { value: "dark-brown", label: "Sötétbarna / Fekete" },
    ],
  },
}

// Transition messages between questions
export const transitionMessages: Record<string, string> = {
  desiredAppearance: "Köszönjük. Most nézzük meg, mely árnyalatok illenek Önhöz.",
  skinDepth: "Nagyszerű választás.",
  skinUndertone: "Kiváló. Az alaptónusa kulcsfontosságú a színválasztásban.",
  personalFocus: "Értjük, mire szeretne fókuszálni.",
  usageContext: "Már majdnem kész. Még egy lépés van hátra.",
}

// Palette recommendation logic
export function determinePalette(answers: ConsultationAnswers): PaletteRecommendation {
  const { skinUndertone, desiredAppearance, skinDepth } = answers

  // Bold appearance with cool/neutral undertone -> Passion
  if (desiredAppearance === "bold" && (skinUndertone === "cool" || skinUndertone === "neutral")) {
    return "passion"
  }

  // Warm undertone or warm appearance -> Desert
  if (skinUndertone === "warm" || desiredAppearance === "warm") {
    return "desert"
  }

  // Cool undertone with elegant/natural -> Nude
  if (skinUndertone === "cool" && (desiredAppearance === "natural" || desiredAppearance === "elegant")) {
    return "nude"
  }

  // Deep skin with bold -> Passion
  if ((skinDepth === "deep" || skinDepth === "medium-deep") && desiredAppearance === "bold") {
    return "passion"
  }

  // Light skin with natural -> Nude
  if ((skinDepth === "light" || skinDepth === "light-medium") && desiredAppearance === "natural") {
    return "nude"
  }

  // For cool undertone -> Nude
  if (skinUndertone === "cool") return "nude"

  // Default for neutral/unknown undertone with natural/elegant appearance
  return "nude"
}

// Label mappings for display
export const appearanceLabels: Record<DesiredAppearance, string> = {
  natural: "természetes harmóniára",
  elegant: "visszafogott eleganciára",
  warm: "meleg ragyogásra",
  bold: "határozott jelenlétre",
}

export const undertoneLabels: Record<SkinUndertone, string> = {
  cool: "hűvös",
  warm: "meleg",
  neutral: "semleges",
  unknown: "vegyes",
}

export const skinDepthLabels: Record<SkinDepth, string> = {
  light: "világos",
  "light-medium": "világos-közepes",
  medium: "közepes",
  "medium-deep": "közepes-mély",
  deep: "mély",
}

export const paletteNames: Record<PaletteRecommendation, string> = {
  nude: "Nude",
  desert: "Desert",
  passion: "Passion",
}
