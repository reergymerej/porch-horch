const standard = (data) => {
  return JSON.stringify(Object.assign({}, {
    jsonrpc: '2.0',
  }, data))
}

const request = (method, params, id) => {
  return standard({
    method,
    params,
    id,
  })
}

const notification = (method, params) => {
  return standard({
    method,
    params,
  })
}

module.exports = {
  notification,
  request,
}
