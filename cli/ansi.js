class ANSI {

  static style = {
    // reset: [ 0, 0 ],
    bold: [ 1, 22 ],
    dim: [ 2, 22 ],
    italic: [ 3, 23 ],
    underline: [ 4, 24 ],
    overline: [ 53, 55 ],
    inverse: [ 7, 27 ],
    hidden: [ 8, 28 ],
    strike: [ 9, 29 ],
  }

  static color = {
    black: [ 30, 39 ],
    red: [ 31, 39 ],
    green: [ 32, 39 ],
    yellow: [ 33, 39 ],
    blue: [ 34, 39 ],
    magenta: [ 35, 39 ],
    cyan: [ 36, 39 ],
    white: [ 37, 39 ],
  }

  static lightColor = {
    black: [ 90, 39 ],
    red: [ 91, 39 ],
    green: [ 92, 39 ],
    yellow: [ 93, 39 ],
    blue: [ 94, 39 ],
    magenta: [ 95, 39 ],
    cyan: [ 96, 39 ],
    white: [ 97, 39 ],
  }

  static reset() { return `\u001B[0m` }

  static format( style, value ) {
    return `\u001B[${ style[0] }m${ value }\u001B[${ style[1] }m`
  }

  static bold( value ) { return ANSI.format( ANSI.style.bold, value ) }
  static dim( value ) { return ANSI.format( ANSI.style.dim, value ) }
  static italic( value ) { return ANSI.format( ANSI.style.italic, value ) }
  static underline( value ) { return ANSI.format( ANSI.style.underline, value ) }
  static overline( value ) { return ANSI.format( ANSI.style.overline, value ) }
  static inverse( value ) { return ANSI.format( ANSI.style.inverse, value ) }
  static hidden( value ) { return ANSI.format( ANSI.style.hidden, value ) }
  static strike( value ) { return ANSI.format( ANSI.style.strike, value ) }

  static black( value ) { return ANSI.format( ANSI.color.black, value ) }
  static red( value ) { return ANSI.format( ANSI.color.red, value ) }
  static green( value ) { return ANSI.format( ANSI.color.green, value ) }
  static yellow( value ) { return ANSI.format( ANSI.color.yellow, value ) }
  static blue( value ) { return ANSI.format( ANSI.color.blue, value ) }
  static magenta( value ) { return ANSI.format( ANSI.color.magenta, value ) }
  static cyan( value ) { return ANSI.format( ANSI.color.cyan, value ) }
  static white( value ) { return ANSI.format( ANSI.color.white, value ) }

  static gray( value ) { return ANSI.format( ANSI.lightColor.black, value ) }
  static lightRed( value ) { return ANSI.format( ANSI.lightColor.red, value ) }
  static lightGreen( value ) { return ANSI.format( ANSI.lightColor.green, value ) }
  static lightYellow( value ) { return ANSI.format( ANSI.lightColor.yellow, value ) }
  static lightBlue( value ) { return ANSI.format( ANSI.lightColor.blue, value ) }
  static lightMagenta( value ) { return ANSI.format( ANSI.lightColor.magenta, value ) }
  static lightCyan( value ) { return ANSI.format( ANSI.lightColor.cyan, value ) }
  static lightWhite( value ) { return ANSI.format( ANSI.lightColor.white, value ) }

}

module.exports = ANSI
