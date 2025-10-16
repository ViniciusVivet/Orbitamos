import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CursorOrbit from "@/components/CursorOrbit";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Orbitamos - Portal da Quebrada que Orbita Tecnologia",
  description: "Da quebrada pra tecnologia — A gente sobe junto. Transforme sua vida através da tecnologia com nossos programas de mentoria gratuitos. Do subemprego à T.I. em 9 meses.",
  keywords: "tecnologia, programação, quebrada, periferia, educação, mentoria, desenvolvimento, curso gratuito, T.I., programação, carreira",
  authors: [{ name: "Douglas Vinicius Alves da Silva" }],
  creator: "Orbitamos",
  publisher: "Orbitamos",
  robots: "index, follow",
  openGraph: {
    title: "Orbitamos - Portal da Quebrada que Orbita Tecnologia",
    description: "Da quebrada pra tecnologia — A gente sobe junto. Transforme sua vida através da tecnologia com nossos programas de mentoria gratuitos.",
    type: "website",
    locale: "pt_BR",
    siteName: "Orbitamos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbitamos - Portal da Quebrada que Orbita Tecnologia",
    description: "Da quebrada pra tecnologia — A gente sobe junto. Transforme sua vida através da tecnologia com nossos programas de mentoria gratuitos.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <CursorOrbit />
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
