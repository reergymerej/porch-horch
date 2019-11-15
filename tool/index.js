#!/usr/bin/env node

// This is the "smartness."
// It will communicate as all great programs do, throught text in STDIO.

const input = process.argv[2]
process.stdout.write(`@${Date.now()}
  I heard you say "${input}".
`)
