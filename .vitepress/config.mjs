import { defineConfig } from 'vitepress'
import http from 'node:http'
import { MCPPlugin } from 'vitepress-plugin-mcp'
import toolkitConfig from '../node_modules/toolkit-docs/.vitepress/config.mjs'

const mcpPort = Number(process.env.PORT) || 4000

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // Use toolkit-docs as documentation source
  srcDir: 'node_modules/toolkit-docs',

  // Inherit metadata from toolkit-docs
  title: toolkitConfig.title,
  description: toolkitConfig.description,

  // Extend toolkit-docs themeConfig
  themeConfig: {
    ...toolkitConfig.themeConfig,
    // search.options is REQUIRED by the MCP plugin to work
    search: {
      provider: 'local',
      options: {},
    },
  },

  // MCP Plugin — starts Express+MCP server on the configured port
  vite: {
    plugins: [
      // Redirect root + proxy MCP → TODO on a single port (mcpPort)
      {
        name: 'redirect-and-proxy-mcp',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
              res.writeHead(302, { Location: 'https://packages.tools/' })
              res.end()
              return
            }
            // Proxy MCP routes to the plugin's Express server (mcpPort+1)
            if (req.url.startsWith('/mcp') || req.url.startsWith('/messages')) {
              const proxy = http.request({
                hostname: 'localhost',
                port: mcpPort + 1,
                path: req.url,
                method: req.method,
                headers: req.headers,
              }, (proxyRes) => {
                res.writeHead(proxyRes.statusCode, proxyRes.headers)
                proxyRes.pipe(res)
              })
              proxy.on('error', () => {
                res.statusCode = 502
                res.end('MCP server not ready')
              })
              req.pipe(proxy)
              return
            }
            next()
          })
        },
      },
      MCPPlugin({ port: mcpPort }),
    ],
  },
})
