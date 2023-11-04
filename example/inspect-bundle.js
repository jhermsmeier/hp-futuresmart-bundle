#!/usr/bin/env node
const Bundle = require( '../lib/bundle' )
const argv = process.argv.slice( 2 )

async function main() {
  const bdl = new Bundle({ filename: argv[0] })
  try {
    await bdl.open()
    await bdl.readHeader()
    await bdl.readEntries()
    console.log( bdl )
  } finally {
    await bdl.close()
  }
}

main().catch( console.error )
