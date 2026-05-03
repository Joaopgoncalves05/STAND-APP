import type { Metadata } from "next";
import { Inter, Roboto, Outfit } from "next/font/google";
import "./globals.css";
import { getTenant } from "@/utils/tenant";
import { CompareProvider } from "@/context/CompareContext";
import { FloatingCompareBar } from "@/components/ui/FloatingCompareBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stand App",
  description: "DMS & Website",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenant = await getTenant();
  
  // Choose font class based on DB
  let fontClass = inter.variable; // Default
  if (tenant?.font_family?.toLowerCase() === 'roboto') fontClass = roboto.variable;
  if (tenant?.font_family?.toLowerCase() === 'outfit') fontClass = outfit.variable;

  const corPrimaria = tenant?.cor_primaria || '#3b82f6';

  return (
    <html
      lang="pt"
      className={`${fontClass} h-full antialiased`}
    >
      <head>
        <style>
          {`:root {
            --color-primary: ${corPrimaria};
          }`}
        </style>
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <CompareProvider>
          {children}
          <FloatingCompareBar />
        </CompareProvider>
      </body>
    </html>
  );
}
