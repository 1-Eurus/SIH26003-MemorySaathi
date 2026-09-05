interface ReferenceImageProps {
  imageSrc: string
  visible: boolean
}

export function ReferenceImage({ imageSrc, visible }: ReferenceImageProps) {
  if (!visible) return null

  return (
    <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-2xl border-4 border-[#E8D5B8] bg-white p-1.5 shadow-sm">
      <div
        className="aspect-square rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url("${imageSrc}")` }}
        role="img"
        aria-label="The finished picture, for reference"
      />
    </div>
  )
}
