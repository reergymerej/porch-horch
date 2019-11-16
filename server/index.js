#!/usr/bin/env node

// This is the server.
// This will take requests and talk to the tool.

const os = require('os')
const child_process = require('child_process')
const path = require('path')
const message = require('../message')
const jsonrpc = require('../jsonrpc')



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
    done(result.toString())
  })
}

const notify = (method, params) => {
  process.stdout.write(
    message(jsonrpc.notification(method, params))
  )
}

const parseMessage = (string) => {
  const parts = string.split(`${os.EOL}${os.EOL}`)
  const headers = parts[0]
  const content = JSON.parse(parts[1])
  return {
    headers,
    content,
  }
}

process.stdin.on('data', (data) => {
  const m = parseMessage(data.toString())
  const method = m.content.method

  switch (method) {
    default:
      console.log(`no handler for "${method}"`)
  }

  return
  runTool(input, (result) => {
    notify('???', { message: result })
  })
})
