#!/usr/bin/env node
const Bundle = require( '../lib/bundle' )
const argv = process.argv.slice( 2 )

async function main() {

  const pkg = new Bundle.Package({ path: argv[0] })
  await pkg.open()

  try {
    await pkg.readHeader()
    await pkg.readEntries()
    console.log( pkg )
  } finally {
    await pkg.close()
  }

}

main().catch( console.error )
