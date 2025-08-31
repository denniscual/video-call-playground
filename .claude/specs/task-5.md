# Integrate theming in the app

## Plan

- Support light, dark, and system modes
- Use shadcn/ui theming approach
- Theme switcher in top-right of header
- Prevent theme flicker

## Implementation Steps

1. Install `next-themes` package
2. Create ThemeProvider component
3. Wrap root layout with provider + suppressHydrationWarning
4. Add theme toggle component to header

Reference: https://ui.shadcn.com/docs/dark-mode/next
