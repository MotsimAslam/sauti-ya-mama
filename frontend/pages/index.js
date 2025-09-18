import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>Sauti Ya Mama</title>
        <meta
          name="description"
          content="AI-powered maternal health companion for expectant mothers in low-resource settings."
        />
      </Head>

      <main className="bg-gray-50 min-h-screen text-gray-800">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-16 lg:flex lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
                <span className="block">Sauti Ya Mama</span>
                <span className="block text-purple-600 mt-2">
                  Maternal Health Companion
                </span>
              </h1>
              <p className="mt-6 text-lg text-gray-600">
                AI-powered support for expectant mothers in low-resource
                settings. Get personalized health advice, find nearby clinics,
                and chat with medical AI assistants – all in your local
                language.
              </p>
              <div className="mt-8 flex space-x-4">
                <Link
                  href="/auth"
                  className="rounded-lg bg-purple-600 px-6 py-3 text-white font-semibold shadow hover:bg-purple-700 transition"
                >
                  Get Started
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-purple-600 px-6 py-3 text-purple-600 font-semibold hover:bg-purple-50 transition"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <img
                className="w-full max-w-md mx-auto"
                src="https://illustrations.popsy.co/gray/mother-holding-baby.svg"
                alt="Mother illustration"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white py-12">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-purple-600">10k+</p>
              <p className="mt-1 text-gray-600">Mothers Helped</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">5+</p>
              <p className="mt-1 text-gray-600">Languages Supported</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">100+</p>
              <p className="mt-1 text-gray-600">Clinics Mapped</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-extrabold text-center text-gray-900">
              The Maternal Health Crisis
            </h2>
            <p className="mt-4 text-lg text-center text-gray-600">
              Every day, thousands of expectant mothers in low-resource areas
              face preventable health complications due to lack of access to
              medical information and care.
            </p>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
                <div className="text-purple-600 text-4xl mb-4">❤️</div>
                <h3 className="text-xl font-semibold">Lack of Access</h3>
                <p className="mt-2 text-gray-600">
                  Limited access to healthcare facilities and medical
                  professionals in rural and low-income areas.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
                <div className="text-purple-600 text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold">Misinformation</h3>
                <p className="mt-2 text-gray-600">
                  Prevalence of myths and misinformation about pregnancy and
                  maternal health practices.
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
                <div className="text-purple-600 text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold">Language Barriers</h3>
                <p className="mt-2 text-gray-600">
                  Communication gaps due to limited local-language healthcare
                  resources.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-purple-600 py-16 text-center text-white">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-2 text-lg">
            Join thousands of mothers using Sauti Ya Mama for safe, accessible,
            and reliable maternal health support.
          </p>
          <div className="mt-6">
            <Link
              href="/auth"
              className="rounded-lg bg-white px-8 py-3 text-purple-600 font-semibold shadow hover:bg-gray-100 transition"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
