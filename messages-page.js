'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (!token) {
      router.push('/login')
      return
    }
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    fetchConversations()
  }, [router])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (err) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/messages/conversation/${conversationId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (err) {
      console.error('Error fetching messages:', err)
    }
  }

  const selectConversation = (conv) => {
    setSelectedConversation(conv)
    fetchMessages(conv.id)
    // Update unread count locally
    setConversations(prev => prev.map(c => 
      c.id === conv.id ? { ...c, unread_count: 0 } : c
    ))
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listing_id: selectedConversation.listing_id,
          content: newMessage.trim()
        })
      })

      if (res.ok) {
        setNewMessage('')
        fetchMessages(selectedConversation.id)
        fetchConversations()
      }
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "A l'instant"
    if (minutes < 60) return `Il y a ${minutes} min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`
    return date.toLocaleDateString('fr-FR')
  }

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)
  }

  if (!user) {
    return (
      <>
        <Header />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Chargement...</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      
      <div style={{ background: '#f1f5f9', minHeight: 'calc(100vh - 200px)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <h1 style={{ color: '#1e293b', marginBottom: '20px' }}>Mes messages</h1>
          
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '20px', height: 'calc(100vh - 280px)', minHeight: '500px' }}>
            
            {/* Conversations List */}
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>Conversations</h2>
              </div>
              
              <div style={{ overflowY: 'auto', height: 'calc(100% - 70px)' }}>
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    Chargement...
                  </div>
                ) : conversations.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ fontSize: '50px', marginBottom: '15px' }}>💬</div>
                    <p style={{ color: '#64748b' }}>Aucune conversation</p>
                    <p style={{ color: '#94a3b8', fontSize: '14px' }}>Contactez un vendeur pour commencer</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      style={{
                        padding: '15px 20px',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: selectedConversation?.id === conv.id ? '#eff6ff' : 'white',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {conv.listing_photo ? (
                          <img src={conv.listing_photo} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>📷</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>{conv.other_user_name}</span>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formatDate(conv.last_message_date)}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {conv.listing_title}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                              {conv.last_message}
                            </span>
                            {conv.unread_count > 0 && (
                              <span style={{ background: '#1e40af', color: 'white', fontSize: '11px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {selectedConversation.listing_photo && (
                        <img src={selectedConversation.listing_photo} alt="" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
                      )}
                      <div>
                        <Link href={`/annonce/${selectedConversation.listing_id}`} style={{ fontWeight: '600', color: '#1e293b', textDecoration: 'none', fontSize: '15px' }}>
                          {selectedConversation.listing_title}
                        </Link>
                        <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '600' }}>
                          {formatPrice(selectedConversation.listing_price)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          padding: '12px 16px',
                          borderRadius: msg.sender_id === user.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: msg.sender_id === user.id ? '#1e40af' : '#f1f5f9',
                          color: msg.sender_id === user.id ? 'white' : '#1e293b'
                        }}>
                          <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.content}</p>
                          <div style={{
                            fontSize: '11px',
                            marginTop: '6px',
                            opacity: 0.7,
                            textAlign: 'right'
                          }}>
                            {formatMessageTime(msg.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={sendMessage} style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Ecrivez votre message..."
                      style={{
                        flex: 1,
                        padding: '14px 18px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '25px',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      style={{
                        padding: '14px 25px',
                        background: newMessage.trim() && !sending ? '#1e40af' : '#e2e8f0',
                        color: newMessage.trim() && !sending ? 'white' : '#94a3b8',
                        border: 'none',
                        borderRadius: '25px',
                        fontWeight: '600',
                        cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed'
                      }}
                    >
                      {sending ? '...' : 'Envoyer'}
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>💬</div>
                    <p style={{ fontSize: '18px', color: '#64748b' }}>Selectionnez une conversation</p>
                    <p style={{ fontSize: '14px' }}>pour afficher les messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
