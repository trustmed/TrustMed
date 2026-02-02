"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

/**
 * Theme Provider wrapper component for application-wide theme management.
 * Wraps the next-themes ThemeProvider to enable dark/light mode theming across the application.
 * 
 * @param {ThemeProviderProps} props - Theme provider configuration props
 * @param {React.ReactNode} props.children - Child components to be wrapped by the theme provider
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
