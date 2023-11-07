#!/usr/bin/env node
const Bundle = require( '../lib/bundle' )
const argv = process.argv.slice( 2 )

async function main() {

  const bdl = new Bundle({ path: argv[0] })
  await bdl.open()

  try {
    await bdl.readHeader()
    await bdl.readEntries()
    await bdl.readSignature()
    console.log( bdl )
  } finally {
    await bdl.close()
  }

}

main().catch( console.error )
