import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy - Miked.live',
  description: 'Privacy policy and data handling practices for Miked.live',
  openGraph: {
    title: 'Privacy Policy - Miked.live',
    description: 'Privacy policy and data handling practices for Miked.live',
    image: '/og-image.png',
    url: 'https://miked.live/privacy',
    type: 'website',
  },
}

export default function PrivacyPage() {
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
          title="Privacy Policy"
          description="How we collect, use, and protect your data"
          showBadge={false}
          titleColor="indigo"
        />

        <div className="space-y-8 mb-24">
          {/* Last Updated */}
          <div className="text-sm text-slate-500">
            Last updated: February 2026
          </div>

          {/* Introduction */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Introduction</h2>
            <p className="text-slate-600">
              Miked.live ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          {/* Data We Collect */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Data We Collect</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-indigo-500 mb-2">Personal Information</h3>
                <p className="text-slate-600 mb-2">When you create a rider, we collect:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                  <li>Band name</li>
                  <li>Contact person name</li>
                  <li>Email address</li>
                  <li>Stage and equipment requirements</li>
                  <li>Rider specifications and technical details</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-500 mb-2">Analytics Data</h3>
                <p className="text-slate-600 mb-2">We use PostHog to track:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                  <li>Page views and user interactions</li>
                  <li>Feature usage (e.g., when you download a rider)</li>
                  <li>Events like "Start Now" clicks</li>
                </ul>
                <p className="text-slate-500 text-sm mt-2">Note: Analytics are only collected in production (miked.live). Development and staging environments are excluded.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-indigo-500 mb-2">Automatically Collected Data</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-600 ml-2">
                  <li>Browser type and version</li>
                  <li>IP address</li>
                  <li>Device information</li>
                  <li>Pages visited and time spent</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Data */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">How We Use Your Data</h2>
            <div className="space-y-3 text-slate-600">
              <p>
                <span className="font-semibold text-indigo-500">To Generate & Deliver PDFs:</span> We use your personal information to create professional rider PDFs and send them to your email.
              </p>
              <p>
                <span className="font-semibold text-indigo-500">To Send Emails:</span> We use Resend (an email service) to deliver your generated rider PDF. Your email is shared with this service only for delivery purposes.
              </p>
              <p>
                <span className="font-semibold text-indigo-500">For Analytics:</span> We track how users interact with Miked.live to improve the platform, understand feature usage, and enhance user experience.
              </p>
              <p>
                <span className="font-semibold text-indigo-500">To Store Data:</span> We store your rider information in Supabase so you can access it later and we can provide the best service.
              </p>
              <p>
                <span className="font-semibold text-indigo-500">To Improve Services:</span> We analyze usage patterns to identify bugs, optimize features, and develop new tools.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Third-Party Services</h2>
            <div className="space-y-4 text-slate-600">
              <div>
                <p className="font-semibold text-indigo-500 mb-1">Supabase</p>
                <p className="text-sm">We use Supabase to store your rider data and manage user sessions. Your data is encrypted and stored securely.</p>
              </div>
              <div>
                <p className="font-semibold text-indigo-500 mb-1">Resend</p>
                <p className="text-sm">We use Resend to deliver your generated rider PDFs via email. Only your email address is shared with Resend, solely for email delivery.</p>
              </div>
              <div>
                <p className="font-semibold text-indigo-500 mb-1">PostHog</p>
                <p className="text-sm">We use PostHog for analytics on production only. It helps us understand how the platform is used and identify areas for improvement.</p>
              </div>
              <div>
                <p className="font-semibold text-indigo-500 mb-1">Vercel</p>
                <p className="text-sm">Our website is hosted on Vercel. Vercel's infrastructure may collect standard server logs and performance data.</p>
              </div>
            </div>
          </section>

          {/* Data Storage & Security */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Data Storage & Security</h2>
            <div className="space-y-3 text-slate-600">
              <p>
                Your data is stored securely in Supabase with encryption. We implement industry-standard security practices to protect your information from unauthorized access, alteration, or destruction.
              </p>
              <p>
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your personal information, we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Your Rights</h2>
            <p className="text-slate-600 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
              <li><span className="font-semibold text-indigo-500">Access</span> - Request a copy of the personal data we hold about you</li>
              <li><span className="font-semibold text-indigo-500">Correct</span> - Ask us to correct inaccurate or incomplete data</li>
              <li><span className="font-semibold text-indigo-500">Delete</span> - Request deletion of your data (subject to legal obligations)</li>
              <li><span className="font-semibold text-indigo-500">Opt-out</span> - Disable analytics tracking (via browser settings or contacting us)</li>
            </ul>
            <p className="text-slate-600 mt-4">
              To exercise these rights, please contact us through the contact page.
            </p>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Cookies & Tracking</h2>
            <p className="text-slate-600">
              We use cookies and similar tracking technologies to enhance your experience. PostHog uses cookies to track user interactions on the production site. You can disable cookies in your browser settings, though this may affect functionality.
            </p>
          </section>

          {/* Retention */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Data Retention</h2>
            <p className="text-slate-600">
              We retain your rider data as long as your account is active or as needed to provide our services. You can request deletion of your data at any time. Analytics data is retained according to PostHog's retention policies (typically 1 year).
            </p>
          </section>

          {/* Changes */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Changes to This Policy</h2>
            <p className="text-slate-600">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last Updated" date and, where required, by requesting your consent.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Contact Me</h2>
            <p className="text-slate-600 mb-3">
              If you have questions about this Privacy Policy or our data practices, please reach out:
            </p>
            <ul className="space-y-2 text-slate-600 ml-2">
              <li>
                Visit my <Link href="/contact" className="text-indigo-500 hover:text-indigo-500">contact page</Link>
              </li>
              <li>
                Join the <a href="https://chat.whatsapp.com/JW37b8r65X1AyAGYPRt1NG" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-500">WhatsApp community</a>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
