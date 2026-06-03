import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/Navbar.jsx',
        'src/components/ProtectedRoute.jsx',
        'src/pages/Login.jsx',
        'src/pages/SignUp.jsx',
        'src/pages/ForgotPassword.jsx'
      ],
    }
  }
})
