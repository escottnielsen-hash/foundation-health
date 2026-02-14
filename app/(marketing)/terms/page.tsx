import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-primary font-display tracking-tight">
                Foundation Health
              </span>
            </Link>
            <Link
              href="/"
              className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">Legal</p>
          <h1 className="text-5xl font-bold text-primary font-display mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-4 text-sm">
            Last Updated: January 1, {new Date().getFullYear()}
          </p>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Agreement to Terms
              </h2>
              <p className="leading-relaxed">
                By accessing or using the Foundation Health website and services, operated by AI
                Venture Holdings LLC, you agree to be bound by these Terms of Service. If you do not
                agree with any part of these terms, you may not access our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Description of Services
              </h2>
              <p className="leading-relaxed">
                Foundation Health provides premium healthcare services including orthopedic surgery,
                regenerative medicine, executive health assessments, and resort-based recovery
                programs through a membership model at destination locations across the American
                West. Our services are subject to availability and applicable medical licensing
                requirements.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">Membership</h2>
              <p className="leading-relaxed">
                Foundation Health membership is subject to application and approval. Membership fees,
                benefits, and terms are outlined in the separate Membership Agreement provided upon
                acceptance. Membership does not guarantee specific medical outcomes. All medical
                services are provided by licensed healthcare professionals.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Medical Disclaimer
              </h2>
              <p className="leading-relaxed">
                The information provided on this website is for general informational purposes only
                and does not constitute medical advice. Always seek the guidance of a qualified
                healthcare provider with any questions you may have regarding a medical condition.
                Never disregard professional medical advice or delay seeking it because of
                information on this website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Limitation of Liability
              </h2>
              <p className="leading-relaxed">
                To the fullest extent permitted by law, Foundation Health and AI Venture Holdings LLC
                shall not be liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of our website or services. Our total
                liability shall not exceed the amounts paid by you for services received.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">Governing Law</h2>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the
                State of Utah, without regard to conflict of law principles.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">Contact</h2>
              <p className="leading-relaxed">
                For questions about these Terms of Service, please contact us at
                info@foundationhealth.com or write to Foundation Health, Midvale, Utah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground/40 text-sm">
          <p>&copy; {new Date().getFullYear()} Foundation Health. All rights reserved.</p>
          <p className="mt-2">Midvale, Utah &middot; AI Venture Holdings LLC</p>
        </div>
      </footer>
    </div>
  );
}
