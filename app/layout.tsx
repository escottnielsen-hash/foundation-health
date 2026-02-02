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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
