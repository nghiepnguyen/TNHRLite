import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Nếu 5173 bị chiếm dụng, Vite sẽ báo lỗi thay vì đổi sang port khác
  }
})

