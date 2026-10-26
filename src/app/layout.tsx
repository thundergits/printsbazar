import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PrintsBazar — Custom Gifts, Photo Prints & Signage",
    template: "%s | PrintsBazar",
  },
  description:
    "Shop custom acrylic photo prints, name plates, keychains, photo albums and more. Gifts change, memories remain — delivered across India.",
  keywords: ["custom gifts", "personalized gifts", "acrylic photo prints", "name plates", "keychains", "India"],
  openGraph: {
    siteName: "PrintsBazar",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
