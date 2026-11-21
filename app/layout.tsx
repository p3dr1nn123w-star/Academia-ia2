import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academia IA — Aprenda. Investigue. Evolua.",
  description: "Uma escola virtual inteligente para aprender, pesquisar e desenvolver autonomia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}