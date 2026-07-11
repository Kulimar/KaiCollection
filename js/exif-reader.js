// Minimal pure-JS JPEG EXIF date reader. No dependencies.
// Reads DateTimeOriginal (0x9003) or DateTime (0x0132) from the Exif IFD.
// Returns a "YYYY-MM-DD" string or null if not present/parseable.
// Deliberately does NOT invent a date: any failure/absence resolves to null.

(function (global) {
  function readExifDate(arrayBuffer) {
    try {
      const view = new DataView(arrayBuffer);
      if (view.byteLength < 4 || view.getUint16(0, false) !== 0xFFD8) return null; // not a JPEG

      let offset = 2;
      while (offset < view.byteLength) {
        if (view.getUint8(offset) !== 0xFF) break;
        const marker = view.getUint8(offset + 1);
        if (marker === 0xE1) {
          const exifLength = view.getUint16(offset + 2, false);
          return parseExifSegment(view, offset + 4, exifLength - 2);
        }
        if (marker === 0xDA) break; // start of scan, no more metadata
        offset += 2 + view.getUint16(offset + 2, false);
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  function parseExifSegment(view, start, length) {
    if (view.getUint32(start, false) !== 0x45786966) return null; // "Exif"
    const tiffOffset = start + 6;
    const little = view.getUint16(tiffOffset, false) === 0x4949;
    if (view.getUint16(tiffOffset + 2, little) !== 0x002A) return null;
    const firstIFDOffset = view.getUint32(tiffOffset + 4, little);
    return searchIFDsForDate(view, tiffOffset, tiffOffset + firstIFDOffset, little);
  }

  function searchIFDsForDate(view, tiffOffset, ifdOffset, little) {
    const entryCount = view.getUint16(ifdOffset, little);
    let exifIFDOffset = null;
    let dateTimeValue = null;

    for (let i = 0; i < entryCount; i++) {
      const entryOffset = ifdOffset + 2 + i * 12;
      const tag = view.getUint16(entryOffset, little);
      if (tag === 0x8769) { // Exif IFD pointer
        exifIFDOffset = tiffOffset + view.getUint32(entryOffset + 8, little);
      }
      if (tag === 0x0132 && !dateTimeValue) { // DateTime
        dateTimeValue = readAsciiValue(view, tiffOffset, entryOffset, little);
      }
    }

    if (exifIFDOffset != null) {
      const subCount = view.getUint16(exifIFDOffset, little);
      for (let i = 0; i < subCount; i++) {
        const entryOffset = exifIFDOffset + 2 + i * 12;
        const tag = view.getUint16(entryOffset, little);
        if (tag === 0x9003 || tag === 0x9004) { // DateTimeOriginal / DateTimeDigitized
          const value = readAsciiValue(view, tiffOffset, entryOffset, little);
          if (value) return formatExifDate(value);
        }
      }
    }

    return dateTimeValue ? formatExifDate(dateTimeValue) : null;
  }

  function readAsciiValue(view, tiffOffset, entryOffset, little) {
    const count = view.getUint32(entryOffset + 4, little);
    if (count <= 0) return null;
    const valueOffset = count > 4 ? tiffOffset + view.getUint32(entryOffset + 8, little) : entryOffset + 8;
    let str = '';
    for (let i = 0; i < count - 1; i++) {
      const code = view.getUint8(valueOffset + i);
      if (code === 0) break;
      str += String.fromCharCode(code);
    }
    return str || null;
  }

  function formatExifDate(raw) {
    // EXIF format: "YYYY:MM:DD HH:MM:SS"
    const m = /^(\d{4}):(\d{2}):(\d{2})/.exec(raw);
    if (!m) return null;
    return `${m[1]}-${m[2]}-${m[3]}`;
  }

  global.KaiExif = { readExifDate };
})(window);
