import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 相对路径：本地预览、GitHub Pages 子路径（/python-data-explorer/）都能直接用
  base: './',
  server: { port: 5173 },
})
