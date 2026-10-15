import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/api'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')

      const response = await api.post('/auth/login', {
        email,
        password,
      })

      localStorage.setItem('token', response.data.token)

      navigate('/dashboard')
    } catch (err) {
      console.error(err)

      setError(
        'Invalid email or password. Please check your credentials.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">

      <div className="w-full max-w-md">

        <div className="mb-8 text-center">

          <h1 className="text-3xl font-bold tracking-tight">
            Apply<span className="text-blue-500">Track</span>
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Intelligent Job Application Management
          </p>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">

          <div className="mb-6">
            <h2 className="text-2xl font-semibold">
              Welcome back
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Sign in to manage your job applications.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-400 transition hover:text-blue-300"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

          </form>

          {/* Register */}
          <div className="mt-6 border-t border-slate-800 pt-6 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-400 transition hover:text-blue-300"
              >
                Create Account
              </Link>
            </p>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Login
