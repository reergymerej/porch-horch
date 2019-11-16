#!/usr/bin/env node

// This is the server.
// This will take requests and talk to the tool.

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

const sendMessage = (message) => {
  process.stdout.write(message)
}

const notify = (method, params) => {
  sendMessage(
    message.stringify(jsonrpc.notification(method, params))
  )
}

process.stdin.on('data', (data) => {
  const m = message.parse(data.toString())
  const method = m.content.method

  switch (method) {
    case 'initialize':
      runTool('hello', (result) => {
        setTimeout(() => {
          notify('???', { message: result })
        }, 3000)
      })
      break

    default:
      console.log(`no handler for "${method}"`)
  }

})
