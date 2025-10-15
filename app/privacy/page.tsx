import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900">
                Privacy Policy
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  1. Information We Collect
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We collect information you provide directly to us, such as
                  when you create an account, use our services, or contact us
                  for support.
                </p>
                <h3 className="text-xl font-semibold text-slate-900 mt-6">
                  Personal Information
                </h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Name and email address</li>
                  <li>
                    Practice information (name, specialty, contact details)
                  </li>
                  <li>Billing and payment information</li>
                  <li>Communication preferences</li>
                </ul>
                <h3 className="text-xl font-semibold text-slate-900 mt-6">
                  Usage Information
                </h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>How you interact with our services</li>
                  <li>Analytics data and performance metrics</li>
                  <li>Device and browser information</li>
                  <li>IP address and location data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  2. How We Use Your Information
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends and usage</li>
                  <li>Personalize your experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  3. Information Sharing and Disclosure
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties without your consent, except in
                  the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> We may share information
                    with trusted third parties who assist us in operating our
                    website and conducting our business
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose
                    information when required by law or to protect our rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with any
                    merger, sale of assets, or acquisition
                  </li>
                  <li>
                    <strong>Consent:</strong> When you have given us explicit
                    consent to share your information
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  4. Data Security
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We implement appropriate security measures to protect your
                  personal information against unauthorized access, alteration,
                  disclosure, or destruction. This includes:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication</li>
                  <li>HIPAA-aware infrastructure and practices</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  5. Cookies and Tracking Technologies
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We use cookies and similar tracking technologies to enhance
                  your experience on our website. You can control cookie
                  settings through your browser preferences.
                </p>
                <h3 className="text-xl font-semibold text-slate-900 mt-6">
                  Types of Cookies We Use
                </h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> Required for basic
                    website functionality
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how
                    visitors use our website
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings
                    and preferences
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  6. Third-Party Services
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Our service integrates with third-party providers for specific
                  functionality:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>
                    <strong>Supabase:</strong> Authentication and user
                    management
                  </li>
                  <li>
                    <strong>OpenAI:</strong> AI-powered search and chat
                    functionality
                  </li>
                  <li>
                    <strong>Stripe:</strong> Payment processing and billing
                  </li>
                  <li>
                    <strong>Analytics Providers:</strong> Website usage and
                    performance tracking
                  </li>
                </ul>
                <p className="text-slate-600 leading-relaxed mt-4">
                  These third parties have their own privacy policies, and we
                  encourage you to review them.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  7. Your Rights and Choices
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  You have certain rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>
                    <strong>Access:</strong> Request access to your personal
                    information
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of
                    inaccurate information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information
                  </li>
                  <li>
                    <strong>Portability:</strong> Request a copy of your data in
                    a portable format
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing
                    communications
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  8. Data Retention
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We retain your personal information for as long as necessary
                  to provide our services and fulfill the purposes outlined in
                  this privacy policy, unless a longer retention period is
                  required or permitted by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  9. International Data Transfers
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure appropriate
                  safeguards are in place to protect your information in
                  accordance with this privacy policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  10. Children's Privacy
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Our service is not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  11. Changes to This Privacy Policy
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We may update this privacy policy from time to time. We will
                  notify you of any changes by posting the new privacy policy on
                  this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  12. Contact Us
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  If you have any questions about this Privacy Policy, please
                  contact us at{" "}
                  <Link
                    href="/contact"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    our contact page
                  </Link>
                  .
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
