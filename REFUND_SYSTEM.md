# Kredit visszatérítési rendszer

## Probléma

Korábban, ha az elemzés feldolgozása sikertelen volt (pl. Gemini API hiba, MAD service hiba, timeout), a felhasználótól már levont kredit nem került visszatérítésre. Ez azt jelentette, hogy a felhasználó fizetett egy elemzésért, amit nem kapott meg.

## Megoldás

Implementáltam egy automatikus visszatérítési rendszert, amely minden sikertelen elemzésnél visszaadja a kreditet.

### Főbb változások

#### 1. Timeout kezelés ([lib/process-analysis.ts](lib/process-analysis.ts))

- **5 perces timeout**: Ha az elemzés feldolgozása 5 percnél tovább tart, automatikusan megszakad
- A timeout esetén az elemzés státusza `failed` lesz
- Automatikus kredit visszatérítés történik

```typescript
const PROCESSING_TIMEOUT = 5 * 60 * 1000 // 5 minutes
```

#### 2. Automatikus kredit visszatérítés ([lib/process-analysis.ts](lib/process-analysis.ts:17-40))

Minden esetben, amikor az elemzés `failed` státuszra áll:
1. Ellenőrzi, hogy történt-e kredit levonás
2. Ha igen, visszaad 1 kreditet a felhasználónak
3. Ledger bejegyzést hoz létre `"refund"` okkal

```typescript
async function refundCreditIfNeeded(sessionId: string, userId: string | null)
```

#### 3. Hibakezelés ([lib/process-analysis.ts](lib/process-analysis.ts:70-93))

Az elemzés feldolgozása során bármi hiba esetén:
- Státusz → `failed`
- Kredit visszatérítés automatikusan megtörténik
- Részletes hibaüzenet logolása

#### 4. Cleanup cron job ([app/api/cron/cleanup-stuck-analyses/route.ts](app/api/cron/cleanup-stuck-analyses/route.ts))

**10 percenként** fut automatikusan és:
- Megkeresi az összes `processing` státuszú elemzést, ami 10 percnél régebbi
- Státusz → `failed`
- Kredit visszatérítés, ha van felhasználó és történt levonás
- Részletes jelentés készítése

**Beállítás**: [vercel.json](vercel.json)

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-stuck-analyses",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

### Mikor történik visszatérítés?

1. **Gemini API hiba**: Ha a Gemini API nem válaszol vagy hibát ad vissza
2. **MAD service hiba**: Ha a smink képgenerálás sikertelen (ez NEM okoz teljes hibát, csak nincs kép)
3. **Timeout**: Ha az elemzés 5 percnél tovább tart
4. **Képfeltöltési hiba**: Ha nem sikerül a képeket feltölteni
5. **PDF generálási hiba**: Ha a PDF generálás sikertelen
6. **Leragadt elemzések**: Cleanup job automatikusan kezeli őket

### Mikor NEM történik visszatérítés?

1. **Sikeres elemzés**: Ha minden rendben lezajlott
2. **Stripe fizetés**: Ha csak Stripe-al fizettek, de még nem indult el a feldolgozás
3. **Nem létező felhasználó**: Vendég elemzéseknél (mivel ott nincs kredit rendszer)

### Monitoring

#### Console logok

```
[Cleanup] Looking for stuck analyses...
[Cleanup] Found 2 stuck sessions
[Cleanup] Refunded credit for session abc-123
[Cleanup] Processed 2 sessions, refunded 2 credits
```

#### Ledger bejegyzések

Minden visszatérítés egy `credit_ledger` bejegyzést hoz létre:
- `delta`: +1
- `reason`: "refund"
- `analysisSessionId`: kapcsolódó elemzés ID

### Tesztelés

1. **Timeout tesztelése**: Próbálj meg egy elemzést feldolgozni 5+ percig tartó késleltetéssel
2. **API hiba tesztelése**: Hibás API kulccsal próbálkozz
3. **Cleanup job tesztelése**: Hívd meg kézzel a `/api/cron/cleanup-stuck-analyses` endpointot

### Biztonság

- Csak a felhasználó saját elemzéseinél történik visszatérítés
- Dupla visszatérítés ellen védelem: ellenőrzi, hogy már történt-e refund
- Minden művelet tranzakcionálisan történik (adatbázis szinten)

## Összefoglalás

Most már **biztonságos** a kredit rendszer:
- ✅ Timeout védelem (5 perc)
- ✅ Automatikus visszatérítés sikertelen elemzésnél
- ✅ Cleanup job a leragadt elemzésekhez (10 percenként)
- ✅ Részletes logolás és monitoring
- ✅ Dupla visszatérítés elleni védelem
