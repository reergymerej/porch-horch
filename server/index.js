#!/usr/bin/env node

// This is the server.
// This will take requests and talk to the tool.

const child_process = require('child_process')
const path = require('path')
const toolPath = path.resolve(__dirname, '../tool/index.js')

const runTool = (done) => {
  // We're spawning to show that we could work with non-js too.
  const tool = child_process.spawn(toolPath)

  const chunks = []
  tool.stdout.on('data', (data) => {
    chunks.push(data)
  })

  tool.on('exit', () => {
    const result = Buffer.concat(chunks)
    done(result)
  })
}

process.stdin.on('data', () => {
  // I respond to anything.
  runTool((result) => {
    process.stdout.write(result)
  })
})

console.log('server listening on stdin')
