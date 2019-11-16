// used to create LSP-compliant message
const message = (content) => {
  return `
Content-Length: ${content.length}

${content}
`
}

module.exports = message
