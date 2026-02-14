"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Mountain,
  Stethoscope,
  FlaskConical,
  HeartPulse,
  ShieldCheck,
  MapPin,
  Star,
  ArrowRight,
  CheckCircle2,
  Activity,
  TreePine,
  Building2,
  Phone,
  Mail,
} from "lucide-react";

const services = [
  {
    icon: Stethoscope,
    title: "Orthopedic Surgery",
    description:
      "Complex revision surgery, joint replacement, and spine surgery performed by world-class surgeons. Exceptional outcomes delivered in resort settings across the American West.",
  },
  {
    icon: FlaskConical,
    title: "Regenerative Medicine",
    description:
      "Stem cell and PRP therapy, NAD+ infusion protocols, and customized peptide programs. Cutting-edge regenerative treatments that accelerate healing and optimize performance.",
  },
  {
    icon: HeartPulse,
    title: "Executive Health",
    description:
      "Comprehensive health assessments, advanced preventive screening, and longevity optimization protocols. Proactive medicine designed for high-performing individuals.",
  },
  {
    icon: ShieldCheck,
    title: "Recovery & Wellness",
    description:
      "Resort-based post-surgical recovery with 24/7 nursing, physical therapy, nutrition programming, and dedicated concierge services in breathtaking destinations.",
  },
];

const destinations = [
  {
    name: "Moab",
    state: "Utah",
    tagline: "Red rock recovery. Critical access hospital with enhanced reimbursement.",
    icon: Mountain,
  },
  {
    name: "Camas",
    state: "Washington",
    tagline: "Pacific Northwest surgical excellence. Boutique OR with luxury recovery.",
    icon: TreePine,
  },
  {
    name: "Park City",
    state: "Utah",
    tagline: "Mountain wellness. Executive health at Marcella.",
    icon: Building2,
  },
  {
    name: "Powder Mountain",
    state: "Utah",
    tagline: "Alpine retreat. Future expansion destination.",
    icon: Mountain,
  },
];

const membershipTiers = [
  {
    name: "Platinum",
    price: "$100,000",
    period: "/year",
    featured: true,
    features: [
      "Unlimited access to all services and locations",
      "Priority scheduling with 24-hour turnaround",
      "24/7 direct physician access",
      "All wellness and regenerative services included",
      "Dedicated care concierge",
      "Private recovery suites at all destinations",
      "Annual comprehensive executive health assessment",
      "Family member guest privileges",
    ],
  },
  {
    name: "Gold",
    price: "$50,000",
    period: "/year",
    featured: false,
    features: [
      "Priority access to all locations",
      "Same-week appointment availability",
      "Wellness program with personal protocols",
      "Quarterly comprehensive health assessments",
      "Dedicated care coordinator",
      "Recovery suite access",
      "Telemedicine and virtual consultations",
    ],
  },
  {
    name: "Silver",
    price: "$25,000",
    period: "/year",
    featured: false,
    features: [
      "Enhanced access to Foundation network",
      "Quarterly wellness assessments",
      "Telemedicine included",
      "Preferred scheduling",
      "Care coordination services",
      "Access to regenerative medicine menu",
    ],
  },
];

const stats = [
  { value: "85%", label: "IDR Win Rate" },
  { value: "4", label: "Destination Locations" },
  { value: "101%", label: "Cost Reimbursement at CAH" },
  { value: "3.7x", label: "Medicare Rate Settlements" },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm fixed w-full top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-primary font-display tracking-tight">
                Foundation Health
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-10">
              <a
                href="#services"
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase"
              >
                Services
              </a>
              <a
                href="#destinations"
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase"
              >
                Locations
              </a>
              <a
                href="#membership"
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase"
              >
                Membership
              </a>
              <Link
                href="/about"
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-medium tracking-wide uppercase"
              >
                Login
              </Link>
              <Link href="/contact" className="btn-primary text-sm">
                Schedule Consultation
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-border">
            <div className="px-6 py-6 space-y-5">
              <a
                href="#services"
                className="block text-foreground/70 hover:text-primary text-sm font-medium tracking-wide uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </a>
              <a
                href="#destinations"
                className="block text-foreground/70 hover:text-primary text-sm font-medium tracking-wide uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                Locations
              </a>
              <a
                href="#membership"
                className="block text-foreground/70 hover:text-primary text-sm font-medium tracking-wide uppercase"
                onClick={() => setMobileMenuOpen(false)}
              >
                Membership
              </a>
              <Link
                href="/about"
                className="block text-foreground/70 hover:text-primary text-sm font-medium tracking-wide uppercase"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block text-foreground/70 hover:text-primary text-sm font-medium tracking-wide uppercase"
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="block text-foreground/70 hover:text-primary text-sm font-medium tracking-wide uppercase"
              >
                Login
              </Link>
              <Link href="/contact" className="btn-primary block text-center text-sm">
                Schedule Consultation
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 lg:pt-40 lg:pb-32 bg-gradient-to-br from-background via-white to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
                Luxury Destination Healthcare
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-8 font-display leading-tight">
                Destination Healthcare, Reimagined
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-xl">
                Premium surgical care, regenerative medicine, and wellness programs at exclusive
                resort destinations across the American West.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#membership" className="btn-primary text-center">
                  Explore Membership
                </a>
                <Link href="/contact" className="btn-secondary text-center">
                  Schedule Consultation
                </Link>
              </div>
            </div>
            <div className="relative h-[28rem] lg:h-[32rem] bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 rounded-2xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
              <div className="text-center relative z-10">
                <Mountain className="w-24 h-24 mx-auto text-primary/30 mb-4" />
                <Activity className="w-16 h-16 mx-auto text-accent/50" />
                <p className="mt-6 text-primary/40 font-display text-lg tracking-wide">
                  Where Medicine Meets Nature
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
              Our Services
            </p>
            <h2 className="section-title">World-Class Care, Extraordinary Settings</h2>
            <p className="section-subtitle">
              From complex surgical procedures to cutting-edge regenerative therapies, delivered in
              destinations that inspire healing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-card p-10 rounded-xl border border-border hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                  <service.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-4 font-display">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                <button className="mt-6 text-accent font-semibold flex items-center group-hover:translate-x-1 transition-transform">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section id="destinations" className="py-24 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
              Our Destinations
            </p>
            <h2 className="section-title">Heal in Extraordinary Places</h2>
            <p className="section-subtitle">
              Each Foundation Health location is chosen for its natural beauty, clinical excellence,
              and favorable reimbursement landscape.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination) => (
              <div
                key={destination.name}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <destination.icon className="w-16 h-16 text-primary/30 group-hover:text-primary/50 transition-colors" />
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-sm text-accent font-medium tracking-wide">
                      {destination.state}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-primary font-display mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {destination.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
              Membership
            </p>
            <h2 className="section-title">Invest in Your Health</h2>
            <p className="section-subtitle">
              Foundation Health membership provides unparalleled access to destination healthcare,
              world-class physicians, and personalized wellness protocols.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {membershipTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border-2 p-10 transition-all duration-300 ${
                  tier.featured
                    ? "border-accent bg-primary text-primary-foreground shadow-xl scale-105"
                    : "border-border bg-card hover:shadow-lg"
                }`}
              >
                <div className="mb-8">
                  {tier.featured && (
                    <span className="inline-block bg-accent text-primary text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3
                    className={`text-2xl font-bold font-display mb-2 ${
                      tier.featured ? "text-primary-foreground" : "text-primary"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline">
                    <span
                      className={`text-4xl font-bold font-display ${
                        tier.featured ? "text-accent" : "text-primary"
                      }`}
                    >
                      {tier.price}
                    </span>
                    <span
                      className={`ml-1 text-sm ${
                        tier.featured ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {tier.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-10">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start space-x-3">
                      <CheckCircle2
                        className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                          tier.featured ? "text-accent" : "text-accent"
                        }`}
                      />
                      <span
                        className={`text-sm leading-relaxed ${
                          tier.featured ? "text-primary-foreground/90" : "text-muted-foreground"
                        }`}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`block text-center py-3.5 rounded-lg font-semibold tracking-wide transition-all duration-300 ${
                    tier.featured
                      ? "bg-accent text-primary hover:bg-accent/90 shadow-sm"
                      : "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  }`}
                >
                  Apply for Membership
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Foundation Health */}
      <section className="py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
                Why Foundation Health
              </p>
              <h2 className="text-4xl md:text-5xl font-bold font-display mb-8 text-primary-foreground">
                A New Model of Healthcare
              </h2>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-6">
                Foundation Health is built on the thesis that American healthcare is broken. We
                believe in prevention over treatment, premium outcomes over volume, and destination
                recovery over clinical discharge.
              </p>
              <p className="text-primary-foreground/80 text-lg leading-relaxed mb-8">
                Our model leverages critical access hospital designations, independent dispute
                resolution, and resort-based recovery to deliver the highest quality care with
                aligned financial incentives.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center text-accent font-semibold tracking-wide hover:translate-x-1 transition-transform"
              >
                Learn About Our Vision
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center border border-white/10"
                  >
                    <div className="text-4xl font-bold text-accent font-display mb-2">
                      {stat.value}
                    </div>
                    <div className="text-primary-foreground/60 text-sm font-medium tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-10 h-10 text-accent mx-auto mb-6" />
          <h2 className="section-title">Begin Your Health Journey</h2>
          <p className="section-subtitle mb-10">
            Experience the future of healthcare. Schedule a private consultation with our team to
            explore membership and discover how Foundation Health can transform your approach to
            wellness.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary text-center">
              Schedule a Private Consultation
            </Link>
            <a href="tel:+18005551234" className="btn-secondary text-center">
              <Phone className="w-4 h-4 inline mr-2" />
              Call Us Directly
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold font-display mb-4">Foundation Health</h3>
              <p className="text-primary-foreground/60 leading-relaxed mb-6 max-w-sm">
                Destination healthcare reimagined. Premium surgical care, regenerative medicine, and
                wellness at exclusive resort destinations.
              </p>
              <div className="flex items-center space-x-3 text-primary-foreground/50 text-sm">
                <Mail className="w-4 h-4" />
                <span>info@foundationhealth.com</span>
              </div>
              <div className="flex items-center space-x-3 text-primary-foreground/50 text-sm mt-2">
                <Phone className="w-4 h-4" />
                <span>(800) 555-1234</span>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-sm tracking-widest uppercase mb-6 text-accent">
                Services
              </h4>
              <ul className="space-y-3 text-primary-foreground/60">
                <li>
                  <a href="#services" className="hover:text-accent transition-colors text-sm">
                    Orthopedic Surgery
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-accent transition-colors text-sm">
                    Regenerative Medicine
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-accent transition-colors text-sm">
                    Executive Health
                  </a>
                </li>
                <li>
                  <a href="#services" className="hover:text-accent transition-colors text-sm">
                    Recovery & Wellness
                  </a>
                </li>
              </ul>
            </div>

            {/* Locations */}
            <div>
              <h4 className="font-semibold text-sm tracking-widest uppercase mb-6 text-accent">
                Locations
              </h4>
              <ul className="space-y-3 text-primary-foreground/60">
                <li>
                  <a href="#destinations" className="hover:text-accent transition-colors text-sm">
                    Moab, Utah
                  </a>
                </li>
                <li>
                  <a href="#destinations" className="hover:text-accent transition-colors text-sm">
                    Camas, Washington
                  </a>
                </li>
                <li>
                  <a href="#destinations" className="hover:text-accent transition-colors text-sm">
                    Park City, Utah
                  </a>
                </li>
                <li>
                  <a href="#destinations" className="hover:text-accent transition-colors text-sm">
                    Powder Mountain, Utah
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold text-sm tracking-widest uppercase mb-6 text-accent">
                Legal
              </h4>
              <ul className="space-y-3 text-primary-foreground/60">
                <li>
                  <Link href="/terms" className="hover:text-accent transition-colors text-sm">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-accent transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/hipaa-notice"
                    className="hover:text-accent transition-colors text-sm"
                  >
                    HIPAA Notice
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-primary-foreground/40 text-sm">
            <p>&copy; {new Date().getFullYear()} Foundation Health. All rights reserved.</p>
            <p className="mt-2 md:mt-0">
              <MapPin className="w-3 h-3 inline mr-1" />
              Midvale, Utah &middot; AI Venture Holdings LLC
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
