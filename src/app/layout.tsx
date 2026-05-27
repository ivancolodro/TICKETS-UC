import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tickets UC",
  description: "Sistema de registro de tickets de soporte",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
