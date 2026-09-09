import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getEditorAuthConfig } from "@/lib/editor-auth";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/editor/login" },
  providers: [
    CredentialsProvider({
      name: "Editorial",
      credentials: {
        email: { label: "Correo electrónico", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const configuration = getEditorAuthConfig();
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        if (!configuration || !email || !password || email !== configuration.email) return null;
        try {
          if (!(await bcrypt.compare(password, configuration.passwordHash))) return null;
        } catch {
          return null;
        }
        return { id: configuration.email, email: configuration.email, name: "Editor", role: "editor" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.role === "editor") token.role = "editor";
      return token;
    },
    async session({ session, token }) {
      if (token.role === "editor" && session.user) session.user.role = "editor";
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler };
