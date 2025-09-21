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
            <a href="#about" className="hover:text-pink-600">About</a>
            <a href="#solution" className="hover:text-pink-600">Solution</a>
            <a href="#impact" className="hover:text-pink-600">Impact</a>
            <a href="#how" className="hover:text-pink-600">How It Works</a>
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
            <a href="#about" className="block text-gray-700 hover:text-pink-600">About</a>
            <a href="#solution" className="block text-gray-700 hover:text-pink-600">Solution</a>
            <a href="#impact" className="block text-gray-700 hover:text-pink-600">Impact</a>
            <a href="#how" className="block text-gray-700 hover:text-pink-600">How It Works</a>
            <a href="#contact" className="block text-gray-700 hover:text-pink-600">Contact Us</a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="bg-gradient-to-r from-pink-100 to-pink-50 py-28 pt-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900">
            Sauti Ya Mama
          </h1>
          <p className="mt-6 text-lg text-gray-700 max-w-2xl mx-auto">
            An AI-powered maternal health companion tackling real-life problems faced by women in developing countries.
            Helping expectant mothers get trusted health advice and find nearby clinics instantly.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Link
              href="/chat"
              className="px-6 py-3 rounded-xl bg-pink-600 text-white font-semibold shadow hover:bg-pink-700"
            >
              Chat with Agent
            </Link>
            <Link
              href="/clinics"
              className="px-6 py-3 rounded-xl border border-pink-600 text-pink-600 font-semibold hover:bg-pink-50"
            >
              Find Clinic
            </Link>
          </div>
        </div>
      </section>

      {/* Real Life Problem */}
      <section id="about" className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900">The Problem</h2>
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          Millions of women in developing countries lack access to affordable hospitals,
          timely medical guidance, and awareness of nearby clinics. Maternal deaths remain
          preventable but widespread.
        </p>
      </section>

      {/* Our Solution */}
      <section id="solution" className="py-20 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold text-gray-900">Our Solution</h2>
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          Sauti Ya Mama uses AI and location technology to provide immediate health advice
          and connect women with nearby clinics and hospitals—saving time, money, and lives.
        </p>
      </section>

      {/* Impact */}
      <section id="impact" className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900">Impact</h2>
        <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
          Every year, over <span className="font-semibold text-pink-600">295,000 women</span> die due to
          pregnancy-related complications. Our solution reduces preventable maternal deaths
          by making healthcare accessible and actionable.
        </p>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            How It Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 1</div>
              <p className="mt-4 text-gray-700">Mother shares her symptoms through chat or voice.</p>
            </div>
            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 2</div>
              <p className="mt-4 text-gray-700">AI analyzes and provides trusted, empathetic recommendations.</p>
            </div>
            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 3</div>
              <p className="mt-4 text-gray-700">If needed, navigation to the nearest clinic is provided instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900">Contact Us</h2>
        <p className="mt-4 text-gray-600">
          For partnerships, pilots, or questions, reach out to us at:
        </p>
        <p className="mt-2 text-pink-600 font-semibold">info@sautiyamama.org</p>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-pink-600 to-pink-500 py-6 text-white text-center">
        <p>&copy; {new Date().getFullYear()} Sauti Ya Mama. All rights reserved.</p>
      </footer>
    </>
  );
}
