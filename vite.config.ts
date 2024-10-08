/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/swtc/",
  build: {chunkSizeWarningLimit: 1600 },
  test: {
    include: ["src/**/*.test.ts"],
  }
})