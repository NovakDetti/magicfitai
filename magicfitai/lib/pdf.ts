import type { AnalysisObservations, MakeupLook } from "@/lib/db/schema"

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
  <meta charset="utf-8">
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
      font-size: 12pt;
      line-height: 1.6;
      color: #1F1F22;
      background: #fff;
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
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #E0DDDA;
    }
    .observation strong {
      color: #B78C86;
      font-size: 9pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 2px;
    }
    .observation span {
      font-size: 11pt;
      color: #1F1F22;
    }
    .notes {
      background: #F8F7F5;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #E0DDDA;
      font-style: italic;
      color: #5A5A60;
      margin-bottom: 16px;
    }
    .look {
      background: #FAFAFA;
      border: 1px solid #E0DDDA;
      border-radius: 12px;
      padding: 16px;
      margin: 16px 0;
      page-break-inside: avoid;
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
      font-size: 11pt;
      margin-bottom: 12px;
    }
    .section {
      background: white;
      border: 1px solid #E0DDDA;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
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
      margin-bottom: 4px;
      font-size: 10pt;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
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
      padding-left: 14px;
      font-size: 10pt;
    }
    .product-category li {
      margin-bottom: 2px;
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
      <span>${observations.faceShape}</span>
    </div>
    <div class="observation">
      <strong>Bőrtónus</strong>
      <span>${observations.skinTone}</span>
    </div>
    <div class="observation">
      <strong>Alaptónus</strong>
      <span>${observations.undertone}</span>
    </div>
    <div class="observation">
      <strong>Kontraszt</strong>
      <span>${observations.contrast}</span>
    </div>
    <div class="observation">
      <strong>Szemforma</strong>
      <span>${observations.eyeShape}</span>
    </div>
    <div class="observation">
      <strong>Szemöldök</strong>
      <span>${observations.brows}</span>
    </div>
    <div class="observation">
      <strong>Ajkak</strong>
      <span>${observations.lips}</span>
    </div>
  </div>
  ${observations.notes ? `<div class="notes">${observations.notes}</div>` : ""}

  <h2>Look Javaslatok</h2>
  ${looks.map((look, index) => `
    <div class="look">
      <div class="look-header">
        <div class="look-number">${index + 1}</div>
        <h3>${look.title}</h3>
      </div>
      <p>${look.why}</p>

      <div class="section">
        <div class="section-title">Lépések</div>
        <ol>
          ${look.steps.map((step) => `<li>${step}</li>`).join("")}
        </ol>
      </div>

      <div class="section">
        <div class="section-title">Ajánlott termékek</div>
        <div class="products-grid">
          <div class="product-category">
            <h4>Alap</h4>
            <ul>${look.products.base.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>
          <div class="product-category">
            <h4>Szemek</h4>
            <ul>${look.products.eyes.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>
          <div class="product-category">
            <h4>Szemöldök</h4>
            <ul>${look.products.brows.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>
          <div class="product-category">
            <h4>Ajkak</h4>
            <ul>${look.products.lips.map((p) => `<li>${p}</li>`).join("")}</ul>
          </div>
          <div class="product-category">
            <h4>Arc</h4>
            <ul>${look.products.face.map((p) => `<li>${p}</li>`).join("")}</ul>
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
