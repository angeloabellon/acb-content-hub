import Header from "./components/Header";
import Footer from "./components/Footer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://casttocast.es"),

  title: "Cast To Cast Baloncesto",
  description:
    "Podcast y tertulias de baloncesto con especial atención al UCAM Murcia CB, CB Jairis, CB Cartagena y Unicaja Málaga.",

  keywords: [
    "baloncesto",
    "UCAM Murcia",
    "ACB",
    "podcast baloncesto",
    "CB Jairis",
    "CB Cartagena",
    "Unicaja Málaga",
    "Basketball Champions League",
  ],

  authors: [{ name: "Cast To Cast Baloncesto" }],

  openGraph: {
    title: "Cast To Cast Baloncesto",
    description: "Tertulias, actualidad y análisis del baloncesto nacional.",
    url: "https://casttocast.es",
    siteName: "Cast To Cast Baloncesto",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Cast To Cast Baloncesto",
      },
    ],
    locale: "es_ES",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Cast To Cast Baloncesto",
    description: "Podcast y tertulias sobre baloncesto nacional y europeo.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="bg-orange-500 text-white text-center text-sm py-2 font-semibold">
          🚧 Sitio web actualmente en fase de construcción y pruebas...
        </div>
        <Header />
        <div className="watermark"></div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
