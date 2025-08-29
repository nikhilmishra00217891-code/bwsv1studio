
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/common/ThemeProvider";
import { EditModeProvider } from "@/components/common/EditModeProvider";
import MainLayout from "./MainLayout";
import CustomThemeProvider from "@/components/common/CustomThemeProvider";


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
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={["light", "dark", "proudshe", "retrogamer", "custom", "yinyang"]}
          >
            <CustomThemeProvider>
              <EditModeProvider>
                <MainLayout>
                  {children}
                </MainLayout>
                <Toaster />
              </EditModeProvider>
            </CustomThemeProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
