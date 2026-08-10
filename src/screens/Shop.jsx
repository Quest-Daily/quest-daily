import { useState } from 'react'
import { CHILDREN } from '../data'
import Avatar from '../components/Avatar'
import { printRedemption } from '../utils/printer'

const CARD_TINTS = ['#ede8f5', '#faebd7', '#dce8f5', '#e4f0e2', '#fde0ec', '#fef3cd', '#e8f4f8', '#f5e6d3']

const HERO_COLORS = {
  max:     '#231030',
  hendrix: '#152238',
  felix:   '#162a18',
}

export default function Shop({ childId, state, onUpdate, onBack, onSuggest }) {
  const child = CHILDREN[childId]
  const [justBought, setJustBought] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const shopItems = state.shopItems || []
  const tickets = state.tickets
  const heroBg = HERO_COLORS[childId] || '#2e3050'

  const iconBtnStyle = {
    width: 38, height: 38,
    background: '#f4f2f7',
    border: 'none',
    borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
  }

  const categories = ['all', ...Array.from(new Set(shopItems.map(i => i.category).filter(Boolean)))]
  const filtered = activeCategory === 'all' ? shopItems : shopItems.filter(i => i.category === activeCategory)
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
      background: '#f4f5f7',
      fontFamily: "'Hanken Grotesk', sans-serif",
      color: '#1a1a2e',
    }}>

      {/* Top nav bar */}
      <nav style={{
        background: '#ffffff',
        borderBottom: '1px solid #ebe8f0',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none',
            color: '#6f6675', cursor: 'pointer',
            fontSize: 20, padding: '8px 8px 8px 0',
            lineHeight: 1, flexShrink: 0,
          }}
        >←</button>

        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          fontSize: 20,
          color: '#1a1a2e',
          letterSpacing: '-0.03em',
          marginLeft: 8,
        }}>
          {child.name} <span style={{ color: child.theme.accent }}>&amp; Co</span>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Search */}
          <button style={iconBtnStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e3050" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* Wishlist */}
          <button style={iconBtnStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e3050" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>

          {/* Cart — shows ticket count */}
          <button style={{ ...iconBtnStyle, position: 'relative' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2e3050" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61H19.4a2 2 0 001.98-1.71L23 6H6"/>
            </svg>
            {tickets > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                background: child.theme.accent,
                color: '#fff',
                fontFamily: "'Space Mono', monospace",
                fontSize: 9, fontWeight: 700,
                minWidth: 16, height: 16,
                borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px',
              }}>{tickets}</div>
            )}
          </button>
        </div>
      </nav>

      {/* Hero banner */}
      <div style={{
        background: heroBg,
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{
            fontFamily: "'Nunito', sans-serif",
            fontWeight: 900,
            fontSize: 28,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>
            {child.name} <span style={{ color: child.theme.accent }}>&amp; Co</span>
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: 4,
          }}>Rewards Store</div>
        </div>

        <Avatar child={child} size={52} square />
      </div>

      {/* Category filter tabs */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #ebe8f0',
        padding: '0 20px',
        display: 'flex',
        overflowX: 'auto',
      }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeCategory === cat ? `2.5px solid ${child.theme.accent}` : '2.5px solid transparent',
              color: activeCategory === cat ? '#1a1a2e' : '#9a8fa6',
              fontFamily: "'Hanken Grotesk', sans-serif",
              fontWeight: activeCategory === cat ? 700 : 500,
              fontSize: 14,
              padding: '12px 14px 10px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s, border-color 0.15s',
            }}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Success toast */}
      {justBought && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a2e', color: '#fff',
          fontFamily: "'Hanken Grotesk', sans-serif",
          fontWeight: 600, fontSize: 15,
          padding: '14px 28px', borderRadius: 999,
          boxShadow: '0 8px 32px rgba(0,0,0,.2)',
          zIndex: 300,
          whiteSpace: 'nowrap',
        }}>
          {justBought.icon} Enjoy your {justBought.title}! 🎉
        </div>
      )}

      <div style={{ padding: '20px 16px 60px' }} id="shop-grid">

        {/* Shop items grid */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#9a8fa6',
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 2px 12px rgba(0,0,0,.05)',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 8, color: '#3a3340' }}>
              Shop's empty
            </div>
            <div style={{ fontSize: 15 }}>Ask a parent to add rewards, or suggest something below!</div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 28,
          }}>
            {filtered.map((item, idx) => {
              const canAfford = tickets >= item.ticketPrice
              const isConfirming = confirming === item.id
              const tint = CARD_TINTS[idx % CARD_TINTS.length]

              return (
                <div key={item.id}
                  onClick={() => canAfford && !isConfirming && setConfirming(item.id)}
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,.07)',
                    opacity: canAfford ? 1 : 0.72,
                    cursor: canAfford && !isConfirming ? 'pointer' : 'default',
                    border: isConfirming ? `2px solid ${child.theme.accent}` : '2px solid transparent',
                    transition: 'opacity 0.2s, border-color 0.15s',
                  }}
                >
                  {/* Image zone — taller, more Kidstuff-like */}
                  <div style={{
                    background: tint,
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Only show badge when affordable */}
                    {canAfford && (
                      <div style={{
                        position: 'absolute',
                        top: 10, left: 10,
                        background: '#daf5d4',
                        color: '#2e7d32',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9,
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 999,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>✓ Can buy</div>
                    )}

                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={item.title}
                        style={{ width: '78%', height: '78%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ fontSize: 64 }}>{item.icon}</div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '12px 14px 14px' }}>
                    {item.category && (
                      <div style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: 9,
                        color: '#b3a9be',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: 4,
                      }}>{item.category}</div>
                    )}

                    <div style={{
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: 800,
                      fontSize: 15,
                      color: '#1a1a2e',
                      lineHeight: 1.25,
                      marginBottom: 10,
                    }}>{item.title}</div>

                    {/* Price row */}
                    {!isConfirming ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M20 12c0-1.1.9-2 2-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4c-1.1 0-2-.9-2-2z" fill="#3d8c4a"/>
                          </svg>
                          <span style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontWeight: 800,
                            fontSize: 17,
                            color: '#3d8c4a',
                          }}>{item.ticketPrice}</span>
                        </div>
                        {!canAfford && (
                          <span style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: 9,
                            color: '#b5546a',
                            background: '#fdf0f2',
                            padding: '2px 7px',
                            borderRadius: 999,
                          }}>need {item.ticketPrice - tickets} more</span>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={e => { e.stopPropagation(); buy(item) }}
                          style={{
                            flex: 1,
                            background: heroBg, color: '#fff',
                            border: 'none', borderRadius: 10,
                            padding: '10px 0', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: "'Nunito', sans-serif",
                          }}
                        >Buy!</button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirming(null) }}
                          style={{
                            background: '#f0e8e0', color: '#6f6675',
                            border: 'none', borderRadius: 10,
                            padding: '10px 12px', fontSize: 13,
                            cursor: 'pointer',
                          }}
                        >✕</button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Suggest a reward */}
        <div style={{
          background: heroBg,
          borderRadius: 18,
          padding: '20px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 30 }}>🌟</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: '#ffffff',
              marginBottom: 3,
            }}>Don't see what you want?</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              Suggest it and Mum or Dad can add it.
            </div>
          </div>
          <button
            onClick={onSuggest}
            style={{
              background: child.theme.accent,
              color: '#fff',
              border: 'none', borderRadius: 999,
              padding: '10px 20px', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
              fontFamily: "'Nunito', sans-serif",
            }}
          >Suggest →</button>
        </div>

        {/* Past redemptions */}
        {state.redemptions?.length > 0 && (
          <div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: 18,
              color: '#1a1a2e',
              marginBottom: 12,
              letterSpacing: '-0.02em',
            }}>Things you've bought</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {state.redemptions.map(r => (
                <div key={r.id} style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  boxShadow: '0 1px 6px rgba(0,0,0,.04)',
                }}>
                  <div style={{ fontSize: 24 }}>{r.itemIcon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{r.itemTitle}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 10,
                      color: '#9a8fa6',
                      marginTop: 2,
                    }}>{r.date}</div>
                  </div>
                  <div style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: 12,
                    color: '#b5546a',
                    fontWeight: 700,
                  }}>−{r.ticketsSpent}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
