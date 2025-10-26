import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklesCore } from "@/components/ui/sparkles";
import {
  PaperPlane,
  PaintPalette,
  BuildingBlocks,
  Balloon,
  Kite,
  Rainbow,
  StarDoodle,
} from "@/components/landing/childhood-assets";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <main className="container mx-auto px-4 pt-12 pb-20 relative overflow-hidden">
        {/* Sparkles Effect */}
        <div className="absolute inset-0 w-full h-full">
          <SparklesCore
            id="tsparticlesfullpage"
            background="transparent"
            minSize={0.6}
            maxSize={1.4}
            particleDensity={100}
            className="w-full h-full"
            particleColor="#3B82F6"
          />
          {/* Gradient fade-out overlay */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white dark:from-gray-950 via-white/60 dark:via-gray-950/60 to-transparent pointer-events-none"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Decorative Childhood Elements */}
          <div className="absolute left-4 top-20 hidden lg:block animate-bounce-slow">
            <PaperPlane className="w-28 h-28 transform -rotate-12" />
          </div>

          <div className="absolute right-8 top-16 hidden lg:block animate-float">
            <Kite className="w-24 h-32" />
          </div>

          <div className="absolute left-16 top-[400px] hidden lg:block animate-float-delayed">
            <Balloon className="w-16 h-24" />
          </div>

          <div className="absolute right-24 top-[320px] hidden lg:block">
            <PaintPalette className="w-20 h-20" />
          </div>

          <div className="absolute left-[45%] top-4 hidden md:block animate-spin-slow">
            <StarDoodle className="w-12 h-12" />
          </div>

          <div className="absolute right-32 bottom-20 hidden lg:block">
            <BuildingBlocks className="w-20 h-20" />
          </div>

          <div className="absolute left-1/4 bottom-32 hidden lg:block opacity-70">
            <Rainbow className="w-32 h-20" />
          </div>

          {/* Main Content */}
          <div className="text-center space-y-8 relative z-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="block text-gray-900 dark:text-white">
                Matrícula Fácil Para
              </span>
              <span className="block text-gray-900 dark:text-white mt-2">
                Sua Creche Comunitária
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Simplifique o processo de matrícula da sua creche com nossa
              plataforma intuitiva e acessível. Organize cadastros, gerencie
              vagas e cuide das crianças com mais eficiência.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                asChild
                size="lg"
                className="bg-[#FF7B7B] hover:bg-[#FF6B6B] text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link href="/login">Começar Agora</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="font-semibold px-8 py-6 text-lg rounded-xl border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <Link href="/dashboard">Acessar Dashboard</Link>
              </Button>
            </div>

            {/* Children Illustration */}
            <div className="pt-16 max-w-5xl mx-auto">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-8 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition duration-500"></div>

                {/* Main image with colorful background */}
                <div className="relative">
                  {/* Colorful background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 dark:from-yellow-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-3xl"></div>

                  {/* Image container */}
                  <div className="relative p-8 md:p-12">
                    <Image
                      src="/images/children.png"
                      alt="Crianças felizes indo para a escola"
                      width={1280}
                      height={720}
                      className="w-full h-auto object-contain transform group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl"
                      priority
                    />
                  </div>

                  {/* Decorative stars */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <StarDoodle className="w-12 h-12 animate-spin-slow" />
                  </div>
                  <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <StarDoodle className="w-10 h-10 animate-spin-slow" />
                  </div>
                  <div className="absolute top-1/2 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <StarDoodle className="w-8 h-8 animate-spin-slow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-10 left-10 opacity-20">
          <BuildingBlocks className="w-32 h-32" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <PaintPalette className="w-32 h-32" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                Por que escolher o MatriFácil?
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Uma solução completa e acessível para sua creche comunitária
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative text-center space-y-4 p-8 rounded-3xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <StarDoodle className="w-10 h-10" />
                </div>
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <Badge variant="secondary" className="font-medium">
                  Organização
                </Badge>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gestão Simplificada
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Organize todas as matrículas em um só lugar. Cadastre
                  crianças, pais e responsáveis de forma rápida e intuitiva.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative text-center space-y-4 p-8 rounded-3xl border-2 border-transparent hover:border-teal-500 dark:hover:border-teal-400 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <StarDoodle className="w-10 h-10" />
                </div>
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <Badge variant="secondary" className="font-medium">
                  Controle
                </Badge>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gerenciamento de Vagas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Gerencie a disponibilidade de vagas por turma e idade. Nunca
                  mais se preocupe com superlotação.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative text-center space-y-4 p-8 rounded-3xl border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <StarDoodle className="w-10 h-10" />
                </div>
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                    />
                  </svg>
                </div>
                <Badge variant="secondary" className="font-medium">
                  Flexibilidade
                </Badge>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Acesso Offline
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Funciona sem internet! Trabalhe offline e sincronize quando
                  tiver conexão. Perfeito para áreas com sinal instável.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-teal-500 dark:from-blue-900 dark:to-teal-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Pronto para começar?
            </h2>
            <p className="text-xl text-blue-50">
              Faça parte das creches que já simplificaram suas matrículas
            </p>
            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-10 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200"
              >
                <Link href="/login">Criar Conta Grátis</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-50 dark:bg-gray-900 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>
              © {new Date().getFullYear()} MatriFácil. Desenvolvido com ❤️ para
              Creche Estrela do Oriente.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
