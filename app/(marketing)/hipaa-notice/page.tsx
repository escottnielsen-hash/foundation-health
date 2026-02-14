import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function HipaaNoticePage() {
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
          <h1 className="text-5xl font-bold text-primary font-display mb-8">
            HIPAA Notice of Privacy Practices
          </h1>
          <p className="text-muted-foreground mb-4 text-sm">
            Effective Date: January 1, {new Date().getFullYear()}
          </p>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Our Commitment to Your Privacy
              </h2>
              <p className="leading-relaxed">
                Foundation Health, operated by AI Venture Holdings LLC, is committed to protecting
                the privacy of your protected health information (PHI). This Notice of Privacy
                Practices describes how medical information about you may be used and disclosed, and
                how you can get access to this information. Please review it carefully.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                How We May Use and Disclose Your PHI
              </h2>
              <p className="leading-relaxed mb-4">
                We may use and disclose your protected health information for the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="leading-relaxed">
                  <strong className="text-foreground">Treatment:</strong> To provide, coordinate, or
                  manage your healthcare and related services, including consultations with other
                  healthcare providers.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-foreground">Payment:</strong> To obtain payment for
                  healthcare services provided to you, including billing, claims management, and
                  collections activities.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-foreground">Healthcare Operations:</strong> For our
                  internal operations, including quality assessment, training, credentialing,
                  auditing, and business planning.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-foreground">As Required by Law:</strong> When required by
                  federal, state, or local law, including public health reporting and legal
                  proceedings.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">Your Rights</h2>
              <p className="leading-relaxed mb-4">
                You have the following rights regarding your protected health information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li className="leading-relaxed">
                  Right to inspect and copy your medical records
                </li>
                <li className="leading-relaxed">
                  Right to request amendments to your health information
                </li>
                <li className="leading-relaxed">
                  Right to an accounting of disclosures of your PHI
                </li>
                <li className="leading-relaxed">
                  Right to request restrictions on certain uses and disclosures
                </li>
                <li className="leading-relaxed">
                  Right to request confidential communications
                </li>
                <li className="leading-relaxed">
                  Right to receive a paper copy of this Notice
                </li>
                <li className="leading-relaxed">
                  Right to file a complaint if you believe your privacy rights have been violated
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Our Responsibilities
              </h2>
              <p className="leading-relaxed">
                We are required by law to maintain the privacy and security of your protected health
                information, provide you with this Notice of our legal duties and privacy practices,
                notify you following a breach of unsecured PHI, and abide by the terms of the Notice
                currently in effect.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Changes to This Notice
              </h2>
              <p className="leading-relaxed">
                We reserve the right to change this Notice and make the new provisions effective for
                all PHI we maintain. Revised notices will be posted on our website and made available
                at our locations.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-primary font-display mb-4">
                Complaints and Contact
              </h2>
              <p className="leading-relaxed">
                If you believe your privacy rights have been violated, you may file a complaint with
                Foundation Health or with the Secretary of the U.S. Department of Health and Human
                Services. You will not be penalized for filing a complaint. Contact our Privacy
                Officer at info@foundationhealth.com or write to Foundation Health, Midvale, Utah.
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
