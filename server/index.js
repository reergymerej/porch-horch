#!/usr/bin/env node

// This is the server.
// This will take requests and talk to the tool.

const child_process = require('child_process')
const path = require('path')
const toolPath = path.resolve(__dirname, '../tool/index.js')

const runTool = (input, done) => {
  // We're spawning to show that we could work with non-js too.
  const tool = child_process.spawn(toolPath, [input])

  const chunks = []
  tool.stdout.on('data', (data) => {
    chunks.push(data)
  })

  tool.on('exit', () => {
    const result = Buffer.concat(chunks)
    done(result)
  })
}

process.stdin.on('data', (data) => {
  // I respond to anything.
  const input = data.toString().trim()
  runTool(input, (result) => {
    process.stdout.write(result)
  })
})
