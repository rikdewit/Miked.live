import { Instagram } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import { TwitterTimeline } from '@/components/TwitterTimeline'

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
  title: 'Contact - Miked.live',
  description: 'Get in touch with Miked.live',
  openGraph: {
    title: 'Contact - Miked.live',
    description: 'Get in touch with Miked.live',
    image: '/og-image.png',
    url: 'https://miked.live/contact',
    type: 'website',
  },
}

export default function ContactPage() {
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

      <div className="w-full px-4 relative z-10 py-12">
        <PageHeader
          badge="Let's Connect"
          title="Get in Touch"
          description="Reach out with feedback, ideas, or just to say hello"
          titleColor="indigo"
        />
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 relative z-10 py-0">

        {/* Contact Block */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <div className="pt-8 border-t border-slate-200 bg-slate-50 rounded-2xl p-8 hover:border-indigo-300/50 transition-colors shadow-lg">
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
            </div>
          </div>
        </div>

        {/* Social Media Feed Block */}
        <div className="flex justify-center mt-8 mb-32">
          <div className="w-full max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* X Timeline */}
              <div className="pt-8 border-t border-slate-200 bg-slate-50 rounded-2xl p-8 hover:border-indigo-300/50 transition-colors shadow-lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">Latest on X</h2>
                <div className="flex justify-center">
                  <TwitterTimeline />
                </div>
              </div>

              {/* Instagram Profile */}
              <div className="pt-8 border-t border-slate-200 bg-slate-50 rounded-2xl p-8 hover:border-indigo-300/50 transition-colors shadow-lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 text-center">Latest on Instagram</h2>
                <div className="flex flex-col items-center">
                  <a
                    href="https://instagram.com/woesnos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 text-indigo-500 hover:text-indigo-600 transition-colors mb-4"
                  >
                    <Instagram size={32} />
                    <span>@woesnos</span>
                  </a>
                  <p className="text-sm text-slate-500 text-center">
                    Follow me on Instagram to see my latest posts and updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
