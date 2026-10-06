import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { CartDrawer, Cursor, Footer, Loader, Nav, SearchOverlay, SmoothScroll } from "@/components/Chrome";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--font-serif", display: "swap" });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "K&F — Define Your Form", template: "%s — K&F" },
  description: "K&F is a contemporary fashion house. Form, function, identity. Campaign 2027.",
};
export const viewport: Viewport = { themeColor: "#0a0a0b", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Loader /><SmoothScroll /><Cursor /><Nav /><CartDrawer /><SearchOverlay />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
