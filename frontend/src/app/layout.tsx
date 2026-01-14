import type { Metadata } from "next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ThemeProvider } from "@/components/theme-provider"
import HoverFooter from "@/components/hover-footer"
import { ToastProvider } from "@/components/toast"
import { Comfortaa, Lobster_Two, Julius_Sans_One} from "next/font/google";


export const metadata: Metadata = {
  title: "TaskFlow - Manage Your Tasks",
  description: "Full-stack task management app with JWT authentication and glassmorphic design",
}

const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comortaa",
  weight: ["400", "700"], // only if Outfit supports this range
});
const lobster_two = Lobster_Two({
  subsets: ["latin"],
  variable: "--font-lobster_two",
  weight: ["400", "700"], // only if Outfit supports this range
});
const julius_sans_one = Julius_Sans_One({
  subsets: ["latin"],
  variable: "--font-julius_sans_one",
  weight: ["400", "400"], // only if Outfit supports this range
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
        >
          <ToastProvider>
            <div className="min-h-screen flex flex-col font-brand ">
              <div className={`${lobster_two.variable} antialiased`}>
                <Navigation />
              </div>
              <main className="flex-1 ">
                <body
                  className={` ${comfortaa.variable} antialiased`}
                >
                  {children}
                </body>
              </main>
              <div className={`${lobster_two.variable} antialiased`}>
                <HoverFooter />
              </div>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html >
  )
}
