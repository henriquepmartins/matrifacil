"use client";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const links = [
    { to: "/", label: "Início" },
    { to: "/dashboard", label: "Painel" },
  ] as const;

  return (
    <header className="bg-white/60 dark:bg-gray-950/60 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between py-5">
          {/* Logo - Left side */}
          <Link href="/" className="group flex items-center">
            <Image
              src="/images/logo.png"
              alt="MatriFácil"
              width={160}
              height={50}
              className="transform group-hover:scale-105 transition-transform duration-300"
              priority
            />
          </Link>

          {/* Right side - Navigation + Actions */}
          <div className="flex items-center gap-8">
            {/* Navigation Links - Desktop only, subtle */}
            <nav className="hidden lg:flex items-center gap-1">
              {links.map(({ to, label }) => {
                return (
                  <Link
                    key={to}
                    href={to}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <ModeToggle />
              <div className="hidden sm:block">
                <UserMenu />
              </div>

              {/* Mobile menu button */}
              <button className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
