import Link from "next/link";

import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-slate-900">
                Terms and Conditions
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  By accessing and using RDU RAG SaaS ("the Service"), you
                  accept and agree to be bound by the terms and provision of
                  this agreement. If you do not agree to abide by the above,
                  please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  2. Use License
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Permission is granted to temporarily download one copy of the
                  materials on RDU RAG SaaS for personal, non-commercial
                  transitory viewing only. This is the grant of a license, not a
                  transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>modify or copy the materials</li>
                  <li>
                    use the materials for any commercial purpose or for any
                    public display
                  </li>
                  <li>
                    attempt to reverse engineer any software contained on the
                    website
                  </li>
                  <li>
                    remove any copyright or other proprietary notations from the
                    materials
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  3. Service Description
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  RDU RAG SaaS provides practice management tools, AI-powered
                  search capabilities, and analytics for mental health
                  practices. The service includes but is not limited to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Practice profile management</li>
                  <li>AI-assisted client discovery</li>
                  <li>Analytics and engagement tracking</li>
                  <li>Billing and subscription management</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  4. User Accounts
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  When you create an account with us, you must provide
                  information that is accurate, complete, and current at all
                  times. You are responsible for safeguarding the password and
                  for all activities that occur under your account.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  5. Privacy Policy
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy
                  Policy, which also governs your use of the Service, to
                  understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  6. Prohibited Uses
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  You may not use our Service:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>
                    For any unlawful purpose or to solicit others to perform
                    unlawful acts
                  </li>
                  <li>
                    To violate any international, federal, provincial, or state
                    regulations, rules, laws, or local ordinances
                  </li>
                  <li>
                    To infringe upon or violate our intellectual property rights
                    or the intellectual property rights of others
                  </li>
                  <li>
                    To harass, abuse, insult, harm, defame, slander, disparage,
                    intimidate, or discriminate
                  </li>
                  <li>To submit false or misleading information</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  7. Termination
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We may terminate or suspend your account immediately, without
                  prior notice or liability, for any reason whatsoever,
                  including without limitation if you breach the Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  8. Disclaimer
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  The information on this website is provided on an "as is"
                  basis. To the fullest extent permitted by law, this Company
                  excludes all representations, warranties, conditions and terms
                  relating to our website and the use of this website.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  9. Limitation of Liability
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  In no event shall RDU RAG SaaS, nor its directors, employees,
                  partners, agents, suppliers, or affiliates, be liable for any
                  indirect, incidental, special, consequential, or punitive
                  damages, including without limitation, loss of profits, data,
                  use, goodwill, or other intangible losses, resulting from your
                  use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  10. Governing Law
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  These Terms shall be interpreted and governed by the laws of
                  the State of North Carolina, United States, without regard to
                  its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  11. Changes to Terms
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will try to provide at least 30 days notice prior to any new
                  terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  12. Contact Information
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  If you have any questions about these Terms and Conditions,
                  please contact us at{" "}
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
