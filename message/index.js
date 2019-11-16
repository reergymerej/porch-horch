// used to create LSP-compliant message

const getJsonRpc = (data) => {
  return JSON.stringify({
    jsonrpc: '2.0',
    method: '???',
    params: {},
    id: 111,
    result,
  })
}

const message = (content) => {
  return `
Content-Length: ${content.length}

${content}
`
}

module.exports = message
