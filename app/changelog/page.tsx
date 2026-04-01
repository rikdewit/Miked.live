import { getChangelogPosts } from '@/lib/changelogLoader'
import { parseMarkdown } from '@/lib/parseMarkdown'
import Link from 'next/link'
import { Instagram } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { EmailSubscribe } from '@/components/EmailSubscribe'

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

export const metadata = {
  title: 'Changelog - Miked.live',
  description: 'Latest updates and improvements to Miked.live',
  openGraph: {
    title: 'Changelog - Miked.live',
    description: 'Latest updates and improvements to Miked.live',
    image: '/og-image.png',
    url: 'https://miked.live/changelog',
    type: 'website',
  },
}

export default function ChangelogPage() {
  const posts = getChangelogPosts()

  return (
    <div className="flex flex-col w-full bg-white text-slate-900 relative">
      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-64 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl"></div>
      </div>
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 relative z-10 py-16">
        <PageHeader
          title="Changelog"
          description="Latest updates and improvements to Miked.live"
          showBadge={false}
          titleColor="indigo"
        />

        <div className="space-y-12 mb-24">
          {/* Email Subscribe Section */}
          <EmailSubscribe
            title="Stay in the loop"
            description="Subscribe to get notified about new features and updates"
            buttonText="Subscribe"
            placeholder="your@email.com"
          />

          {/* Feedback Section */}
          <div className="relative flex gap-8">
            {/* Hidden date column for alignment - matches post layout */}
            <div className="hidden md:block w-24 flex-shrink-0"></div>
            {/* Feedback content */}
            <div className="flex-1 pt-8 border-t border-slate-200 bg-slate-50 rounded-2xl p-8 hover:border-indigo-300/50 transition-colors shadow-lg">
              <p className="text-lg font-extrabold text-slate-900 mb-4">I'm building this in public and I'd love your feedback!</p>
              <a
                href="https://chat.whatsapp.com/JW37b8r65X1AyAGYPRt1NG"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg mb-4"
              >
                <span>Join the WhatsApp community</span>
                <span>↗</span>
              </a>
              <p className="text-xs text-slate-500 mb-4">Share ideas, feedback, and feature requests with me directly</p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">Or follow me:</span>
                <a
                  href="https://twitter.com/Woesnos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-slate-400 hover:text-indigo-500 transition-colors"
                  title="X"
                >
                  <div className="sm:hidden">
                    <XIcon size={24} />
                  </div>
                  <div className="hidden sm:block">
                    <XIcon size={28} />
                  </div>
                </a>
                <a
                  href="https://instagram.com/woesnos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-slate-400 hover:text-indigo-500 transition-colors"
                  title="Instagram"
                >
                  <Instagram size={24} className="sm:hidden" />
                  <Instagram size={28} className="hidden sm:block" />
                </a>
              </div>
            </div>
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No updates yet. Check back soon!</p>
            </div>
          ) : (
            posts.map((post, index) => {
              const date = new Date(post.date)
              const nextPost = posts[index + 1]
              const isNextPostSameDay = nextPost && nextPost.date === post.date
              const currentYear = new Date().getFullYear()
              const isCurrentYear = date.getFullYear() === currentYear

              return (
                <div key={post.date} className="relative flex gap-8">
                  {/* Sticky Date - Hidden on small screens */}
                  <div className="hidden md:block w-24 flex-shrink-0 sticky top-32 h-fit">
                    <div className="text-center">
                      <div className="text-xs font-bold text-indigo-400 mb-2 opacity-75">#{posts.length - index}</div>
                      <time className="text-lg font-bold text-indigo-500">{date.getDate()}</time>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                        {!isCurrentYear && <span className="block text-xs mt-1 text-slate-400">{date.getFullYear()}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <article className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-8 pt-12 hover:border-indigo-300/50 transition-colors shadow-lg">
                    {/* Date and number for small screens */}
                    <div className="md:hidden flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                      <div className="text-center">
                        <div className="text-xs font-bold text-indigo-400 opacity-75">#{posts.length - index}</div>
                        <time className="text-sm font-bold text-indigo-500">{date.getDate()}</time>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                          {!isCurrentYear && <span className="block text-xs text-slate-400">{date.getFullYear()}</span>}
                        </p>
                      </div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">{post.title}</h2>
                    <p className="text-base sm:text-lg text-slate-600 mb-6">{post.description}</p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full rounded-lg mb-8 border border-white/10"
                      />
                    )}
                  <div className="max-w-none text-base sm:text-lg text-slate-600 space-y-4">
                    {parseMarkdown(post.content).map((node, i) => {
                      if (node.type === 'paragraph') {
                        return (
                          <p key={i}>
                            {Array.isArray(node.content) &&
                              node.content.map((inline, j) =>
                                inline.type === 'bold' ? (
                                  <strong key={j} className="font-bold text-slate-900">
                                    {inline.content}
                                  </strong>
                                ) : (
                                  <span key={j}>{inline.content}</span>
                                )
                              )}
                          </p>
                        )
                      } else if (node.type === 'heading') {
                        return (
                          <h3 key={i} className="text-xl font-bold text-slate-900 mt-6 mb-3">
                            {Array.isArray(node.content) &&
                              node.content.map((inline, j) =>
                                inline.type === 'bold' ? (
                                  <strong key={j} className="font-bold">
                                    {inline.content}
                                  </strong>
                                ) : (
                                  <span key={j}>{inline.content}</span>
                                )
                              )}
                          </h3>
                        )
                      } else if (node.type === 'list') {
                        return (
                          <ul key={i} className="list-disc list-inside space-y-2 ml-2">
                            {Array.isArray(node.content) &&
                              node.content.map((item, j) => (
                                <li key={j} className="text-slate-600">
                                  {Array.isArray(item) &&
                                    item.map((inline, k) =>
                                      inline.type === 'bold' ? (
                                        <strong key={k} className="font-bold text-slate-900">
                                          {inline.content}
                                        </strong>
                                      ) : (
                                        <span key={k}>{inline.content}</span>
                                      )
                                    )}
                                </li>
                              ))}
                          </ul>
                        )
                      }
                      return null
                    })}
                  </div>
                  </article>
                </div>
              )
            })
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
