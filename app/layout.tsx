import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundation Health - Building Healthier Futures",
  description: "Comprehensive healthcare solutions focused on prevention, wellness, and holistic patient care.",
  keywords: "healthcare, wellness, preventive care, patient care, health foundation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
