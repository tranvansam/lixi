/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

const TTS_MAX_LEN = 200

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    legacy(),
    // Proxy TTS qua server (tránh CORS): /api/tts?text=...&lang=vi → audio tiếng Việt
    {
      name: 'tts-proxy',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url?.startsWith('/api/tts')) return next()
          try {
            const u = new URL(req.url, 'http://localhost')
            const text = u.searchParams.get('text')?.trim() || ''
            const lang = u.searchParams.get('lang') || 'vi'
            if (!text || text.length > TTS_MAX_LEN) {
              res.writeHead(400, { 'Content-Type': 'text/plain' })
              res.end('Missing or too long text (max ' + TTS_MAX_LEN + ')')
              return
            }
            const tts = await import('google-tts-api')
            const base64 = await tts.getAudioBase64(text, { lang, timeout: 10000 })
            const buf = Buffer.from(base64, 'base64')
            res.writeHead(200, { 'Content-Type': 'audio/mpeg' })
            res.end(buf)
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end('TTS error')
          }
        })
      }
    }
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/theme/mixins" as *;\n'
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
