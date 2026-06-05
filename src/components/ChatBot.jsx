import { useState, useRef, useEffect } from 'react'
import '../styles/chatbot.css'
import { generateResponse, suggestionPrompts } from '../services/chatbotService'

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy tu asistente virtual de DentVision. ¿En qué puedo ayudarte? 😊',
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text = input) => {
    if (!text.trim()) return

    const userMessage = {
      id: messages.length + 1,
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simular pequeño delay para que parezca natural
    setTimeout(() => {
      const botResponse = generateResponse(text)
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsLoading(false)
    }, 500)
  }

  const handleSuggestion = (suggestion) => {
    handleSendMessage(suggestion)
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        className={`chatbot-fab ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="Abrir chat"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>

      {/* Ventana del chat */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-title">
              <h3>n Chat</h3>
              <span className="status-dot"></span>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              title="Cerrar chat"
            >
              ✕
            </button>
          </div>

          {/* Mensajes */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message message-${msg.sender}`}
              >
                <div className="message-content">
                  <div
                    className="message-text"
                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>') }}
                  />
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message message-bot">
                <div className="message-content">
                  <div className="message-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias (mostrar solo al inicio) */}
          {messages.length === 1 && !isLoading && (
            <div className="chatbot-suggestions">
              {suggestionPrompts.map((prompt, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestion(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe tu pregunta..."
              className="chatbot-input"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              className="chatbot-send-btn"
              disabled={!input.trim() || isLoading}
              title="Enviar mensaje"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
