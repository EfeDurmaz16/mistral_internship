import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mistral Memory Chat",
  description: "Minimalist chat interface with Mistral API"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-neutral-100">
        {children}
      </body>
    </html>
  );
}
