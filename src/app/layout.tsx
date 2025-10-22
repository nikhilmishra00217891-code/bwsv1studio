
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { EditModeProvider } from "@/components/common/EditModeProvider";
import CustomThemeProvider from "@/components/common/CustomThemeProvider";
import Header from "@/components/common/Header";
import { headers } from "next/headers";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "BiharWaleSirji - Parivaar. Pratishtha. Parivartan.",
  description:
    "India's first platform that teaches like an elder brother, not a stranger.",
  manifest: "/manifest.json",
  icons: {
    icon: "https://i.postimg.cc/FR3TT8KL/IMG-20250915-WA0003-1.jpg",
    apple: "https://i.postimg.cc/FR3TT8KL/IMG-20250915-WA0003-1.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";

  // The header is hidden for onboarding, focus zone rooms, and warzone rooms.
  const isFullScreenPage = pathname.startsWith('/onboarding') || pathname.startsWith('/focus-zone/room/') || pathname.startsWith('/warzone/room/');
  const showHeader = !isFullScreenPage;
  

  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
       <head>
        <meta name="theme-color" content="#000000" />
       </head>
      <body className={`${poppins.variable} font-body antialiased select-none`}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark", "proudshe", "retrogamer", "custom", "yinyang"]}
          >
            <CustomThemeProvider>
              <EditModeProvider>
                {showHeader && <Header />}
                <main>{children}</main>
                <Toaster />
              </EditModeProvider>
            </CustomThemeProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
