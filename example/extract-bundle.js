#!/usr/bin/env node
const path = require( 'node:path' )
const Bundle = require( '../lib/bundle' )
const argv = process.argv.slice( 2 )

async function main() {

  const filename = argv[0]
  const targetDir = argv[1]

  const bdl = new Bundle({ path: filename })

  try {
    await bdl.open()
    await bdl.readHeader()
    await bdl.readEntries()
    await bdl.extract( targetDir )
  } finally {
    await bdl.close()
  }

}

main().catch( console.error )
