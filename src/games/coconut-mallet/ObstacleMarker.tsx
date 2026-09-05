interface ObstacleMarkerProps {
  x: number
  y: number
  /** Radius as a percentage of the play area width. */
  radius: number
  highlight?: boolean
}

export function ObstacleMarker({ x, y, radius, highlight }: ObstacleMarkerProps) {
  return (
    <div
      className={`absolute rounded-full border-4 shadow-inner transition-shadow duration-150 ${
        highlight ? 'border-[#1D2B49] ring-4 ring-[#1D2B49]/40' : 'border-[#8A3A17]'
      }`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${radius * 2}%`,
        aspectRatio: '1 / 1',
        transform: 'translate(-50%, -50%)',
        background: 'repeating-linear-gradient(45deg, #C4622D 0px, #C4622D 10px, #A64E20 10px, #A64E20 20px)',
      }}
      aria-hidden="true"
    />
  )
}
