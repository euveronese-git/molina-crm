import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Cinzel } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const brand = Cinzel({
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Molina CRM | Lançamentos",
  description:
    "CRM interno — Molina Transações Imobiliárias · Pipeline de lançamentos na Barra da Tijuca",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${sans.variable} ${serif.variable} ${brand.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
