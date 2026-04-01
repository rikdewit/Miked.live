import { PageHeader } from '@/components/PageHeader'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service - Miked.live',
  description: 'Terms of service and user agreement for Miked.live',
  openGraph: {
    title: 'Terms of Service - Miked.live',
    description: 'Terms of service and user agreement for Miked.live',
    image: '/og-image.png',
    url: 'https://miked.live/terms',
    type: 'website',
  },
}

export default function TermsPage() {
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
          title="Terms of Service"
          description="User agreement and service terms"
          showBadge={false}
          titleColor="indigo"
        />

        <div className="space-y-8 mb-24">
          {/* Last Updated */}
          <div className="text-sm text-slate-500">
            Last updated: February 2026
          </div>

          {/* Agreement */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Agreement to Terms</h2>
            <p className="text-slate-600">
              By accessing and using Miked.live, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Use License */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Use License</h2>
            <p className="text-slate-600 mb-3">
              Permission is granted to temporarily download one copy of the materials (information or software) on Miked.live for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on Miked.live</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Use automated tools or scrapers to extract data from the platform</li>
            </ul>
          </section>

          {/* Disclaimer */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Disclaimer</h2>
            <p className="text-slate-600 mb-3">
              The materials on Miked.live are provided "as-is". Miked.live makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="text-slate-600">
              Further, Miked.live does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </section>

          {/* Limitations */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Limitations of Liability</h2>
            <p className="text-slate-600">
              In no event shall Miked.live or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Miked.live, even if Miked.live or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          {/* Accuracy of Materials */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Accuracy of Materials</h2>
            <p className="text-slate-600">
              The materials appearing on Miked.live could include technical, typographical, or photographic errors. Miked.live does not warrant that any of the materials on its website are accurate, complete, or current. Miked.live may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          {/* Materials Link */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Links & Third-Party Services</h2>
            <p className="text-slate-600 mb-3">
              Miked.live has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Miked.live of the site. Use of any such linked website is at the user's own risk.
            </p>
            <p className="text-slate-600">
              Third-party services we use (Supabase, Resend, PostHog, Vercel) have their own terms of service and privacy policies. By using Miked.live, you also agree to their respective terms.
            </p>
          </section>

          {/* Modifications */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Modifications to Service</h2>
            <p className="text-slate-600">
              Miked.live may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          {/* Governing Law */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Governing Law</h2>
            <p className="text-slate-600">
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Miked.live operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          {/* User Conduct */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">User Conduct</h2>
            <p className="text-slate-600 mb-3">
              You agree not to use Miked.live for any purpose that is illegal or prohibited by these terms. You agree that you will not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
              <li>Harass, abuse, or threaten others</li>
              <li>Upload or transmit viruses or malicious code</li>
              <li>Collect or track personal information of others without consent</li>
              <li>Spam or send unsolicited messages</li>
              <li>Engage in any form of fraud or deception</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Intellectual Property Rights</h2>
            <p className="text-slate-600 mb-3">
              The content, features, and functionality of Miked.live (including but not limited to all information, software, text, displays, images, video and audio) are owned by Miked.live, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-slate-600">
              The rider templates and tools provided by Miked.live are for your personal use only. Any rider PDF you generate contains your band's information and may be used and distributed by you for professional purposes.
            </p>
          </section>

          {/* Account Responsibility */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Account Responsibility</h2>
            <p className="text-slate-600">
              If you create an account on Miked.live, you are responsible for maintaining the confidentiality of your account information and password, and you are responsible for all activities that occur under your account. You agree to notify Miked.live immediately of any unauthorized use of your account or any other breach of security.
            </p>
          </section>

          {/* PDF Generation & Email */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">PDF Generation & Email Delivery</h2>
            <p className="text-slate-600 mb-3">
              When you generate a rider PDF:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-600 ml-2">
              <li>We will send the PDF to the email address you provide</li>
              <li>Your data is stored in our database for future access</li>
              <li>You are responsible for ensuring the email address is correct</li>
              <li>We are not responsible for email delivery failures by third-party providers</li>
              <li>The PDF contains your band information and may be freely distributed by you</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Termination</h2>
            <p className="text-slate-600">
              Miked.live may terminate or suspend your access to the service immediately, without prior notice or liability, for any reason whatsoever, including if you breach the Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Contact Me</h2>
            <p className="text-slate-600 mb-3">
              If you have questions about these Terms of Service, please reach out:
            </p>
            <ul className="space-y-2 text-slate-600 ml-2">
              <li>
                Visit my <Link href="/contact" className="text-indigo-500 hover:text-indigo-600">contact page</Link>
              </li>
              <li>
                Join the <a href="https://chat.whatsapp.com/JW37b8r65X1AyAGYPRt1NG" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600">WhatsApp community</a>
              </li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
