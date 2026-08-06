/**
 * Renders a notched ticket-stub shape using CSS mask radial gradients.
 * The notches appear at a set height from the bottom, matching the design.
 * Wrap in a div with filter:drop-shadow to get a shadow that follows the cutout.
 */
export default function TicketShape({ bg, stubHeight = 64, children, style = {} }) {
  const mask = [
    `radial-gradient(circle 11px at left calc(100% - ${stubHeight}px), transparent 9.5px, #000 11px)`,
    `radial-gradient(circle 11px at right calc(100% - ${stubHeight}px), transparent 9.5px, #000 11px)`,
  ].join(',')

  return (
    <div style={{
      position: 'relative',
      background: bg,
      borderRadius: 20,
      WebkitMask: mask,
      WebkitMaskComposite: 'source-in',
      mask,
      maskComposite: 'intersect',
      ...style,
    }}>
      {children}
    </div>
  )
}
