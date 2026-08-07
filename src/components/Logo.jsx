// Amethyst sword mark — no background, renders on cream app screens
export default function Logo({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(15,50,50)">
        <polygon points="50,12 47.5,16.5 44,63 56,63 52.5,16.5" fill="#3a1860"/>
        <rect x="29" y="63" width="42" height="8.5" rx="4.25" fill="#c090e8"/>
        <rect x="47" y="71.5" width="6" height="14" rx="3" fill="#d8b4f8"/>
        <ellipse cx="50" cy="90" rx="9" ry="5.5" fill="#3a1860"/>
      </g>
      <polygon transform="translate(19,78)" points="0,-4.5 1.05,-1.55 4.28,-1.4 1.75,0.6 2.65,3.8 0,2.1 -2.65,3.8 -1.75,0.6 -4.28,-1.4 -1.05,-1.55" fill="#e0c030"/>
    </svg>
  )
}
