import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "MEDIA360 | Unified AI Customer Experience Intelligence",
  description: "Turn fragmented customer feedback into actionable business clarity with MEDIA360.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const isAuthPage = false; // We will handle this by checking the pathname in a client component or using a more robust way. 
  // Actually, I'll just check if the session exists. If it doesn't and middleware is working, it's an auth page.
  
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased overflow-x-hidden`}>
        <SessionProvider session={session}>
          <div className="flex min-h-screen bg-background">
            {session && <Sidebar />}
            <div className={session ? "flex-1 ml-64 flex flex-col min-h-screen" : "flex-1 flex flex-col min-h-screen"}>
              {session && <Topbar />}
              <main className={session ? "flex-1 p-8" : "flex-1"}>
                {children}
              </main>
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
