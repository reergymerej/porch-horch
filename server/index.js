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

const pendingActions = {}

const clearPendingAction = (id) => {
  const [timeout] = pendingActions[id]
  delete pendingActions[id]
  clearTimeout(timeout)
}

const routes = {
  'initialize': () => notify('initialized'),
  '$/cancelRequest': (message) => {
    const id = message.content.params.id
    // Canceling an action tells it to stop and return what it has so far.  It
    // must still return a result.
    const [, x] = pendingActions[id]
    x()
  }
}

const defaultRoute = (message) => {
  console.log(`no handler for "${message.content.method}"`)
}

const wrapFunction = (m, id) => {
  const method = m.content.method
  const handler = routes[method] || defaultRoute
  return () => {
    handler(m)
    if (id !== undefined) {
      clearPendingAction(id)
    }
  }
}

process.stdin.on('data', (data) => {
  const m = message.parse(data.toString())
  const id = m.content.id
  const x = wrapFunction(m, id)
  const method = m.content.method
  const wait = method === '$/cancelRequest' ? 0 : 1000
  const timeout = setTimeout(() => x(), wait)
  if (id !== undefined) {
    pendingActions[id] = [timeout, x]
  }
})
