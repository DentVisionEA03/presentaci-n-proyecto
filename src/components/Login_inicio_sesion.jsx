import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { recoverPassword, registerUser } from '../services/authService'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login({ onLogin, onBack }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [recoverEmail, setRecoverEmail] = useState('')

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const changeMode = (nextMode) => {
    setMode(nextMode)
    setErrors({})
    setSuccessMessage('')
    setLoading(false)
  }

  const validateLogin = () => {
    const err = {}

    if (!form.email.trim()) {
      err.email = 'El correo es obligatorio'
    } else if (!EMAIL_REGEX.test(form.email)) {
      err.email = 'Ingresa un correo válido'
    }

    if (!form.password) {
      err.password = 'La contraseña es obligatoria'
    } else if (form.password.length < 6) {
      err.password = 'Mínimo 6 caracteres'
    }

    setErrors(err)
    setSuccessMessage('')
    return Object.keys(err).length === 0
  }

  const validateRegister = () => {
    const err = {}

    if (!registerForm.name.trim()) {
      err.name = 'El nombre es obligatorio'
    }

    if (!registerForm.email.trim()) {
      err.email = 'El correo es obligatorio'
    } else if (!EMAIL_REGEX.test(registerForm.email)) {
      err.email = 'Ingresa un correo válido'
    }

    if (!registerForm.password) {
      err.password = 'La contraseña es obligatoria'
    } else if (registerForm.password.length < 6) {
      err.password = 'Mínimo 6 caracteres'
    }

    setErrors(err)
    setSuccessMessage('')
    return Object.keys(err).length === 0
  }

  const validateRecover = () => {
    const err = {}

    if (!recoverEmail.trim()) {
      err.email = 'El correo es obligatorio'
    } else if (!EMAIL_REGEX.test(recoverEmail)) {
      err.email = 'Ingresa un correo válido'
    }

    setErrors(err)
    setSuccessMessage('')
    return Object.keys(err).length === 0
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()

    if (!validateLogin()) return

    setLoading(true)

    try {
      await onLogin({
        email: form.email,
        password: form.password,
        remember: form.remember,
      })
      setSuccessMessage('Inicio de sesión exitoso.')
    } catch (error) {
      setErrors({ form: error.message || 'No pudimos iniciar sesión. Revisa tus datos.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()

    if (!validateRegister()) return

    setLoading(true)

    try {
      await registerUser(registerForm)
      setSuccessMessage('Registro exitoso. Ya puedes iniciar sesión.')
      setForm((current) => ({ ...current, email: registerForm.email }))
      setRegisterForm({ name: '', email: '', password: '' })
      setMode('login')
    } catch (error) {
      setErrors({ form: error.message || 'No pudimos crear la cuenta.' })
    } finally {
      setLoading(false)
    }
  }

  const handleRecoverSubmit = async (e) => {
    e.preventDefault()

    if (!validateRecover()) return

    setLoading(true)

    try {
      const response = await recoverPassword({ email: recoverEmail })
      setSuccessMessage(response.message || `Enviamos instrucciones a ${recoverEmail}.`)
      setRecoverEmail('')
      setMode('login')
    } catch (error) {
      setErrors({ form: error.message || 'No pudimos enviar las instrucciones.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-overlay"></div>

      <div className="login-card animate-fadeIn">
        {onBack && (
          <button type="button" className="login-back" onClick={onBack}>
            Volver a la pagina principal
          </button>
        )}

        <h2>
          {mode === 'login' && 'Iniciar Sesión'}
          {mode === 'register' && 'Crear Cuenta'}
          {mode === 'recover' && 'Recuperar Contraseña'}
        </h2>

        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="login-form" noValidate>
            <div className="form-field">
              <label className="field-label" htmlFor="login-email">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Correo"
                className="form-input"
                value={form.email}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              {errors.email && (
                <p className="form-error" id="login-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-field password-field">
              <label className="field-label" htmlFor="login-password">
                Contraseña
              </label>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                className="form-input"
                value={form.password}
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="show-password-btn"
                aria-controls="login-password"
                aria-pressed={showPassword}
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>

              {errors.password && (
                <p className="form-error" id="login-password-error">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="login-options">
              <label className="remember-field">
                <input
                  id="remember-session"
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) =>
                    setForm({ ...form, remember: e.target.checked })
                  }
                />
                Recordarme
              </label>

              <button
                type="button"
                className="text-link"
                onClick={() => changeMode('recover')}
              >
                Olvidé mi contraseña
              </button>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner" aria-hidden="true"></span>
              ) : (
                'Ingresar'
              )}
            </button>

            <p className="form-switch">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  if (onBack) onBack();
                  navigate('/register');
                }}
              >
                Registrarse
              </button>
            </p>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="login-form" noValidate>
            <div className="form-field">
              <label className="field-label" htmlFor="register-name">
                Nombre completo
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="Nombre completo"
                className="form-input"
                value={registerForm.name}
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'register-name-error' : undefined}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="form-error" id="register-name-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="register-email">
                Correo electrónico
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="Correo"
                className="form-input"
                value={registerForm.email}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
                onChange={(e) =>
                  setRegisterForm({ ...registerForm, email: e.target.value })
                }
              />
              {errors.email && (
                <p className="form-error" id="register-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-field">
              <label className="field-label" htmlFor="register-password">
                Contraseña
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="Contraseña"
                className="form-input"
                value={registerForm.password}
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'register-password-error' : undefined}
                onChange={(e) =>
                  setRegisterForm({
                    ...registerForm,
                    password: e.target.value,
                  })
                }
              />
              {errors.password && (
                <p className="form-error" id="register-password-error">
                  {errors.password}
                </p>
              )}
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? <span className="spinner" aria-hidden="true"></span> : 'Crear cuenta'}
            </button>

            <p className="form-switch">
              ¿Ya tienes cuenta?{' '}
              <button
                type="button"
                className="text-link"
                onClick={() => changeMode('login')}
              >
                Iniciar sesión
              </button>
            </p>
          </form>
        )}

        {mode === 'recover' && (
          <form onSubmit={handleRecoverSubmit} className="login-form" noValidate>
            <p className="form-help">
              Escribe tu correo y te enviaremos instrucciones para recuperar tu contraseña.
            </p>

            <div className="form-field">
              <label className="field-label" htmlFor="recover-email">
                Correo electrónico
              </label>
              <input
                id="recover-email"
                type="email"
                placeholder="Correo"
                className="form-input"
                value={recoverEmail}
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'recover-email-error' : undefined}
                onChange={(e) => setRecoverEmail(e.target.value)}
              />
              {errors.email && (
                <p className="form-error" id="recover-email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="spinner" aria-hidden="true"></span>
              ) : (
                'Enviar instrucciones'
              )}
            </button>

            <p className="form-switch">
              <button
                type="button"
                className="text-link"
                onClick={() => changeMode('login')}
              >
                Volver al inicio de sesión
              </button>
            </p>
          </form>
        )}

        {successMessage && (
          <p className="form-success" role="status">
            {successMessage}
          </p>
        )}

        {errors.form && (
          <p className="form-error form-error-center" role="alert">
            {errors.form}
          </p>
        )}
      </div>
    </div>
  )
}
