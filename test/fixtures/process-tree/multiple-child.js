// read the code carefully before launching this with a high number
var spawn = require('child_process').spawn
var p = process.argv[2] || 2

if (!p) {
  return
}

while(p--) {
  let s = spawn('node', [process.argv[1], p], {detached: true})
}

require('./sleep.js')
