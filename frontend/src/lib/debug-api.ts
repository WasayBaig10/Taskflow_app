/**
 * Debug utility to check API key configuration
 * Run this in browser console or import temporarily
 */

export function debugApiKeyConfig() {
  if (typeof window === "undefined") {
    console.log("⚠️ Running on server side")
    return
  }

  console.group("🔑 API Key Configuration Debug")
  console.log("Environment variable (NEXT_PUBLIC_OPENAI_API_KEY):", {
    exists: !!process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    value: process.env.NEXT_PUBLIC_OPENAI_API_KEY?.substring(0, 10) + "...",
    length: process.env.NEXT_PUBLIC_OPENAI_API_KEY?.length || 0,
  })

  console.log("localStorage (openai_api_key):", {
    exists: !!localStorage.getItem("openai_api_key"),
    value: localStorage.getItem("openai_api_key")?.substring(0, 10) + "...",
    length: localStorage.getItem("openai_api_key")?.length || 0,
  })

  const activeKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || localStorage.getItem("openai_api_key")

  console.log("🎯 Active API Key:", {
    source: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? "environment" : "localStorage",
    value: activeKey?.substring(0, 20) + "...",
    length: activeKey?.length || 0,
    isValid: activeKey?.startsWith("sk-"),
  })

  if (activeKey?.includes("place")) {
    console.error("❌ ERROR: Using placeholder key! Clear localStorage:")
    console.error('   localStorage.removeItem("openai_api_key")')
  }

  console.groupEnd()

  return {
    envKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    localStorageKey: localStorage.getItem("openai_api_key"),
    activeKey,
    source: process.env.NEXT_PUBLIC_OPENAI_API_KEY ? "environment" : "localStorage",
  }
}

// Auto-run on import if in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("🐛 Debug: Run debugApiKeyConfig() to check API key configuration")
}