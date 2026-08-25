import { authClient } from '../lib/auth-client'
import { Link } from 'react-router-dom'

function Home() {
  const signOut = async () => {
    await authClient.signOut()
  }

  return (
    <div className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Messenger</h1>
      <p className="mb-8">You are logged in!</p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          to="/friends"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block"
        >
          Go to Friends
        </Link>
        <button
          onClick={signOut}
          className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Home