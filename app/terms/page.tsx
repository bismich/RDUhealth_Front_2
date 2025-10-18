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
                Terms & Conditions
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Effective Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="prose prose-slate max-w-none space-y-8">
              <section className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-slate-700 leading-relaxed">
                  These Terms & Conditions ("Terms") govern your access to and use of the Urizon Health platform 
                  and services (the "Service"), operated by Urizon Solutions, LLC ("Company," "we," "us," or "our"). 
                  By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to 
                  these Terms, please do not use our Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  1. Service Description
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Urizon Health provides an AI-powered referral and matching tool designed to connect individuals 
                  with licensed mental health professionals in their area. Our Service facilitates connections only 
                  and does not provide medical advice, diagnosis, or treatment.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  2. Eligibility & Registration
                </h2>
                <h3 className="text-xl font-medium text-slate-800 mt-4">2.1 Provider Eligibility</h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>All practices and individual providers must be certified, licensed mental health professionals in their respective fields and jurisdictions</li>
                  <li>Providers must maintain active licensure and comply with all applicable state and federal regulations</li>
                  <li>Providers must possess a valid National Provider Identification (NPI) number</li>
                </ul>
                
                <h3 className="text-xl font-medium text-slate-800 mt-4">2.2 Verification Requirements</h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>We verify all providers using the official NPI Registry and other publicly available professional databases</li>
                  <li>We reserve the right to request additional documentation to verify credentials</li>
                  <li>We reserve the right to refuse, suspend, or terminate any account that cannot be verified or is not in compliance with applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  3. Data Collection & Privacy
                </h2>
                <h3 className="text-xl font-medium text-slate-800 mt-4">3.1 Limited Data Collection</h3>
                <p className="text-slate-600 leading-relaxed">
                  The information collected about each practice is strictly limited to:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Publicly available information from practice websites</li>
                  <li>Information available through legitimate online searches</li>
                  <li>Information voluntarily provided by the practice or provider</li>
                </ul>
                
                <h3 className="text-xl font-medium text-slate-800 mt-4">3.2 No Patient Health Information</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our platform does not handle, access, collect, or store any Patient Health Information (PHI) 
                  or protected health information as defined under HIPAA.
                </p>
                
                <h3 className="text-xl font-medium text-slate-800 mt-4">3.3 Tool Functionality</h3>
                <p className="text-slate-600 leading-relaxed">
                  Our matching tool operates without visibility into any personal health information from either 
                  users seeking services or providers offering services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  4. Provider Responsibilities
                </h2>
                <h3 className="text-xl font-medium text-slate-800 mt-4">4.1 Information Accuracy</h3>
                <p className="text-slate-600 leading-relaxed">
                  Each organization, practice, and provider is solely responsible for:
                </p>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>The accuracy, completeness, and currency of all information provided to our Service</li>
                  <li>Updating their information promptly when changes occur</li>
                  <li>Ensuring all submitted information complies with applicable laws and professional standards</li>
                </ul>
                
                <h3 className="text-xl font-medium text-slate-800 mt-4">4.2 Professional Standards</h3>
                <p className="text-slate-600 leading-relaxed">
                  Providers agree to maintain appropriate professional liability insurance and adhere to all 
                  applicable professional ethical standards and guidelines.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  5. Fraud Prevention
                </h2>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>We actively monitor for fraudulent activity on our platform</li>
                  <li>Accounts suspected of being fraudulent will be immediately suspended pending investigation</li>
                  <li>Confirmed fraudulent accounts will be permanently terminated and may be reported to appropriate law enforcement authorities</li>
                  <li>We cooperate fully with law enforcement investigations related to fraudulent activity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  6. Payment Terms
                </h2>
                <h3 className="text-xl font-medium text-slate-800 mt-4">6.1 Payment Processing</h3>
                <p className="text-slate-600 leading-relaxed">
                  All payments are securely processed through Stripe, Inc., a third-party payment processor. 
                  By providing payment information, you agree to Stripe's terms of service and privacy policy.
                </p>
                
                <h3 className="text-xl font-medium text-slate-800 mt-4">6.2 Subscription Services</h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Subscription fees are billed in advance on a recurring basis (monthly/annually as selected)</li>
                  <li>All fees are non-refundable except as expressly stated in these Terms</li>
                </ul>
                
                <h3 className="text-xl font-medium text-slate-800 mt-4">6.3 Cancellation & Refunds</h3>
                <ul className="list-disc pl-6 text-slate-600 space-y-2">
                  <li>Users may cancel their subscription at any time through their account settings</li>
                  <li>Cancellations take effect at the end of the current billing period</li>
                  <li>No refunds will be issued for any use of the Service beyond fourteen (14) days from the initial purchase date</li>
                  <li>Upon cancellation, access to premium features will continue until the end of the current billing period</li>
                </ul>
              </section>

              <section className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <h2 className="text-2xl font-semibold text-slate-900">
                  7. Medical Disclaimer
                </h2>
                <p className="text-slate-700 font-semibold mb-2">IMPORTANT NOTICE:</p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li>Our AI matching tool provides referral matching services only and does not offer medical advice, diagnosis, or treatment</li>
                  <li>The Service is not a substitute for professional medical advice, diagnosis, or treatment</li>
                  <li>Always seek the advice of qualified health providers with questions regarding mental health conditions</li>
                  <li>Never disregard professional medical advice or delay in seeking it because of information obtained through our Service</li>
                </ul>
              </section>

              <section className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h2 className="text-2xl font-semibold text-slate-900">
                  8. Crisis Support
                </h2>
                <p className="text-slate-700 font-semibold mb-3">
                  If you are experiencing a mental health crisis or emergency:
                </p>
                <ul className="list-disc pl-6 text-slate-700 space-y-2">
                  <li><strong>Call 988</strong> for the Suicide & Crisis Lifeline</li>
                  <li><strong>Call 911</strong> for immediate emergency assistance</li>
                  <li>Contact your local emergency services</li>
                  <li>Go to your nearest emergency room</li>
                </ul>
                <p className="text-slate-700 mt-3">
                  Our platform displays prominent crisis support information and implements safety guidelines 
                  to direct users in crisis to appropriate emergency resources.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  9. Intellectual Property
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  All content, features, and functionality of the Service, including but not limited to text, 
                  graphics, logos, and software, are the exclusive property of Urizon Solutions, LLC and are 
                  protected by applicable intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  10. Limitation of Liability
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, URIZON SOLUTIONS, LLC SHALL NOT BE LIABLE FOR ANY 
                  INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS 
                  OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, 
                  OR OTHER INTANGIBLE LOSSES.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  11. Indemnification
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  You agree to defend, indemnify, and hold harmless Urizon Solutions, LLC, its officers, 
                  directors, employees, and agents, from and against any claims, damages, obligations, 
                  losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising 
                  from your use of the Service or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  12. Termination
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We reserve the right to terminate or suspend your account and access to the Service 
                  immediately, without prior notice or liability, for any reason, including without 
                  limitation if you breach these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  13. Governing Law
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of 
                  North Carolina, United States, without regard to its conflict of law provisions. 
                  Any disputes arising from these Terms shall be resolved in the state or federal 
                  courts located in Wake County, North Carolina.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  14. Changes to Terms
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  We reserve the right to modify or replace these Terms at any time at our sole discretion. 
                  If a revision is material, we will provide at least 30 days' notice prior to any new 
                  terms taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  15. Severability
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining 
                  provisions shall continue in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  16. Entire Agreement
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  These Terms constitute the entire agreement between you and Urizon Solutions, LLC 
                  regarding the use of the Service and supersede any prior agreements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-slate-900">
                  17. Contact Information
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  For questions about these Terms & Conditions, please contact us at:
                </p>
                <div className="mt-3 p-4 bg-gray-50 rounded">
                  <p className="text-slate-700 font-semibold">Urizon Solutions, LLC</p>
                  <p className="text-slate-600">
                    Email: <a href="mailto:contact@urizonsolutions.com" className="text-blue-600 hover:text-blue-800 underline">
                      contact@urizonsolutions.com
                    </a>
                  </p>
                  <p className="text-slate-600">
                    Website: <a href="https://www.urizonhealth.com" className="text-blue-600 hover:text-blue-800 underline">
                      www.urizonhealth.com
                    </a>
                  </p>
                </div>
              </section>

              <section className="border-t pt-6 mt-8">
                <p className="text-slate-500 text-sm italic text-center">
                  By using the Urizon Health platform, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms & Conditions.
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
