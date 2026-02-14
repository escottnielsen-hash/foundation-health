import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
          <h1 className="text-5xl font-bold text-primary font-display mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-4 text-sm">
            Last Updated: January 1, {new Date().getFullYear()}
          </p>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">Introduction</h2>
              <p className="leading-relaxed">
                Foundation Health (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), operated by AI
                Venture Holdings LLC, is committed to protecting the privacy of our members,
                patients, and website visitors. This Privacy Policy describes how we collect, use,
                disclose, and safeguard your information when you visit our website, use our
                services, or interact with us.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Information We Collect
              </h2>
              <p className="leading-relaxed">
                We may collect personal information that you voluntarily provide to us when you
                express interest in our services, register for membership, participate in activities,
                or contact us. This information may include your name, email address, phone number,
                mailing address, and information related to your healthcare needs.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                How We Use Your Information
              </h2>
              <p className="leading-relaxed">
                We use the information we collect to provide, operate, and maintain our services;
                communicate with you regarding membership, appointments, and services; improve and
                personalize your experience; comply with legal and regulatory requirements; and
                protect the health, safety, and security of our members and patients.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Protected Health Information
              </h2>
              <p className="leading-relaxed">
                Any protected health information (PHI) collected as part of our healthcare services
                is governed by our HIPAA Notice of Privacy Practices, which is available separately.
                PHI is handled in strict compliance with the Health Insurance Portability and
                Accountability Act (HIPAA) and applicable state laws.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate technical and organizational security measures to protect
                your personal information. However, no electronic transmission over the internet or
                information storage technology can be guaranteed to be 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at
                info@foundationhealth.com or write to us at Foundation Health, Midvale, Utah.
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
