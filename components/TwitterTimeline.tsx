'use client'

const XIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z" />
  </svg>
)

export const TwitterTimeline = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <a
        href="https://x.com/WoesNos"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 text-indigo-500 hover:text-indigo-600 transition-colors"
      >
        <XIcon size={32} />
        <span className="text-lg font-semibold">@WoesNos</span>
      </a>
      <p className="text-sm text-slate-500 text-center">
        Follow me on X to see my latest tweets and updates
      </p>
    </div>
  )
}
