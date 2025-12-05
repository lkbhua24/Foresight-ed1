import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "@/contexts/WalletContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import ReactQueryProvider from "@/components/ReactQueryProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <AuthProvider>
            <WalletProvider>
              <div className="flex min-h-screen flex-col">
                <TopNavBar />
                <div className="flex flex-1">
                  <Sidebar />
                  <div className="flex-1 min-h-screen bg-white">
                    {children}
                  </div>
                </div>
              </div>
            </WalletProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
