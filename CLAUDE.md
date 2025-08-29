# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

- `pnpm dev` - Start the development server with Turbopack
- `pnpm build` - Build the application for production with Turbopack
- `pnpm start` - Start the production server

Note: This project uses `pnpm` as the package manager (indicated by `pnpm-lock.yaml`).

## Architecture

This is a Next.js 15.5.2 application with the App Router architecture, set up as a fresh video call playground project. Key architectural details:

### Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript with strict configuration
- **Styling**: Tailwind CSS v4 with custom CSS variables for theming
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Build Tool**: Turbopack enabled for both dev and build

### Project Structure

- Uses the modern App Router (`src/app/` directory)
- Path alias `@/*` maps to `./src/*`
- Standard Next.js layout with root layout in `src/app/layout.tsx`
- Main page component in `src/app/page.tsx` (currently contains Next.js starter template)

### Styling System

- Tailwind CSS with inline theme configuration
- CSS custom properties for theming (`--background`, `--foreground`)
- Dark mode support via `prefers-color-scheme`
- Font variables integrated with Tailwind (`--font-geist-sans`, `--font-geist-mono`)

### Current State

This is a fresh Create Next App installation - the main page still contains the default Next.js welcome template. The project is ready for video call functionality to be built on top of this foundation.
