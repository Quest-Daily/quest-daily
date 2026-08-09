import { useState } from 'react'
import { CHILDREN } from '../data'
import Avatar from '../components/Avatar'
import { printRedemption } from '../utils/printer'

const CARD_TINTS = ['#ede8f5', '#faebd7', '#dce8f5', '#e4f0e2', '#fde0ec', '#fef3cd', '#e8f4f8', '#f5e6d3']

const SHOP_TAGLINES = {
  max:     ['Goes fast.', 'Looks cool.'],
  hendrix: ['Play hard.', 'Win bigger.'],
  felix:   ['Dream big.', 'Earn it.'],
}

export default function Shop({ childId, state, onUpdate, onBack, onSuggest }) {
  const child = CHILDREN[childId]
  const [justBought, setJustBought] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  const shopItems = state.shopItems || []
  const tickets = state.tickets

  const categories = ['all', ...Array.from(new Set(shopItems.map(i => i.category).filter(Boolean)))]
  const filtered = activeCategory === 'all' ? shopItems : shopItems.filter(i => i.category === activeCategory)

  const taglines = SHOP_TAGLINES[childId] || ['Earn it.', 'Spend it.']

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
        height: 64,
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

        {/* Wordmark */}
        <div style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 900,
          fontSize: 22,
          color: '#1a1a2e',
          letterSpacing: '-0.03em',
          marginLeft: 8,
        }}>
          {child.name} <span style={{ color: child.theme.accent }}>&amp; Co</span>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Ticket balance pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: child.theme.bg,
          color: child.theme.textMuted,
          fontFamily: "'Space Mono', monospace",
          fontWeight: 700,
          fontSize: 14,
          padding: '7px 16px',
          borderRadius: 999,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 12c0-1.1.9-2 2-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4c-1.1 0-2-.9-2-2z" fill="currentColor" opacity=".85"/>
          </svg>
          {tickets}
        </div>
      </nav>

      {/* Hero section */}
      <div style={{
        background: '#2e3050',
        padding: '40px 28px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle radial glow behind text */}
        <div style={{
          position: 'absolute',
          top: -60, left: -60,
          width: 300, height: 300,
          borderRadius: '50%',
          background: child.theme.accent,
          opacity: 0.12,
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(38px, 8vw, 56px)',
              lineHeight: 1.0,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              marginBottom: 14,
              textWrap: 'balance',
            }}>
              {taglines[0]}<br />{taglines[1]}
            </div>
            <div style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.6)',
              marginBottom: 24,
              lineHeight: 1.5,
            }}>
              Complete quests, collect tickets,<br />grab your rewards.
            </div>
            <button
              onClick={() => document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth' })}
              style={{
                background: child.theme.accent === '#a8689a'
                  ? '#b8eeae'
                  : child.theme.accent === '#4f7099'
                  ? '#aee0ee'
                  : '#aeeec8',
                color: '#1a1a2e',
                border: 'none',
                borderRadius: 999,
                padding: '12px 24px',
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
              }}
            >Shop the drop →</button>
          </div>

          {/* Avatar / ticket display */}
          <div style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            <Avatar child={child} size={88} square />
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: 'rgba(255,255,255,0.45)',
              textAlign: 'center',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              {tickets} ticket{tickets !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #ebe8f0',
        padding: '0 24px',
        display: 'flex',
        gap: 0,
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
              padding: '14px 16px 12px',
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
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
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

      <div style={{ padding: '28px 20px 60px' }} id="shop-grid">

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
            gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))',
            gap: 14,
            marginBottom: 32,
          }}>
            {filtered.map((item, idx) => {
              const canAfford = tickets >= item.ticketPrice
              const isConfirming = confirming === item.id
              const tint = CARD_TINTS[idx % CARD_TINTS.length]

              return (
                <div key={item.id} style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,.06)',
                  opacity: canAfford ? 1 : 0.75,
                  transition: 'transform 0.15s, opacity 0.2s',
                  cursor: canAfford && !isConfirming ? 'pointer' : 'default',
                }}
                  onClick={() => canAfford && !isConfirming && setConfirming(item.id)}
                >
                  {/* Image zone */}
                  <div style={{
                    background: tint,
                    height: 140,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {/* Affordability badge */}
                    <div style={{
                      position: 'absolute',
                      top: 10, left: 10,
                      background: canAfford ? '#daf5d4' : '#f5dae0',
                      color: canAfford ? '#2e7d32' : '#b5546a',
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}>
                      {canAfford ? '✓ Can buy' : `Need ${item.ticketPrice - tickets} more`}
                    </div>

                    {item.photo ? (
                      <img
                        src={item.photo}
                        alt={item.title}
                        style={{
                          width: '80%', height: '80%',
                          objectFit: 'contain',
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 56 }}>{item.icon}</div>
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
                        marginBottom: 5,
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      marginBottom: isConfirming ? 10 : 0,
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path d="M20 12c0-1.1.9-2 2-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4c-1.1 0-2-.9-2-2z" fill="#3d8c4a"/>
                      </svg>
                      <span style={{
                        fontFamily: "'Nunito', sans-serif",
                        fontWeight: 800,
                        fontSize: 16,
                        color: '#3d8c4a',
                      }}>{item.ticketPrice}</span>
                      <span style={{
                        fontFamily: "'Hanken Grotesk', sans-serif",
                        fontSize: 11,
                        color: '#9a8fa6',
                      }}>tickets</span>
                    </div>

                    {/* Confirm buttons */}
                    {isConfirming && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={e => { e.stopPropagation(); buy(item) }}
                          style={{
                            flex: 1,
                            background: '#1a1a2e', color: '#fff',
                            border: 'none', borderRadius: 10,
                            padding: '9px 0', fontSize: 13, fontWeight: 700,
                            cursor: 'pointer',
                            fontFamily: "'Nunito', sans-serif",
                          }}
                        >Buy!</button>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirming(null) }}
                          style={{
                            background: '#f0e8e0', color: '#6f6675',
                            border: 'none', borderRadius: 10,
                            padding: '9px 10px', fontSize: 13,
                            cursor: 'pointer',
                            fontFamily: "'Hanken Grotesk', sans-serif",
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
          background: '#2e3050',
          borderRadius: 20,
          padding: '24px 26px',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          flexWrap: 'wrap',
          marginBottom: 36,
        }}>
          <div style={{ fontSize: 36 }}>🌟</div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: '#ffffff',
              marginBottom: 4,
              letterSpacing: '-0.01em',
            }}>
              Don't see what you want?
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>
              Suggest a reward and Mum or Dad can add it.
            </div>
          </div>
          <button
            onClick={onSuggest}
            style={{
              background: child.theme.accent,
              color: '#fff',
              border: 'none', borderRadius: 999,
              padding: '12px 22px', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: '-0.01em',
            }}
          >Suggest →</button>
        </div>

        {/* Past redemptions */}
        {state.redemptions?.length > 0 && (
          <div>
            <div style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 900,
              fontSize: 20,
              color: '#1a1a2e',
              marginBottom: 14,
              letterSpacing: '-0.02em',
            }}>Things you've bought</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {state.redemptions.map(r => (
                <div key={r.id} style={{
                  background: '#fff',
                  borderRadius: 14,
                  padding: '13px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 1px 6px rgba(0,0,0,.04)',
                }}>
                  <div style={{ fontSize: 26 }}>{r.itemIcon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a2e' }}>{r.itemTitle}</div>
                    <div style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: 11,
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
