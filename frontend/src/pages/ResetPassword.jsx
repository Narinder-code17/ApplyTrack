import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/api'

function ResetPassword() {
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setMessage('')

    if (!token) {
      setError('Invalid password reset link.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    try {
      setLoading(true)

      const response = await api.post(
        '/auth/reset-password',
        {
          token,
          newPassword: password,
        }
      )

      setMessage(response.data)

      setPassword('')
      setConfirmPassword('')

    } catch (err) {
      console.error(err)

      setError(
        err.response?.data ||
        'Unable to reset password. The link may have expired.'
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
            Reset Password
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Create a new password for your account.
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

          {!message && (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  New Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Resetting...'
                  : 'Reset Password'}
              </button>

            </form>
          )}

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

export default ResetPassword