"use client"

/**
 * Theme Provider for dark/light mode support.
 *
 * Uses next-themes for seamless theme switching with system preference detection.
 */
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ComponentProps } from "react"

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
