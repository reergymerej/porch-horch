// used to create LSP-compliant message

const os = require('os')

const stringify = (content) => {
  return `
Content-Length: ${content.length}

${content}
`
}

const parse = (string) => {
  const parts = string.split(`${os.EOL}${os.EOL}`)
  const headers = parts[0]
  const content = JSON.parse(parts[1])
  return {
    headers,
    content,
  }
}

module.exports = {
  parse,
  stringify,
}
