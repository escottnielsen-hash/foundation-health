"use client";

import { useState } from "react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav id="main-nav" className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div id="nav-logo" className="flex items-center">
              <span className="text-2xl font-bold text-primary">Foundation Health</span>
            </div>

            {/* Desktop Menu */}
            <div id="nav-desktop-menu" className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-zinc-700 hover:text-primary transition-colors">Services</a>
              <a href="#about" className="text-zinc-700 hover:text-primary transition-colors">About</a>
              <a href="#team" className="text-zinc-700 hover:text-primary transition-colors">Team</a>
              <a href="#contact" className="text-zinc-700 hover:text-primary transition-colors">Contact</a>
              <button id="nav-cta-button" className="btn-primary">Schedule Consultation</button>
            </div>

            {/* Mobile Menu Button */}
            <button
              id="nav-mobile-menu-button"
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="nav-mobile-menu" className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-4">
              <a href="#services" className="block text-zinc-700 hover:text-primary">Services</a>
              <a href="#about" className="block text-zinc-700 hover:text-primary">About</a>
              <a href="#team" className="block text-zinc-700 hover:text-primary">Team</a>
              <a href="#contact" className="block text-zinc-700 hover:text-primary">Contact</a>
              <button id="nav-mobile-cta-button" className="btn-primary w-full">Schedule Consultation</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero-section" className="pt-24 pb-16 bg-gradient-to-br from-sky-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div id="hero-content">
              <h1 id="hero-title" className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Building Healthier Futures
              </h1>
              <p id="hero-description" className="text-xl text-muted-foreground mb-8">
                Comprehensive healthcare solutions focused on prevention, wellness, and holistic patient care.
              </p>
              <div id="hero-cta-buttons" className="flex flex-col sm:flex-row gap-4">
                <button id="hero-primary-cta" className="btn-primary">Get Started</button>
                <button id="hero-secondary-cta" className="btn-secondary">Learn More</button>
              </div>
            </div>
            <div id="hero-image-container" className="relative h-96 bg-gradient-to-br from-sky-200 to-sky-100 rounded-2xl flex items-center justify-center">
              <div className="text-center text-primary">
                <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <p className="mt-4 text-lg font-semibold">Your Health, Our Priority</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services-section" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="services-header" className="text-center mb-16">
            <h2 id="services-title" className="section-title">Our Services</h2>
            <p id="services-subtitle" className="section-subtitle">
              Comprehensive healthcare solutions tailored to your needs
            </p>
          </div>

          <div id="services-grid" className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div id="service-preventive-card" className="bg-white p-8 rounded-xl border-2 border-zinc-100 hover:border-sky-200 hover:shadow-lg transition-all duration-300">
              <div id="service-preventive-icon" className="w-16 h-16 bg-sky-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 id="service-preventive-title" className="text-2xl font-bold text-foreground mb-4">Preventive Care</h3>
              <p id="service-preventive-description" className="text-muted-foreground mb-6">
                Regular check-ups, screenings, and health assessments to keep you healthy and detect issues early.
              </p>
              <button id="service-preventive-cta" className="text-primary font-semibold hover:text-sky-600 flex items-center">
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Service 2 */}
            <div id="service-wellness-card" className="bg-white p-8 rounded-xl border-2 border-zinc-100 hover:border-sky-200 hover:shadow-lg transition-all duration-300">
              <div id="service-wellness-icon" className="w-16 h-16 bg-sky-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 id="service-wellness-title" className="text-2xl font-bold text-foreground mb-4">Wellness Programs</h3>
              <p id="service-wellness-description" className="text-muted-foreground mb-6">
                Personalized nutrition, fitness, and lifestyle programs designed to optimize your overall wellbeing.
              </p>
              <button id="service-wellness-cta" className="text-primary font-semibold hover:text-sky-600 flex items-center">
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Service 3 */}
            <div id="service-specialist-card" className="bg-white p-8 rounded-xl border-2 border-zinc-100 hover:border-sky-200 hover:shadow-lg transition-all duration-300">
              <div id="service-specialist-icon" className="w-16 h-16 bg-sky-100 rounded-lg flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 id="service-specialist-title" className="text-2xl font-bold text-foreground mb-4">Specialist Care</h3>
              <p id="service-specialist-description" className="text-muted-foreground mb-6">
                Access to top specialists and coordinated care for complex health conditions and specialized treatment.
              </p>
              <button id="service-specialist-cta" className="text-primary font-semibold hover:text-sky-600 flex items-center">
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className="py-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="stats-grid" className="grid md:grid-cols-4 gap-8 text-center">
            <div id="stat-patients">
              <div className="text-5xl font-bold mb-2">50K+</div>
              <div className="text-sky-100">Patients Served</div>
            </div>
            <div id="stat-providers">
              <div className="text-5xl font-bold mb-2">200+</div>
              <div className="text-sky-100">Healthcare Providers</div>
            </div>
            <div id="stat-locations">
              <div className="text-5xl font-bold mb-2">15</div>
              <div className="text-sky-100">Locations</div>
            </div>
            <div id="stat-satisfaction">
              <div className="text-5xl font-bold mb-2">98%</div>
              <div className="text-sky-100">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about-section" className="py-20 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div id="about-image-container" className="relative h-96 bg-gradient-to-br from-sky-100 to-sky-50 rounded-2xl"></div>
            <div id="about-content">
              <h2 id="about-title" className="section-title text-left">About Foundation Health</h2>
              <p id="about-description" className="text-lg text-muted-foreground mb-6">
                Founded on the principle that exceptional healthcare should be accessible to everyone, Foundation Health has been serving our community for over two decades.
              </p>
              <p id="about-mission" className="text-lg text-muted-foreground mb-8">
                Our mission is to provide comprehensive, patient-centered care that addresses not just symptoms, but the whole person – body, mind, and spirit.
              </p>
              <button id="about-cta-button" className="btn-primary">Our Story</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta-section" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="cta-title" className="section-title">Ready to Start Your Health Journey?</h2>
          <p id="cta-description" className="section-subtitle mb-8">
            Schedule a consultation with one of our healthcare professionals today.
          </p>
          <div id="cta-buttons" className="flex flex-col sm:flex-row gap-4 justify-center">
            <button id="cta-primary-button" className="btn-primary">Book Appointment</button>
            <button id="cta-secondary-button" className="btn-secondary">Call Us Now</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="main-footer" className="bg-zinc-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="footer-content" className="grid md:grid-cols-4 gap-8">
            <div id="footer-brand">
              <h3 className="text-2xl font-bold mb-4">Foundation Health</h3>
              <p className="text-zinc-400">Building healthier futures together.</p>
            </div>
            <div id="footer-links-services">
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white">Preventive Care</a></li>
                <li><a href="#" className="hover:text-white">Wellness Programs</a></li>
                <li><a href="#" className="hover:text-white">Specialist Care</a></li>
              </ul>
            </div>
            <div id="footer-links-company">
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-zinc-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Our Team</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div id="footer-contact">
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-zinc-400">
                <li>Email: info@foundationhealth.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Hours: Mon-Fri 8AM-6PM</li>
              </ul>
            </div>
          </div>
          <div id="footer-bottom" className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-400">
            <p>&copy; 2026 Foundation Health. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
