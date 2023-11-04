const fsp = require( 'node:fs/promises' )
const path = require( 'path' )

class File {

  #handle = null
  #path = null
  #flags = 'r'
  #mode = 0o666

  constructor( options ) {
    this.#handle = options?.handle ?? this.#handle
    this.#path = options?.path ?? this.#path
    this.#flags = options?.flags ?? this.#flags
    this.#mode = options?.mode ?? this.#mode
  }

  get handle() { return this.#handle }
  get path() { return this.#path }
  get flags() { return this.#flags }
  get mode() { return this.#mode }

  set handle( value ) { this.#handle = value }
  set path( value ) { this.#path = value }
  set flags( value ) { this.#flags = value }
  set mode( value ) { this.#mode = value }

  async open() {
    if( this.#handle != null ) return
    this.#handle = await fsp.open(
      this.#path,
      this.#flags,
      this.#mode
    )
  }

  async close() {
    if( this.#handle == null ) return
    await this.#handle.close()
    this.#handle = null
  }

}

module.exports = File
