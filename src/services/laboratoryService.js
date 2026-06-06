import apiClient from './apiClient'

const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true'
const laboratoryStorageKey = 'dentvision-laboratory-cases'

const wait = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })

const readStoredCases = () => {
  const savedCases = localStorage.getItem(laboratoryStorageKey)

  if (!savedCases) return []

  try {
    return JSON.parse(savedCases)
  } catch {
    return []
  }
}

const saveStoredCases = (cases) => {
  localStorage.setItem(laboratoryStorageKey, JSON.stringify(cases))
}

export const createLaboratoryCase = async (caseData) => {
  if (useMockApi) {
    await wait(500)

    const createdCase = {
      id: crypto.randomUUID(),
      status: 'received',
      createdAt: new Date().toISOString(),
      ...caseData,
    }

    const cases = readStoredCases()
    saveStoredCases([createdCase, ...cases])

    return createdCase
  }

  return apiClient.post('/laboratory/cases', caseData)
}

export const getLaboratoryCases = async () => {
  if (useMockApi) {
    await wait(300)

    return readStoredCases()
  }

  return apiClient.get('/laboratory/cases')
}

export const updateLaboratoryCaseStatus = async (caseId, status) => {
  if (useMockApi) {
    await wait(300)

    const cases = readStoredCases()
    const updatedCases = cases.map((laboratoryCase) =>
      laboratoryCase.id === caseId
        ? { ...laboratoryCase, status, updatedAt: new Date().toISOString() }
        : laboratoryCase,
    )

    saveStoredCases(updatedCases)

    return updatedCases.find((laboratoryCase) => laboratoryCase.id === caseId)
  }

  return apiClient.patch(`/laboratory/cases/${caseId}`, { status })
}

export const deleteLaboratoryCase = async (caseId) => {
  if (useMockApi) {
    await wait(300)

    const updatedCases = readStoredCases().filter((laboratoryCase) => laboratoryCase.id !== caseId)
    saveStoredCases(updatedCases)

    return { id: caseId }
  }

  return apiClient.delete(`/laboratory/cases/${caseId}`)
}
