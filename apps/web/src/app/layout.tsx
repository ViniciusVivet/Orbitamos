import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CursorOrbit from "@/components/CursorOrbit";
import { ClientAuthProvider } from "@/components/AuthProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { ProgressProviderWithAuth } from "@/contexts/ProgressContext";
import PreWakeProvider from "@/components/PreWakeProvider";
import ForumWidget from "@/components/ForumWidget";
import FloatingChat from "@/components/chat/FloatingChat";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.orbitamosbr.com"),
  title: "Orbitamos - Sites, Sistemas e Automações para Negócios",
  description:
    "Criamos landing pages, sites profissionais, catálogos digitais, sistemas web e automações para negócios venderem, organizar e escalar.",
  keywords:
    "sites profissionais, landing pages, sistemas web, automações, agência digital, criação de sites, catálogo digital, e-commerce, Next.js, São Paulo",
  authors: [{ name: "Douglas Vinicius Alves da Silva" }],
  creator: "Orbitamos",
  publisher: "Orbitamos",
  robots: "index, follow",
  icons: {
    icon: [
      { url: "/orbi-favicon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/orbi-favicon.png",
    apple: "/orbi-favicon.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Orbitamos - Sites, Sistemas e Automações para Negócios",
    description:
      "Landing pages, sites profissionais, catálogos digitais, sistemas web e automações para negócios venderem, organizar e escalar.",
    url: "https://www.orbitamosbr.com",
    type: "website",
    locale: "pt_BR",
    siteName: "Orbitamos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbitamos - Sites, Sistemas e Automações para Negócios",
    description:
      "Criamos landing pages, sites profissionais, catálogos digitais, sistemas web e automações para negócios venderem, organizar e escalar.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ErrorBoundaryWrapper>
          <ClientAuthProvider>
            <ProgressProviderWithAuth>
              <ChatProvider>
                <PreWakeProvider>
                  <CursorOrbit />
                  <Navigation />
                  <ForumWidget />
                  <FloatingChat />
                  <main className="pt-16 min-w-0 overflow-x-hidden">
                    {children}
                  </main>
                </PreWakeProvider>
              </ChatProvider>
            </ProgressProviderWithAuth>
          </ClientAuthProvider>
        </ErrorBoundaryWrapper>
      </body>
    </html>
  );
}
