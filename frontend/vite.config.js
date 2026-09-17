import http from 'node:http'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Tomcat's NIO connector will occasionally reject a request with a bare "400 Bad
// Request" (no JSON body from our own error handler) when it reuses a keep-alive
// socket that the dev proxy's default agent pooled from an earlier request — stray
// bytes left on the wire get parsed as the start of the next request line. Forcing a
// fresh connection per proxied request avoids that entirely; see
// https://github.com/http-party/node-http-proxy/issues/1520 for the same failure
// mode against other backends.
const noKeepAliveAgent = new http.Agent({ keepAlive: false })

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8081/saarthi',
        changeOrigin: true,
        agent: noKeepAliveAgent,
      },
    },
  },
})
