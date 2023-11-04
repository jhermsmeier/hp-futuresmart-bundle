#!/usr/bin/env node
const Bundle = require( '../lib/bundle' )
const argv = process.argv.slice( 2 )

async function main() {

  const bdl = new Bundle({ path: argv[0] })

  try {
    await bdl.open()
    await bdl.readHeader()
    await bdl.readEntries()
    await bdl.readSignature()
    console.log( bdl )
  } finally {
    await bdl.close()
  }

}

main().catch( console.error )
