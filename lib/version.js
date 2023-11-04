class Version {

  major = 0
  minor = 0

  read( buffer, offset = 0 ) {
    this.major = buffer.readUInt16LE( offset ); offset += 2
    this.minor = buffer.readUInt16LE( offset ); offset += 2
    return offset
  }

  write( buffer, offset = 0 ) {
    offset = buffer.writeUInt16LE( this.major, offset )
    offset = buffer.writeUInt16LE( this.minor, offset )
    return offset
  }

}

module.exports = Version
