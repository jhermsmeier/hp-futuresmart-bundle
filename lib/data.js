function readUUID( buffer, offset = 0 ) {

  const block1 = buffer[ offset + 3 ] << 24 |
    buffer[ offset + 2 ] << 16 |
    buffer[ offset + 1 ] << 8 |
    buffer[ offset + 0 ] << 0

  const block2 = buffer[ offset + 5 ] << 8 |
    buffer[ offset + 4 ] << 0
  const block3 = buffer[ offset + 7 ] << 8 |
    buffer[ offset + 6 ] << 0
  const block4 = buffer[ offset + 8 ] << 8 |
    buffer[ offset + 9 ] << 0

  const block5 = buffer[ offset + 10 ] << 8 |
    buffer[ offset + 11 ] << 0
  const block6 = buffer[ offset + 12 ] << 24 |
    buffer[ offset + 13 ] << 16 |
    buffer[ offset + 14 ] << 8 |
    buffer[ offset + 15 ] << 0

  const uuid = ( block1 >>> 0 ).toString( 16 ).padStart( 8, '0' ) + '-' +
    ( block2 >>> 0 ).toString( 16 ).padStart( 4, '0' ) + '-' +
    ( block3 >>> 0 ).toString( 16 ).padStart( 4, '0' ) + '-' +
    ( block4 >>> 0 ).toString( 16 ).padStart( 4, '0' ) + '-' +
    ( block5 >>> 0 ).toString( 16 ).padStart( 4, '0' ) +
    ( block6 >>> 0 ).toString( 16 ).padStart( 8, '0' )

  return uuid.toUpperCase()

}

function readCString( buffer, offset = 0, encoding = 'ascii', capacity = 0x100 ) {
  const eod = buffer.indexOf( 0x00, offset )
  if( eod == offset ) return ''
  const end = eod == -1 ? capacity : eod
  return buffer.toString( encoding, offset, end )
}

module.exports.readUUID = readUUID
module.exports.readCString = readCString
