import type { Metadata } from "next";
import imageManifest from "@/lib/image-manifest.json";
import "./globals.css";
import "./design-system.css";
import "./cinematic.css";
import "./home-editorial.css";
import "./shop-editorial.css";
import "./product-editorial.css";
import "./solutions-editorial.css";
import "./about-editorial.css";
import "./contact-editorial.css";
import "./help-editorial.css";
import "./cart-editorial.css";
import "./tracking-editorial.css";
import "./admin-premium.css";
import "./brand-identity.css";
import "./home-sales.css";
import "./category-editorial.css";
import "./brand-calm.css";
import "./shop-simple.css";
import "./product-carousel.css";
import "./footer-premium.css";
import "./product-cards.css";
import "./product-detail.css";
import "./admin-signin.css";
import "./checkout-premium.css";
import localFont from "next/font/local";
const manrope = localFont({
  src: "../public/fonts/manrope.ttf",
  variable: "--font-manrope",
  display: "swap",
});
const editorial = localFont({
  src: "../public/fonts/cormorant-garamond.ttf",
  variable: "--font-editorial",
  display: "swap",
});
import { CartProvider } from "@/components/store/CartProvider";
import { Chrome } from "@/components/store/Chrome";
export const metadata: Metadata = {
  title: {
    default: "Rahat Energy | Energy, Beautifully Engineered",
    template: "%s | Rahat Energy",
  },
  icons: {
    icon: encodeURI(imageManifest["/images/logo.webp"].variants[0].src),
    apple: encodeURI(imageManifest["/images/logo.webp"].variants[1].src),
  },
  description:
    "Explore solar panels, inverters, battery storage and energy accessories with Rahat Energy.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${editorial.variable}`}>
        <CartProvider>
          <Chrome>{children}</Chrome>
        </CartProvider>
      </body>
    </html>
  );
}
