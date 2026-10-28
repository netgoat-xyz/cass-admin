import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "cal-sans"
import "./globals.css"
import { CasShell } from "@/components/cas-shell"
import { ThemeProvider, themeInitScript, cn } from "@netgoat/ui"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: {
    default: "CAS · NetGoat",
    template: "%s · CAS",
  },
  description: "Central Administrative Service control panel for NetGoat.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={cn(plusJakarta.variable)} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${plusJakarta.className} min-h-svh antialiased`}>
        <ThemeProvider defaultTheme="dark">
          <CasShell>{children}</CasShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
