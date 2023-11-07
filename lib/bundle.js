const fs = require( 'node:fs' )
const fsp = require( 'node:fs/promises' )
const path = require( 'node:path' )
const crc32 = require( 'cyclic-32' )
const { pipeline } = require( 'node:stream/promises' )
const { readUUID, readCString } = require( './data' )
const File = require( './file' )
const Version = require( './version' )
const Package = require( './package' )
const Signature = require( './signature' )

class Bundle extends File {

  static ID = 1818518121 // 'ibdl' <69 62 64 6c>
  static HEADER_SIZE = 2345
  static ENTRY_SIZE = 16

  static Package = Package

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

    super( options )

    this.version = new Version()
    this.headerSize = 0
    this.headerChecksum = 0
    this.tableEntries = 0
    this.tableChecksum = 0
    this.dateCode = new Date()
    this.reserved = 0 // Always zero, possibly just a reserved field

    this.release = ''
    this.vendor = ''
    this.name = ''

    this.unknown1 = 0
    this.unknown2 = 0
    this.unknown3 = 0

    this.futureSmartVersion = ''
    this.modelCode = ''

    this.packages = []
    this.signature = null

  }

  async readHeader() {

    const buffer = Buffer.alloc( Bundle.HEADER_SIZE )
    await this.handle.read( buffer, 0, buffer.length, 0 )

    var offset = 0

    const magic = buffer.readUInt32LE( offset ); offset += 4
    if( magic != Bundle.ID ) {
      throw new Error( 'Invalid HP firmware bundle' )
    }

    offset = this.version.read( buffer, offset )

    this.headerSize = buffer.readUInt32LE( offset ); offset += 4
    this.headerChecksum = buffer.readUInt32LE( offset ); offset += 4

    this.tableEntries = buffer.readUInt32LE( offset ); offset += 4
    this.tableChecksum = buffer.readUInt32LE( offset ); offset += 4
    this.dateCode.setTime( buffer.readUInt32LE( offset ) * 1000 ); offset += 4
    this.reserved = buffer.readUInt32LE( offset ); offset += 4

    this.release = readCString( buffer, offset ); offset += 0x100
    this.vendor = readCString( buffer, offset ); offset += 0x100
    this.name = readCString( buffer, offset ); offset += 0x100

    this.unknown1 = buffer.readUInt8( offset ); offset += 1
    this.unknown2 = buffer.readUInt32LE( offset ); offset += 4
    this.unknown3 = buffer.readUInt32LE( offset ); offset += 4

    this.futureSmartVersion = readCString( buffer, offset ); offset += 0x100
    this.modelCode = readCString( buffer, offset ); offset += 0x100

    // Zero out the header checksum
    buffer.writeUInt32LE( 0x00000000, 0x0C ) // offset = 12
    // Calculate header CRC32
    const headerCrc = crc32( buffer ) >>> 0
    // Put back original value
    buffer.writeUInt32LE( this.headerChecksum, 0x0C )

    if( headerCrc != this.headerChecksum ) {
      throw new Error( 'Invalid bundle header checksum' )
    }

    return offset

  }

  async readEntries( position = this.headerSize ) {

    const length = Bundle.ENTRY_SIZE * this.tableEntries
    const buffer = Buffer.alloc( length )

    await this.handle.read( buffer, 0, length, position )

    if( this.packages.length > 0 ) this.packages.length = 0

    const tableCrc = crc32( buffer ) >>> 0
    if( tableCrc != this.tableChecksum ) {
      throw new Error( 'Invalid file table checksum' )
    }

    for( var offset = 0; offset < length; offset += Bundle.ENTRY_SIZE ) {
      const entry = new Bundle.Entry()
      entry.read( buffer, offset )
      this.packages.push( entry )
    }

    return position + offset

  }

  async readSignature() {

    const lastPkg = this.packages[ this.packages.length - 1 ]
    const eod = lastPkg != null ? lastPkg.offset + lastPkg.length : -1
    const stats = await this.handle.stat()

    if( eod == -1 || eod >= stats.size ) {
      return this.signature = null
    }

    const length = stats.size - eod
    const buffer = Buffer.alloc( length )

    await this.handle.read( buffer, 0, length, eod )
    return this.signature = new Signature().parse( buffer.toString( 'utf8' ) )

  }

  _extractDirname() {
    const extname = path.extname( this.path )
    const basename = path.basename( this.path, extname )
    const dirname = path.dirname( this.path )
    return path.join( dirname, this.name || basename )
  }

  /**
   * Extract an HP firmware bundle into a given target directory
   * @param {String} dirname
   * @returns {undefined}
   */
  async extract( dirname ) {

    dirname = dirname || this._extractDirname()

    await fsp.mkdir( dirname, { recursive: true })

    for( let entry of this.packages ) {
      let pkg = new Package({
        handle: this.handle,
        offset: entry.offset,
      })
      await pkg.readHeader()
      await pkg.readEntries()
      await pkg.extract( path.join( dirname, pkg.name ) )
    }

  }

  async extractPackages( dirname ) {

    dirname = dirname || this._extractDirname()

    await fsp.mkdir( dirname, { recursive: true })

    for( let entry of this.packages ) {

      let pkg = new Package({
        handle: this.handle,
        offset: entry.offset,
      })

      await pkg.readHeader()

      const filename = path.join( dirname, `${ pkg.name }.pkg` )

      const readable = fs.createReadStream( null, {
        fd: this.handle.fd,
        autoClose: false,
        start: entry.offset,
        end: entry.offset + entry.length - 1,
        encoding: null,
        highWaterMark: 1024 * 1024,
      })

      const writable = fs.createWriteStream( filename, {
        encoding: null,
        highWaterMark: 1024 * 1024,
      })

      await pipeline( readable, writable )

    }

  }

}

module.exports = Bundle
