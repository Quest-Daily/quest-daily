import { useState } from 'react'
import { CHILDREN } from '../data'
import Avatar from '../components/Avatar'
import { printRedemption } from '../utils/printer'

export default function Shop({ childId, state, onUpdate, onBack, onSuggest }) {
  const child = CHILDREN[childId]
  const [justBought, setJustBought] = useState(null)
  const [confirming, setConfirming] = useState(null)

  const shopItems = state.shopItems || []
  const tickets = state.tickets

  function buy(item) {
    if (tickets < item.ticketPrice) return
    setConfirming(null)
    const redemption = {
      id: Date.now(),
      itemId: item.id,
      itemTitle: item.title,
      itemIcon: item.icon,
      ticketsSpent: item.ticketPrice,
      date: new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
    }
    printRedemption({
      childName: child.name,
      itemTitle: item.title,
      ticketPrice: item.ticketPrice,
      remainingTickets: tickets - item.ticketPrice,
    })
    onUpdate(s => ({
      ...s,
      tickets: s.tickets - item.ticketPrice,
      redemptions: [redemption, ...(s.redemptions || [])],
    }))
    setJustBought(item)
    setTimeout(() => setJustBought(null), 3000)
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#fdf5f1',
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#3a3340',
    }}>
      {/* Header */}
      <div style={{
        background: child.theme.bg,
        padding: '52px 44px 36px',
      }}>
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.7)',
            border: 'none', borderRadius: 999,
            padding: '9px 16px',
            fontFamily: "'Space Mono', monospace",
            fontSize: 12, color: '#3a3340',
            cursor: 'pointer', marginBottom: 28,
          }}
        >← Back</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Avatar child={child} size={72} square />
          <div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 12,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: child.theme.textMuted,
              marginBottom: 4,
            }}>🛍️ Your shop</div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 36,
              color: '#3a3340',
            }}>{child.name}'s shop</h1>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              color: child.theme.textMuted,
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: 16,
              padding: '10px 20px',
              borderRadius: 999,
              boxShadow: `0 3px 10px ${child.theme.shadow}`,
            }}>🎟️ {tickets} {tickets === 1 ? 'ticket' : 'tickets'}</div>
          </div>
        </div>
      </div>

      {/* Success toast */}
      {justBought && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: '#3a3340', color: '#fdf5f1',
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontWeight: 600, fontSize: 15,
          padding: '14px 28px', borderRadius: 999,
          boxShadow: '0 6px 24px rgba(58,51,64,.25)',
          zIndex: 200,
          animation: 'fadeInDown 0.3s ease',
        }}>
          {justBought.icon} Enjoy your {justBought.title}! 🎉
        </div>
      )}

      <div style={{ padding: '36px 44px' }}>
        {/* Shop items grid */}
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 26,
          marginBottom: 20,
        }}>Spend your tickets</h2>

        {shopItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#9a8fa6',
            background: '#fff',
            borderRadius: 22,
            boxShadow: '0 3px 12px rgba(58,51,64,.05)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, marginBottom: 8 }}>Shop's empty</div>
            <div style={{ fontSize: 15 }}>Ask a parent to add rewards, or suggest something below!</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 20,
            marginBottom: 40,
          }}>
            {shopItems.map(item => {
              const canAfford = tickets >= item.ticketPrice
              const isConfirming = confirming === item.id

              return (
                <div key={item.id} style={{
                  background: '#fff',
                  borderRadius: 22,
                  padding: '28px 22px 22px',
                  textAlign: 'center',
                  boxShadow: '0 3px 14px rgba(58,51,64,.06)',
                  opacity: canAfford ? 1 : 0.6,
                  transition: 'opacity 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Affordability ribbon */}
                  {!canAfford && (
                    <div style={{
                      position: 'absolute',
                      top: 12, right: -28,
                      background: '#f0e8e0',
                      color: '#9a8fa6',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      padding: '4px 36px',
                      transform: 'rotate(35deg)',
                      letterSpacing: '0.06em',
                    }}>SAVING</div>
                  )}

                  {item.photo ? (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <img src={item.photo} alt={item.title} style={{
                        width: 80, height: 80, objectFit: 'contain',
                        borderRadius: 12, background: '#faf6fc',
                      }} />
                    </div>
                  ) : (
                    <div style={{ fontSize: 52, marginBottom: 14 }}>{item.icon}</div>
                  )}
                  <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: 20,
                    color: '#3a3340',
                    marginBottom: 10,
                    lineHeight: 1.2,
                  }}>{item.title}</div>
                  <div style={{
                    display: 'inline-block',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    background: canAfford ? child.theme.bg : '#f0e8e0',
                    color: canAfford ? child.theme.accent : '#9a8fa6',
                    padding: '5px 14px',
                    borderRadius: 999,
                    marginBottom: 18,
                  }}>🎟️ {item.ticketPrice}</div>

                  {isConfirming ? (
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                      <button
                        onClick={() => buy(item)}
                        style={{
                          background: '#3a3340', color: '#fff',
                          border: 'none', borderRadius: 999,
                          padding: '10px 18px', fontSize: 14, fontWeight: 600,
                          cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                        }}
                      >Yes, buy!</button>
                      <button
                        onClick={() => setConfirming(null)}
                        style={{
                          background: '#f0e8e0', color: '#6f6675',
                          border: 'none', borderRadius: 999,
                          padding: '10px 14px', fontSize: 14,
                          cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif",
                        }}
                      >Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => canAfford && setConfirming(item.id)}
                      style={{
                        width: '100%',
                        background: canAfford ? '#3a3340' : '#e8e0da',
                        color: canAfford ? '#fff' : '#9a8fa6',
                        border: 'none', borderRadius: 999,
                        padding: '12px 0', fontSize: 14, fontWeight: 600,
                        cursor: canAfford ? 'pointer' : 'default',
                        fontFamily: "'Hanken Grotesk', sans-serif",
                        transition: 'background 0.2s',
                      }}
                    >
                      {canAfford ? `Buy for ${item.ticketPrice} tickets` : `Need ${item.ticketPrice - tickets} more tickets`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Suggest a reward */}
        <div style={{
          background: child.theme.bg,
          borderRadius: 22,
          padding: '28px 30px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
          marginBottom: 40,
        }}>
          <div style={{ fontSize: 40 }}>🌟</div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, marginBottom: 4 }}>
              Don't see what you want?
            </div>
            <div style={{ fontSize: 14, color: child.theme.textMuted }}>
              Suggest a reward and Mum or Dad can add it to your shop.
            </div>
          </div>
          <button
            onClick={onSuggest}
            style={{
              background: '#3a3340', color: '#fff',
              border: 'none', borderRadius: 999,
              padding: '12px 24px', fontSize: 14, fontWeight: 600,
              cursor: 'pointer', flexShrink: 0,
              fontFamily: "'Hanken Grotesk', sans-serif",
            }}
          >Suggest a reward →</button>
        </div>

        {/* Past redemptions */}
        {state.redemptions?.length > 0 && (
          <div>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: 26,
              marginBottom: 16,
            }}>Things you've bought</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.redemptions.map(r => (
                <div key={r.id} style={{
                  background: '#fff',
                  borderRadius: 16,
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 2px 8px rgba(58,51,64,.04)',
                }}>
                  <div style={{ fontSize: 28 }}>{r.itemIcon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{r.itemTitle}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
                      color: '#9a8fa6',
                      marginTop: 2,
                    }}>{r.date}</div>
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 13,
                    color: '#b5546a',
                  }}>−{r.ticketsSpent} 🎟️</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
