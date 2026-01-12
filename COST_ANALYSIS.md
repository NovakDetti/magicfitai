# MagicFit AI - Költségelemzés (1 felhasználó / 1 elemzés)

## 🎯 Teljes User Flow Költségei

### 1. **Képfeltöltés & Tárolás (Cloudflare R2)**

**Feltöltött kép (előtte):**
- Eredeti méret: ~2-3 MB (átlag selfie)
- Optimalizált méret: ~150 KB (WebP, 1200x1600px, 85% quality)
- Tárolási költség: $0.015/GB/hó
- **Költség/hó: $0.0000023 (~0 Ft)**

**Generált képek (3x utána):**
- 3 x ~150 KB = ~450 KB
- **Költség/hó: $0.0000068 (~0 Ft)**

**Összesen tárolás (előtte + 3x utána):**
- **~600 KB / user**
- **Költség/hó: $0.000009 (0.003 Ft/hó)**
- **Költség/év: $0.00011 (0.036 Ft/év)**

---

### 2. **OpenAI API (GPT-4o Vision)**

**Elemzés (GPT-4o):**
- Input tokens: ~1,000 tokens (prompt + kép metadata)
- Output tokens: ~2,000 tokens (részletes elemzés + 3 look leírás)
- Összesen: ~3,000 tokens
- Költség: $0.0025/1K input + $0.010/1K output
- **Költség: $0.0025 + $0.020 = $0.0225 (7.5 Ft)**

**3 Look generálás (3x GPT-4o):**
- Input tokens: 3 x ~800 = 2,400 tokens
- Output tokens: 3 x ~1,200 = 3,600 tokens
- **Költség: $0.006 + $0.036 = $0.042 (14 Ft)**

**OpenAI összesen:**
- **$0.0645 per user (~21.5 Ft)**

---

### 3. **Képgenerálás (Replicate/MAD)**

**MAD (Makeup Transfer AI):**
- Cost per generation: ~$0.02-0.05 (függően a modeltől)
- 3 look x $0.03 average
- **Költség: $0.09 (~30 Ft)**

**Alternatíva - Stable Diffusion XL:**
- Cost per image: ~$0.002-0.005
- 3 images x $0.003
- **Költség: $0.009 (~3 Ft)**

---

### 4. **Adatbázis (Neon PostgreSQL)**

**Free tier:**
- 0.5 GB storage (több mint elég)
- 100 hours compute/hó
- **Költség: $0 (ingyenes a kezdéshez)**

**Paid tier (ha kinövöd):**
- $19/hó = korlátlan
- 1 user = ~2 KB metadata
- **Költség/user: $0.000001 (~0 Ft)**

---

### 5. **Vercel Hosting**

**Free tier:**
- 100 GB bandwidth/hó
- Serverless functions
- **Költség: $0**

**Ha fizetős (Pro - $20/hó):**
- 1 user request = ~5 MB transfer
- **Költség/user: $0.0001 (~0 Ft)**

---

## 💰 TELJES KÖLTSÉG / USER / ELEMZÉS

| Szolgáltatás | Költség (USD) | Költség (HUF) | % |
|-------------|--------------|--------------|---|
| **OpenAI GPT-4o** | $0.0645 | 21.5 Ft | 41% |
| **Képgenerálás (MAD)** | $0.09 | 30 Ft | 58% |
| **Tárolás (R2)** | $0.000009 | 0.003 Ft | <1% |
| **Adatbázis** | $0.000001 | 0.0003 Ft | <1% |
| **Hosting/Transfer** | $0.0001 | 0.03 Ft | <1% |
| **ÖSSZESEN** | **$0.155** | **~52 Ft** | **100%** |

---

## 📊 ÜZLETI SZÁMOK

### Bevétel vs Költség

**1 kredit ára: 450 Ft**
- Költség: 52 Ft
- Profit margin: **398 Ft (88.4%)**
- Markup: **8.65x**

**5 kredites csomag: 2,025 Ft (405 Ft/kredit)**
- Költség: 5 x 52 = 260 Ft
- Profit: 1,765 Ft (87.2%)
- Markup: **7.8x**

**10 kredites csomag: 3,825 Ft (382.5 Ft/kredit)**
- Költség: 10 x 52 = 520 Ft
- Profit: 3,305 Ft (86.4%)
- Markup: **7.4x**

---

## 🎯 BREAK-EVEN ANALÍZIS

**Havi fix költségek:**
- Domain: ~5,000 Ft/év = 417 Ft/hó
- Vercel Pro (opcionális): 7,000 Ft/hó
- **Összesen: ~7,500 Ft/hó**

**Break-even pontok:**
- **Ingyenes tier-el:** 7,500 Ft / 398 Ft profit = **19 eladás/hó**
- **Pro tier-el:** 7,500 Ft / 398 Ft = **19 eladás/hó** (tárolási többletköltség elhanyagolható)

**Veszteség nélkül:** ~1 eladás/nap

---

## 💡 OPTIMALIZÁLÁSI LEHETŐSÉGEK

### 1. Képgenerálás költség csökkentése (-78%)

**Jelenlegi:** MAD service = $0.09/user
**Alternatíva:** Stable Diffusion XL = $0.009/user
**Megtakarítás:** $0.081 (27 Ft) / user
**Új profit margin:** 425 Ft (94.4%)

### 2. GPT-4o-mini használata bizonyos részekhez (-50%)

**Jelenlegi:** GPT-4o minden lépéshez
**Alternatíva:** GPT-4o vision + GPT-4o-mini leíráshoz
**Megtakarítás:** ~$0.03 (10 Ft) / user
**Új profit margin:** 408 Ft (90.7%)

### 3. Batch processing (később, nagy volumen esetén)

OpenAI batch API: 50% kedvezmény
**Megtakarítás:** $0.032 (10.7 Ft) / user

---

## 📈 SKÁLÁZÁSI FORGATÓKÖNYVEK

### Konzervatív (100 user/hó)
- Bevétel: 100 x 450 Ft = 45,000 Ft
- Költség: 100 x 52 Ft + 7,500 Ft = 12,700 Ft
- **Profit: 32,300 Ft/hó**

### Növekedési (500 user/hó)
- Bevétel: 500 x 450 Ft = 225,000 Ft
- Költség: 500 x 52 Ft + 7,500 Ft = 33,500 Ft
- **Profit: 191,500 Ft/hó**

### Sikeres (2,000 user/hó)
- Bevétel: 2,000 x 450 Ft = 900,000 Ft
- Költség: 2,000 x 52 Ft + 7,500 Ft = 111,500 Ft
- **Profit: 788,500 Ft/hó**

---

## 🚨 KRITIKUS LIMITEK

### OpenAI Rate Limits (Tier 1)
- 500,000 tokens/perc
- ~166 egyidejű user / perc
- **Aggódni 10,000+ user/nap felett kell**

### Cloudflare R2 Free Tier
- 10 GB storage
- **~17,000 elemzés** (600 KB/elemzés)
- **~566 nap** 30 user/nap sebességgel
- **~283 nap** 60 user/nap sebességgel

### Neon DB Free Tier
- 0.5 GB storage + 100h compute
- **Aggódni 1,000+ user után kell**

---

## ✅ AJÁNLÁS

**Jelenlegi árazás KIVÁLÓ:**
- 88% profit margin egészséges
- Versenyképes ár (450 Ft vs kozmetikus: 10,000+ Ft)
- Bőven van tér a költségeknek növekedni

**Következő lépések:**
1. ✅ Képoptimalizálás implementálva (70% megtakarítás)
2. ⏳ R2 beállítása production-re
3. ⏳ Monitorozás: követni a tényleges költségeket
4. 🔮 Később: Batch processing nagy volumen esetén

**Pénzügyileg fenntartható: ✅**
