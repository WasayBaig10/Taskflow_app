import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import HoverFooter from "@/components/hover-footer"

export const metadata: Metadata = {
  title: "TaskFlow - Manage Your Tasks",
  description: "Full-stack task management app with JWT authentication",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <HoverFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
