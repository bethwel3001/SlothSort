import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SlothSort — Do The Work For Me",
  description: "Minimalist, effortless file sorting powered by SlothSort.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#fafafa] text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}
