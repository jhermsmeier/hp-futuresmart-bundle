const fs = require( 'node:fs' )
const fsp = require( 'node:fs/promises' )
const path = require( 'node:path' )
const crc32 = require( 'cyclic-32' )
const { pipeline } = require( 'node:stream/promises' )
const { readUUID, readCString } = require( './data' )
const File = require( './file' )
const Version = require( './version' )

class Package extends File {

  static ID = 1735094377 // 'ipkg' <69 70 6b 67>
  static HEADER_SIZE = 0x043D
  static ENTRY_SIZE = 0x100 + 8 + 8 + 4

  static Entry = class FileEntry {

    name = ''
    offset = 0
    length = 0
    // NOTE: Probably CRC32 or CRC32C
    checksum = 0

    read( buffer, offset = 0 ) {
      this.name = readCString( buffer, offset ); offset += 0x100
      this.offset = Number( buffer.readBigUInt64LE( offset ) ); offset += 8
      this.length = Number( buffer.readBigUInt64LE( offset ) ); offset += 8
      this.checksum = buffer.readUInt32LE( offset ); offset += 4
      return offset
    }

  }

  constructor( options ) {

    super( options )
    // Package start offset within the file
    this._offset = options?.offset ?? 0

    this.version = new Version()
    this.headerSize = 0
    this.unknown1 = 0
    this.tableEntries = 0
    this.unknown2 = 0
    this.dateCode = new Date()
    this.unknown3 = 0 // Always zero, possibly just a reserved field

    this.release = ''
    this.vendor = ''
    this.name = ''
    // NOTE: This is quite possibly not a UUID at all, but it seems to fit nicely.
    // Otherwise possibly a checksum; which at 16 bytes (128 bits) could be MD5.
    // UPDATE: Tried a bunch of hashes with different parts of the package etc.,
    // but couldn't get anything to match as a checksum / hash with this field.
    // Maybe I was off by a byte somewhere, but so far this doesn't look like a checksum / hash.
    // Could potentially be a signature created with the parent bundle's signing key?
    // UPDATE 2: For E87740_50_60_70_fs5.7_fw_2507052_043290 I found several packages with the same
    // exact values here: 'AsianFonts.ipkg', 'DBLib.ipkg', 'Initramfs.ipkg', 'JDI.ipkg', 'Kaliman.ipkg'.
    // So this is definitely neither a checksum nor a signature, as the package contents differ.
    // UPDATE 3: Same for other packages, e.g. XenonDsip, XenonInitramfs, XenonLinux, XenonRootFs
    // all share the same value here – so this might indeed be the subsystem UUID
    this.uuid = ''

    // NOTE: There's two uint32s in here, one is almost always <7F 00 00 00>,
    // followed by an almost always zero, but sometimes one <01 00 00 00>.
    // Doesn't quite add up to 0x0D though – investigation needed.
    this.unknown4 = Buffer.alloc( 0x0D )
    this.comment = ''

    this.files = []

  }

  async readHeader() {

    const buffer = Buffer.alloc( Package.HEADER_SIZE )
    await this.handle.read( buffer, 0, buffer.length, this._offset + 0 )

    var offset = 0

    const magic = buffer.readUInt32LE( offset ); offset += 4
    if( magic != Package.ID ) {
      throw new Error( 'Invalid HP firmware package' )
    }

    offset = this.version.read( buffer, offset )
    this.headerSize = buffer.readUInt32LE( offset ); offset += 4
    this.unknown1 = buffer.readUInt32LE( offset ); offset += 4

    this.tableEntries = buffer.readUInt32LE( offset ); offset += 4
    this.unknown2 = buffer.readUInt32LE( offset ); offset += 4
    this.dateCode.setTime( buffer.readUInt32LE( offset ) * 1000 ); offset += 4
    this.unknown3 = buffer.readUInt32LE( offset ); offset += 4

    this.release = readCString( buffer, offset ); offset += 0x100
    this.vendor = readCString( buffer, offset ); offset += 0x100
    this.name = readCString( buffer, offset ); offset += 0x100

    this.uuid = readUUID( buffer, offset ); offset += 0x10
    offset += buffer.copy( this.unknown4, 0, offset, offset + this.unknown4.length )
    this.comment = readCString( buffer, offset ); offset += 0x100

    return offset

  }

  async readEntries( position = this.headerSize ) {

    const length = Package.ENTRY_SIZE * this.tableEntries
    const buffer = Buffer.alloc( length )

    await this.handle.read( buffer, 0, length, this._offset + position )

    if( this.files.length > 0 ) this.files.length = 0

    for( var offset = 0; offset < length; offset += Package.ENTRY_SIZE ) {
      let entry = new Package.Entry()
      entry.read( buffer, offset )
      this.files.push( entry )
    }

    return position + offset

  }

  /**
   * Calculate the CRC32 checksum for a given file entry
   * @param {Package.Entry} entry
   * @returns {Number} crc32
   */
  async checksumFile( entry ) {

    const checksum = crc32.createHash()
    const readable = fs.createReadStream( null, {
      fd: this.handle.fd,
      autoClose: false,
      start: this._offset + entry.offset,
      end: this._offset + entry.offset + entry.length - 1,
      encoding: null,
      highWaterMark: 1024 * 1024,
    })

    await pipeline( readable, checksum )

    return checksum.digest().readUInt32BE( 0 )

  }

  /**
   * Extract an HP firmware package into a given target directory
   * @param {String} dirname
   * @returns {undefined}
   */
  async extract( dirname ) {

    await fsp.mkdir( dirname, { recursive: true })

    for( let entry of this.files ) {
      const filename = path.join( dirname, entry.name )
      const readable = fs.createReadStream( null, {
        fd: this.handle.fd,
        autoClose: false,
        start: this._offset + entry.offset,
        end: this._offset + entry.offset + entry.length - 1,
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

module.exports = Package
