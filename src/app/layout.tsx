
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { Toaster } from "@/components/ui/toaster";
import AiMentorWidget from "@/components/common/AiMentorWidget";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { EditModeProvider } from "@/components/common/EditModeProvider";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import Link from "next/link";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "BiharWaleSirji - Parivaar. Pratishtha. Parivartan.",
  description:
    "India's first platform that teaches like an elder brother, not a stranger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <body className={`${poppins.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={["light", "dark", "proudshe", "retrogamer"]}
        >
          <AuthProvider>
            <EditModeProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
                 <Button
                    asChild
                    className="h-16 w-16 rounded-full shadow-lg"
                    size="icon"
                    aria-label="Contact Us"
                  >
                    <Link href="/contact">
                      <Phone className="h-8 w-8" />
                    </Link>
                </Button>
                <AiMentorWidget />
              </div>
              <Toaster />
            </EditModeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
