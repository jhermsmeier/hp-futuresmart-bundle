const fs = require( 'node:fs/promises' )
const path = require( 'node:path' )
const { readUUID, readCString } = require( './data' )
const Version = require( './version' )
const Package = require( './package' )

class Bundle {

  static ID = 1818518121 // 'ibdl' <69 62 64 6c>
  static MIN_HEADER_SIZE = 0x420
  static ENTRY_SIZE = 16

  static Entry = class PackageEntry {

    offset = 0
    length = 0

    read( buffer, offset = 0 ) {
      this.offset = Number( buffer.readBigUInt64LE( offset ) ); offset += 8
      this.length = Number( buffer.readBigUInt64LE( offset ) ); offset += 8
      return offset
    }

  }

  constructor( options ) {

    this._handle = options?.handle ?? null
    this._path = options?.filename ?? null
    this._flags = options?.flags ?? 'r'
    this._mode = options?.mode ?? 0o666

    this.version = new Version()
    this.headerSize = 0
    this.unknown1 = 0
    this.tableEntries = 0
    this.unknown2 = 0
    this.timestamp = new Date()
    this.unknown3 = 0 // Always zero, possibly just a reserved field

    this.release = ''
    this.vendor = ''
    this.name = ''

    this.packages = []

  }

  async open() {
    if( this._handle != null ) return
    this._handle = await fs.open( this._path, this._flags, this._mode )
  }

  async close() {
    if( this._handle == null ) return
    await this._handle.close()
    this._handle = null
  }

  async readHeader() {

    const buffer = Buffer.alloc( Bundle.MIN_HEADER_SIZE )
    await this._handle.read( buffer, 0, buffer.length, 0 )

    var offset = 0

    const magic = buffer.readUInt32LE( offset ); offset += 4
    if( magic != Bundle.ID ) {
      throw new Error( 'Invalid HP firmware bundle' )
    }

    offset = this.version.read( buffer, offset )
    this.headerSize = buffer.readUInt32LE( offset ); offset += 4
    this.unknown1 = buffer.readUInt32LE( offset ); offset += 4

    this.tableEntries = buffer.readUInt32LE( offset ); offset += 4
    this.unknown2 = buffer.readUInt32LE( offset ); offset += 4
    this.timestamp.setTime( buffer.readUInt32LE( offset ) * 1000 ); offset += 4
    this.unknown3 = buffer.readUInt32LE( offset ); offset += 4

    this.release = readCString( buffer, offset ); offset += 0x100
    this.vendor = readCString( buffer, offset ); offset += 0x100
    this.name = readCString( buffer, offset ); offset += 0x100

    return offset

  }

  async readEntries( position = this.headerSize ) {

    const length = Bundle.ENTRY_SIZE * this.tableEntries
    const buffer = Buffer.alloc( length )

    await this._handle.read( buffer, 0, length, position )

    if( this.packages.length > 0 ) this.packages.length = 0

    for( var offset = 0; offset < length; offset += Bundle.ENTRY_SIZE ) {
      const entry = new Bundle.Entry()
      entry.read( buffer, offset )
      this.packages.push( entry )
    }

    return position + offset

  }

  async readSignature() {
    throw new Error( 'Not implemented' )
  }

  _extractDirname() {
    const extname = path.extname( this._path )
    const basename = path.basename( this._path, extname )
    const dirname = path.dirname( this._path )
    return path.join( dirname, this.name || basename )
  }

  /**
   * Extract an HP firmware bundle into a given target directory
   * @param {String} dirname
   * @returns {undefined}
   */
  async extract( dirname ) {

    dirname = dirname || this._extractDirname()

    await fs.mkdir( dirname, { recursive: true })

    for( let entry of this.packages ) {
      let pkg = new Package({
        handle: this._handle,
        offset: entry.offset,
      })
      await pkg.readHeader()
      await pkg.readEntries()
      await pkg.extract( path.join( dirname, pkg.name ) )
    }

  }

}

module.exports = Bundle
