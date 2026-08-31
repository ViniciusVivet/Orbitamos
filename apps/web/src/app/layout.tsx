import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import CursorOrbit from "@/components/CursorOrbit";
import { ClientAuthProvider } from "@/components/AuthProvider";
import { ChatProvider } from "@/contexts/ChatContext";
import { ProgressProviderWithAuth } from "@/contexts/ProgressContext";
import ForumWidget from "@/components/ForumWidget";
import FloatingChat from "@/components/chat/FloatingChat";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";

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
    "Produtos digitais para sua empresa vender, organizar e escalar: presença profissional, vendas online, sistemas, automações e evolução contínua.",
  keywords:
    "presença digital profissional, vender pela internet, sistema para empresa, automação de processos, integração de sistemas, manutenção de sites, São Paulo",
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
      "Seis soluções claras para sua empresa vender, organizar e escalar com tecnologia.",
    url: "https://www.orbitamosbr.com",
    type: "website",
    locale: "pt_BR",
    siteName: "Orbitamos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbitamos - Sites, Sistemas e Automações para Negócios",
    description:
      "Presença profissional, vendas online, sistemas, automações e evolução contínua para empresas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{localStorage.removeItem("orbitamos-theme")}catch(e){}document.documentElement.dataset.theme="dark";document.documentElement.style.colorScheme="dark"})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider>
          <ErrorBoundaryWrapper>
            <ClientAuthProvider>
              <ProgressProviderWithAuth>
                <ChatProvider>
                  <CursorOrbit />
                  <Navigation />
                  <ForumWidget />
                  <FloatingChat />
                  <main className="pt-16 min-w-0 overflow-x-clip">
                    {children}
                  </main>
                </ChatProvider>
              </ProgressProviderWithAuth>
            </ClientAuthProvider>
          </ErrorBoundaryWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
