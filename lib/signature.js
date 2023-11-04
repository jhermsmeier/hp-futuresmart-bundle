class Signature {

  static MARKER_START = '--=</Begin HP Signed File Fingerprint\\>=--'
  static MARKER_END = '--=</End HP Signed File Fingerprint\\>=--'

  constructor() {
    this.fingerprintLength = 0
    this.key = ''
    this.hash = ''
    this.digest = ''
  }

  parse( input ) {

    if( typeof input != 'string' )
      throw new TypeError( 'Signature must be a string' )

    const startOffset = input.indexOf( Signature.MARKER_START )
    if( startOffset == -1 )
      throw new Error( 'Missing signature start marker' )

    const endOffset = input.indexOf( Signature.MARKER_END, startOffset )
    if( endOffset == -1 || endOffset < startOffset )
      throw new Error( 'Missing or invalid signature end marker' )

    var offset = startOffset

    while( offset < endOffset ) {

      let eol = input.indexOf( '\n', offset )
      if( eol == -1 || eol >= endOffset  ) break

      let sep = input.indexOf( ':', offset )
      if( sep == -1 || sep >= endOffset )
        throw new Error( 'Missing field separator in signature' )

      let field = input.substring( offset, sep ).trim().toLowerCase(); offset = sep + 1
      let value = input.substring( offset, eol ).trim(); offset = eol + 1

      switch( field ) {
        case 'fingerprint length': this.fingerprintLength = Number( value ); break
        case 'key': this.key = value; break
        case 'hash': this.hash = value; break
        case 'signature': this.digest = value; break
      }

    }

    return this

  }

  toString() {
    return `${ Signature.MARKER_START }\n` +
      `Fingerprint Length: ${ this.fingerprintLength }\n` +
      `Key: ${ this.key }\n` +
      `Hash: ${ this.hash }\n` +
      `Signature: ${ Buffer.isBuffer( this.digest ) ? this.digest.toString( 'base64' ) : this.digest }\n` +
      `Fingerprint Length: ${ this.fingerprintLength }\n` +
      `${ Signature.MARKER_END }\n`
  }

}

module.exports = Signature
