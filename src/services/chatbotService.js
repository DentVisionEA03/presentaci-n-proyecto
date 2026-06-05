import { services, specialists } from '../data/clinicData'

/**
 * Genera respuestas inteligentes basadas en entrada del usuario
 * Reconoce intenciones y busca información en la BD
 */

const intentPatterns = {
  greeting: /^(hola|hi|buenos|buenas|qué tal|cómo estás?)/i,
  farewell: /^(adiós|bye|chao|hasta|nos vemos)/i,
  services: /^(servicio|qué ofrecen|servicios|tratamiento|especialidad|qué hacen)/i,
  appointment: /^(cita|agendar|reservar|agendar cita|marcar cita|pedir cita)/i,
  specialist: /^(especialista|doctor|odontólogo|dentista|optometrista|quién|médico)/i,
  hours: /^(horario|cuándo|disponible|abierto|horas)/i,
  orthodontics: /(ortodoncia|ortodoncia|alineación|brackets|frenillo)/i,
  general: /(odontología|limpieza|preventivo|check-?up)/i,
  aesthetics: /(estética|blanqueamiento|sonrisa|estético)/i,
  optometry: /(optometría|ojos|lentes|gafas|visión)/i,
  help: /^(ayuda|help|necesito ayuda|ayúdame|qué puedo|cómo)/i,
}

const farewellResponses = [
  '¡Hasta pronto! Si necesitas algo más, estoy aquí. 👋',
  '¡Que tengas un excelente día! Vuelve pronto. 😊',
  '¡Adiós! Gracias por contactarnos. 👋',
]

const greetingResponses = [
  '¡Hola! Bienvenido a DentVision. ¿En qué puedo ayudarte? 😊',
  '¡Hola! Soy tu asistente virtual. ¿Qué necesitas hoy? 👋',
  '¡Bienvenido! ¿Cómo puedo asistirte? 🦷',
]

const helpResponses = [
  'Puedo ayudarte con:\n• 📋 Información de servicios\n• 👨‍⚕️ Especialistas disponibles\n• 📅 Agendar cita\n• ⏰ Horarios de atención\n\n¿Qué necesitas?',
  'Estoy aquí para:\n✅ Mostrar servicios\n✅ Encontrar especialistas\n✅ Agendar citas\n✅ Responder preguntas\n\n¿En qué puedo ayudarte?',
]

const getServiceInfo = (searchTerm) => {
  const query = searchTerm.toLowerCase()

  const matched = services.filter((service) => {
    const text = `${service.title} ${service.description} ${service.category}`.toLowerCase()
    return text.includes(query)
  })

  if (matched.length === 0) {
    return `No encontré servicios relacionados con "${searchTerm}". Prueba con: ${services.map((s) => s.title).join(', ')}`
  }

  return matched
    .map(
      (service) =>
        `<strong>${service.title}</strong>\n${service.description}\n⏱️ Duración: ${service.duration}\n`,
    )
    .join('\n')
}

const getSpecialistInfo = () => {
  return specialists
    .map(
      (specialist) =>
        `<strong>${specialist.name}</strong>\n${specialist.specialty} • ${specialist.location}\n${specialist.experience} • ${specialist.availability}`,
    )
    .join('\n\n')
}

const getSpecialistByService = (serviceName) => {
  const service = services.find((s) => s.title.toLowerCase().includes(serviceName.toLowerCase()))

  if (!service) return null

  return specialists.filter((specialist) => {
    if (service.category === 'Integral') return true
    if (service.category === 'Dental') return specialist.specialty !== 'Optometria'
    if (service.category === 'Visual') return specialist.specialty === 'Optometria'
    return specialist.specialty === service.title
  })
}

const detectIntent = (message) => {
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(message)) {
      return intent
    }
  }
  return 'general'
}

export const generateResponse = (userMessage) => {
  if (!userMessage.trim()) {
    return '¿Hola? ¿Necesitas algo? 😊'
  }

  const intent = detectIntent(userMessage)
  const message = userMessage.toLowerCase()

  switch (intent) {
    case 'greeting':
      return greetingResponses[Math.floor(Math.random() * greetingResponses.length)]

    case 'farewell':
      return farewellResponses[Math.floor(Math.random() * farewellResponses.length)]

    case 'help':
      return helpResponses[Math.floor(Math.random() * helpResponses.length)]

    case 'services':
      return `<strong>Nuestros Servicios:</strong>\n\n${services.map((s) => `• ${s.title} (${s.category})`).join('\n')}\n\n¿Cuál te interesa?`

    case 'specialist':
      return `<strong>Nuestros Especialistas:</strong>\n\n${getSpecialistInfo()}\n\n¿Te gustaría agendar una cita?`

    case 'orthodontics':
      return getServiceInfo('Ortodoncia')

    case 'general':
      return getServiceInfo('Odontologia')

    case 'aesthetics':
      return getServiceInfo('Estetica')

    case 'optometry':
      return getServiceInfo('Optometria')

    case 'appointment':
      return '¡Perfecto! Para agendar una cita:\n\n📋 <strong>Opción 1:</strong> Haz clic en "Agendar Cita" en nuestro sitio\n📱 <strong>Opción 2:</strong> Llámanos\n💬 <strong>Opción 3:</strong> Cuéntame qué servicio necesitas y te ayudaré\n\n¿Qué servicio buscas?'

    case 'hours':
      return '⏰ <strong>Horarios de Atención:</strong>\n\n📍 Sede Norte: Lunes a viernes 8am - 6pm\n📍 Sede Centro: Martes, Jueves, Sábado 8am - 5pm\n📍 Sede Chapinero: Lunes a Sábado 9am - 7pm\n\n¿Necesitas agendar?'

    default: {
      // Detectar si menciona un servicio específico
      const serviceMatch = services.find((s) =>
        message.includes(s.title.toLowerCase().replace(/ /g, '')),
      )

      if (serviceMatch) {
        const matchedSpecialists = getSpecialistByService(serviceMatch.title)
        if (matchedSpecialists && matchedSpecialists.length > 0) {
          return `<strong>${serviceMatch.title}</strong>\n${serviceMatch.description}\n\n<strong>Especialistas disponibles:</strong>\n${matchedSpecialists.map((s) => `• ${s.name} (${s.location})`).join('\n')}\n\n¿Deseas agendar una cita?`
        }
      }

      return 'No estoy seguro de tu pregunta. Puedo ayudarte con:\n• Servicios\n• Especialistas\n• Agendar citas\n• Horarios\n\n¿Cuál te interesa?'
    }
  }
}

export const suggestionPrompts = [
  '¿Qué servicios ofrecen?',
  'Ver especialistas',
  'Agendar cita',
  '¿Cuál es el horario?',
]
