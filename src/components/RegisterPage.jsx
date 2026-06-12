import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import fondoImagen from '../assets/fondo.jpg'
import styles from '../styles/RegisterPage.module.css'
import { registerUser } from '../services/authService'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    documentType: '',
    documentId: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    try {
      // Llamada al servicio de registro (usando los campos que espera el servicio)
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      navigate('/login') // Redirigir al login tras éxito
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const pageStyle = {
    backgroundImage: `url(${fondoImagen})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
  return (
    <div style={pageStyle}>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            <div className={`border-0 rounded-3 text-white ${styles.cardGlass}`}>
              <div className="card-body p-5">
                <h2 className="text-center mb-4">Crear Cuenta</h2>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nombre Completo</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Juan Pérez"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="nombre@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Tipo de Documento</label>
                    <select
                      className="form-select form-control"
                      aria-label="Default select example"
                      name="documentType"
                      value={formData.documentType}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Seleccionar Tipo de Documento
                      </option>
                      <option value="1">Cédula de Ciudadanía (C.C.)</option>
                      <option value="2">Tarjeta de Identidad (T.I.)</option>
                      <option value="3">Cédula de Extranjería (C.E.)</option>
                      <option value="4">Permiso Especial de Permanencia (PEP)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="documento" className="form-label">
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      name="documentId"
                      className="form-control"
                      id="documento"
                      placeholder="Ingresa tu número de documento"
                      maxLength={10}
                      value={formData.documentId}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && <p className="text-danger small">{error}</p>}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={loading}
                  >
                    {loading ? 'Procesando...' : 'Registrarse'}
                  </button>
                </form>

                <div className="text-center mt-3">
                  <small>
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import fondoImagen from '../assets/fondo.jpg'
import styles from '../styles/RegisterPage.module.css'
import { registerUser } from '../services/authService'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    documentType: '',
    documento: '',
    email: '',
    emailConfirm: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [generalError, setGeneralError] = useState('')

  // Validaciones
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (pwd) => ({
    length: pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*()_+=[\]{};':"\\|,.<>/?]/.test(pwd),
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombres.trim()) newErrors.nombres = 'Nombres es requerido'
    if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos es requerido'
    if (!formData.documento.trim()) newErrors.documento = 'Documento es requerido'
    if (!validateEmail(formData.email)) newErrors.email = 'Email inválido'
    if (formData.email !== formData.emailConfirm) newErrors.emailConfirm = 'Los emails no coinciden'

    const passwordValidation = validatePassword(formData.password)
    if (!Object.values(passwordValidation).every(Boolean)) {
      newErrors.password = 'La contraseña no cumple los requisitos'
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    if (!formData.acceptedTerms) newErrors.acceptedTerms = 'Debes aceptar las políticas'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) return

    setLoading(true)
    try {
      await registerUser({
        nombres:      formData.nombres,
        apellidos:    formData.apellidos,
        email: formData.email,
        password: formData.password,
        documento: formData.documento,
        documentType: formData.documentType,
      })
      navigate('/login')
    } catch (err) {
      setGeneralError(err.message || 'No se pudo crear la cuenta. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const passwordValidation = validatePassword(formData.password)

  const pageStyle = {
    backgroundImage: `url(${fondoImagen})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 0',
  }

  return (
    <div style={pageStyle}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className={`border-0 rounded-3 text-white ${styles.cardGlass}`}>
              <div className="card-body p-4">
                <h2 className="text-center mb-4 fw-bold">Crear Cuenta</h2>

                {generalError && (
                  <div className="alert alert-danger" role="alert">
                    {generalError}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Nombres y Apellidos */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombres *</label>
                      <input
                        type="text"
                        name="nombres"
                        className={`form-control ${errors.nombres ? 'is-invalid' : ''}`}
                        placeholder="Juan"
                        value={formData.nombres}
                        onChange={handleChange}
                      />
                      {errors.nombres && <div className="invalid-feedback d-block">{errors.nombres}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellidos *</label>
                      <input
                        type="text"
                        name="apellidos"
                        className={`form-control ${errors.apellidos ? 'is-invalid' : ''}`}
                        placeholder="Pérez García"
                        value={formData.apellidos}
                        onChange={handleChange}
                      />
                      {errors.apellidos && <div className="invalid-feedback d-block">{errors.apellidos}</div>}
                    </div>
                  </div>

                  {/* Tipo y Número de Documento */}
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Tipo de Documento *</label>
                      <select
                        name="documentType"
                        className="form-select"
                        value={formData.documentType}
                        onChange={handleChange}
                      >
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="PA">Pasaporte</option>
                        <option value="TI">Tarjeta de Identidad</option>
                      </select>
                    </div>
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Número de Documento *</label>
                      <input
                        type="text"
                        name="documento"
                        className={`form-control ${errors.documento ? 'is-invalid' : ''}`}
                        placeholder="1234567890"
                        value={formData.documento}
                        onChange={handleChange}
                      />
                      {errors.documento && <div className="invalid-feedback d-block">{errors.documento}</div>}
                    </div>
                  </div>

                  {/* Email y Confirmación */}
                  <div className="mb-3">
                    <label className="form-label">Correo Electrónico *</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback d-block">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirmar Correo Electrónico *</label>
                    <input
                      type="email"
                      name="emailConfirm"
                      className={`form-control ${errors.emailConfirm ? 'is-invalid' : ''}`}
                      placeholder="Repite tu correo"
                      value={formData.emailConfirm}
                      onChange={handleChange}
                    />
                    {errors.emailConfirm && <div className="invalid-feedback d-block">{errors.emailConfirm}</div>}
                  </div>

                  {/* Contraseña */}
                  <div className="mb-3">
                    <label className="form-label">Contraseña *</label>
                    <div className="position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className={`btn btn-sm position-absolute end-0 top-50 translate-middle-y ${styles.eyeButton}`}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {errors.password && <div className="invalid-feedback d-block">{errors.password}</div>}

                    {/* Barra de Validación de Contraseña */}
                    {formData.password && (
                      <div className={`mt-2 ${styles.passwordValidator}`}>
                        <div className={`${styles.validatorRow}`}>
                          <span className={passwordValidation.length ? styles.valid : styles.invalid}>
                            ✓ Mínimo 8 caracteres
                          </span>
                        </div>
                        <div className={`${styles.validatorRow}`}>
                          <span className={passwordValidation.uppercase ? styles.valid : styles.invalid}>
                            ✓ Letra mayúscula
                          </span>
                        </div>
                        <div className={`${styles.validatorRow}`}>
                          <span className={passwordValidation.lowercase ? styles.valid : styles.invalid}>
                            ✓ Letra minúscula
                          </span>
                        </div>
                        <div className={`${styles.validatorRow}`}>
                          <span className={passwordValidation.number ? styles.valid : styles.invalid}>
                            ✓ Número
                          </span>
                        </div>
                        <div className={`${styles.validatorRow}`}>
                          <span className={passwordValidation.special ? styles.valid : styles.invalid}>
                            ✓ Carácter especial (!@#$%^&*)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirmar Contraseña */}
                  <div className="mb-3">
                    <label className="form-label">Confirmar Contraseña *</label>
                    <div className="position-relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className={`btn btn-sm position-absolute end-0 top-50 translate-middle-y ${styles.eyeButton}`}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                    )}
                  </div>

                  {/* Términos y Condiciones */}
                  <div className="mb-3 form-check">
                    <input
                      type="checkbox"
                      name="acceptedTerms"
                      className={`form-check-input ${errors.acceptedTerms ? 'is-invalid' : ''}`}
                      id="termsCheck"
                      checked={formData.acceptedTerms}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="termsCheck">
                      Acepto la política de{' '}
                      <a href="#" className={styles.link}>
                        Habeas Data
                      </a>{' '}
                      y los{' '}
                      <a href="#" className={styles.link}>
                        términos de servicio
                      </a>
                      {' *'}
                    </label>
                    {errors.acceptedTerms && (
                      <div className="invalid-feedback d-block">{errors.acceptedTerms}</div>
                    )}
                  </div>

                  {/* Botón Submit */}
                  <button
                    type="submit"
                    className={`btn w-100 mt-4 ${styles.submitButton}`}
                    disabled={loading}
                  >
                    {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </button>

                  <div className="text-center mt-3">
                    <p className="text-white">
                      ¿Ya tienes cuenta?{' '}
                      <Link to="/login" className={styles.link}>
                        Inicia sesión aquí
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
