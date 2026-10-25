import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SlothSort",
  description: "Minimalist, effortless file sorting powered by SlothSort.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🦥</text></svg>',
  },
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
