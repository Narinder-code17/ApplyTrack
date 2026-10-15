import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setMessage('')
      setError('')

      const response = await api.post('/auth/forgot-password', {
        email,
      })

      setMessage(response.data)
    } catch (err) {
      console.error(err)
      setError(
        'Unable to process your request. Please try again.'
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

          <h2 className="text-2xl font-semibold">
            Forgot your password?
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Enter your registered email and we'll send you a
            password reset link.
          </p>

          {message && (
            <div className="mt-5 rounded-lg border border-green-900 bg-green-950/30 p-3 text-sm text-green-400">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            <div>

              <label className="mb-2 block text-sm font-medium text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Sending...'
                : 'Send Reset Link'}
            </button>

          </form>

          <div className="mt-6 text-center">

            <Link
              to="/login"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              ← Back to Login
            </Link>

          </div>

        </div>

      </div>

    </div>
  )
}

export default ForgotPassword