export default function TestPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Test Page - Működik a Vercel deployment!</h1>
      <p>Ha ezt látod, akkor a build és deploy működik.</p>
      <p>Dátum: {new Date().toISOString()}</p>
    </div>
  )
}
