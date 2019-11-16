#!/usr/bin/env node

// This is the server.
// This will take requests and talk to the tool.

const child_process = require('child_process')
const path = require('path')
const message = require('../message')

const toolCommand = path.resolve(__dirname, '../tool/index.js')
// const toolCommand = "ls"

const runTool = (input, done) => {
  // We're spawning to show that we could work with non-js too.
  const tool = child_process.spawn(toolCommand, [input])

  const chunks = []
  tool.stdout.on('data', (data) => chunks.push(data))
  tool.stderr.on('data', (data) => console.log(data.toString()))
  tool.on('exit', () => {
    const result = Buffer.concat(chunks)
    done(result)
  })
}

process.stdin.on('data', (data) => {
  // I respond to anything.
  const input = data.toString().trim()
  runTool(input, (result) => {
    const m = message(result.toString())
    process.stdout.write(m)
  })
})
