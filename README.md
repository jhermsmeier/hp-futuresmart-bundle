# HP FutureSmart Firmware Bundle

## CLI

### Install via [npm](https://www.npmjs.com)

```console
npm install --global hp-futuresmart-bundle
```

### CLI Usage

```console
> hp-bdl --help

HP FutureSmart Firmware Bundle Tool

  Usage: hp-bdl [command] [options]

  Options:
    -h, --help ..................... Display this usage help
    -v, --version .................. Print the tool version

  Commands:
    help ........................... Display this usage help
    inspect <path> ................. Show bundle or package information & contents
    extract <path> [target-dir] .... Unpack bundle or package into target directory

  Command Options:
    extract
      -p, --pkg .................... Unpack the bundle into its package files

```

#### Inspecting Bundles & Packages

To inspect / list a firmware bundle's contents, run:

```console
> hp-bdl inspect E87740_50_60_70_fs5.7_fw_2507052_043290.bdl

Bundle Name: HP Color LaserJet MFP E877, E87740, E87750, E87760, E87770
Release: 2507052_043290
Vendor: HP

FutureSmart Version: 5.7
Model Code: 6D6664-0045

File Format Version: 1.1
Date Code: 23 Sept 2023, 08:00:00 CEST

Signing Key: TestDEV-Key-IPG-RD
Hash: sha256
Signature: BIZaSwAQou7JVUzw5jrnlq97bApw87wA/FZUTm611m84eHsYYA6yVkU6twn+t2S6JW4mOdkLP0eAnSt2ZU/L0L++dwVdRTqDgNk2OgfbvR4eNNP0kkr/xpxJmH3o8tDSYOGF+xv7bsfQAVQ/z/U33ITDe0s/7jnQQuyn7I2C/fy+rM75leYbGboJ0m3n3ePzTCd+7Qm+K6375wpT4LckTt/OKEPr0pbxCbdCh4JTLP9BS9i27D1V5RwWyk1Uik+aIU8OHlPtpVd5Zvexs07U5YtQrlaGVHHq6PnmCMlfLDXQKrjI+6jWZXaSPz38M0CLzUf6GN9tMDOWCR5kkq0Ncg==

Packages:

  AsianFonts VMPS_BUILD_2.0.2507052.14662.md5_FC6D4FBC (HP) – 33.5 MB
   ├┄┄ asianfonts.sq – 33.2 MB
   ├┄┄ asianfonts.conf – 47.0 B
   ├┄┄ asianfonts.sq.hashtree – 270.3 kB
   ├┄┄ asianfonts.sq.roothash – 64.0 B
   ├┄┄ asianfonts.sq.roothash.sig – 5.0 kB
   └┄┄ asianfonts.conf.sig – 5.0 kB

  BIOS BIOS_TRON_release.25R_2507002 (HP) – 18.9 MB
   ├┄┄ BootFwUpdate.efi – 52.6 kB
   ├┄┄ LogoInstaller.efi – 48.5 kB
   ├┄┄ installers.list – 35.0 B
...
```

For packages:

```console
> hp-bdl inspect XenonDsip.pkg

Package Name: XenonDsip
Release: 20230623_1953.25R_SYNC_2507001
Vendor: HP
Subsystem: 6AA8B514-F5BA-4D70-B758-80D278FB8FC5

File Format Version: 1.3
Date Code: 24 Jun 2023, 08:00:00 CEST

Size: 2.8 MB
Files:

 ├┄┄ dsip.sq – 2.8 MB
 ├┄┄ dsip.sq.hashtree – 32.8 kB
 ├┄┄ dsip.sq.roothash – 64.0 B
 ├┄┄ dsip.sq.roothash.sig – 5.0 kB
 ├┄┄ dsip.conf – 53.0 B
 └┄┄ dsip.conf.sig – 5.0 kB
```

#### Extracting a Bundle

##### Fully unpack a firmware bundle:

```console
hp-bdl extract firmware.bdl /path/to/unpack/into
```

This will result in the following directory structure in the target directory:

```
Target Directory
  ├── Package Name 1
  │   ├── File 1
  │   ├── File 2
  │   └── File N
  ├── Package Name 2
  │   ├── File 1
  │   ├── File 2
  │   └── File N
  └── Package Name N
      ├── File 1
      ├── File 2
      └── File N
```

##### Partially unpack a bundle into its packages:

```console
hp-bdl extract --pkg firmware.bdl /path/to/unpack/into
```

This will result in the following directory structure in the target directory:

```
Target Directory
  ├── Package Name 1.pkg
  ├── Package Name 2.pkg
  └── Package Name N.pkg
```

## Library

### Install via [npm](https://www.npmjs.com)

```console
npm install --save hp-futuresmart-bundle
```

### Usage Examples

Complete, runnable examples can be found in the `/examples` directory.

```js
const Bundle = require( 'hp-futuresmart-bundle' )
```

#### Reading a Bundle

```js
const bdl = new Bundle({ path: '/path/to/firmware.bdl' })
await bdl.open()

try {
  await bdl.readHeader()
  await bdl.readEntries()
  await bdl.readSignature()
  console.log( bdl )
} finally {
  await bdl.close()
}
```

```output
Bundle {
  version: Version { major: 1, minor: 1 },
  headerSize: 2345,
  headerChecksum: 2976076565,
  tableEntries: 18,
  tableChecksum: 2650956131,
  dateCode: 2023-08-09T06:00:00.000Z,
  reserved: 0,
  release: '2507050_043083',
  vendor: 'Hewlett-Packard',
  name: 'HP Color LaserJet MFP E77422, E77428',
  unknown1: 0,
  unknown2: 3,
  unknown3: 0,
  futureSmartVersion: '5.7',
  modelCode: '6D6664-0025',
  packages: [
    PackageEntry { offset: 2633, length: 23353377 },
    PackageEntry { offset: 23356010, length: 1322540 },
    PackageEntry { offset: 24678550, length: 200051527 },
    PackageEntry { offset: 224730077, length: 197740890 },
    PackageEntry { offset: 422470967, length: 33592 },
    PackageEntry { offset: 422504559, length: 23761 },
    PackageEntry { offset: 422528320, length: 6758996 },
    PackageEntry { offset: 429287316, length: 23802593 },
    PackageEntry { offset: 453089909, length: 49159423 },
    PackageEntry { offset: 502249332, length: 66897 },
    PackageEntry { offset: 502316229, length: 715030 },
    PackageEntry { offset: 503031259, length: 368200 },
    PackageEntry { offset: 503399459, length: 14445557 },
    PackageEntry { offset: 517845016, length: 84968845 },
    PackageEntry { offset: 602813861, length: 408526839 },
    PackageEntry { offset: 1011340700, length: 263505 },
    PackageEntry { offset: 1011604205, length: 36593 },
    PackageEntry { offset: 1011640798, length: 32525181 }
  ],
  signature: Signature {
    fingerprintLength: 531,
    key: 'TestDEV-Key-IPG-RD',
    hash: 'sha256',
    digest: 'LzEG9QKpYaYxxjcBb83dhTLsoRv1KW/BK44Nmo7RYvt1aePu+6Z+TC9BZ22LJ0VbomnzhachWhHDXhw0CG8Pbw1HXEQ29RoYMlpTTD3090+V63JpmntD0eShkH3GaFLqHngwv5ZCBe6ZRWVFMNubWkp/R/cyL/aA4fPSmk0ecFog+amrE8QIhVwVLjY+uGrCDmNkr7zYkWZ1fP2KSinjcz7qA/nH6YAqI+lBA5n7+hMh8IZLMq9p0WWPwLKGuNXluo+pFt0VX2dSKtAMjPCj0WFCY0zqjWz4tk5BOieRFGip8iPbl4o4vOuvOaO1regOegF09hSA6YuSr3hD6ziYyA=='
  }
}
```

#### Reading a Package

```js
const pkg = new Bundle.Package({ path: '/path/to/firmware.pkg' })
await pkg.open()

try {
  await pkg.readHeader()
  await pkg.readEntries()
  console.log( pkg )
} finally {
  await pkg.close()
}
```

```output
Package {
  version: Version { major: 1, minor: 3 },
  headerSize: 1085,
  headerChecksum: 79671442,
  tableEntries: 6,
  tableChecksum: 2801338791,
  dateCode: 2023-06-24T06:00:00.000Z,
  reserved: 0,
  release: '20230623_1953.25R_SYNC_2507001',
  vendor: 'HP',
  name: 'XenonDsip',
  uuid: '6AA8B514-F5BA-4D70-B758-80D278FB8FC5',
  unknown: <Buffer 7f 00 00 00 00 00 00 00 00 00 00 00 00>,
  comment: '',
  files: [
    FileEntry {
      name: 'dsip.sq',
      offset: 2741,
      length: 2781184,
      checksum: 1445817618
    },
    FileEntry {
      name: 'dsip.sq.hashtree',
      offset: 2783925,
      length: 32768,
      checksum: 1702383250
    },
    FileEntry {
      name: 'dsip.sq.roothash',
      offset: 2816693,
      length: 64,
      checksum: 346933375
    },
    FileEntry {
      name: 'dsip.sq.roothash.sig',
      offset: 2816757,
      length: 4951,
      checksum: 3270975769
    },
    FileEntry {
      name: 'dsip.conf',
      offset: 2821708,
      length: 53,
      checksum: 3335544639
    },
    FileEntry {
      name: 'dsip.conf.sig',
      offset: 2821761,
      length: 4951,
      checksum: 4169081344
    }
  ]
}
```
