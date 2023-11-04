class bytes {

  static prefix = [
    'q', 'r', 'y', 'z', 'a', 'f', 'p', 'n', 'μ', 'm', '',
    'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y', 'R', 'Q'
  ]

  static format( value, decimals = 1 ) {

    var magnitude = Math.ceil( Math.log10( Math.abs( value ) ) ) - 1

    // Set the magnitude to zero for log10(0), which returns -Infinity
    if( !Number.isFinite( magnitude ) ) magnitude = 0
    // Calculate prefix array index
    var index = Math.floor( magnitude / 3 ) + 10
    // Clamp index to lowest / highest prefix
    index = Math.min( 20, Math.max( 0, index ) )

    // Exponent to scale the value by
    var exponent = ( index - 10 ) * 3
    var symbol = bytes.prefix[ index ]

    // Don't display fractions of a byte
    var number = ( value / 10 ** exponent )
      .toFixed( magnitude == 0 ? 0 : decimals )

    return `${ number } ${ symbol }B`

  }

}

module.exports = bytes
