import { authClient } from '../lib/auth-client'

function Login() {
  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:5173/"
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">Messenger</h1>
      <button
        type="button"
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-blue-500 text-white rounded-lg text-base hover:bg-blue-600 transition-colors cursor-pointer"
      >
        Sign in with Google
      </button>
    </div>
  )
}

export default Login