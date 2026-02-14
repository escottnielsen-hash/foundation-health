import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foundation Health - Destination Healthcare, Reimagined",
  description: "Premium surgical care, regenerative medicine, and wellness programs at exclusive resort destinations across the American West.",
  keywords: "luxury healthcare, destination medicine, orthopedic surgery, regenerative medicine, executive health, stem cell therapy, resort recovery, membership healthcare",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
