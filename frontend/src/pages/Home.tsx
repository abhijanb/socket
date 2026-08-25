import { authClient } from '../lib/auth-client'

function Home() {
  const signOut = async () => {
    await authClient.signOut()
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Welcome to Messenger</h1>
      <p>You are logged in!</p>
      <button 
        onClick={signOut}
        style={{ padding: '0.75rem 1.5rem', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer' }}
      >
        Sign Out
      </button>
    </div>
  )
}

export default Home