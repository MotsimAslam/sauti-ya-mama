// pages/index.js
import Head from "next/head";
import Link from "next/link";
import { Heart, Users, Map, Mic, BrainCircuit, Stethoscope } from "lucide-react";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sauti Ya Mama - AI Maternal Health Companion</title>
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-100 to-pink-50 py-20">
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
            <Link
              href="#solution"
              className="px-6 py-3 rounded-xl border border-pink-600 text-pink-600 font-semibold hover:bg-pink-50"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Why Sauti Ya Mama?
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Tackling maternal health challenges with technology & compassion
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-pink-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <Heart className="h-10 w-10 text-pink-600" />
              <h3 className="mt-4 text-xl font-semibold">Instant Triage</h3>
              <p className="mt-2 text-gray-600">
                Get AI-powered symptom checks and emergency guidance instantly.
              </p>
            </div>

            <div className="bg-pink-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <Mic className="h-10 w-10 text-pink-600" />
              <h3 className="mt-4 text-xl font-semibold">Voice First</h3>
              <p className="mt-2 text-gray-600">
                Accessible for all mothers with voice-based interaction in local
                languages.
              </p>
            </div>

            <div className="bg-pink-50 p-6 rounded-2xl shadow hover:shadow-lg transition">
              <Map className="h-10 w-10 text-pink-600" />
              <h3 className="mt-4 text-xl font-semibold">Clinic Navigation</h3>
              <p className="mt-2 text-gray-600">
                Find the nearest clinic or hospital with real-time directions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solution" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Our Solution
          </h2>
          <p className="mt-4 text-center text-gray-600">
            Powered by AI & community-driven design for real-world impact
          </p>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="flex space-x-4">
              <BrainCircuit className="h-10 w-10 text-pink-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold">Multi-Agent AI</h3>
                <p className="text-gray-600">
                  Specialized AI agents act like a digital medical team for
                  maternal health.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <Stethoscope className="h-10 w-10 text-pink-600 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold">Trusted Knowledge</h3>
                <p className="text-gray-600">
                  Verified medical advice following WHO guidelines and local
                  expertise.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            How It Works
          </h2>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 1</div>
              <p className="mt-4 text-gray-700">
                Mother speaks her symptoms via voice command.
              </p>
            </div>

            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 2</div>
              <p className="mt-4 text-gray-700">
                AI analyzes and gives trusted recommendations instantly.
              </p>
            </div>

            <div className="text-center p-6 border rounded-xl shadow-sm">
              <div className="text-pink-600 text-2xl font-bold">Step 3</div>
              <p className="mt-4 text-gray-700">
                Navigation to nearest clinic if emergency is detected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="bg-gradient-to-r from-pink-600 to-pink-500 py-20 text-white text-center">
        <h2 className="text-3xl font-bold">Appointment Booking Coming Soon</h2>
        <p className="mt-4 max-w-2xl mx-auto">
          Soon you’ll be able to book hospital & clinic appointments directly
          from Sauti Ya Mama.
        </p>
      </section>
    </>
  );
}
