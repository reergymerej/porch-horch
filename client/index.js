#!/usr/bin/env node

// This is the client.
// IDE's would talk to this and it would talk to the server (via RPC-JSON).

// In reality, the server should already be running.  This would be
// coordinated by the editor.
const child_process = require('child_process')
const path = require('path')

// Again, use spawn to separate Node relationship.  This could be on a remote
// machine for all we care.
const serverPath = path.resolve(__dirname, '../server/index.js')
const server = child_process.spawn(serverPath)

process.stdin.on('data', (data) => {
  // Talk to the server.
  server.stdout.once('data', (data) => {
    process.stdout.write(data)
  })

  server.stdin.write(`LSP-request-placeholder: ${data}`)
})

console.log('client is ready for commands')
