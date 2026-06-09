import { useEffect, useState } from 'react'
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../services/employeeService'
import '../styles/employeeManagement.css'

const EMPLOYEE_TYPES = {
  ODONTOLOGO: 'Odontólogo',
  TECNICO_DENTAL: 'Técnico Dental',
  AUXILIAR_ADMINISTRATIVA: 'Auxiliar Administrativa',
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('ALL')
  
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    documento: '',
    telefono: '',
    especialidad: '',
    tipo: 'ODONTOLOGO',
  })
  
  const [formErrors, setFormErrors] = useState({})

  // Cargar empleados
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        await loadEmployees();
      } catch (error) {
        console.error(error);
      }
    };

    fetchEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getEmployees()
      setEmployees(data)
    } catch (err) {
      setError(err.message || 'Error al cargar los empleados')
    } finally {
      setLoading(false)
    }
  }

  // Validar formulario
  const validateForm = () => {
    const errors = {}
    if (!formData.nombres.trim()) errors.nombres = 'Nombres requerido'
    if (!formData.apellidos.trim()) errors.apellidos = 'Apellidos requerido'
    if (!formData.documento.trim()) errors.documento = 'Documento requerido'
    if (!formData.telefono.trim()) errors.telefono = 'Teléfono requerido'
    if (!formData.especialidad.trim()) errors.especialidad = 'Especialidad requerida'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      documento: '',
      telefono: '',
      especialidad: '',
      tipo: 'ODONTOLOGO',
    })
    setFormErrors({})
    setEditingId(null)
  }

  // Abrir formulario para crear
  const handleCreateNew = () => {
    resetForm()
    setShowForm(true)
  }

  // Abrir formulario para editar
  const handleEdit = (employee) => {
    setFormData({
      nombres: employee.nombres,
      apellidos: employee.apellidos,
      documento: employee.documento,
      telefono: employee.telefono,
      especialidad: employee.especialidad,
      tipo: employee.tipo,
    })
    setEditingId(employee.id)
    setShowForm(true)
  }

  // Guardar empleado
  const handleSave = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      if (editingId) {
        await updateEmployee(editingId, formData)
      } else {
        await createEmployee(formData)
      }
      await loadEmployees()
      setShowForm(false)
      resetForm()
    } catch (err) {
      setError(err.message || 'Error al guardar el empleado')
    } finally {
      setLoading(false)
    }
  }

  // Eliminar empleado
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) return

    setLoading(true)
    try {
      await deleteEmployee(id)
      await loadEmployees()
    } catch (err) {
      setError(err.message || 'Error al eliminar el empleado')
    } finally {
      setLoading(false)
    }
  }

  // Cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  // Filtrar empleados
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.documento.includes(searchTerm)
    const matchesType = filterType === 'ALL' || emp.tipo === filterType
    return matchesSearch && matchesType
  })

  if (loading && employees.length === 0) {
    return (
      <div className="employee-management">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="employee-management">
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Gestión de Empleados</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleCreateNew}
            disabled={loading}
          >
            + Nuevo Empleado
          </button>
        </div>

        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button
              type="button"
              className="btn-close"
              onClick={() => setError('')}
            ></button>
          </div>
        )}

        {/* Formulario Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingId ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForm(false)}
                ></button>
              </div>

              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nombres *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.nombres ? 'is-invalid' : ''}`}
                        name="nombres"
                        value={formData.nombres}
                        onChange={handleFormChange}
                      />
                      {formErrors.nombres && (
                        <div className="invalid-feedback d-block">
                          {formErrors.nombres}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Apellidos *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.apellidos ? 'is-invalid' : ''}`}
                        name="apellidos"
                        value={formData.apellidos}
                        onChange={handleFormChange}
                      />
                      {formErrors.apellidos && (
                        <div className="invalid-feedback d-block">
                          {formErrors.apellidos}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Documento *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.documento ? 'is-invalid' : ''}`}
                        name="documento"
                        value={formData.documento}
                        onChange={handleFormChange}
                      />
                      {formErrors.documento && (
                        <div className="invalid-feedback d-block">
                          {formErrors.documento}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Teléfono *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.telefono ? 'is-invalid' : ''}`}
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleFormChange}
                      />
                      {formErrors.telefono && (
                        <div className="invalid-feedback d-block">
                          {formErrors.telefono}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tipo *</label>
                      <select
                        className="form-select"
                        name="tipo"
                        value={formData.tipo}
                        onChange={handleFormChange}
                      >
                        {Object.entries(EMPLOYEE_TYPES).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Especialidad *</label>
                      <input
                        type="text"
                        className={`form-control ${formErrors.especialidad ? 'is-invalid' : ''}`}
                        name="especialidad"
                        placeholder="Ej: Odontología General"
                        value={formData.especialidad}
                        onChange={handleFormChange}
                      />
                      {formErrors.especialidad && (
                        <div className="invalid-feedback d-block">
                          {formErrors.especialidad}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="row mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Todos los tipos</option>
              {Object.entries(EMPLOYEE_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Empleados */}
        {filteredEmployees.length === 0 ? (
          <div className="alert alert-info">
            No hay empleados que coincidan con los filtros
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Nombre Completo</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Tipo</th>
                  <th>Especialidad</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="fw-bold">{employee.fullName}</td>
                    <td>{employee.documento}</td>
                    <td>{employee.telefono}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {EMPLOYEE_TYPES[employee.tipo]}
                      </span>
                    </td>
                    <td>{employee.especialidad}</td>
                    <td>
                      <span
                        className={`badge ${
                          employee.estado === 'ACTIVO'
                            ? 'bg-success'
                            : 'bg-danger'
                        }`}
                      >
                        {employee.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(employee)}
                        disabled={loading}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(employee.id)}
                        disabled={loading}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 text-muted">
          Total: {filteredEmployees.length} empleado(s)
        </div>
      </div>
    </div>
  )
}

export default EmployeeManagement
