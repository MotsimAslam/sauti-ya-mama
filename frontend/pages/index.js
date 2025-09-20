// frontend/pages/index.js
import {
  HeartIcon,
  GlobeAltIcon,
  ChatBubbleLeftEllipsisIcon,
  CpuChipIcon,
  MapPinIcon,
  MicrophoneIcon,
  ChartBarIcon,
  UserGroupIcon,
  LanguageIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ✅ Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-purple-600">Sauti Ya Mama</h1>
          <nav className="hidden md:flex space-x-6 text-gray-700">
            <a href="#problem" className="hover:text-purple-600">Problem</a>
            <a href="#solution" className="hover:text-purple-600">Solution</a>
            <a href="#impact" className="hover:text-purple-600">Impact</a>
            <a href="#contact" className="hover:text-purple-600">Contact</a>
          </nav>
          <div>
            <a
              href="/auth"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      {/* ✅ Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-500 text-white py-20 px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          AI-Powered Maternal Health Companion
        </h2>
        <p className="text-lg max-w-2xl mx-auto mb-6">
          Supporting mothers in low-resource settings with instant AI health
          triage, clinic navigation, and voice-based assistance — in their local language.
        </p>
        <div className="space-x-4">
          <a
            href="/auth"
            className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            Get Started
          </a>
          <a
            href="#problem"
            className="border border-white px-6 py-3 rounded-lg shadow hover:bg-white hover:text-purple-600 transition"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* ✅ Problem Section */}
      <section id="problem" className="py-16 px-6 max-w-6xl mx-auto text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">The Maternal Health Crisis</h3>
        <p className="text-gray-600 mb-10">
          According to WHO, <span className="font-semibold">295,000 women</span> died during childbirth in 2020.  
          94% of these deaths occurred in low-resource countries — most preventable with timely care.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <HeartIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">Lack of Access</h4>
            <p className="text-gray-600">
              Limited access to clinics and trained professionals in rural and low-income areas.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <ChatBubbleLeftEllipsisIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">Misinformation</h4>
            <p className="text-gray-600">
              Harmful myths and lack of reliable maternal health information cost lives.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <GlobeAltIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">Language Barriers</h4>
            <p className="text-gray-600">
              Communication gaps in healthcare due to limited local-language resources.
            </p>
          </div>
        </div>
      </section>

      {/* ✅ Solution Section */}
      <section id="solution" className="py-16 px-6 max-w-6xl mx-auto text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-4">Our Solution – Sauti Ya Mama</h3>
        <p className="text-gray-600 mb-10">
          A multi-agent AI-powered companion designed to make maternal care accessible, reliable, and inclusive.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <CpuChipIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">AI Symptom Checker</h4>
            <p className="text-gray-600">
              Instant AI triage detects complications early and guides mothers toward care.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <MapPinIcon className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">Nearby Clinics</h4>
            <p className="text-gray-600">
              Google Maps integration to locate the closest safe healthcare facility.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <MicrophoneIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold mb-2">Voice-Based Assistant</h4>
            <p className="text-gray-600">
              Conversational AI in multiple local languages — no literacy required.
            </p>
          </div>
        </div>
      </section>

      // Add this section after Solution Section in index.js

{/* ✅ How It Works Section */}
<section id="how-it-works" className="py-20 px-6 bg-white">
  <div className="max-w-6xl mx-auto text-center">
    <h3 className="text-3xl font-bold text-gray-800 mb-4">How Sauti Ya Mama Works</h3>
    <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
      A simple 4-step process that makes life-saving maternal health support 
      accessible to every mother, even in low-resource settings.
    </p>

    <div className="grid md:grid-cols-4 gap-8">
      {/* Step 1 */}
      <div className="bg-purple-50 rounded-xl shadow-md p-6 relative">
        <div className="absolute -top-4 -left-4 bg-purple-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
          1
        </div>
        <MicrophoneIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h4 className="text-lg font-bold mb-2">Speak or Type Symptoms</h4>
        <p className="text-gray-600">
          Mothers share their symptoms in local languages using voice or text.
        </p>
      </div>

      {/* Step 2 */}
      <div className="bg-purple-50 rounded-xl shadow-md p-6 relative">
        <div className="absolute -top-4 -left-4 bg-purple-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
          2
        </div>
        <CpuChipIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h4 className="text-lg font-bold mb-2">AI Health Analysis</h4>
        <p className="text-gray-600">
          Multi-agent AI checks risks and triages pregnancy complications instantly.
        </p>
      </div>

      {/* Step 3 */}
      <div className="bg-purple-50 rounded-xl shadow-md p-6 relative">
        <div className="absolute -top-4 -left-4 bg-purple-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
          3
        </div>
        <MapPinIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h4 className="text-lg font-bold mb-2">Find Nearby Clinics</h4>
        <p className="text-gray-600">
          The system recommends the closest safe healthcare facility with directions.
        </p>
      </div>

      {/* Step 4 */}
      <div className="bg-purple-50 rounded-xl shadow-md p-6 relative">
        <div className="absolute -top-4 -left-4 bg-purple-600 text-white w-10 h-10 flex items-center justify-center rounded-full font-bold">
          4
        </div>
        <CalendarIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
        <h4 className="text-lg font-bold mb-2">Book Appointment (Coming Soon)</h4>
        <p className="text-gray-600">
          Mothers will soon be able to book appointments directly with partnered hospitals.
        </p>
      </div>
    </div>
  </div>
</section>


      {/* ✅ Impact Section */}
      <section id="impact" className="py-16 bg-gray-100 text-center">
        <h3 className="text-3xl font-bold text-gray-800 mb-6">Our Impact</h3>
        <p className="text-gray-600 mb-10">
          Real-world outcomes from our pilot programs show life-saving potential at scale.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <UserGroupIcon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h4 className="text-xl font-bold">10,000+</h4>
            <p className="text-gray-600">Mothers Reached</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <LanguageIcon className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold">5+</h4>
            <p className="text-gray-600">Languages Supported</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <ChartBarIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold">100+</h4>
            <p className="text-gray-600">Clinics Connected</p>
          </div>
        </div>
      </section>

      {/* ✅ Appointment Booking (Coming Soon) */}
      <section className="py-16 px-6 text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white">
        <div className="max-w-3xl mx-auto">
          <CalendarIcon className="h-16 w-16 mx-auto mb-6 text-white" />
          <h3 className="text-3xl font-bold mb-4">Coming Soon: Appointment Booking</h3>
          <p className="text-lg mb-6">
            Soon, mothers will be able to <span className="font-semibold">book appointments directly</span> 
            with partnered hospitals and clinics through Sauti Ya Mama.
          </p>
          <p className="italic text-sm text-gray-200">
            *This feature is currently in development and will be available in upcoming releases.*
          </p>
        </div>
      </section>

      {/* ✅ Footer / CTA */}
      <footer id="contact" className="bg-purple-600 text-white text-center py-12">
        <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
        <p className="mb-6">
          Join thousands of mothers using Sauti Ya Mama for safe, accessible, and reliable maternal health support.
        </p>
        <a
          href="/auth"
          className="bg-white text-purple-600 px-6 py-3 rounded-lg shadow hover:bg-gray-100 font-semibold transition"
        >
          Sign Up Now
        </a>
      </footer>
    </div>
  );
}
