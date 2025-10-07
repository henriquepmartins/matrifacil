import { auth } from "@matrifacil-/auth";
import { withMcpAuth } from "better-auth/plugins";

const handler = withMcpAuth(auth, async (req, session) => {
  // session contém o registro do token de acesso com scopes e ID do usuário
  // Aqui você pode implementar sua lógica MCP
  // Este é um exemplo básico de resposta

  return new Response(
    JSON.stringify({
      message: "MCP endpoint configured successfully",
      userId: session.userId,
      scopes: session.scopes,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});

export { handler as GET, handler as POST, handler as DELETE };
