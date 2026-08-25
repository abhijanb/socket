import { authClient } from './lib/auth-client'
import './App.css'

function App() {
  const signInWithGoogle = async () => {
    await authClient.signIn.social({ provider: "google" })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
      <h1>Messenger</h1>
      <button
        type="button"
        onClick={signInWithGoogle}
        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#4285f4', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }}
      >
        Sign in with Google
      </button>
    </div>
  )
}

export default App