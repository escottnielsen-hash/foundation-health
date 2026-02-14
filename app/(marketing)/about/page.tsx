import Link from "next/link";
import { ArrowLeft, Target, Heart, TrendingUp, Users } from "lucide-react";

export default function AboutPage() {
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

      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-20 bg-gradient-to-br from-background via-white to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
            About Us
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-primary font-display mb-8 leading-tight">
            Redefining American Healthcare
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Foundation Health is building the future of medicine -- where world-class clinical
            outcomes meet destination recovery, and financial incentives align with patient welfare.
          </p>
        </div>
      </section>

      {/* Medicine 3.0 Vision */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
                Our Vision
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-primary font-display mb-8">
                Medicine 3.0
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                The American healthcare system is fundamentally broken. It rewards volume over value,
                treatment over prevention, and institutional convenience over patient outcomes. Foundation
                Health exists to build a better model.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We call our approach Medicine 3.0: a shift from reactive, disease-focused care to
                proactive, longevity-oriented healthcare delivered in environments that promote
                genuine healing. By combining surgical excellence with regenerative medicine,
                executive health assessments, and resort-based recovery, we are creating a new
                category of healthcare.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our model leverages critical access hospital designations, independent dispute
                resolution for fair reimbursement, and destination settings that attract both patients
                seeking premium care and physicians seeking practice autonomy.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card p-8 rounded-xl border border-border">
                <Target className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-lg font-bold text-primary font-display mb-2">Prevention First</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Proactive health optimization over reactive disease management.
                </p>
              </div>
              <div className="bg-card p-8 rounded-xl border border-border">
                <Heart className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-lg font-bold text-primary font-display mb-2">Patient Aligned</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Financial incentives that reward quality outcomes, not visit volume.
                </p>
              </div>
              <div className="bg-card p-8 rounded-xl border border-border">
                <TrendingUp className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-lg font-bold text-primary font-display mb-2">Premium Outcomes</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  World-class surgeons and cutting-edge regenerative protocols.
                </p>
              </div>
              <div className="bg-card p-8 rounded-xl border border-border">
                <Users className="w-8 h-8 text-accent mb-4" />
                <h3 className="text-lg font-bold text-primary font-display mb-2">Concierge Model</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Dedicated care teams with direct physician access and coordination.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Reform Thesis */}
      <section className="py-20 lg:py-28 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
            Our Thesis
          </p>
          <h2 className="text-4xl md:text-5xl font-bold font-display mb-10 text-primary-foreground">
            Healthcare Reform Through Innovation
          </h2>
          <div className="space-y-6 text-primary-foreground/80 text-lg leading-relaxed">
            <p>
              The No Surprises Act and Independent Dispute Resolution (IDR) process have created a
              new paradigm in healthcare reimbursement. Foundation Health is built to thrive in this
              environment, achieving an 85% IDR win rate and 3.7x Medicare rate settlements.
            </p>
            <p>
              By operating in critical access hospital (CAH) markets, we benefit from 101% cost
              reimbursement while serving patients in destination settings that promote healing. This
              model aligns incentives: patients receive premium care, physicians practice at the top
              of their license, and the financial model is sustainable without dependence on volume.
            </p>
            <p>
              Our network of resort destinations across the American West -- Moab, Camas, Park City,
              and Powder Mountain -- provides the backdrop for a fundamentally different healthcare
              experience. One where recovery happens in nature, not in a hospital corridor.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
              Leadership
            </p>
            <h2 className="section-title">The Team Behind Foundation Health</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {/* Dr. Scott Nelson */}
            <div className="bg-card p-10 rounded-xl border border-border">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary font-display">SN</span>
              </div>
              <h3 className="text-2xl font-bold text-primary font-display mb-1">
                Dr. Scott Nelson
              </h3>
              <p className="text-accent font-medium text-sm tracking-wide uppercase mb-4">
                Co-Founder & Chief Medical Officer
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A visionary physician and medtech entrepreneur with deep expertise in orthopedic
                surgery, regenerative medicine, and healthcare innovation. Dr. Nelson brings decades
                of clinical experience and a relentless focus on redefining how premium healthcare
                is delivered in the United States.
              </p>
            </div>

            {/* Mike Morgan */}
            <div className="bg-card p-10 rounded-xl border border-border">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-primary font-display">MM</span>
              </div>
              <h3 className="text-2xl font-bold text-primary font-display mb-1">Mike Morgan</h3>
              <p className="text-accent font-medium text-sm tracking-wide uppercase mb-4">
                Co-Founder & Chief Executive Officer
              </p>
              <p className="text-muted-foreground leading-relaxed">
                A seasoned operator and strategist with expertise in healthcare finance, venture
                building, and operational scale. Mike drives the business model, market expansion,
                and financial architecture that makes Foundation Health&apos;s destination healthcare
                vision a reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title">Join Us in Reimagining Healthcare</h2>
          <p className="section-subtitle mb-10">
            Whether you are a prospective member, a physician seeking practice autonomy, or an
            investor aligned with our vision, we would welcome the conversation.
          </p>
          <Link href="/contact" className="btn-primary">
            Get in Touch
          </Link>
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
