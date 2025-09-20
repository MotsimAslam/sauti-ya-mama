// pages/index.js
import Head from "next/head";
import Link from "next/link";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Head>
        <title>Sauti Ya Mama - AI Maternal Health Companion</title>
      </Head>

      {/* Navbar */}
      <header className="fixed w-full bg-white shadow z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-pink-600" />
            <span className="font-bold text-gray-800 text-xl">Sauti Ya Mama</span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <a href="#home" className="hover:text-pink-600">Home</a>
            <a href="#about" className="hover:text-pink-600">About Us</a>
            <a href="#how" className="hover:text-pink-600">How It Works</a>
            <a href="#clinics" className="hover:text-pink-600">Clinics</a>
            <a href="#contact" className="hover:text-pink-600">Contact Us</a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white shadow px-6 py-4 space-y-4">
            <a href="#home" className="block text-gray-700 hover:text-pink-600">Home</a>
            <a href="#about" className="block text-gray-700 hover:text-pink-600">About Us</a>
            <a href="#how" className="block text-gray-700 hover:text-pink-600">How It Works</a>
            <a href="#clinics" className="block text-gray-700 hover:text-pink-600">Clinics</a>
            <a href="#contact" className="block text-gray-700 hover:text-pink-600">Contact Us</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-r from-pink-100 to-pink-50 py-24 pt-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
            Sauti Ya Mama
          </h1>
          <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">
            AI-powered maternal health companion designed to save mothers’ lives
            with voice-based guidance, real-time clinic navigation, and instant
            health triage.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/auth"
              className="px-6 py-3 rounded-xl bg-pink-600 text-white font-semibold shadow hover:bg-pink-700"
            >
              Get Started
            </Link>
            <a
              href="#about"
              className="px-6 py-3 rounded-xl border border-pink-600 text-pink-600 font-semibold hover:bg-pink-50"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900">About Us</h2>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
            We are tackling maternal health challenges using AI, voice technology, 
            and clinic navigation to ensure no mother dies from preventable causes.
          </p>
        </div>
      </section>

      {/* Features / How It Works */}
      <section id="how" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 1</div>
              <p className="mt-4 text-gray-700">Mother speaks her symptoms via voice.</p>
            </div>
            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 2</div>
              <p className="mt-4 text-gray-700">AI analyzes & gives trusted recommendations.</p>
            </div>
            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 3</div>
              <p className="mt-4 text-gray-700">Navigation to nearest clinic if needed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clinics Section */}
      <section id="clinics" className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900">Find Clinics</h2>
        <p className="mt-4 text-gray-600">
          Use our real-time location service to find nearby clinics and hospitals.
        </p>
        <Link
          href="/clinics"
          className="mt-6 inline-block px-6 py-3 bg-pink-600 text-white rounded-xl shadow hover:bg-pink-700"
        >
          Search Clinics
        </Link>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
        <p className="mt-4 text-gray-600">
          For partnerships, pilots, or questions, reach out to us at:
        </p>
        <p className="mt-2 text-pink-600 font-semibold">info@sautiyamama.org</p>
      </section>

      {/* Coming Soon */}
      <section className="bg-gradient-to-r from-pink-600 to-pink-500 py-20 text-white text-center">
        <h2 className="text-3xl font-bold">Appointment Booking Coming Soon</h2>
        <p className="mt-4 max-w-2xl mx-auto">
          Soon you’ll be able to book hospital & clinic appointments directly from Sauti Ya Mama.
        </p>
      </section>
    </>
  );
}
