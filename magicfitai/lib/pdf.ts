import type { AnalysisObservations, MakeupLook } from "@/lib/db/schema"

/**
 * Escape HTML to prevent XSS and ensure proper character encoding
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (char) => map[char] || char)
}

/**
 * Generate PDF content as HTML (for server-side PDF generation)
 * This creates a print-optimized HTML that can be converted to PDF
 */
export function generatePdfHtml(
  observations: AnalysisObservations,
  looks: MakeupLook[],
  beforeImageUrl?: string | null
): string {
  return `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>Smink Útmutató - Magic Fit AI</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1F1F22;
      background: #fff;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      max-width: 100%;
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      margin-bottom: 20px;
      border-bottom: 2px solid #B78C86;
    }
    .header h1 {
      color: #B78C86;
      font-size: 28pt;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .header p {
      color: #7A7A80;
      font-size: 11pt;
    }
    .user-photo {
      text-align: center;
      margin-bottom: 24px;
    }
    .user-photo img {
      max-width: 180px;
      max-height: 180px;
      border-radius: 12px;
      border: 2px solid #B78C86;
    }
    h2 {
      color: #1F1F22;
      font-size: 16pt;
      margin: 24px 0 12px;
      padding-bottom: 6px;
      border-bottom: 1px solid #B78C86;
    }
    .observations-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .observation {
      background: #F8F7F5;
      padding: 8px 10px;
      border-radius: 8px;
      border: 1px solid #E0DDDA;
      min-width: 0;
      max-width: 100%;
    }
    .observation strong {
      color: #B78C86;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
    }
    .observation span {
      font-size: 10pt;
      color: #1F1F22;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      display: block;
      max-width: 100%;
    }
    .notes {
      background: #F8F7F5;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #E0DDDA;
      font-style: italic;
      color: #5A5A60;
      margin-bottom: 16px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    .look {
      background: #FAFAFA;
      border: 1px solid #E0DDDA;
      border-radius: 12px;
      padding: 14px;
      margin: 16px 0;
      page-break-inside: avoid;
      max-width: 100%;
      min-width: 0;
    }
    .look-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .look-number {
      width: 28px;
      height: 28px;
      background: #B78C86;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 12pt;
    }
    .look h3 {
      color: #1F1F22;
      font-size: 14pt;
      margin: 0;
    }
    .look > p {
      color: #5A5A60;
      font-size: 10pt;
      margin-bottom: 12px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      max-width: 100%;
    }
    .section {
      background: white;
      border: 1px solid #E0DDDA;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
      max-width: 100%;
      min-width: 0;
    }
    .section-title {
      font-weight: 600;
      color: #B78C86;
      font-size: 10pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .section ol {
      margin: 0;
      padding-left: 18px;
    }
    .section li {
      margin-bottom: 3px;
      font-size: 9pt;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      max-width: 100%;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .product-category {
      min-width: 0;
      max-width: 100%;
    }
    .product-category h4 {
      color: #7A7A80;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 4px;
    }
    .product-category ul {
      margin: 0;
      padding-left: 12px;
      font-size: 9pt;
    }
    .product-category li {
      margin-bottom: 2px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      max-width: 100%;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      padding-top: 16px;
      border-top: 1px solid #E0DDDA;
      color: #7A7A80;
      font-size: 10pt;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Smink Útmutató</h1>
    <p>Személyre szabott sminktanácsok a Magic Fit AI-tól</p>
  </div>

  ${beforeImageUrl ? `
  <div class="user-photo">
    <img src="${beforeImageUrl}" alt="Eredeti fotó" />
  </div>
  ` : ""}

  <h2>Arcanalízis</h2>
  <div class="observations-grid">
    <div class="observation">
      <strong>Arcforma</strong>
      <span>${escapeHtml(observations.faceShape)}</span>
    </div>
    <div class="observation">
      <strong>Bőrtónus</strong>
      <span>${escapeHtml(observations.skinTone)}</span>
    </div>
    <div class="observation">
      <strong>Alaptónus</strong>
      <span>${escapeHtml(observations.undertone)}</span>
    </div>
    <div class="observation">
      <strong>Kontraszt</strong>
      <span>${escapeHtml(observations.contrast)}</span>
    </div>
    <div class="observation">
      <strong>Szemforma</strong>
      <span>${escapeHtml(observations.eyeShape)}</span>
    </div>
    <div class="observation">
      <strong>Szemöldök</strong>
      <span>${escapeHtml(observations.brows)}</span>
    </div>
    <div class="observation">
      <strong>Ajkak</strong>
      <span>${escapeHtml(observations.lips)}</span>
    </div>
  </div>
  ${observations.notes ? `<div class="notes">${escapeHtml(observations.notes)}</div>` : ""}

  <h2>Look Javaslatok</h2>
  ${looks.map((look, index) => `
    <div class="look">
      <div class="look-header">
        <div class="look-number">${index + 1}</div>
        <h3>${escapeHtml(look.title)}</h3>
      </div>
      <p>${escapeHtml(look.why)}</p>

      <div class="section">
        <div class="section-title">Lépések</div>
        <ol>
          ${look.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
      </div>

      <div class="section">
        <div class="section-title">Ajánlott termékek</div>
        <div class="products-grid">
          <div class="product-category">
            <h4>Alap</h4>
            <ul>${look.products.base.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
          </div>
          <div class="product-category">
            <h4>Szemek</h4>
            <ul>${look.products.eyes.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
          </div>
          <div class="product-category">
            <h4>Szemöldök</h4>
            <ul>${look.products.brows.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
          </div>
          <div class="product-category">
            <h4>Ajkak</h4>
            <ul>${look.products.lips.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
          </div>
          <div class="product-category">
            <h4>Arc</h4>
            <ul>${look.products.face.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    </div>
  `).join("")}

  <div class="footer">
    <p>Generálva: Magic Fit AI • ${new Date().toLocaleDateString("hu-HU")}</p>
    <p>© ${new Date().getFullYear()} Magic Fit AI - Minden jog fenntartva</p>
  </div>
</body>
</html>
  `
}

/**
 * Generate PDF buffer from HTML using puppeteer (if available)
 * Falls back to returning HTML if puppeteer is not available
 */
export async function generatePdfBuffer(
  observations: AnalysisObservations,
  looks: MakeupLook[],
  beforeImageUrl?: string | null
): Promise<Buffer> {
  const html = generatePdfHtml(observations, looks, beforeImageUrl)

  // Return HTML as buffer (client can render as HTML or use print dialog)
  // For true PDF generation in production, use a service like:
  // - Puppeteer (requires headless Chrome)
  // - @react-pdf/renderer
  // - External API (html2pdf, DocRaptor, etc.)

  return Buffer.from(html, "utf-8")
}
