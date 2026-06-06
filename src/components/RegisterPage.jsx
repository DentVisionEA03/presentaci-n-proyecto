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
  const [showPassword, setShowPassword] = useState(false)

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
                      type={showPassword ? 'text' : 'password'}
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
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3 d-flex justify-content-end">
                    <button
                      type="button"
                      className="btn btn-link btn-sm text-primary text-decoration-none p-0 fw-bold"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                    </button>
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
