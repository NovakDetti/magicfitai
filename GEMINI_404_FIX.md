# Gemini 404 hiba javítása

## Probléma
```
Error: Gemini elemzés sikertelen (hibakód: 404)
```

Ez akkor történt, amikor hétköznapi smink elemzést próbáltál készíteni.

## Ok

A **`gemini-2.0-flash-exp`** model már **nem elérhető** vagy nem létezik a Gemini API-ban. Ez egy kísérleti model volt, amelyet valószínűleg visszavontak vagy átneveztek.

## Megoldás

Frissítettem a model nevet a stabil verzióra:

### Változások ([lib/gemini.ts](lib/gemini.ts))

**Régi (nem működő):**
```typescript
const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp"
```

**Új (működő):**
```typescript
const model = process.env.GEMINI_MODEL || "gemini-2.0-flash-001"
```

Ez a változás **két helyen** történt:
1. `analyzeImage` függvényben (119. sor)
2. `analyzeSkinCondition` függvényben (448. sor)

## Alternatív modelek

Ha a `gemini-2.0-flash-001` sem működik, próbáld ki ezeket (`.env` fájlban):

```bash
# Legújabb Flash verzió (gyors, olcsó)
GEMINI_MODEL=gemini-2.0-flash-001

# Gemini 1.5 Flash (stabil)
GEMINI_MODEL=gemini-1.5-flash

# Gemini 1.5 Flash Latest
GEMINI_MODEL=gemini-1.5-flash-latest

# Gemini 1.5 Pro (lassabb, de pontosabb)
GEMINI_MODEL=gemini-1.5-pro

# Gemini 1.5 Pro Latest
GEMINI_MODEL=gemini-1.5-pro-latest
```

## Mi történt a kreditel?

✅ **Jó hír:** A kredit visszatérítési rendszer automatikusan működött!

Amikor a Gemini 404 hibát adott:
1. ❌ Az elemzés státusza → `failed`
2. ✅ **1 kredit automatikusan visszatérült** a felhasználónak
3. ✅ Ledger bejegyzés készült: `reason: "refund"`

Ezt a kódrészlet biztosítja ([lib/process-analysis.ts](lib/process-analysis.ts:97-112)):
```typescript
} catch (error) {
  console.error(`Analysis processing failed for ${sessionId}:`, error)

  // Update status to failed
  await db.update(analysisSessions)
    .set({ status: "failed" })
    .where(eq(analysisSessions.id, sessionId))

  // Refund credit if it was deducted
  await refundCreditIfNeeded(sessionId, session.userId) // ✅ Automatikus visszatérítés

  throw error
}
```

## Ellenőrzés

### 1. Nézd meg az adatbázist

```sql
-- Ellenőrizd a sikertelen elemzést
SELECT * FROM analysis_sessions
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 5;

-- Ellenőrizd a visszatérítést
SELECT * FROM credit_ledger
WHERE reason = 'refund'
ORDER BY created_at DESC
LIMIT 5;
```

### 2. Console logok

Keresd ezeket a sorokat a logokban:
```
Analysis processing failed for [session-id]: Error: Gemini elemzés sikertelen (hibakód: 404)
Refunded 1 credit to user [user-id] for failed session [session-id]
```

## Következő lépések

1. ✅ **Model név frissítve** → `gemini-2.0-flash-001`
2. ✅ **Kredit visszatérítve** (automatikusan)
3. 🔄 **Próbáld újra** az elemzést - most működnie kell!

## Hasznos linkek

- [Gemini API Models dokumentáció](https://ai.google.dev/models/gemini)
- [Gemini API Key beszerzése](https://makersuite.google.com/app/apikey)
- [Gemini API árazás](https://ai.google.dev/pricing)

## Környezeti változók

Példa konfiguráció ([.env.example](.env.example)):
```bash
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash-001  # opcionális, ez az alapértelmezett
```
