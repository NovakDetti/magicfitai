export default function HomePage() {
  return (
    <div style={{
      padding: '50px',
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', color: '#333' }}>
        🎨 Magic Fit AI
      </h1>
      <p style={{ fontSize: '24px', marginBottom: '20px', color: '#666' }}>
        Személyre szabott sminktanácsok AI-val
      </p>
      <p style={{ fontSize: '16px', color: '#999' }}>
        Az oldal hamarosan elérhető lesz!
      </p>
      <p style={{ fontSize: '14px', color: '#aaa', marginTop: '40px' }}>
        Build: {new Date().toISOString()}
      </p>
    </div>
  )
}
