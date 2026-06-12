import { createServer, resolveConfig } from 'vitepress'

const mcpPort = Number(process.env.PORT) || 4000

async function main() {
  const root = process.cwd()

  // Resolve configuration for validation
  const config = await resolveConfig(root)
  console.log('📚 VitePress config resolved')
  console.log(`   Source (srcDir): ${config.srcDir}`)

  // Start VitePress server with MCP plugin
  const server = await createServer(root, { port: mcpPort })
  await server.listen()

  console.log('')
  console.log('🚀 Server started on port:')
  console.log(`   http://localhost:${mcpPort}`)
  console.log(`   http://localhost:${mcpPort}/mcp`)
  console.log(`   http://localhost:${mcpPort + 1}/mcp`)
  console.log('')
  console.log('   GET  /              →  302 redirect → https://packages.tools/')
  console.log(`   POST /mcp           →  proxy → MCP server (internal :${mcpPort + 1})`)
  console.log(`   GET  /mcp/__sse     →  proxy → MCP SSE (internal :${mcpPort + 1})`)
  console.log(`   POST /messages      →  proxy → MCP messages (internal :${mcpPort + 1})`)
  console.log('')
  console.log('✅ Ready for deployment on Node.js hosting')

  // Graceful shutdown
  const shutdown = async () => {
    console.log('')
    console.log('🛑 Shutting down servers…')
    await server.close()
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

main().catch((err) => {
  console.error('❌ Error starting:', err)
  process.exit(1)
})
