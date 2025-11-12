import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware do Next.js para proteger rotas do dashboard
 * Verifica autenticação antes de permitir acesso
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protege todas as rotas do dashboard
  if (pathname.startsWith("/dashboard")) {
    // Verifica se há token no cookie
    const token = request.cookies.get("token")?.value;

    // Se não houver token, redireciona para login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Se houver token, permite o acesso
    // A validação completa será feita no lado do cliente e servidor
    return NextResponse.next();
  }

  // Para rotas não protegidas, permite acesso
  return NextResponse.next();
}

// Configura quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

