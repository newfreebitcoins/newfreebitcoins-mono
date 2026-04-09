var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));

// node_modules/base64-js/index.js
var require_base64_js = __commonJS({
  "node_modules/base64-js/index.js"(exports) {
    "use strict";
    exports.byteLength = byteLength;
    exports.toByteArray = toByteArray;
    exports.fromByteArray = fromByteArray;
    var lookup = [];
    var revLookup = [];
    var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
    var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }
    var i;
    var len;
    revLookup["-".charCodeAt(0)] = 62;
    revLookup["_".charCodeAt(0)] = 63;
    function getLens(b64) {
      var len2 = b64.length;
      if (len2 % 4 > 0) {
        throw new Error("Invalid string. Length must be a multiple of 4");
      }
      var validLen = b64.indexOf("=");
      if (validLen === -1) validLen = len2;
      var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
      return [validLen, placeHoldersLen];
    }
    function byteLength(b64) {
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function _byteLength(b64, validLen, placeHoldersLen) {
      return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
    }
    function toByteArray(b64) {
      var tmp;
      var lens = getLens(b64);
      var validLen = lens[0];
      var placeHoldersLen = lens[1];
      var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
      var curByte = 0;
      var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
      var i2;
      for (i2 = 0; i2 < len2; i2 += 4) {
        tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
        arr[curByte++] = tmp >> 16 & 255;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 2) {
        tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
        arr[curByte++] = tmp & 255;
      }
      if (placeHoldersLen === 1) {
        tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
        arr[curByte++] = tmp >> 8 & 255;
        arr[curByte++] = tmp & 255;
      }
      return arr;
    }
    function tripletToBase64(num) {
      return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
    }
    function encodeChunk(uint8, start, end) {
      var tmp;
      var output = [];
      for (var i2 = start; i2 < end; i2 += 3) {
        tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
        output.push(tripletToBase64(tmp));
      }
      return output.join("");
    }
    function fromByteArray(uint8) {
      var tmp;
      var len2 = uint8.length;
      var extraBytes = len2 % 3;
      var parts = [];
      var maxChunkLength = 16383;
      for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
        parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
      }
      if (extraBytes === 1) {
        tmp = uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
        );
      } else if (extraBytes === 2) {
        tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
        parts.push(
          lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
        );
      }
      return parts.join("");
    }
  }
});

// node_modules/ieee754/index.js
var require_ieee754 = __commonJS({
  "node_modules/ieee754/index.js"(exports) {
    exports.read = function(buffer, offset, isLE, mLen, nBytes) {
      var e, m;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var nBits = -7;
      var i = isLE ? nBytes - 1 : 0;
      var d = isLE ? -1 : 1;
      var s = buffer[offset + i];
      i += d;
      e = s & (1 << -nBits) - 1;
      s >>= -nBits;
      nBits += eLen;
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      m = e & (1 << -nBits) - 1;
      e >>= -nBits;
      nBits += mLen;
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }
      if (e === 0) {
        e = 1 - eBias;
      } else if (e === eMax) {
        return m ? NaN : (s ? -1 : 1) * Infinity;
      } else {
        m = m + Math.pow(2, mLen);
        e = e - eBias;
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
    };
    exports.write = function(buffer, value2, offset, isLE, mLen, nBytes) {
      var e, m, c;
      var eLen = nBytes * 8 - mLen - 1;
      var eMax = (1 << eLen) - 1;
      var eBias = eMax >> 1;
      var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
      var i = isLE ? 0 : nBytes - 1;
      var d = isLE ? 1 : -1;
      var s = value2 < 0 || value2 === 0 && 1 / value2 < 0 ? 1 : 0;
      value2 = Math.abs(value2);
      if (isNaN(value2) || value2 === Infinity) {
        m = isNaN(value2) ? 1 : 0;
        e = eMax;
      } else {
        e = Math.floor(Math.log(value2) / Math.LN2);
        if (value2 * (c = Math.pow(2, -e)) < 1) {
          e--;
          c *= 2;
        }
        if (e + eBias >= 1) {
          value2 += rt / c;
        } else {
          value2 += rt * Math.pow(2, 1 - eBias);
        }
        if (value2 * c >= 2) {
          e++;
          c /= 2;
        }
        if (e + eBias >= eMax) {
          m = 0;
          e = eMax;
        } else if (e + eBias >= 1) {
          m = (value2 * c - 1) * Math.pow(2, mLen);
          e = e + eBias;
        } else {
          m = value2 * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
          e = 0;
        }
      }
      for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
      }
      e = e << mLen | m;
      eLen += mLen;
      for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
      }
      buffer[offset + i - d] |= s * 128;
    };
  }
});

// apps/frontend/node_modules/buffer/index.js
var require_buffer = __commonJS({
  "apps/frontend/node_modules/buffer/index.js"(exports) {
    "use strict";
    var base64 = require_base64_js();
    var ieee754 = require_ieee754();
    var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
    exports.Buffer = Buffer3;
    exports.SlowBuffer = SlowBuffer;
    exports.INSPECT_MAX_BYTES = 50;
    var K_MAX_LENGTH = 2147483647;
    exports.kMaxLength = K_MAX_LENGTH;
    Buffer3.TYPED_ARRAY_SUPPORT = typedArraySupport();
    if (!Buffer3.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
      console.error(
        "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
      );
    }
    function typedArraySupport() {
      try {
        const arr = new Uint8Array(1);
        const proto = { foo: function() {
          return 42;
        } };
        Object.setPrototypeOf(proto, Uint8Array.prototype);
        Object.setPrototypeOf(arr, proto);
        return arr.foo() === 42;
      } catch (e) {
        return false;
      }
    }
    Object.defineProperty(Buffer3.prototype, "parent", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this)) return void 0;
        return this.buffer;
      }
    });
    Object.defineProperty(Buffer3.prototype, "offset", {
      enumerable: true,
      get: function() {
        if (!Buffer3.isBuffer(this)) return void 0;
        return this.byteOffset;
      }
    });
    function createBuffer(length2) {
      if (length2 > K_MAX_LENGTH) {
        throw new RangeError('The value "' + length2 + '" is invalid for option "size"');
      }
      const buf = new Uint8Array(length2);
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    function Buffer3(arg, encodingOrOffset, length2) {
      if (typeof arg === "number") {
        if (typeof encodingOrOffset === "string") {
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        }
        return allocUnsafe(arg);
      }
      return from(arg, encodingOrOffset, length2);
    }
    Buffer3.poolSize = 8192;
    function from(value2, encodingOrOffset, length2) {
      if (typeof value2 === "string") {
        return fromString(value2, encodingOrOffset);
      }
      if (ArrayBuffer.isView(value2)) {
        return fromArrayView(value2);
      }
      if (value2 == null) {
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value2
        );
      }
      if (isInstance(value2, ArrayBuffer) || value2 && isInstance(value2.buffer, ArrayBuffer)) {
        return fromArrayBuffer(value2, encodingOrOffset, length2);
      }
      if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value2, SharedArrayBuffer) || value2 && isInstance(value2.buffer, SharedArrayBuffer))) {
        return fromArrayBuffer(value2, encodingOrOffset, length2);
      }
      if (typeof value2 === "number") {
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      }
      const valueOf = value2.valueOf && value2.valueOf();
      if (valueOf != null && valueOf !== value2) {
        return Buffer3.from(valueOf, encodingOrOffset, length2);
      }
      const b = fromObject(value2);
      if (b) return b;
      if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value2[Symbol.toPrimitive] === "function") {
        return Buffer3.from(value2[Symbol.toPrimitive]("string"), encodingOrOffset, length2);
      }
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value2
      );
    }
    Buffer3.from = function(value2, encodingOrOffset, length2) {
      return from(value2, encodingOrOffset, length2);
    };
    Object.setPrototypeOf(Buffer3.prototype, Uint8Array.prototype);
    Object.setPrototypeOf(Buffer3, Uint8Array);
    function assertSize(size) {
      if (typeof size !== "number") {
        throw new TypeError('"size" argument must be of type number');
      } else if (size < 0) {
        throw new RangeError('The value "' + size + '" is invalid for option "size"');
      }
    }
    function alloc(size, fill, encoding) {
      assertSize(size);
      if (size <= 0) {
        return createBuffer(size);
      }
      if (fill !== void 0) {
        return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
      }
      return createBuffer(size);
    }
    Buffer3.alloc = function(size, fill, encoding) {
      return alloc(size, fill, encoding);
    };
    function allocUnsafe(size) {
      assertSize(size);
      return createBuffer(size < 0 ? 0 : checked(size) | 0);
    }
    Buffer3.allocUnsafe = function(size) {
      return allocUnsafe(size);
    };
    Buffer3.allocUnsafeSlow = function(size) {
      return allocUnsafe(size);
    };
    function fromString(string2, encoding) {
      if (typeof encoding !== "string" || encoding === "") {
        encoding = "utf8";
      }
      if (!Buffer3.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      const length2 = byteLength(string2, encoding) | 0;
      let buf = createBuffer(length2);
      const actual = buf.write(string2, encoding);
      if (actual !== length2) {
        buf = buf.slice(0, actual);
      }
      return buf;
    }
    function fromArrayLike(array2) {
      const length2 = array2.length < 0 ? 0 : checked(array2.length) | 0;
      const buf = createBuffer(length2);
      for (let i = 0; i < length2; i += 1) {
        buf[i] = array2[i] & 255;
      }
      return buf;
    }
    function fromArrayView(arrayView) {
      if (isInstance(arrayView, Uint8Array)) {
        const copy = new Uint8Array(arrayView);
        return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
      }
      return fromArrayLike(arrayView);
    }
    function fromArrayBuffer(array2, byteOffset, length2) {
      if (byteOffset < 0 || array2.byteLength < byteOffset) {
        throw new RangeError('"offset" is outside of buffer bounds');
      }
      if (array2.byteLength < byteOffset + (length2 || 0)) {
        throw new RangeError('"length" is outside of buffer bounds');
      }
      let buf;
      if (byteOffset === void 0 && length2 === void 0) {
        buf = new Uint8Array(array2);
      } else if (length2 === void 0) {
        buf = new Uint8Array(array2, byteOffset);
      } else {
        buf = new Uint8Array(array2, byteOffset, length2);
      }
      Object.setPrototypeOf(buf, Buffer3.prototype);
      return buf;
    }
    function fromObject(obj) {
      if (Buffer3.isBuffer(obj)) {
        const len = checked(obj.length) | 0;
        const buf = createBuffer(len);
        if (buf.length === 0) {
          return buf;
        }
        obj.copy(buf, 0, 0, len);
        return buf;
      }
      if (obj.length !== void 0) {
        if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }
      if (obj.type === "Buffer" && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }
    function checked(length2) {
      if (length2 >= K_MAX_LENGTH) {
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
      }
      return length2 | 0;
    }
    function SlowBuffer(length2) {
      if (+length2 != length2) {
        length2 = 0;
      }
      return Buffer3.alloc(+length2);
    }
    Buffer3.isBuffer = function isBuffer(b) {
      return b != null && b._isBuffer === true && b !== Buffer3.prototype;
    };
    Buffer3.compare = function compare2(a, b) {
      if (isInstance(a, Uint8Array)) a = Buffer3.from(a, a.offset, a.byteLength);
      if (isInstance(b, Uint8Array)) b = Buffer3.from(b, b.offset, b.byteLength);
      if (!Buffer3.isBuffer(a) || !Buffer3.isBuffer(b)) {
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      }
      if (a === b) return 0;
      let x = a.length;
      let y = b.length;
      for (let i = 0, len = Math.min(x, y); i < len; ++i) {
        if (a[i] !== b[i]) {
          x = a[i];
          y = b[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    Buffer3.isEncoding = function isEncoding(encoding) {
      switch (String(encoding).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return true;
        default:
          return false;
      }
    };
    Buffer3.concat = function concat2(list, length2) {
      if (!Array.isArray(list)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      if (list.length === 0) {
        return Buffer3.alloc(0);
      }
      let i;
      if (length2 === void 0) {
        length2 = 0;
        for (i = 0; i < list.length; ++i) {
          length2 += list[i].length;
        }
      }
      const buffer = Buffer3.allocUnsafe(length2);
      let pos = 0;
      for (i = 0; i < list.length; ++i) {
        let buf = list[i];
        if (isInstance(buf, Uint8Array)) {
          if (pos + buf.length > buffer.length) {
            if (!Buffer3.isBuffer(buf)) buf = Buffer3.from(buf);
            buf.copy(buffer, pos);
          } else {
            Uint8Array.prototype.set.call(
              buffer,
              buf,
              pos
            );
          }
        } else if (!Buffer3.isBuffer(buf)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        } else {
          buf.copy(buffer, pos);
        }
        pos += buf.length;
      }
      return buffer;
    };
    function byteLength(string2, encoding) {
      if (Buffer3.isBuffer(string2)) {
        return string2.length;
      }
      if (ArrayBuffer.isView(string2) || isInstance(string2, ArrayBuffer)) {
        return string2.byteLength;
      }
      if (typeof string2 !== "string") {
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string2
        );
      }
      const len = string2.length;
      const mustMatch = arguments.length > 2 && arguments[2] === true;
      if (!mustMatch && len === 0) return 0;
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "ascii":
          case "latin1":
          case "binary":
            return len;
          case "utf8":
          case "utf-8":
            return utf8ToBytes3(string2).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return len * 2;
          case "hex":
            return len >>> 1;
          case "base64":
            return base64ToBytes2(string2).length;
          default:
            if (loweredCase) {
              return mustMatch ? -1 : utf8ToBytes3(string2).length;
            }
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer3.byteLength = byteLength;
    function slowToString(encoding, start, end) {
      let loweredCase = false;
      if (start === void 0 || start < 0) {
        start = 0;
      }
      if (start > this.length) {
        return "";
      }
      if (end === void 0 || end > this.length) {
        end = this.length;
      }
      if (end <= 0) {
        return "";
      }
      end >>>= 0;
      start >>>= 0;
      if (end <= start) {
        return "";
      }
      if (!encoding) encoding = "utf8";
      while (true) {
        switch (encoding) {
          case "hex":
            return hexSlice(this, start, end);
          case "utf8":
          case "utf-8":
            return utf8Slice(this, start, end);
          case "ascii":
            return asciiSlice(this, start, end);
          case "latin1":
          case "binary":
            return latin1Slice(this, start, end);
          case "base64":
            return base64Slice(this, start, end);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return utf16leSlice(this, start, end);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = (encoding + "").toLowerCase();
            loweredCase = true;
        }
      }
    }
    Buffer3.prototype._isBuffer = true;
    function swap(b, n, m) {
      const i = b[n];
      b[n] = b[m];
      b[m] = i;
    }
    Buffer3.prototype.swap16 = function swap16() {
      const len = this.length;
      if (len % 2 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      }
      for (let i = 0; i < len; i += 2) {
        swap(this, i, i + 1);
      }
      return this;
    };
    Buffer3.prototype.swap32 = function swap32() {
      const len = this.length;
      if (len % 4 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      }
      for (let i = 0; i < len; i += 4) {
        swap(this, i, i + 3);
        swap(this, i + 1, i + 2);
      }
      return this;
    };
    Buffer3.prototype.swap64 = function swap64() {
      const len = this.length;
      if (len % 8 !== 0) {
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      }
      for (let i = 0; i < len; i += 8) {
        swap(this, i, i + 7);
        swap(this, i + 1, i + 6);
        swap(this, i + 2, i + 5);
        swap(this, i + 3, i + 4);
      }
      return this;
    };
    Buffer3.prototype.toString = function toString() {
      const length2 = this.length;
      if (length2 === 0) return "";
      if (arguments.length === 0) return utf8Slice(this, 0, length2);
      return slowToString.apply(this, arguments);
    };
    Buffer3.prototype.toLocaleString = Buffer3.prototype.toString;
    Buffer3.prototype.equals = function equals(b) {
      if (!Buffer3.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
      if (this === b) return true;
      return Buffer3.compare(this, b) === 0;
    };
    Buffer3.prototype.inspect = function inspect() {
      let str = "";
      const max = exports.INSPECT_MAX_BYTES;
      str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
      if (this.length > max) str += " ... ";
      return "<Buffer " + str + ">";
    };
    if (customInspectSymbol) {
      Buffer3.prototype[customInspectSymbol] = Buffer3.prototype.inspect;
    }
    Buffer3.prototype.compare = function compare2(target, start, end, thisStart, thisEnd) {
      if (isInstance(target, Uint8Array)) {
        target = Buffer3.from(target, target.offset, target.byteLength);
      }
      if (!Buffer3.isBuffer(target)) {
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
        );
      }
      if (start === void 0) {
        start = 0;
      }
      if (end === void 0) {
        end = target ? target.length : 0;
      }
      if (thisStart === void 0) {
        thisStart = 0;
      }
      if (thisEnd === void 0) {
        thisEnd = this.length;
      }
      if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
        throw new RangeError("out of range index");
      }
      if (thisStart >= thisEnd && start >= end) {
        return 0;
      }
      if (thisStart >= thisEnd) {
        return -1;
      }
      if (start >= end) {
        return 1;
      }
      start >>>= 0;
      end >>>= 0;
      thisStart >>>= 0;
      thisEnd >>>= 0;
      if (this === target) return 0;
      let x = thisEnd - thisStart;
      let y = end - start;
      const len = Math.min(x, y);
      const thisCopy = this.slice(thisStart, thisEnd);
      const targetCopy = target.slice(start, end);
      for (let i = 0; i < len; ++i) {
        if (thisCopy[i] !== targetCopy[i]) {
          x = thisCopy[i];
          y = targetCopy[i];
          break;
        }
      }
      if (x < y) return -1;
      if (y < x) return 1;
      return 0;
    };
    function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
      if (buffer.length === 0) return -1;
      if (typeof byteOffset === "string") {
        encoding = byteOffset;
        byteOffset = 0;
      } else if (byteOffset > 2147483647) {
        byteOffset = 2147483647;
      } else if (byteOffset < -2147483648) {
        byteOffset = -2147483648;
      }
      byteOffset = +byteOffset;
      if (numberIsNaN(byteOffset)) {
        byteOffset = dir ? 0 : buffer.length - 1;
      }
      if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
      if (byteOffset >= buffer.length) {
        if (dir) return -1;
        else byteOffset = buffer.length - 1;
      } else if (byteOffset < 0) {
        if (dir) byteOffset = 0;
        else return -1;
      }
      if (typeof val === "string") {
        val = Buffer3.from(val, encoding);
      }
      if (Buffer3.isBuffer(val)) {
        if (val.length === 0) {
          return -1;
        }
        return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
      } else if (typeof val === "number") {
        val = val & 255;
        if (typeof Uint8Array.prototype.indexOf === "function") {
          if (dir) {
            return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
          } else {
            return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
          }
        }
        return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
      }
      throw new TypeError("val must be string, number or Buffer");
    }
    function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
      let indexSize = 1;
      let arrLength = arr.length;
      let valLength = val.length;
      if (encoding !== void 0) {
        encoding = String(encoding).toLowerCase();
        if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
          if (arr.length < 2 || val.length < 2) {
            return -1;
          }
          indexSize = 2;
          arrLength /= 2;
          valLength /= 2;
          byteOffset /= 2;
        }
      }
      function read(buf, i2) {
        if (indexSize === 1) {
          return buf[i2];
        } else {
          return buf.readUInt16BE(i2 * indexSize);
        }
      }
      let i;
      if (dir) {
        let foundIndex = -1;
        for (i = byteOffset; i < arrLength; i++) {
          if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
            if (foundIndex === -1) foundIndex = i;
            if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
          } else {
            if (foundIndex !== -1) i -= i - foundIndex;
            foundIndex = -1;
          }
        }
      } else {
        if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
        for (i = byteOffset; i >= 0; i--) {
          let found = true;
          for (let j = 0; j < valLength; j++) {
            if (read(arr, i + j) !== read(val, j)) {
              found = false;
              break;
            }
          }
          if (found) return i;
        }
      }
      return -1;
    }
    Buffer3.prototype.includes = function includes(val, byteOffset, encoding) {
      return this.indexOf(val, byteOffset, encoding) !== -1;
    };
    Buffer3.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
    };
    Buffer3.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
      return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
    };
    function hexWrite(buf, string2, offset, length2) {
      offset = Number(offset) || 0;
      const remaining = buf.length - offset;
      if (!length2) {
        length2 = remaining;
      } else {
        length2 = Number(length2);
        if (length2 > remaining) {
          length2 = remaining;
        }
      }
      const strLen = string2.length;
      if (length2 > strLen / 2) {
        length2 = strLen / 2;
      }
      let i;
      for (i = 0; i < length2; ++i) {
        const parsed = parseInt(string2.substr(i * 2, 2), 16);
        if (numberIsNaN(parsed)) return i;
        buf[offset + i] = parsed;
      }
      return i;
    }
    function utf8Write(buf, string2, offset, length2) {
      return blitBuffer(utf8ToBytes3(string2, buf.length - offset), buf, offset, length2);
    }
    function asciiWrite(buf, string2, offset, length2) {
      return blitBuffer(asciiToBytes(string2), buf, offset, length2);
    }
    function base64Write(buf, string2, offset, length2) {
      return blitBuffer(base64ToBytes2(string2), buf, offset, length2);
    }
    function ucs2Write(buf, string2, offset, length2) {
      return blitBuffer(utf16leToBytes(string2, buf.length - offset), buf, offset, length2);
    }
    Buffer3.prototype.write = function write(string2, offset, length2, encoding) {
      if (offset === void 0) {
        encoding = "utf8";
        length2 = this.length;
        offset = 0;
      } else if (length2 === void 0 && typeof offset === "string") {
        encoding = offset;
        length2 = this.length;
        offset = 0;
      } else if (isFinite(offset)) {
        offset = offset >>> 0;
        if (isFinite(length2)) {
          length2 = length2 >>> 0;
          if (encoding === void 0) encoding = "utf8";
        } else {
          encoding = length2;
          length2 = void 0;
        }
      } else {
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      }
      const remaining = this.length - offset;
      if (length2 === void 0 || length2 > remaining) length2 = remaining;
      if (string2.length > 0 && (length2 < 0 || offset < 0) || offset > this.length) {
        throw new RangeError("Attempt to write outside buffer bounds");
      }
      if (!encoding) encoding = "utf8";
      let loweredCase = false;
      for (; ; ) {
        switch (encoding) {
          case "hex":
            return hexWrite(this, string2, offset, length2);
          case "utf8":
          case "utf-8":
            return utf8Write(this, string2, offset, length2);
          case "ascii":
          case "latin1":
          case "binary":
            return asciiWrite(this, string2, offset, length2);
          case "base64":
            return base64Write(this, string2, offset, length2);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return ucs2Write(this, string2, offset, length2);
          default:
            if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
            encoding = ("" + encoding).toLowerCase();
            loweredCase = true;
        }
      }
    };
    Buffer3.prototype.toJSON = function toJSON() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function base64Slice(buf, start, end) {
      if (start === 0 && end === buf.length) {
        return base64.fromByteArray(buf);
      } else {
        return base64.fromByteArray(buf.slice(start, end));
      }
    }
    function utf8Slice(buf, start, end) {
      end = Math.min(buf.length, end);
      const res = [];
      let i = start;
      while (i < end) {
        const firstByte = buf[i];
        let codePoint = null;
        let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
        if (i + bytesPerSequence <= end) {
          let secondByte, thirdByte, fourthByte, tempCodePoint;
          switch (bytesPerSequence) {
            case 1:
              if (firstByte < 128) {
                codePoint = firstByte;
              }
              break;
            case 2:
              secondByte = buf[i + 1];
              if ((secondByte & 192) === 128) {
                tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
                if (tempCodePoint > 127) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 3:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
                if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                  codePoint = tempCodePoint;
                }
              }
              break;
            case 4:
              secondByte = buf[i + 1];
              thirdByte = buf[i + 2];
              fourthByte = buf[i + 3];
              if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
                tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
                if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                  codePoint = tempCodePoint;
                }
              }
          }
        }
        if (codePoint === null) {
          codePoint = 65533;
          bytesPerSequence = 1;
        } else if (codePoint > 65535) {
          codePoint -= 65536;
          res.push(codePoint >>> 10 & 1023 | 55296);
          codePoint = 56320 | codePoint & 1023;
        }
        res.push(codePoint);
        i += bytesPerSequence;
      }
      return decodeCodePointsArray(res);
    }
    var MAX_ARGUMENTS_LENGTH = 4096;
    function decodeCodePointsArray(codePoints) {
      const len = codePoints.length;
      if (len <= MAX_ARGUMENTS_LENGTH) {
        return String.fromCharCode.apply(String, codePoints);
      }
      let res = "";
      let i = 0;
      while (i < len) {
        res += String.fromCharCode.apply(
          String,
          codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
        );
      }
      return res;
    }
    function asciiSlice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i] & 127);
      }
      return ret;
    }
    function latin1Slice(buf, start, end) {
      let ret = "";
      end = Math.min(buf.length, end);
      for (let i = start; i < end; ++i) {
        ret += String.fromCharCode(buf[i]);
      }
      return ret;
    }
    function hexSlice(buf, start, end) {
      const len = buf.length;
      if (!start || start < 0) start = 0;
      if (!end || end < 0 || end > len) end = len;
      let out = "";
      for (let i = start; i < end; ++i) {
        out += hexSliceLookupTable[buf[i]];
      }
      return out;
    }
    function utf16leSlice(buf, start, end) {
      const bytes = buf.slice(start, end);
      let res = "";
      for (let i = 0; i < bytes.length - 1; i += 2) {
        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
      }
      return res;
    }
    Buffer3.prototype.slice = function slice(start, end) {
      const len = this.length;
      start = ~~start;
      end = end === void 0 ? len : ~~end;
      if (start < 0) {
        start += len;
        if (start < 0) start = 0;
      } else if (start > len) {
        start = len;
      }
      if (end < 0) {
        end += len;
        if (end < 0) end = 0;
      } else if (end > len) {
        end = len;
      }
      if (end < start) end = start;
      const newBuf = this.subarray(start, end);
      Object.setPrototypeOf(newBuf, Buffer3.prototype);
      return newBuf;
    };
    function checkOffset(offset, ext, length2) {
      if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
      if (offset + ext > length2) throw new RangeError("Trying to access beyond buffer length");
    }
    Buffer3.prototype.readUintLE = Buffer3.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      return val;
    };
    Buffer3.prototype.readUintBE = Buffer3.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        checkOffset(offset, byteLength2, this.length);
      }
      let val = this[offset + --byteLength2];
      let mul = 1;
      while (byteLength2 > 0 && (mul *= 256)) {
        val += this[offset + --byteLength2] * mul;
      }
      return val;
    };
    Buffer3.prototype.readUint8 = Buffer3.prototype.readUInt8 = function readUInt82(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      return this[offset];
    };
    Buffer3.prototype.readUint16LE = Buffer3.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] | this[offset + 1] << 8;
    };
    Buffer3.prototype.readUint16BE = Buffer3.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      return this[offset] << 8 | this[offset + 1];
    };
    Buffer3.prototype.readUint32LE = Buffer3.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
    };
    Buffer3.prototype.readUint32BE = Buffer3.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
    };
    Buffer3.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
      const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
      return BigInt(lo) + (BigInt(hi) << BigInt(32));
    });
    Buffer3.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
      return (BigInt(hi) << BigInt(32)) + BigInt(lo);
    });
    Buffer3.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let val = this[offset];
      let mul = 1;
      let i = 0;
      while (++i < byteLength2 && (mul *= 256)) {
        val += this[offset + i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer3.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) checkOffset(offset, byteLength2, this.length);
      let i = byteLength2;
      let mul = 1;
      let val = this[offset + --i];
      while (i > 0 && (mul *= 256)) {
        val += this[offset + --i] * mul;
      }
      mul *= 128;
      if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
      return val;
    };
    Buffer3.prototype.readInt8 = function readInt8(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 1, this.length);
      if (!(this[offset] & 128)) return this[offset];
      return (255 - this[offset] + 1) * -1;
    };
    Buffer3.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset] | this[offset + 1] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer3.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 2, this.length);
      const val = this[offset + 1] | this[offset] << 8;
      return val & 32768 ? val | 4294901760 : val;
    };
    Buffer3.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
    };
    Buffer3.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
    };
    Buffer3.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
      return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
    });
    Buffer3.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
      offset = offset >>> 0;
      validateNumber(offset, "offset");
      const first = this[offset];
      const last = this[offset + 7];
      if (first === void 0 || last === void 0) {
        boundsError(offset, this.length - 8);
      }
      const val = (first << 24) + // Overflow
      this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
      return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
    });
    Buffer3.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, true, 23, 4);
    };
    Buffer3.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 4, this.length);
      return ieee754.read(this, offset, false, 23, 4);
    };
    Buffer3.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, true, 52, 8);
    };
    Buffer3.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
      offset = offset >>> 0;
      if (!noAssert) checkOffset(offset, 8, this.length);
      return ieee754.read(this, offset, false, 52, 8);
    };
    function checkInt(buf, value2, offset, ext, max, min) {
      if (!Buffer3.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
      if (value2 > max || value2 < min) throw new RangeError('"value" argument is out of bounds');
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
    }
    Buffer3.prototype.writeUintLE = Buffer3.prototype.writeUIntLE = function writeUIntLE(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value2, offset, byteLength2, maxBytes, 0);
      }
      let mul = 1;
      let i = 0;
      this[offset] = value2 & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        this[offset + i] = value2 / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeUintBE = Buffer3.prototype.writeUIntBE = function writeUIntBE(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      byteLength2 = byteLength2 >>> 0;
      if (!noAssert) {
        const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
        checkInt(this, value2, offset, byteLength2, maxBytes, 0);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      this[offset + i] = value2 & 255;
      while (--i >= 0 && (mul *= 256)) {
        this[offset + i] = value2 / mul & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeUint8 = Buffer3.prototype.writeUInt8 = function writeUInt82(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 1, 255, 0);
      this[offset] = value2 & 255;
      return offset + 1;
    };
    Buffer3.prototype.writeUint16LE = Buffer3.prototype.writeUInt16LE = function writeUInt16LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      return offset + 2;
    };
    Buffer3.prototype.writeUint16BE = Buffer3.prototype.writeUInt16BE = function writeUInt16BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 65535, 0);
      this[offset] = value2 >>> 8;
      this[offset + 1] = value2 & 255;
      return offset + 2;
    };
    Buffer3.prototype.writeUint32LE = Buffer3.prototype.writeUInt32LE = function writeUInt32LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
      this[offset + 3] = value2 >>> 24;
      this[offset + 2] = value2 >>> 16;
      this[offset + 1] = value2 >>> 8;
      this[offset] = value2 & 255;
      return offset + 4;
    };
    Buffer3.prototype.writeUint32BE = Buffer3.prototype.writeUInt32BE = function writeUInt32BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 4294967295, 0);
      this[offset] = value2 >>> 24;
      this[offset + 1] = value2 >>> 16;
      this[offset + 2] = value2 >>> 8;
      this[offset + 3] = value2 & 255;
      return offset + 4;
    };
    function wrtBigUInt64LE(buf, value2, offset, min, max) {
      checkIntBI(value2, min, max, buf, offset, 7);
      let lo = Number(value2 & BigInt(4294967295));
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      lo = lo >> 8;
      buf[offset++] = lo;
      let hi = Number(value2 >> BigInt(32) & BigInt(4294967295));
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      hi = hi >> 8;
      buf[offset++] = hi;
      return offset;
    }
    function wrtBigUInt64BE(buf, value2, offset, min, max) {
      checkIntBI(value2, min, max, buf, offset, 7);
      let lo = Number(value2 & BigInt(4294967295));
      buf[offset + 7] = lo;
      lo = lo >> 8;
      buf[offset + 6] = lo;
      lo = lo >> 8;
      buf[offset + 5] = lo;
      lo = lo >> 8;
      buf[offset + 4] = lo;
      let hi = Number(value2 >> BigInt(32) & BigInt(4294967295));
      buf[offset + 3] = hi;
      hi = hi >> 8;
      buf[offset + 2] = hi;
      hi = hi >> 8;
      buf[offset + 1] = hi;
      hi = hi >> 8;
      buf[offset] = hi;
      return offset + 8;
    }
    Buffer3.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value2, offset = 0) {
      return wrtBigUInt64LE(this, value2, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer3.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value2, offset = 0) {
      return wrtBigUInt64BE(this, value2, offset, BigInt(0), BigInt("0xffffffffffffffff"));
    });
    Buffer3.prototype.writeIntLE = function writeIntLE(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
      }
      let i = 0;
      let mul = 1;
      let sub = 0;
      this[offset] = value2 & 255;
      while (++i < byteLength2 && (mul *= 256)) {
        if (value2 < 0 && sub === 0 && this[offset + i - 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value2 / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeIntBE = function writeIntBE(value2, offset, byteLength2, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        const limit = Math.pow(2, 8 * byteLength2 - 1);
        checkInt(this, value2, offset, byteLength2, limit - 1, -limit);
      }
      let i = byteLength2 - 1;
      let mul = 1;
      let sub = 0;
      this[offset + i] = value2 & 255;
      while (--i >= 0 && (mul *= 256)) {
        if (value2 < 0 && sub === 0 && this[offset + i + 1] !== 0) {
          sub = 1;
        }
        this[offset + i] = (value2 / mul >> 0) - sub & 255;
      }
      return offset + byteLength2;
    };
    Buffer3.prototype.writeInt8 = function writeInt8(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 1, 127, -128);
      if (value2 < 0) value2 = 255 + value2 + 1;
      this[offset] = value2 & 255;
      return offset + 1;
    };
    Buffer3.prototype.writeInt16LE = function writeInt16LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      return offset + 2;
    };
    Buffer3.prototype.writeInt16BE = function writeInt16BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 2, 32767, -32768);
      this[offset] = value2 >>> 8;
      this[offset + 1] = value2 & 255;
      return offset + 2;
    };
    Buffer3.prototype.writeInt32LE = function writeInt32LE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 2147483647, -2147483648);
      this[offset] = value2 & 255;
      this[offset + 1] = value2 >>> 8;
      this[offset + 2] = value2 >>> 16;
      this[offset + 3] = value2 >>> 24;
      return offset + 4;
    };
    Buffer3.prototype.writeInt32BE = function writeInt32BE(value2, offset, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) checkInt(this, value2, offset, 4, 2147483647, -2147483648);
      if (value2 < 0) value2 = 4294967295 + value2 + 1;
      this[offset] = value2 >>> 24;
      this[offset + 1] = value2 >>> 16;
      this[offset + 2] = value2 >>> 8;
      this[offset + 3] = value2 & 255;
      return offset + 4;
    };
    Buffer3.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value2, offset = 0) {
      return wrtBigUInt64LE(this, value2, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    Buffer3.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value2, offset = 0) {
      return wrtBigUInt64BE(this, value2, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
    });
    function checkIEEE754(buf, value2, offset, ext, max, min) {
      if (offset + ext > buf.length) throw new RangeError("Index out of range");
      if (offset < 0) throw new RangeError("Index out of range");
    }
    function writeFloat(buf, value2, offset, littleEndian, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value2, offset, 4, 34028234663852886e22, -34028234663852886e22);
      }
      ieee754.write(buf, value2, offset, littleEndian, 23, 4);
      return offset + 4;
    }
    Buffer3.prototype.writeFloatLE = function writeFloatLE(value2, offset, noAssert) {
      return writeFloat(this, value2, offset, true, noAssert);
    };
    Buffer3.prototype.writeFloatBE = function writeFloatBE(value2, offset, noAssert) {
      return writeFloat(this, value2, offset, false, noAssert);
    };
    function writeDouble(buf, value2, offset, littleEndian, noAssert) {
      value2 = +value2;
      offset = offset >>> 0;
      if (!noAssert) {
        checkIEEE754(buf, value2, offset, 8, 17976931348623157e292, -17976931348623157e292);
      }
      ieee754.write(buf, value2, offset, littleEndian, 52, 8);
      return offset + 8;
    }
    Buffer3.prototype.writeDoubleLE = function writeDoubleLE(value2, offset, noAssert) {
      return writeDouble(this, value2, offset, true, noAssert);
    };
    Buffer3.prototype.writeDoubleBE = function writeDoubleBE(value2, offset, noAssert) {
      return writeDouble(this, value2, offset, false, noAssert);
    };
    Buffer3.prototype.copy = function copy(target, targetStart, start, end) {
      if (!Buffer3.isBuffer(target)) throw new TypeError("argument should be a Buffer");
      if (!start) start = 0;
      if (!end && end !== 0) end = this.length;
      if (targetStart >= target.length) targetStart = target.length;
      if (!targetStart) targetStart = 0;
      if (end > 0 && end < start) end = start;
      if (end === start) return 0;
      if (target.length === 0 || this.length === 0) return 0;
      if (targetStart < 0) {
        throw new RangeError("targetStart out of bounds");
      }
      if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
      if (end < 0) throw new RangeError("sourceEnd out of bounds");
      if (end > this.length) end = this.length;
      if (target.length - targetStart < end - start) {
        end = target.length - targetStart + start;
      }
      const len = end - start;
      if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
        this.copyWithin(targetStart, start, end);
      } else {
        Uint8Array.prototype.set.call(
          target,
          this.subarray(start, end),
          targetStart
        );
      }
      return len;
    };
    Buffer3.prototype.fill = function fill(val, start, end, encoding) {
      if (typeof val === "string") {
        if (typeof start === "string") {
          encoding = start;
          start = 0;
          end = this.length;
        } else if (typeof end === "string") {
          encoding = end;
          end = this.length;
        }
        if (encoding !== void 0 && typeof encoding !== "string") {
          throw new TypeError("encoding must be a string");
        }
        if (typeof encoding === "string" && !Buffer3.isEncoding(encoding)) {
          throw new TypeError("Unknown encoding: " + encoding);
        }
        if (val.length === 1) {
          const code = val.charCodeAt(0);
          if (encoding === "utf8" && code < 128 || encoding === "latin1") {
            val = code;
          }
        }
      } else if (typeof val === "number") {
        val = val & 255;
      } else if (typeof val === "boolean") {
        val = Number(val);
      }
      if (start < 0 || this.length < start || this.length < end) {
        throw new RangeError("Out of range index");
      }
      if (end <= start) {
        return this;
      }
      start = start >>> 0;
      end = end === void 0 ? this.length : end >>> 0;
      if (!val) val = 0;
      let i;
      if (typeof val === "number") {
        for (i = start; i < end; ++i) {
          this[i] = val;
        }
      } else {
        const bytes = Buffer3.isBuffer(val) ? val : Buffer3.from(val, encoding);
        const len = bytes.length;
        if (len === 0) {
          throw new TypeError('The value "' + val + '" is invalid for argument "value"');
        }
        for (i = 0; i < end - start; ++i) {
          this[i + start] = bytes[i % len];
        }
      }
      return this;
    };
    var errors = {};
    function E(sym, getMessage, Base) {
      errors[sym] = class NodeError extends Base {
        constructor() {
          super();
          Object.defineProperty(this, "message", {
            value: getMessage.apply(this, arguments),
            writable: true,
            configurable: true
          });
          this.name = `${this.name} [${sym}]`;
          this.stack;
          delete this.name;
        }
        get code() {
          return sym;
        }
        set code(value2) {
          Object.defineProperty(this, "code", {
            configurable: true,
            enumerable: true,
            value: value2,
            writable: true
          });
        }
        toString() {
          return `${this.name} [${sym}]: ${this.message}`;
        }
      };
    }
    E(
      "ERR_BUFFER_OUT_OF_BOUNDS",
      function(name) {
        if (name) {
          return `${name} is outside of buffer bounds`;
        }
        return "Attempt to access memory outside buffer bounds";
      },
      RangeError
    );
    E(
      "ERR_INVALID_ARG_TYPE",
      function(name, actual) {
        return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
      },
      TypeError
    );
    E(
      "ERR_OUT_OF_RANGE",
      function(str, range5, input) {
        let msg = `The value of "${str}" is out of range.`;
        let received = input;
        if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
          received = addNumericalSeparator(String(input));
        } else if (typeof input === "bigint") {
          received = String(input);
          if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
            received = addNumericalSeparator(received);
          }
          received += "n";
        }
        msg += ` It must be ${range5}. Received ${received}`;
        return msg;
      },
      RangeError
    );
    function addNumericalSeparator(val) {
      let res = "";
      let i = val.length;
      const start = val[0] === "-" ? 1 : 0;
      for (; i >= start + 4; i -= 3) {
        res = `_${val.slice(i - 3, i)}${res}`;
      }
      return `${val.slice(0, i)}${res}`;
    }
    function checkBounds(buf, offset, byteLength2) {
      validateNumber(offset, "offset");
      if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
        boundsError(offset, buf.length - (byteLength2 + 1));
      }
    }
    function checkIntBI(value2, min, max, buf, offset, byteLength2) {
      if (value2 > max || value2 < min) {
        const n = typeof min === "bigint" ? "n" : "";
        let range5;
        if (byteLength2 > 3) {
          if (min === 0 || min === BigInt(0)) {
            range5 = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
          } else {
            range5 = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
          }
        } else {
          range5 = `>= ${min}${n} and <= ${max}${n}`;
        }
        throw new errors.ERR_OUT_OF_RANGE("value", range5, value2);
      }
      checkBounds(buf, offset, byteLength2);
    }
    function validateNumber(value2, name) {
      if (typeof value2 !== "number") {
        throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value2);
      }
    }
    function boundsError(value2, length2, type) {
      if (Math.floor(value2) !== value2) {
        validateNumber(value2, type);
        throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value2);
      }
      if (length2 < 0) {
        throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
      }
      throw new errors.ERR_OUT_OF_RANGE(
        type || "offset",
        `>= ${type ? 1 : 0} and <= ${length2}`,
        value2
      );
    }
    var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
    function base64clean(str) {
      str = str.split("=")[0];
      str = str.trim().replace(INVALID_BASE64_RE, "");
      if (str.length < 2) return "";
      while (str.length % 4 !== 0) {
        str = str + "=";
      }
      return str;
    }
    function utf8ToBytes3(string2, units) {
      units = units || Infinity;
      let codePoint;
      const length2 = string2.length;
      let leadSurrogate = null;
      const bytes = [];
      for (let i = 0; i < length2; ++i) {
        codePoint = string2.charCodeAt(i);
        if (codePoint > 55295 && codePoint < 57344) {
          if (!leadSurrogate) {
            if (codePoint > 56319) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            } else if (i + 1 === length2) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              continue;
            }
            leadSurrogate = codePoint;
            continue;
          }
          if (codePoint < 56320) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
            leadSurrogate = codePoint;
            continue;
          }
          codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
        } else if (leadSurrogate) {
          if ((units -= 3) > -1) bytes.push(239, 191, 189);
        }
        leadSurrogate = null;
        if (codePoint < 128) {
          if ((units -= 1) < 0) break;
          bytes.push(codePoint);
        } else if (codePoint < 2048) {
          if ((units -= 2) < 0) break;
          bytes.push(
            codePoint >> 6 | 192,
            codePoint & 63 | 128
          );
        } else if (codePoint < 65536) {
          if ((units -= 3) < 0) break;
          bytes.push(
            codePoint >> 12 | 224,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else if (codePoint < 1114112) {
          if ((units -= 4) < 0) break;
          bytes.push(
            codePoint >> 18 | 240,
            codePoint >> 12 & 63 | 128,
            codePoint >> 6 & 63 | 128,
            codePoint & 63 | 128
          );
        } else {
          throw new Error("Invalid code point");
        }
      }
      return bytes;
    }
    function asciiToBytes(str) {
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        byteArray.push(str.charCodeAt(i) & 255);
      }
      return byteArray;
    }
    function utf16leToBytes(str, units) {
      let c, hi, lo;
      const byteArray = [];
      for (let i = 0; i < str.length; ++i) {
        if ((units -= 2) < 0) break;
        c = str.charCodeAt(i);
        hi = c >> 8;
        lo = c % 256;
        byteArray.push(lo);
        byteArray.push(hi);
      }
      return byteArray;
    }
    function base64ToBytes2(str) {
      return base64.toByteArray(base64clean(str));
    }
    function blitBuffer(src, dst, offset, length2) {
      let i;
      for (i = 0; i < length2; ++i) {
        if (i + offset >= dst.length || i >= src.length) break;
        dst[i + offset] = src[i];
      }
      return i;
    }
    function isInstance(obj, type) {
      return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
    }
    function numberIsNaN(obj) {
      return obj !== obj;
    }
    var hexSliceLookupTable = (function() {
      const alphabet3 = "0123456789abcdef";
      const table = new Array(256);
      for (let i = 0; i < 16; ++i) {
        const i16 = i * 16;
        for (let j = 0; j < 16; ++j) {
          table[i16 + j] = alphabet3[i] + alphabet3[j];
        }
      }
      return table;
    })();
    function defineBigIntMethod(fn) {
      return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
    }
    function BufferBigIntNotDefined() {
      throw new Error("BigInt not supported");
    }
  }
});

// node_modules/bech32/dist/index.js
var require_dist = __commonJS({
  "node_modules/bech32/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.bech32m = exports.bech32 = void 0;
    var ALPHABET2 = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
    var ALPHABET_MAP = {};
    for (let z = 0; z < ALPHABET2.length; z++) {
      const x = ALPHABET2.charAt(z);
      ALPHABET_MAP[x] = z;
    }
    function polymodStep(pre) {
      const b = pre >> 25;
      return (pre & 33554431) << 5 ^ -(b >> 0 & 1) & 996825010 ^ -(b >> 1 & 1) & 642813549 ^ -(b >> 2 & 1) & 513874426 ^ -(b >> 3 & 1) & 1027748829 ^ -(b >> 4 & 1) & 705979059;
    }
    function prefixChk(prefix) {
      let chk = 1;
      for (let i = 0; i < prefix.length; ++i) {
        const c = prefix.charCodeAt(i);
        if (c < 33 || c > 126)
          return "Invalid prefix (" + prefix + ")";
        chk = polymodStep(chk) ^ c >> 5;
      }
      chk = polymodStep(chk);
      for (let i = 0; i < prefix.length; ++i) {
        const v = prefix.charCodeAt(i);
        chk = polymodStep(chk) ^ v & 31;
      }
      return chk;
    }
    function convert(data, inBits, outBits, pad) {
      let value2 = 0;
      let bits = 0;
      const maxV = (1 << outBits) - 1;
      const result = [];
      for (let i = 0; i < data.length; ++i) {
        value2 = value2 << inBits | data[i];
        bits += inBits;
        while (bits >= outBits) {
          bits -= outBits;
          result.push(value2 >> bits & maxV);
        }
      }
      if (pad) {
        if (bits > 0) {
          result.push(value2 << outBits - bits & maxV);
        }
      } else {
        if (bits >= inBits)
          return "Excess padding";
        if (value2 << outBits - bits & maxV)
          return "Non-zero padding";
      }
      return result;
    }
    function toWords(bytes) {
      return convert(bytes, 8, 5, true);
    }
    function fromWordsUnsafe(words) {
      const res = convert(words, 5, 8, false);
      if (Array.isArray(res))
        return res;
    }
    function fromWords(words) {
      const res = convert(words, 5, 8, false);
      if (Array.isArray(res))
        return res;
      throw new Error(res);
    }
    function getLibraryFromEncoding(encoding) {
      let ENCODING_CONST;
      if (encoding === "bech32") {
        ENCODING_CONST = 1;
      } else {
        ENCODING_CONST = 734539939;
      }
      function encode20(prefix, words, LIMIT) {
        LIMIT = LIMIT || 90;
        if (prefix.length + 7 + words.length > LIMIT)
          throw new TypeError("Exceeds length limit");
        prefix = prefix.toLowerCase();
        let chk = prefixChk(prefix);
        if (typeof chk === "string")
          throw new Error(chk);
        let result = prefix + "1";
        for (let i = 0; i < words.length; ++i) {
          const x = words[i];
          if (x >> 5 !== 0)
            throw new Error("Non 5-bit word");
          chk = polymodStep(chk) ^ x;
          result += ALPHABET2.charAt(x);
        }
        for (let i = 0; i < 6; ++i) {
          chk = polymodStep(chk);
        }
        chk ^= ENCODING_CONST;
        for (let i = 0; i < 6; ++i) {
          const v = chk >> (5 - i) * 5 & 31;
          result += ALPHABET2.charAt(v);
        }
        return result;
      }
      function __decode(str, LIMIT) {
        LIMIT = LIMIT || 90;
        if (str.length < 8)
          return str + " too short";
        if (str.length > LIMIT)
          return "Exceeds length limit";
        const lowered = str.toLowerCase();
        const uppered = str.toUpperCase();
        if (str !== lowered && str !== uppered)
          return "Mixed-case string " + str;
        str = lowered;
        const split3 = str.lastIndexOf("1");
        if (split3 === -1)
          return "No separator character for " + str;
        if (split3 === 0)
          return "Missing prefix for " + str;
        const prefix = str.slice(0, split3);
        const wordChars = str.slice(split3 + 1);
        if (wordChars.length < 6)
          return "Data too short";
        let chk = prefixChk(prefix);
        if (typeof chk === "string")
          return chk;
        const words = [];
        for (let i = 0; i < wordChars.length; ++i) {
          const c = wordChars.charAt(i);
          const v = ALPHABET_MAP[c];
          if (v === void 0)
            return "Unknown character " + c;
          chk = polymodStep(chk) ^ v;
          if (i + 6 >= wordChars.length)
            continue;
          words.push(v);
        }
        if (chk !== ENCODING_CONST)
          return "Invalid checksum for " + str;
        return { prefix, words };
      }
      function decodeUnsafe(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === "object")
          return res;
      }
      function decode19(str, LIMIT) {
        const res = __decode(str, LIMIT);
        if (typeof res === "object")
          return res;
        throw new Error(res);
      }
      return {
        decodeUnsafe,
        decode: decode19,
        encode: encode20,
        toWords,
        fromWordsUnsafe,
        fromWords
      };
    }
    exports.bech32 = getLibraryFromEncoding("bech32");
    exports.bech32m = getLibraryFromEncoding("bech32m");
  }
});

// node_modules/qrcode/lib/can-promise.js
var require_can_promise = __commonJS({
  "node_modules/qrcode/lib/can-promise.js"(exports, module) {
    module.exports = function() {
      return typeof Promise === "function" && Promise.prototype && Promise.prototype.then;
    };
  }
});

// node_modules/qrcode/lib/core/utils.js
var require_utils = __commonJS({
  "node_modules/qrcode/lib/core/utils.js"(exports) {
    var toSJISFunction;
    var CODEWORDS_COUNT = [
      0,
      // Not used
      26,
      44,
      70,
      100,
      134,
      172,
      196,
      242,
      292,
      346,
      404,
      466,
      532,
      581,
      655,
      733,
      815,
      901,
      991,
      1085,
      1156,
      1258,
      1364,
      1474,
      1588,
      1706,
      1828,
      1921,
      2051,
      2185,
      2323,
      2465,
      2611,
      2761,
      2876,
      3034,
      3196,
      3362,
      3532,
      3706
    ];
    exports.getSymbolSize = function getSymbolSize(version) {
      if (!version) throw new Error('"version" cannot be null or undefined');
      if (version < 1 || version > 40) throw new Error('"version" should be in range from 1 to 40');
      return version * 4 + 17;
    };
    exports.getSymbolTotalCodewords = function getSymbolTotalCodewords(version) {
      return CODEWORDS_COUNT[version];
    };
    exports.getBCHDigit = function(data) {
      let digit = 0;
      while (data !== 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    };
    exports.setToSJISFunction = function setToSJISFunction(f) {
      if (typeof f !== "function") {
        throw new Error('"toSJISFunc" is not a valid function.');
      }
      toSJISFunction = f;
    };
    exports.isKanjiModeEnabled = function() {
      return typeof toSJISFunction !== "undefined";
    };
    exports.toSJIS = function toSJIS(kanji) {
      return toSJISFunction(kanji);
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-level.js
var require_error_correction_level = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-level.js"(exports) {
    exports.L = { bit: 1 };
    exports.M = { bit: 0 };
    exports.Q = { bit: 3 };
    exports.H = { bit: 2 };
    function fromString(string2) {
      if (typeof string2 !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string2.toLowerCase();
      switch (lcStr) {
        case "l":
        case "low":
          return exports.L;
        case "m":
        case "medium":
          return exports.M;
        case "q":
        case "quartile":
          return exports.Q;
        case "h":
        case "high":
          return exports.H;
        default:
          throw new Error("Unknown EC Level: " + string2);
      }
    }
    exports.isValid = function isValid(level) {
      return level && typeof level.bit !== "undefined" && level.bit >= 0 && level.bit < 4;
    };
    exports.from = function from(value2, defaultValue) {
      if (exports.isValid(value2)) {
        return value2;
      }
      try {
        return fromString(value2);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/bit-buffer.js
var require_bit_buffer = __commonJS({
  "node_modules/qrcode/lib/core/bit-buffer.js"(exports, module) {
    function BitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    BitBuffer.prototype = {
      get: function(index) {
        const bufIndex = Math.floor(index / 8);
        return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) === 1;
      },
      put: function(num, length2) {
        for (let i = 0; i < length2; i++) {
          this.putBit((num >>> length2 - i - 1 & 1) === 1);
        }
      },
      getLengthInBits: function() {
        return this.length;
      },
      putBit: function(bit) {
        const bufIndex = Math.floor(this.length / 8);
        if (this.buffer.length <= bufIndex) {
          this.buffer.push(0);
        }
        if (bit) {
          this.buffer[bufIndex] |= 128 >>> this.length % 8;
        }
        this.length++;
      }
    };
    module.exports = BitBuffer;
  }
});

// node_modules/qrcode/lib/core/bit-matrix.js
var require_bit_matrix = __commonJS({
  "node_modules/qrcode/lib/core/bit-matrix.js"(exports, module) {
    function BitMatrix(size) {
      if (!size || size < 1) {
        throw new Error("BitMatrix size must be defined and greater than 0");
      }
      this.size = size;
      this.data = new Uint8Array(size * size);
      this.reservedBit = new Uint8Array(size * size);
    }
    BitMatrix.prototype.set = function(row, col, value2, reserved) {
      const index = row * this.size + col;
      this.data[index] = value2;
      if (reserved) this.reservedBit[index] = true;
    };
    BitMatrix.prototype.get = function(row, col) {
      return this.data[row * this.size + col];
    };
    BitMatrix.prototype.xor = function(row, col, value2) {
      this.data[row * this.size + col] ^= value2;
    };
    BitMatrix.prototype.isReserved = function(row, col) {
      return this.reservedBit[row * this.size + col];
    };
    module.exports = BitMatrix;
  }
});

// node_modules/qrcode/lib/core/alignment-pattern.js
var require_alignment_pattern = __commonJS({
  "node_modules/qrcode/lib/core/alignment-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    exports.getRowColCoords = function getRowColCoords(version) {
      if (version === 1) return [];
      const posCount = Math.floor(version / 7) + 2;
      const size = getSymbolSize(version);
      const intervals = size === 145 ? 26 : Math.ceil((size - 13) / (2 * posCount - 2)) * 2;
      const positions = [size - 7];
      for (let i = 1; i < posCount - 1; i++) {
        positions[i] = positions[i - 1] - intervals;
      }
      positions.push(6);
      return positions.reverse();
    };
    exports.getPositions = function getPositions(version) {
      const coords = [];
      const pos = exports.getRowColCoords(version);
      const posLength = pos.length;
      for (let i = 0; i < posLength; i++) {
        for (let j = 0; j < posLength; j++) {
          if (i === 0 && j === 0 || // top-left
          i === 0 && j === posLength - 1 || // bottom-left
          i === posLength - 1 && j === 0) {
            continue;
          }
          coords.push([pos[i], pos[j]]);
        }
      }
      return coords;
    };
  }
});

// node_modules/qrcode/lib/core/finder-pattern.js
var require_finder_pattern = __commonJS({
  "node_modules/qrcode/lib/core/finder-pattern.js"(exports) {
    var getSymbolSize = require_utils().getSymbolSize;
    var FINDER_PATTERN_SIZE = 7;
    exports.getPositions = function getPositions(version) {
      const size = getSymbolSize(version);
      return [
        // top-left
        [0, 0],
        // top-right
        [size - FINDER_PATTERN_SIZE, 0],
        // bottom-left
        [0, size - FINDER_PATTERN_SIZE]
      ];
    };
  }
});

// node_modules/qrcode/lib/core/mask-pattern.js
var require_mask_pattern = __commonJS({
  "node_modules/qrcode/lib/core/mask-pattern.js"(exports) {
    exports.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    var PenaltyScores = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    exports.isValid = function isValid(mask) {
      return mask != null && mask !== "" && !isNaN(mask) && mask >= 0 && mask <= 7;
    };
    exports.from = function from(value2) {
      return exports.isValid(value2) ? parseInt(value2, 10) : void 0;
    };
    exports.getPenaltyN1 = function getPenaltyN1(data) {
      const size = data.size;
      let points = 0;
      let sameCountCol = 0;
      let sameCountRow = 0;
      let lastCol = null;
      let lastRow = null;
      for (let row = 0; row < size; row++) {
        sameCountCol = sameCountRow = 0;
        lastCol = lastRow = null;
        for (let col = 0; col < size; col++) {
          let module2 = data.get(row, col);
          if (module2 === lastCol) {
            sameCountCol++;
          } else {
            if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
            lastCol = module2;
            sameCountCol = 1;
          }
          module2 = data.get(col, row);
          if (module2 === lastRow) {
            sameCountRow++;
          } else {
            if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
            lastRow = module2;
            sameCountRow = 1;
          }
        }
        if (sameCountCol >= 5) points += PenaltyScores.N1 + (sameCountCol - 5);
        if (sameCountRow >= 5) points += PenaltyScores.N1 + (sameCountRow - 5);
      }
      return points;
    };
    exports.getPenaltyN2 = function getPenaltyN2(data) {
      const size = data.size;
      let points = 0;
      for (let row = 0; row < size - 1; row++) {
        for (let col = 0; col < size - 1; col++) {
          const last = data.get(row, col) + data.get(row, col + 1) + data.get(row + 1, col) + data.get(row + 1, col + 1);
          if (last === 4 || last === 0) points++;
        }
      }
      return points * PenaltyScores.N2;
    };
    exports.getPenaltyN3 = function getPenaltyN3(data) {
      const size = data.size;
      let points = 0;
      let bitsCol = 0;
      let bitsRow = 0;
      for (let row = 0; row < size; row++) {
        bitsCol = bitsRow = 0;
        for (let col = 0; col < size; col++) {
          bitsCol = bitsCol << 1 & 2047 | data.get(row, col);
          if (col >= 10 && (bitsCol === 1488 || bitsCol === 93)) points++;
          bitsRow = bitsRow << 1 & 2047 | data.get(col, row);
          if (col >= 10 && (bitsRow === 1488 || bitsRow === 93)) points++;
        }
      }
      return points * PenaltyScores.N3;
    };
    exports.getPenaltyN4 = function getPenaltyN4(data) {
      let darkCount = 0;
      const modulesCount = data.data.length;
      for (let i = 0; i < modulesCount; i++) darkCount += data.data[i];
      const k = Math.abs(Math.ceil(darkCount * 100 / modulesCount / 5) - 10);
      return k * PenaltyScores.N4;
    };
    function getMaskAt(maskPattern, i, j) {
      switch (maskPattern) {
        case exports.Patterns.PATTERN000:
          return (i + j) % 2 === 0;
        case exports.Patterns.PATTERN001:
          return i % 2 === 0;
        case exports.Patterns.PATTERN010:
          return j % 3 === 0;
        case exports.Patterns.PATTERN011:
          return (i + j) % 3 === 0;
        case exports.Patterns.PATTERN100:
          return (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
        case exports.Patterns.PATTERN101:
          return i * j % 2 + i * j % 3 === 0;
        case exports.Patterns.PATTERN110:
          return (i * j % 2 + i * j % 3) % 2 === 0;
        case exports.Patterns.PATTERN111:
          return (i * j % 3 + (i + j) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }
    exports.applyMask = function applyMask(pattern, data) {
      const size = data.size;
      for (let col = 0; col < size; col++) {
        for (let row = 0; row < size; row++) {
          if (data.isReserved(row, col)) continue;
          data.xor(row, col, getMaskAt(pattern, row, col));
        }
      }
    };
    exports.getBestMask = function getBestMask(data, setupFormatFunc) {
      const numPatterns = Object.keys(exports.Patterns).length;
      let bestPattern = 0;
      let lowerPenalty = Infinity;
      for (let p = 0; p < numPatterns; p++) {
        setupFormatFunc(p);
        exports.applyMask(p, data);
        const penalty = exports.getPenaltyN1(data) + exports.getPenaltyN2(data) + exports.getPenaltyN3(data) + exports.getPenaltyN4(data);
        exports.applyMask(p, data);
        if (penalty < lowerPenalty) {
          lowerPenalty = penalty;
          bestPattern = p;
        }
      }
      return bestPattern;
    };
  }
});

// node_modules/qrcode/lib/core/error-correction-code.js
var require_error_correction_code = __commonJS({
  "node_modules/qrcode/lib/core/error-correction-code.js"(exports) {
    var ECLevel = require_error_correction_level();
    var EC_BLOCKS_TABLE = [
      // L  M  Q  H
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      2,
      2,
      1,
      2,
      2,
      4,
      1,
      2,
      4,
      4,
      2,
      4,
      4,
      4,
      2,
      4,
      6,
      5,
      2,
      4,
      6,
      6,
      2,
      5,
      8,
      8,
      4,
      5,
      8,
      8,
      4,
      5,
      8,
      11,
      4,
      8,
      10,
      11,
      4,
      9,
      12,
      16,
      4,
      9,
      16,
      16,
      6,
      10,
      12,
      18,
      6,
      10,
      17,
      16,
      6,
      11,
      16,
      19,
      6,
      13,
      18,
      21,
      7,
      14,
      21,
      25,
      8,
      16,
      20,
      25,
      8,
      17,
      23,
      25,
      9,
      17,
      23,
      34,
      9,
      18,
      25,
      30,
      10,
      20,
      27,
      32,
      12,
      21,
      29,
      35,
      12,
      23,
      34,
      37,
      12,
      25,
      34,
      40,
      13,
      26,
      35,
      42,
      14,
      28,
      38,
      45,
      15,
      29,
      40,
      48,
      16,
      31,
      43,
      51,
      17,
      33,
      45,
      54,
      18,
      35,
      48,
      57,
      19,
      37,
      51,
      60,
      19,
      38,
      53,
      63,
      20,
      40,
      56,
      66,
      21,
      43,
      59,
      70,
      22,
      45,
      62,
      74,
      24,
      47,
      65,
      77,
      25,
      49,
      68,
      81
    ];
    var EC_CODEWORDS_TABLE = [
      // L  M  Q  H
      7,
      10,
      13,
      17,
      10,
      16,
      22,
      28,
      15,
      26,
      36,
      44,
      20,
      36,
      52,
      64,
      26,
      48,
      72,
      88,
      36,
      64,
      96,
      112,
      40,
      72,
      108,
      130,
      48,
      88,
      132,
      156,
      60,
      110,
      160,
      192,
      72,
      130,
      192,
      224,
      80,
      150,
      224,
      264,
      96,
      176,
      260,
      308,
      104,
      198,
      288,
      352,
      120,
      216,
      320,
      384,
      132,
      240,
      360,
      432,
      144,
      280,
      408,
      480,
      168,
      308,
      448,
      532,
      180,
      338,
      504,
      588,
      196,
      364,
      546,
      650,
      224,
      416,
      600,
      700,
      224,
      442,
      644,
      750,
      252,
      476,
      690,
      816,
      270,
      504,
      750,
      900,
      300,
      560,
      810,
      960,
      312,
      588,
      870,
      1050,
      336,
      644,
      952,
      1110,
      360,
      700,
      1020,
      1200,
      390,
      728,
      1050,
      1260,
      420,
      784,
      1140,
      1350,
      450,
      812,
      1200,
      1440,
      480,
      868,
      1290,
      1530,
      510,
      924,
      1350,
      1620,
      540,
      980,
      1440,
      1710,
      570,
      1036,
      1530,
      1800,
      570,
      1064,
      1590,
      1890,
      600,
      1120,
      1680,
      1980,
      630,
      1204,
      1770,
      2100,
      660,
      1260,
      1860,
      2220,
      720,
      1316,
      1950,
      2310,
      750,
      1372,
      2040,
      2430
    ];
    exports.getBlocksCount = function getBlocksCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_BLOCKS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
    exports.getTotalCodewordsCount = function getTotalCodewordsCount(version, errorCorrectionLevel) {
      switch (errorCorrectionLevel) {
        case ECLevel.L:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 0];
        case ECLevel.M:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 1];
        case ECLevel.Q:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 2];
        case ECLevel.H:
          return EC_CODEWORDS_TABLE[(version - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
  }
});

// node_modules/qrcode/lib/core/galois-field.js
var require_galois_field = __commonJS({
  "node_modules/qrcode/lib/core/galois-field.js"(exports) {
    var EXP_TABLE = new Uint8Array(512);
    var LOG_TABLE = new Uint8Array(256);
    (function initTables() {
      let x = 1;
      for (let i = 0; i < 255; i++) {
        EXP_TABLE[i] = x;
        LOG_TABLE[x] = i;
        x <<= 1;
        if (x & 256) {
          x ^= 285;
        }
      }
      for (let i = 255; i < 512; i++) {
        EXP_TABLE[i] = EXP_TABLE[i - 255];
      }
    })();
    exports.log = function log(n) {
      if (n < 1) throw new Error("log(" + n + ")");
      return LOG_TABLE[n];
    };
    exports.exp = function exp(n) {
      return EXP_TABLE[n];
    };
    exports.mul = function mul(x, y) {
      if (x === 0 || y === 0) return 0;
      return EXP_TABLE[LOG_TABLE[x] + LOG_TABLE[y]];
    };
  }
});

// node_modules/qrcode/lib/core/polynomial.js
var require_polynomial = __commonJS({
  "node_modules/qrcode/lib/core/polynomial.js"(exports) {
    var GF = require_galois_field();
    exports.mul = function mul(p1, p2) {
      const coeff = new Uint8Array(p1.length + p2.length - 1);
      for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
          coeff[i + j] ^= GF.mul(p1[i], p2[j]);
        }
      }
      return coeff;
    };
    exports.mod = function mod2(divident, divisor) {
      let result = new Uint8Array(divident);
      while (result.length - divisor.length >= 0) {
        const coeff = result[0];
        for (let i = 0; i < divisor.length; i++) {
          result[i] ^= GF.mul(divisor[i], coeff);
        }
        let offset = 0;
        while (offset < result.length && result[offset] === 0) offset++;
        result = result.slice(offset);
      }
      return result;
    };
    exports.generateECPolynomial = function generateECPolynomial(degree) {
      let poly = new Uint8Array([1]);
      for (let i = 0; i < degree; i++) {
        poly = exports.mul(poly, new Uint8Array([1, GF.exp(i)]));
      }
      return poly;
    };
  }
});

// node_modules/qrcode/lib/core/reed-solomon-encoder.js
var require_reed_solomon_encoder = __commonJS({
  "node_modules/qrcode/lib/core/reed-solomon-encoder.js"(exports, module) {
    var Polynomial = require_polynomial();
    function ReedSolomonEncoder(degree) {
      this.genPoly = void 0;
      this.degree = degree;
      if (this.degree) this.initialize(this.degree);
    }
    ReedSolomonEncoder.prototype.initialize = function initialize(degree) {
      this.degree = degree;
      this.genPoly = Polynomial.generateECPolynomial(this.degree);
    };
    ReedSolomonEncoder.prototype.encode = function encode20(data) {
      if (!this.genPoly) {
        throw new Error("Encoder not initialized");
      }
      const paddedData = new Uint8Array(data.length + this.degree);
      paddedData.set(data);
      const remainder = Polynomial.mod(paddedData, this.genPoly);
      const start = this.degree - remainder.length;
      if (start > 0) {
        const buff = new Uint8Array(this.degree);
        buff.set(remainder, start);
        return buff;
      }
      return remainder;
    };
    module.exports = ReedSolomonEncoder;
  }
});

// node_modules/qrcode/lib/core/version-check.js
var require_version_check = __commonJS({
  "node_modules/qrcode/lib/core/version-check.js"(exports) {
    exports.isValid = function isValid(version) {
      return !isNaN(version) && version >= 1 && version <= 40;
    };
  }
});

// node_modules/qrcode/lib/core/regex.js
var require_regex = __commonJS({
  "node_modules/qrcode/lib/core/regex.js"(exports) {
    var numeric = "[0-9]+";
    var alphanumeric = "[A-Z $%*+\\-./:]+";
    var kanji = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
    kanji = kanji.replace(/u/g, "\\u");
    var byte = "(?:(?![A-Z0-9 $%*+\\-./:]|" + kanji + ")(?:.|[\r\n]))+";
    exports.KANJI = new RegExp(kanji, "g");
    exports.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
    exports.BYTE = new RegExp(byte, "g");
    exports.NUMERIC = new RegExp(numeric, "g");
    exports.ALPHANUMERIC = new RegExp(alphanumeric, "g");
    var TEST_KANJI = new RegExp("^" + kanji + "$");
    var TEST_NUMERIC = new RegExp("^" + numeric + "$");
    var TEST_ALPHANUMERIC = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
    exports.testKanji = function testKanji(str) {
      return TEST_KANJI.test(str);
    };
    exports.testNumeric = function testNumeric(str) {
      return TEST_NUMERIC.test(str);
    };
    exports.testAlphanumeric = function testAlphanumeric(str) {
      return TEST_ALPHANUMERIC.test(str);
    };
  }
});

// node_modules/qrcode/lib/core/mode.js
var require_mode = __commonJS({
  "node_modules/qrcode/lib/core/mode.js"(exports) {
    var VersionCheck = require_version_check();
    var Regex = require_regex();
    exports.NUMERIC = {
      id: "Numeric",
      bit: 1 << 0,
      ccBits: [10, 12, 14]
    };
    exports.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 1 << 1,
      ccBits: [9, 11, 13]
    };
    exports.BYTE = {
      id: "Byte",
      bit: 1 << 2,
      ccBits: [8, 16, 16]
    };
    exports.KANJI = {
      id: "Kanji",
      bit: 1 << 3,
      ccBits: [8, 10, 12]
    };
    exports.MIXED = {
      bit: -1
    };
    exports.getCharCountIndicator = function getCharCountIndicator(mode, version) {
      if (!mode.ccBits) throw new Error("Invalid mode: " + mode);
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid version: " + version);
      }
      if (version >= 1 && version < 10) return mode.ccBits[0];
      else if (version < 27) return mode.ccBits[1];
      return mode.ccBits[2];
    };
    exports.getBestModeForData = function getBestModeForData(dataStr) {
      if (Regex.testNumeric(dataStr)) return exports.NUMERIC;
      else if (Regex.testAlphanumeric(dataStr)) return exports.ALPHANUMERIC;
      else if (Regex.testKanji(dataStr)) return exports.KANJI;
      else return exports.BYTE;
    };
    exports.toString = function toString(mode) {
      if (mode && mode.id) return mode.id;
      throw new Error("Invalid mode");
    };
    exports.isValid = function isValid(mode) {
      return mode && mode.bit && mode.ccBits;
    };
    function fromString(string2) {
      if (typeof string2 !== "string") {
        throw new Error("Param is not a string");
      }
      const lcStr = string2.toLowerCase();
      switch (lcStr) {
        case "numeric":
          return exports.NUMERIC;
        case "alphanumeric":
          return exports.ALPHANUMERIC;
        case "kanji":
          return exports.KANJI;
        case "byte":
          return exports.BYTE;
        default:
          throw new Error("Unknown mode: " + string2);
      }
    }
    exports.from = function from(value2, defaultValue) {
      if (exports.isValid(value2)) {
        return value2;
      }
      try {
        return fromString(value2);
      } catch (e) {
        return defaultValue;
      }
    };
  }
});

// node_modules/qrcode/lib/core/version.js
var require_version = __commonJS({
  "node_modules/qrcode/lib/core/version.js"(exports) {
    var Utils = require_utils();
    var ECCode = require_error_correction_code();
    var ECLevel = require_error_correction_level();
    var Mode = require_mode();
    var VersionCheck = require_version_check();
    var G18 = 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0;
    var G18_BCH = Utils.getBCHDigit(G18);
    function getBestVersionForDataLength(mode, length2, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        if (length2 <= exports.getCapacity(currentVersion, errorCorrectionLevel, mode)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    function getReservedBitsCount(mode, version) {
      return Mode.getCharCountIndicator(mode, version) + 4;
    }
    function getTotalBitsFromDataArray(segments, version) {
      let totalBits = 0;
      segments.forEach(function(data) {
        const reservedBits = getReservedBitsCount(data.mode, version);
        totalBits += reservedBits + data.getBitsLength();
      });
      return totalBits;
    }
    function getBestVersionForMixedData(segments, errorCorrectionLevel) {
      for (let currentVersion = 1; currentVersion <= 40; currentVersion++) {
        const length2 = getTotalBitsFromDataArray(segments, currentVersion);
        if (length2 <= exports.getCapacity(currentVersion, errorCorrectionLevel, Mode.MIXED)) {
          return currentVersion;
        }
      }
      return void 0;
    }
    exports.from = function from(value2, defaultValue) {
      if (VersionCheck.isValid(value2)) {
        return parseInt(value2, 10);
      }
      return defaultValue;
    };
    exports.getCapacity = function getCapacity(version, errorCorrectionLevel, mode) {
      if (!VersionCheck.isValid(version)) {
        throw new Error("Invalid QR Code version");
      }
      if (typeof mode === "undefined") mode = Mode.BYTE;
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (mode === Mode.MIXED) return dataTotalCodewordsBits;
      const usableBits = dataTotalCodewordsBits - getReservedBitsCount(mode, version);
      switch (mode) {
        case Mode.NUMERIC:
          return Math.floor(usableBits / 10 * 3);
        case Mode.ALPHANUMERIC:
          return Math.floor(usableBits / 11 * 2);
        case Mode.KANJI:
          return Math.floor(usableBits / 13);
        case Mode.BYTE:
        default:
          return Math.floor(usableBits / 8);
      }
    };
    exports.getBestVersionForData = function getBestVersionForData(data, errorCorrectionLevel) {
      let seg;
      const ecl = ECLevel.from(errorCorrectionLevel, ECLevel.M);
      if (Array.isArray(data)) {
        if (data.length > 1) {
          return getBestVersionForMixedData(data, ecl);
        }
        if (data.length === 0) {
          return 1;
        }
        seg = data[0];
      } else {
        seg = data;
      }
      return getBestVersionForDataLength(seg.mode, seg.getLength(), ecl);
    };
    exports.getEncodedBits = function getEncodedBits(version) {
      if (!VersionCheck.isValid(version) || version < 7) {
        throw new Error("Invalid QR Code version");
      }
      let d = version << 12;
      while (Utils.getBCHDigit(d) - G18_BCH >= 0) {
        d ^= G18 << Utils.getBCHDigit(d) - G18_BCH;
      }
      return version << 12 | d;
    };
  }
});

// node_modules/qrcode/lib/core/format-info.js
var require_format_info = __commonJS({
  "node_modules/qrcode/lib/core/format-info.js"(exports) {
    var Utils = require_utils();
    var G15 = 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0;
    var G15_MASK = 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1;
    var G15_BCH = Utils.getBCHDigit(G15);
    exports.getEncodedBits = function getEncodedBits(errorCorrectionLevel, mask) {
      const data = errorCorrectionLevel.bit << 3 | mask;
      let d = data << 10;
      while (Utils.getBCHDigit(d) - G15_BCH >= 0) {
        d ^= G15 << Utils.getBCHDigit(d) - G15_BCH;
      }
      return (data << 10 | d) ^ G15_MASK;
    };
  }
});

// node_modules/qrcode/lib/core/numeric-data.js
var require_numeric_data = __commonJS({
  "node_modules/qrcode/lib/core/numeric-data.js"(exports, module) {
    var Mode = require_mode();
    function NumericData(data) {
      this.mode = Mode.NUMERIC;
      this.data = data.toString();
    }
    NumericData.getBitsLength = function getBitsLength(length2) {
      return 10 * Math.floor(length2 / 3) + (length2 % 3 ? length2 % 3 * 3 + 1 : 0);
    };
    NumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    NumericData.prototype.getBitsLength = function getBitsLength() {
      return NumericData.getBitsLength(this.data.length);
    };
    NumericData.prototype.write = function write(bitBuffer) {
      let i, group, value2;
      for (i = 0; i + 3 <= this.data.length; i += 3) {
        group = this.data.substr(i, 3);
        value2 = parseInt(group, 10);
        bitBuffer.put(value2, 10);
      }
      const remainingNum = this.data.length - i;
      if (remainingNum > 0) {
        group = this.data.substr(i);
        value2 = parseInt(group, 10);
        bitBuffer.put(value2, remainingNum * 3 + 1);
      }
    };
    module.exports = NumericData;
  }
});

// node_modules/qrcode/lib/core/alphanumeric-data.js
var require_alphanumeric_data = __commonJS({
  "node_modules/qrcode/lib/core/alphanumeric-data.js"(exports, module) {
    var Mode = require_mode();
    var ALPHA_NUM_CHARS = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      " ",
      "$",
      "%",
      "*",
      "+",
      "-",
      ".",
      "/",
      ":"
    ];
    function AlphanumericData(data) {
      this.mode = Mode.ALPHANUMERIC;
      this.data = data;
    }
    AlphanumericData.getBitsLength = function getBitsLength(length2) {
      return 11 * Math.floor(length2 / 2) + 6 * (length2 % 2);
    };
    AlphanumericData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    AlphanumericData.prototype.getBitsLength = function getBitsLength() {
      return AlphanumericData.getBitsLength(this.data.length);
    };
    AlphanumericData.prototype.write = function write(bitBuffer) {
      let i;
      for (i = 0; i + 2 <= this.data.length; i += 2) {
        let value2 = ALPHA_NUM_CHARS.indexOf(this.data[i]) * 45;
        value2 += ALPHA_NUM_CHARS.indexOf(this.data[i + 1]);
        bitBuffer.put(value2, 11);
      }
      if (this.data.length % 2) {
        bitBuffer.put(ALPHA_NUM_CHARS.indexOf(this.data[i]), 6);
      }
    };
    module.exports = AlphanumericData;
  }
});

// node_modules/qrcode/lib/core/byte-data.js
var require_byte_data = __commonJS({
  "node_modules/qrcode/lib/core/byte-data.js"(exports, module) {
    var Mode = require_mode();
    function ByteData(data) {
      this.mode = Mode.BYTE;
      if (typeof data === "string") {
        this.data = new TextEncoder().encode(data);
      } else {
        this.data = new Uint8Array(data);
      }
    }
    ByteData.getBitsLength = function getBitsLength(length2) {
      return length2 * 8;
    };
    ByteData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    ByteData.prototype.getBitsLength = function getBitsLength() {
      return ByteData.getBitsLength(this.data.length);
    };
    ByteData.prototype.write = function(bitBuffer) {
      for (let i = 0, l = this.data.length; i < l; i++) {
        bitBuffer.put(this.data[i], 8);
      }
    };
    module.exports = ByteData;
  }
});

// node_modules/qrcode/lib/core/kanji-data.js
var require_kanji_data = __commonJS({
  "node_modules/qrcode/lib/core/kanji-data.js"(exports, module) {
    var Mode = require_mode();
    var Utils = require_utils();
    function KanjiData(data) {
      this.mode = Mode.KANJI;
      this.data = data;
    }
    KanjiData.getBitsLength = function getBitsLength(length2) {
      return length2 * 13;
    };
    KanjiData.prototype.getLength = function getLength() {
      return this.data.length;
    };
    KanjiData.prototype.getBitsLength = function getBitsLength() {
      return KanjiData.getBitsLength(this.data.length);
    };
    KanjiData.prototype.write = function(bitBuffer) {
      let i;
      for (i = 0; i < this.data.length; i++) {
        let value2 = Utils.toSJIS(this.data[i]);
        if (value2 >= 33088 && value2 <= 40956) {
          value2 -= 33088;
        } else if (value2 >= 57408 && value2 <= 60351) {
          value2 -= 49472;
        } else {
          throw new Error(
            "Invalid SJIS character: " + this.data[i] + "\nMake sure your charset is UTF-8"
          );
        }
        value2 = (value2 >>> 8 & 255) * 192 + (value2 & 255);
        bitBuffer.put(value2, 13);
      }
    };
    module.exports = KanjiData;
  }
});

// node_modules/dijkstrajs/dijkstra.js
var require_dijkstra = __commonJS({
  "node_modules/dijkstrajs/dijkstra.js"(exports, module) {
    "use strict";
    var dijkstra = {
      single_source_shortest_paths: function(graph, s, d) {
        var predecessors = {};
        var costs = {};
        costs[s] = 0;
        var open = dijkstra.PriorityQueue.make();
        open.push(s, 0);
        var closest, u, v, cost_of_s_to_u, adjacent_nodes, cost_of_e, cost_of_s_to_u_plus_cost_of_e, cost_of_s_to_v, first_visit;
        while (!open.empty()) {
          closest = open.pop();
          u = closest.value;
          cost_of_s_to_u = closest.cost;
          adjacent_nodes = graph[u] || {};
          for (v in adjacent_nodes) {
            if (adjacent_nodes.hasOwnProperty(v)) {
              cost_of_e = adjacent_nodes[v];
              cost_of_s_to_u_plus_cost_of_e = cost_of_s_to_u + cost_of_e;
              cost_of_s_to_v = costs[v];
              first_visit = typeof costs[v] === "undefined";
              if (first_visit || cost_of_s_to_v > cost_of_s_to_u_plus_cost_of_e) {
                costs[v] = cost_of_s_to_u_plus_cost_of_e;
                open.push(v, cost_of_s_to_u_plus_cost_of_e);
                predecessors[v] = u;
              }
            }
          }
        }
        if (typeof d !== "undefined" && typeof costs[d] === "undefined") {
          var msg = ["Could not find a path from ", s, " to ", d, "."].join("");
          throw new Error(msg);
        }
        return predecessors;
      },
      extract_shortest_path_from_predecessor_list: function(predecessors, d) {
        var nodes = [];
        var u = d;
        var predecessor;
        while (u) {
          nodes.push(u);
          predecessor = predecessors[u];
          u = predecessors[u];
        }
        nodes.reverse();
        return nodes;
      },
      find_path: function(graph, s, d) {
        var predecessors = dijkstra.single_source_shortest_paths(graph, s, d);
        return dijkstra.extract_shortest_path_from_predecessor_list(
          predecessors,
          d
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(opts) {
          var T = dijkstra.PriorityQueue, t = {}, key;
          opts = opts || {};
          for (key in T) {
            if (T.hasOwnProperty(key)) {
              t[key] = T[key];
            }
          }
          t.queue = [];
          t.sorter = opts.sorter || T.default_sorter;
          return t;
        },
        default_sorter: function(a, b) {
          return a.cost - b.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(value2, cost) {
          var item = { value: value2, cost };
          this.queue.push(item);
          this.queue.sort(this.sorter);
        },
        /**
         * Return the highest priority element in the queue.
         */
        pop: function() {
          return this.queue.shift();
        },
        empty: function() {
          return this.queue.length === 0;
        }
      }
    };
    if (typeof module !== "undefined") {
      module.exports = dijkstra;
    }
  }
});

// node_modules/qrcode/lib/core/segments.js
var require_segments = __commonJS({
  "node_modules/qrcode/lib/core/segments.js"(exports) {
    var Mode = require_mode();
    var NumericData = require_numeric_data();
    var AlphanumericData = require_alphanumeric_data();
    var ByteData = require_byte_data();
    var KanjiData = require_kanji_data();
    var Regex = require_regex();
    var Utils = require_utils();
    var dijkstra = require_dijkstra();
    function getStringByteLength(str) {
      return unescape(encodeURIComponent(str)).length;
    }
    function getSegments(regex2, mode, str) {
      const segments = [];
      let result;
      while ((result = regex2.exec(str)) !== null) {
        segments.push({
          data: result[0],
          index: result.index,
          mode,
          length: result[0].length
        });
      }
      return segments;
    }
    function getSegmentsFromString(dataStr) {
      const numSegs = getSegments(Regex.NUMERIC, Mode.NUMERIC, dataStr);
      const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, Mode.ALPHANUMERIC, dataStr);
      let byteSegs;
      let kanjiSegs;
      if (Utils.isKanjiModeEnabled()) {
        byteSegs = getSegments(Regex.BYTE, Mode.BYTE, dataStr);
        kanjiSegs = getSegments(Regex.KANJI, Mode.KANJI, dataStr);
      } else {
        byteSegs = getSegments(Regex.BYTE_KANJI, Mode.BYTE, dataStr);
        kanjiSegs = [];
      }
      const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);
      return segs.sort(function(s1, s2) {
        return s1.index - s2.index;
      }).map(function(obj) {
        return {
          data: obj.data,
          mode: obj.mode,
          length: obj.length
        };
      });
    }
    function getSegmentBitsLength(length2, mode) {
      switch (mode) {
        case Mode.NUMERIC:
          return NumericData.getBitsLength(length2);
        case Mode.ALPHANUMERIC:
          return AlphanumericData.getBitsLength(length2);
        case Mode.KANJI:
          return KanjiData.getBitsLength(length2);
        case Mode.BYTE:
          return ByteData.getBitsLength(length2);
      }
    }
    function mergeSegments(segs) {
      return segs.reduce(function(acc, curr) {
        const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
        if (prevSeg && prevSeg.mode === curr.mode) {
          acc[acc.length - 1].data += curr.data;
          return acc;
        }
        acc.push(curr);
        return acc;
      }, []);
    }
    function buildNodes(segs) {
      const nodes = [];
      for (let i = 0; i < segs.length; i++) {
        const seg = segs[i];
        switch (seg.mode) {
          case Mode.NUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.ALPHANUMERIC, length: seg.length },
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.ALPHANUMERIC:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: seg.length }
            ]);
            break;
          case Mode.KANJI:
            nodes.push([
              seg,
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
            break;
          case Mode.BYTE:
            nodes.push([
              { data: seg.data, mode: Mode.BYTE, length: getStringByteLength(seg.data) }
            ]);
        }
      }
      return nodes;
    }
    function buildGraph(nodes, version) {
      const table = {};
      const graph = { start: {} };
      let prevNodeIds = ["start"];
      for (let i = 0; i < nodes.length; i++) {
        const nodeGroup = nodes[i];
        const currentNodeIds = [];
        for (let j = 0; j < nodeGroup.length; j++) {
          const node = nodeGroup[j];
          const key = "" + i + j;
          currentNodeIds.push(key);
          table[key] = { node, lastCount: 0 };
          graph[key] = {};
          for (let n = 0; n < prevNodeIds.length; n++) {
            const prevNodeId = prevNodeIds[n];
            if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
              graph[prevNodeId][key] = getSegmentBitsLength(table[prevNodeId].lastCount + node.length, node.mode) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);
              table[prevNodeId].lastCount += node.length;
            } else {
              if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;
              graph[prevNodeId][key] = getSegmentBitsLength(node.length, node.mode) + 4 + Mode.getCharCountIndicator(node.mode, version);
            }
          }
        }
        prevNodeIds = currentNodeIds;
      }
      for (let n = 0; n < prevNodeIds.length; n++) {
        graph[prevNodeIds[n]].end = 0;
      }
      return { map: graph, table };
    }
    function buildSingleSegment(data, modesHint) {
      let mode;
      const bestMode = Mode.getBestModeForData(data);
      mode = Mode.from(modesHint, bestMode);
      if (mode !== Mode.BYTE && mode.bit < bestMode.bit) {
        throw new Error('"' + data + '" cannot be encoded with mode ' + Mode.toString(mode) + ".\n Suggested mode is: " + Mode.toString(bestMode));
      }
      if (mode === Mode.KANJI && !Utils.isKanjiModeEnabled()) {
        mode = Mode.BYTE;
      }
      switch (mode) {
        case Mode.NUMERIC:
          return new NumericData(data);
        case Mode.ALPHANUMERIC:
          return new AlphanumericData(data);
        case Mode.KANJI:
          return new KanjiData(data);
        case Mode.BYTE:
          return new ByteData(data);
      }
    }
    exports.fromArray = function fromArray(array2) {
      return array2.reduce(function(acc, seg) {
        if (typeof seg === "string") {
          acc.push(buildSingleSegment(seg, null));
        } else if (seg.data) {
          acc.push(buildSingleSegment(seg.data, seg.mode));
        }
        return acc;
      }, []);
    };
    exports.fromString = function fromString(data, version) {
      const segs = getSegmentsFromString(data, Utils.isKanjiModeEnabled());
      const nodes = buildNodes(segs);
      const graph = buildGraph(nodes, version);
      const path = dijkstra.find_path(graph.map, "start", "end");
      const optimizedSegs = [];
      for (let i = 1; i < path.length - 1; i++) {
        optimizedSegs.push(graph.table[path[i]].node);
      }
      return exports.fromArray(mergeSegments(optimizedSegs));
    };
    exports.rawSplit = function rawSplit(data) {
      return exports.fromArray(
        getSegmentsFromString(data, Utils.isKanjiModeEnabled())
      );
    };
  }
});

// node_modules/qrcode/lib/core/qrcode.js
var require_qrcode = __commonJS({
  "node_modules/qrcode/lib/core/qrcode.js"(exports) {
    var Utils = require_utils();
    var ECLevel = require_error_correction_level();
    var BitBuffer = require_bit_buffer();
    var BitMatrix = require_bit_matrix();
    var AlignmentPattern = require_alignment_pattern();
    var FinderPattern = require_finder_pattern();
    var MaskPattern = require_mask_pattern();
    var ECCode = require_error_correction_code();
    var ReedSolomonEncoder = require_reed_solomon_encoder();
    var Version = require_version();
    var FormatInfo = require_format_info();
    var Mode = require_mode();
    var Segments = require_segments();
    function setupFinderPattern(matrix, version) {
      const size = matrix.size;
      const pos = FinderPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -1; r <= 7; r++) {
          if (row + r <= -1 || size <= row + r) continue;
          for (let c = -1; c <= 7; c++) {
            if (col + c <= -1 || size <= col + c) continue;
            if (r >= 0 && r <= 6 && (c === 0 || c === 6) || c >= 0 && c <= 6 && (r === 0 || r === 6) || r >= 2 && r <= 4 && c >= 2 && c <= 4) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupTimingPattern(matrix) {
      const size = matrix.size;
      for (let r = 8; r < size - 8; r++) {
        const value2 = r % 2 === 0;
        matrix.set(r, 6, value2, true);
        matrix.set(6, r, value2, true);
      }
    }
    function setupAlignmentPattern(matrix, version) {
      const pos = AlignmentPattern.getPositions(version);
      for (let i = 0; i < pos.length; i++) {
        const row = pos[i][0];
        const col = pos[i][1];
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || r === 0 && c === 0) {
              matrix.set(row + r, col + c, true, true);
            } else {
              matrix.set(row + r, col + c, false, true);
            }
          }
        }
      }
    }
    function setupVersionInfo(matrix, version) {
      const size = matrix.size;
      const bits = Version.getEncodedBits(version);
      let row, col, mod2;
      for (let i = 0; i < 18; i++) {
        row = Math.floor(i / 3);
        col = i % 3 + size - 8 - 3;
        mod2 = (bits >> i & 1) === 1;
        matrix.set(row, col, mod2, true);
        matrix.set(col, row, mod2, true);
      }
    }
    function setupFormatInfo(matrix, errorCorrectionLevel, maskPattern) {
      const size = matrix.size;
      const bits = FormatInfo.getEncodedBits(errorCorrectionLevel, maskPattern);
      let i, mod2;
      for (i = 0; i < 15; i++) {
        mod2 = (bits >> i & 1) === 1;
        if (i < 6) {
          matrix.set(i, 8, mod2, true);
        } else if (i < 8) {
          matrix.set(i + 1, 8, mod2, true);
        } else {
          matrix.set(size - 15 + i, 8, mod2, true);
        }
        if (i < 8) {
          matrix.set(8, size - i - 1, mod2, true);
        } else if (i < 9) {
          matrix.set(8, 15 - i - 1 + 1, mod2, true);
        } else {
          matrix.set(8, 15 - i - 1, mod2, true);
        }
      }
      matrix.set(size - 8, 8, 1, true);
    }
    function setupData(matrix, data) {
      const size = matrix.size;
      let inc = -1;
      let row = size - 1;
      let bitIndex = 7;
      let byteIndex = 0;
      for (let col = size - 1; col > 0; col -= 2) {
        if (col === 6) col--;
        while (true) {
          for (let c = 0; c < 2; c++) {
            if (!matrix.isReserved(row, col - c)) {
              let dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) === 1;
              }
              matrix.set(row, col - c, dark);
              bitIndex--;
              if (bitIndex === -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || size <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    }
    function createData(version, errorCorrectionLevel, segments) {
      const buffer = new BitBuffer();
      segments.forEach(function(data) {
        buffer.put(data.mode.bit, 4);
        buffer.put(data.getLength(), Mode.getCharCountIndicator(data.mode, version));
        data.write(buffer);
      });
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewordsBits = (totalCodewords - ecTotalCodewords) * 8;
      if (buffer.getLengthInBits() + 4 <= dataTotalCodewordsBits) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 !== 0) {
        buffer.putBit(0);
      }
      const remainingByte = (dataTotalCodewordsBits - buffer.getLengthInBits()) / 8;
      for (let i = 0; i < remainingByte; i++) {
        buffer.put(i % 2 ? 17 : 236, 8);
      }
      return createCodewords(buffer, version, errorCorrectionLevel);
    }
    function createCodewords(bitBuffer, version, errorCorrectionLevel) {
      const totalCodewords = Utils.getSymbolTotalCodewords(version);
      const ecTotalCodewords = ECCode.getTotalCodewordsCount(version, errorCorrectionLevel);
      const dataTotalCodewords = totalCodewords - ecTotalCodewords;
      const ecTotalBlocks = ECCode.getBlocksCount(version, errorCorrectionLevel);
      const blocksInGroup2 = totalCodewords % ecTotalBlocks;
      const blocksInGroup1 = ecTotalBlocks - blocksInGroup2;
      const totalCodewordsInGroup1 = Math.floor(totalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup1 = Math.floor(dataTotalCodewords / ecTotalBlocks);
      const dataCodewordsInGroup2 = dataCodewordsInGroup1 + 1;
      const ecCount = totalCodewordsInGroup1 - dataCodewordsInGroup1;
      const rs = new ReedSolomonEncoder(ecCount);
      let offset = 0;
      const dcData = new Array(ecTotalBlocks);
      const ecData = new Array(ecTotalBlocks);
      let maxDataSize = 0;
      const buffer = new Uint8Array(bitBuffer.buffer);
      for (let b = 0; b < ecTotalBlocks; b++) {
        const dataSize = b < blocksInGroup1 ? dataCodewordsInGroup1 : dataCodewordsInGroup2;
        dcData[b] = buffer.slice(offset, offset + dataSize);
        ecData[b] = rs.encode(dcData[b]);
        offset += dataSize;
        maxDataSize = Math.max(maxDataSize, dataSize);
      }
      const data = new Uint8Array(totalCodewords);
      let index = 0;
      let i, r;
      for (i = 0; i < maxDataSize; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          if (i < dcData[r].length) {
            data[index++] = dcData[r][i];
          }
        }
      }
      for (i = 0; i < ecCount; i++) {
        for (r = 0; r < ecTotalBlocks; r++) {
          data[index++] = ecData[r][i];
        }
      }
      return data;
    }
    function createSymbol(data, version, errorCorrectionLevel, maskPattern) {
      let segments;
      if (Array.isArray(data)) {
        segments = Segments.fromArray(data);
      } else if (typeof data === "string") {
        let estimatedVersion = version;
        if (!estimatedVersion) {
          const rawSegments = Segments.rawSplit(data);
          estimatedVersion = Version.getBestVersionForData(rawSegments, errorCorrectionLevel);
        }
        segments = Segments.fromString(data, estimatedVersion || 40);
      } else {
        throw new Error("Invalid data");
      }
      const bestVersion = Version.getBestVersionForData(segments, errorCorrectionLevel);
      if (!bestVersion) {
        throw new Error("The amount of data is too big to be stored in a QR Code");
      }
      if (!version) {
        version = bestVersion;
      } else if (version < bestVersion) {
        throw new Error(
          "\nThe chosen QR Code version cannot contain this amount of data.\nMinimum version required to store current data is: " + bestVersion + ".\n"
        );
      }
      const dataBits = createData(version, errorCorrectionLevel, segments);
      const moduleCount = Utils.getSymbolSize(version);
      const modules = new BitMatrix(moduleCount);
      setupFinderPattern(modules, version);
      setupTimingPattern(modules);
      setupAlignmentPattern(modules, version);
      setupFormatInfo(modules, errorCorrectionLevel, 0);
      if (version >= 7) {
        setupVersionInfo(modules, version);
      }
      setupData(modules, dataBits);
      if (isNaN(maskPattern)) {
        maskPattern = MaskPattern.getBestMask(
          modules,
          setupFormatInfo.bind(null, modules, errorCorrectionLevel)
        );
      }
      MaskPattern.applyMask(maskPattern, modules);
      setupFormatInfo(modules, errorCorrectionLevel, maskPattern);
      return {
        modules,
        version,
        errorCorrectionLevel,
        maskPattern,
        segments
      };
    }
    exports.create = function create(data, options) {
      if (typeof data === "undefined" || data === "") {
        throw new Error("No input text");
      }
      let errorCorrectionLevel = ECLevel.M;
      let version;
      let mask;
      if (typeof options !== "undefined") {
        errorCorrectionLevel = ECLevel.from(options.errorCorrectionLevel, ECLevel.M);
        version = Version.from(options.version);
        mask = MaskPattern.from(options.maskPattern);
        if (options.toSJISFunc) {
          Utils.setToSJISFunction(options.toSJISFunc);
        }
      }
      return createSymbol(data, version, errorCorrectionLevel, mask);
    };
  }
});

// node_modules/qrcode/lib/renderer/utils.js
var require_utils2 = __commonJS({
  "node_modules/qrcode/lib/renderer/utils.js"(exports) {
    function hex2rgba(hex) {
      if (typeof hex === "number") {
        hex = hex.toString();
      }
      if (typeof hex !== "string") {
        throw new Error("Color should be defined as hex string");
      }
      let hexCode = hex.slice().replace("#", "").split("");
      if (hexCode.length < 3 || hexCode.length === 5 || hexCode.length > 8) {
        throw new Error("Invalid hex color: " + hex);
      }
      if (hexCode.length === 3 || hexCode.length === 4) {
        hexCode = Array.prototype.concat.apply([], hexCode.map(function(c) {
          return [c, c];
        }));
      }
      if (hexCode.length === 6) hexCode.push("F", "F");
      const hexValue = parseInt(hexCode.join(""), 16);
      return {
        r: hexValue >> 24 & 255,
        g: hexValue >> 16 & 255,
        b: hexValue >> 8 & 255,
        a: hexValue & 255,
        hex: "#" + hexCode.slice(0, 6).join("")
      };
    }
    exports.getOptions = function getOptions(options) {
      if (!options) options = {};
      if (!options.color) options.color = {};
      const margin = typeof options.margin === "undefined" || options.margin === null || options.margin < 0 ? 4 : options.margin;
      const width = options.width && options.width >= 21 ? options.width : void 0;
      const scale = options.scale || 4;
      return {
        width,
        scale: width ? 4 : scale,
        margin,
        color: {
          dark: hex2rgba(options.color.dark || "#000000ff"),
          light: hex2rgba(options.color.light || "#ffffffff")
        },
        type: options.type,
        rendererOpts: options.rendererOpts || {}
      };
    };
    exports.getScale = function getScale(qrSize, opts) {
      return opts.width && opts.width >= qrSize + opts.margin * 2 ? opts.width / (qrSize + opts.margin * 2) : opts.scale;
    };
    exports.getImageWidth = function getImageWidth(qrSize, opts) {
      const scale = exports.getScale(qrSize, opts);
      return Math.floor((qrSize + opts.margin * 2) * scale);
    };
    exports.qrToImageData = function qrToImageData(imgData, qr, opts) {
      const size = qr.modules.size;
      const data = qr.modules.data;
      const scale = exports.getScale(size, opts);
      const symbolSize = Math.floor((size + opts.margin * 2) * scale);
      const scaledMargin = opts.margin * scale;
      const palette = [opts.color.light, opts.color.dark];
      for (let i = 0; i < symbolSize; i++) {
        for (let j = 0; j < symbolSize; j++) {
          let posDst = (i * symbolSize + j) * 4;
          let pxColor = opts.color.light;
          if (i >= scaledMargin && j >= scaledMargin && i < symbolSize - scaledMargin && j < symbolSize - scaledMargin) {
            const iSrc = Math.floor((i - scaledMargin) / scale);
            const jSrc = Math.floor((j - scaledMargin) / scale);
            pxColor = palette[data[iSrc * size + jSrc] ? 1 : 0];
          }
          imgData[posDst++] = pxColor.r;
          imgData[posDst++] = pxColor.g;
          imgData[posDst++] = pxColor.b;
          imgData[posDst] = pxColor.a;
        }
      }
    };
  }
});

// node_modules/qrcode/lib/renderer/canvas.js
var require_canvas = __commonJS({
  "node_modules/qrcode/lib/renderer/canvas.js"(exports) {
    var Utils = require_utils2();
    function clearCanvas(ctx, canvas, size) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!canvas.style) canvas.style = {};
      canvas.height = size;
      canvas.width = size;
      canvas.style.height = size + "px";
      canvas.style.width = size + "px";
    }
    function getCanvasElement() {
      try {
        return document.createElement("canvas");
      } catch (e) {
        throw new Error("You need to specify a canvas element");
      }
    }
    exports.render = function render(qrData, canvas, options) {
      let opts = options;
      let canvasEl = canvas;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!canvas) {
        canvasEl = getCanvasElement();
      }
      opts = Utils.getOptions(opts);
      const size = Utils.getImageWidth(qrData.modules.size, opts);
      const ctx = canvasEl.getContext("2d");
      const image = ctx.createImageData(size, size);
      Utils.qrToImageData(image.data, qrData, opts);
      clearCanvas(ctx, canvasEl, size);
      ctx.putImageData(image, 0, 0);
      return canvasEl;
    };
    exports.renderToDataURL = function renderToDataURL(qrData, canvas, options) {
      let opts = options;
      if (typeof opts === "undefined" && (!canvas || !canvas.getContext)) {
        opts = canvas;
        canvas = void 0;
      }
      if (!opts) opts = {};
      const canvasEl = exports.render(qrData, canvas, opts);
      const type = opts.type || "image/png";
      const rendererOpts = opts.rendererOpts || {};
      return canvasEl.toDataURL(type, rendererOpts.quality);
    };
  }
});

// node_modules/qrcode/lib/renderer/svg-tag.js
var require_svg_tag = __commonJS({
  "node_modules/qrcode/lib/renderer/svg-tag.js"(exports) {
    var Utils = require_utils2();
    function getColorAttrib(color, attrib) {
      const alpha = color.a / 255;
      const str = attrib + '="' + color.hex + '"';
      return alpha < 1 ? str + " " + attrib + '-opacity="' + alpha.toFixed(2).slice(1) + '"' : str;
    }
    function svgCmd(cmd, x, y) {
      let str = cmd + x;
      if (typeof y !== "undefined") str += " " + y;
      return str;
    }
    function qrToPath(data, size, margin) {
      let path = "";
      let moveBy = 0;
      let newRow = false;
      let lineLength = 0;
      for (let i = 0; i < data.length; i++) {
        const col = Math.floor(i % size);
        const row = Math.floor(i / size);
        if (!col && !newRow) newRow = true;
        if (data[i]) {
          lineLength++;
          if (!(i > 0 && col > 0 && data[i - 1])) {
            path += newRow ? svgCmd("M", col + margin, 0.5 + row + margin) : svgCmd("m", moveBy, 0);
            moveBy = 0;
            newRow = false;
          }
          if (!(col + 1 < size && data[i + 1])) {
            path += svgCmd("h", lineLength);
            lineLength = 0;
          }
        } else {
          moveBy++;
        }
      }
      return path;
    }
    exports.render = function render(qrData, options, cb) {
      const opts = Utils.getOptions(options);
      const size = qrData.modules.size;
      const data = qrData.modules.data;
      const qrcodesize = size + opts.margin * 2;
      const bg = !opts.color.light.a ? "" : "<path " + getColorAttrib(opts.color.light, "fill") + ' d="M0 0h' + qrcodesize + "v" + qrcodesize + 'H0z"/>';
      const path = "<path " + getColorAttrib(opts.color.dark, "stroke") + ' d="' + qrToPath(data, size, opts.margin) + '"/>';
      const viewBox = 'viewBox="0 0 ' + qrcodesize + " " + qrcodesize + '"';
      const width = !opts.width ? "" : 'width="' + opts.width + '" height="' + opts.width + '" ';
      const svgTag = '<svg xmlns="http://www.w3.org/2000/svg" ' + width + viewBox + ' shape-rendering="crispEdges">' + bg + path + "</svg>\n";
      if (typeof cb === "function") {
        cb(null, svgTag);
      }
      return svgTag;
    };
  }
});

// node_modules/qrcode/lib/browser.js
var require_browser = __commonJS({
  "node_modules/qrcode/lib/browser.js"(exports) {
    var canPromise = require_can_promise();
    var QRCode2 = require_qrcode();
    var CanvasRenderer = require_canvas();
    var SvgRenderer = require_svg_tag();
    function renderCanvas(renderFunc, canvas, text, opts, cb) {
      const args = [].slice.call(arguments, 1);
      const argsNum = args.length;
      const isLastArgCb = typeof args[argsNum - 1] === "function";
      if (!isLastArgCb && !canPromise()) {
        throw new Error("Callback required as last argument");
      }
      if (isLastArgCb) {
        if (argsNum < 2) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 2) {
          cb = text;
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 3) {
          if (canvas.getContext && typeof cb === "undefined") {
            cb = opts;
            opts = void 0;
          } else {
            cb = opts;
            opts = text;
            text = canvas;
            canvas = void 0;
          }
        }
      } else {
        if (argsNum < 1) {
          throw new Error("Too few arguments provided");
        }
        if (argsNum === 1) {
          text = canvas;
          canvas = opts = void 0;
        } else if (argsNum === 2 && !canvas.getContext) {
          opts = text;
          text = canvas;
          canvas = void 0;
        }
        return new Promise(function(resolve, reject) {
          try {
            const data = QRCode2.create(text, opts);
            resolve(renderFunc(data, canvas, opts));
          } catch (e) {
            reject(e);
          }
        });
      }
      try {
        const data = QRCode2.create(text, opts);
        cb(null, renderFunc(data, canvas, opts));
      } catch (e) {
        cb(e);
      }
    }
    exports.create = QRCode2.create;
    exports.toCanvas = renderCanvas.bind(null, CanvasRenderer.render);
    exports.toDataURL = renderCanvas.bind(null, CanvasRenderer.renderToDataURL);
    exports.toString = renderCanvas.bind(null, function(data, _, opts) {
      return SvgRenderer.render(data, opts);
    });
  }
});

// apps/frontend/client/scripts/pages/donate.js
var import_buffer = __toESM(require_buffer(), 1);

// node_modules/@noble/curves/node_modules/@noble/hashes/utils.js
function isBytes(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber(n, title = "") {
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new Error(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes(value2, length2, title = "") {
  const bytes = isBytes(value2);
  const len = value2?.length;
  const needsLen = length2 !== void 0;
  if (!bytes || needsLen && len !== length2) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length2}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value2}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value2;
}
function ahash(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash must wrapped by utils.createHasher");
  anumber(h.outputLen);
  anumber(h.blockLen);
}
function aexists(instance2, checkFinished = true) {
  if (instance2.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance2.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput(out, instance2) {
  abytes(out, void 0, "digestInto() output");
  const min = instance2.outputLen;
  if (out.length < min) {
    throw new Error('"digestInto() output" expected to be of length >=' + min);
  }
}
function clean(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr(word, shift) {
  return word << 32 - shift | word >>> shift;
}
var hasHexBuiltin = /* @__PURE__ */ (() => (
  // @ts-ignore
  typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function"
))();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function bytesToHex(bytes) {
  abytes(bytes);
  if (hasHexBuiltin)
    return bytes.toHex();
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += hexes[bytes[i]];
  }
  return hex;
}
var asciis = { _0: 48, _9: 57, A: 65, F: 70, a: 97, f: 102 };
function asciiToBase16(ch) {
  if (ch >= asciis._0 && ch <= asciis._9)
    return ch - asciis._0;
  if (ch >= asciis.A && ch <= asciis.F)
    return ch - (asciis.A - 10);
  if (ch >= asciis.a && ch <= asciis.f)
    return ch - (asciis.a - 10);
  return;
}
function hexToBytes(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  if (hasHexBuiltin)
    return Uint8Array.fromHex(hex);
  const hl = hex.length;
  const al = hl / 2;
  if (hl % 2)
    throw new Error("hex string expected, got unpadded hex of length " + hl);
  const array2 = new Uint8Array(al);
  for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
    const n1 = asciiToBase16(hex.charCodeAt(hi));
    const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
    if (n1 === void 0 || n2 === void 0) {
      const char = hex[hi] + hex[hi + 1];
      throw new Error('hex string expected, got non-hex character "' + char + '" at index ' + hi);
    }
    array2[ai] = n1 * 16 + n2;
  }
  return array2;
}
function concatBytes(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function createHasher(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes(bytesLength = 32) {
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist = (suffix) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@noble/curves/node_modules/@noble/hashes/_md.js
function Chi(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD = class {
  blockLen;
  outputLen;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView(this.buffer);
  }
  update(data) {
    aexists(this);
    abytes(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists(this);
    aoutput(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to ||= new this.constructor();
    to.set(...this.get());
    const { blockLen, buffer, length: length2, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length2;
    to.pos = pos;
    if (length2 % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// node_modules/@noble/curves/node_modules/@noble/hashes/sha2.js
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B = class extends HashMD {
  constructor(outputLen) {
    super(64, outputLen, 8, false);
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W[i - 15];
      const W2 = SHA256_W[i - 2];
      const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
      const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10;
      SHA256_W[i] = s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
      const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
      const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
      const T2 = sigma0 + Maj(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean(SHA256_W);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean(this.buffer);
  }
};
var _SHA256 = class extends SHA2_32B {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  A = SHA256_IV[0] | 0;
  B = SHA256_IV[1] | 0;
  C = SHA256_IV[2] | 0;
  D = SHA256_IV[3] | 0;
  E = SHA256_IV[4] | 0;
  F = SHA256_IV[5] | 0;
  G = SHA256_IV[6] | 0;
  H = SHA256_IV[7] | 0;
  constructor() {
    super(32);
  }
};
var sha256 = /* @__PURE__ */ createHasher(
  () => new _SHA256(),
  /* @__PURE__ */ oidNist(1)
);

// node_modules/@noble/curves/utils.js
var _0n = /* @__PURE__ */ BigInt(0);
var _1n = /* @__PURE__ */ BigInt(1);
function abool(value2, title = "") {
  if (typeof value2 !== "boolean") {
    const prefix = title && `"${title}" `;
    throw new Error(prefix + "expected boolean, got type=" + typeof value2);
  }
  return value2;
}
function abignumber(n) {
  if (typeof n === "bigint") {
    if (!isPosBig(n))
      throw new Error("positive bigint expected, got " + n);
  } else
    anumber(n);
  return n;
}
function numberToHexUnpadded(num) {
  const hex = abignumber(num).toString(16);
  return hex.length & 1 ? "0" + hex : hex;
}
function hexToNumber(hex) {
  if (typeof hex !== "string")
    throw new Error("hex string expected, got " + typeof hex);
  return hex === "" ? _0n : BigInt("0x" + hex);
}
function bytesToNumberBE(bytes) {
  return hexToNumber(bytesToHex(bytes));
}
function bytesToNumberLE(bytes) {
  return hexToNumber(bytesToHex(copyBytes(abytes(bytes)).reverse()));
}
function numberToBytesBE(n, len) {
  anumber(len);
  n = abignumber(n);
  const res = hexToBytes(n.toString(16).padStart(len * 2, "0"));
  if (res.length !== len)
    throw new Error("number too large");
  return res;
}
function numberToBytesLE(n, len) {
  return numberToBytesBE(n, len).reverse();
}
function copyBytes(bytes) {
  return Uint8Array.from(bytes);
}
var isPosBig = (n) => typeof n === "bigint" && _0n <= n;
function inRange(n, min, max) {
  return isPosBig(n) && isPosBig(min) && isPosBig(max) && min <= n && n < max;
}
function aInRange(title, n, min, max) {
  if (!inRange(n, min, max))
    throw new Error("expected valid " + title + ": " + min + " <= n < " + max + ", got " + n);
}
function bitLen(n) {
  let len;
  for (len = 0; n > _0n; n >>= _1n, len += 1)
    ;
  return len;
}
var bitMask = (n) => (_1n << BigInt(n)) - _1n;
function createHmacDrbg(hashLen, qByteLen, hmacFn) {
  anumber(hashLen, "hashLen");
  anumber(qByteLen, "qByteLen");
  if (typeof hmacFn !== "function")
    throw new Error("hmacFn must be a function");
  const u8n = (len) => new Uint8Array(len);
  const NULL = Uint8Array.of();
  const byte0 = Uint8Array.of(0);
  const byte1 = Uint8Array.of(1);
  const _maxDrbgIters = 1e3;
  let v = u8n(hashLen);
  let k = u8n(hashLen);
  let i = 0;
  const reset = () => {
    v.fill(1);
    k.fill(0);
    i = 0;
  };
  const h = (...msgs) => hmacFn(k, concatBytes(v, ...msgs));
  const reseed = (seed = NULL) => {
    k = h(byte0, seed);
    v = h();
    if (seed.length === 0)
      return;
    k = h(byte1, seed);
    v = h();
  };
  const gen = () => {
    if (i++ >= _maxDrbgIters)
      throw new Error("drbg: tried max amount of iterations");
    let len = 0;
    const out = [];
    while (len < qByteLen) {
      v = h();
      const sl = v.slice();
      out.push(sl);
      len += v.length;
    }
    return concatBytes(...out);
  };
  const genUntil = (seed, pred) => {
    reset();
    reseed(seed);
    let res = void 0;
    while (!(res = pred(gen())))
      reseed();
    reset();
    return res;
  };
  return genUntil;
}
function validateObject(object2, fields = {}, optFields = {}) {
  if (!object2 || typeof object2 !== "object")
    throw new Error("expected valid options object");
  function checkField(fieldName, expectedType, isOpt) {
    const val = object2[fieldName];
    if (isOpt && val === void 0)
      return;
    const current = typeof val;
    if (current !== expectedType || val === null)
      throw new Error(`param "${fieldName}" is invalid: expected ${expectedType}, got ${current}`);
  }
  const iter = (f, isOpt) => Object.entries(f).forEach(([k, v]) => checkField(k, v, isOpt));
  iter(fields, false);
  iter(optFields, true);
}
function memoized(fn) {
  const map = /* @__PURE__ */ new WeakMap();
  return (arg, ...args) => {
    const val = map.get(arg);
    if (val !== void 0)
      return val;
    const computed = fn(arg, ...args);
    map.set(arg, computed);
    return computed;
  };
}

// node_modules/@noble/curves/abstract/modular.js
var _0n2 = /* @__PURE__ */ BigInt(0);
var _1n2 = /* @__PURE__ */ BigInt(1);
var _2n = /* @__PURE__ */ BigInt(2);
var _3n = /* @__PURE__ */ BigInt(3);
var _4n = /* @__PURE__ */ BigInt(4);
var _5n = /* @__PURE__ */ BigInt(5);
var _7n = /* @__PURE__ */ BigInt(7);
var _8n = /* @__PURE__ */ BigInt(8);
var _9n = /* @__PURE__ */ BigInt(9);
var _16n = /* @__PURE__ */ BigInt(16);
function mod(a, b) {
  const result = a % b;
  return result >= _0n2 ? result : b + result;
}
function pow2(x, power, modulo) {
  let res = x;
  while (power-- > _0n2) {
    res *= res;
    res %= modulo;
  }
  return res;
}
function invert(number2, modulo) {
  if (number2 === _0n2)
    throw new Error("invert: expected non-zero number");
  if (modulo <= _0n2)
    throw new Error("invert: expected positive modulus, got " + modulo);
  let a = mod(number2, modulo);
  let b = modulo;
  let x = _0n2, y = _1n2, u = _1n2, v = _0n2;
  while (a !== _0n2) {
    const q = b / a;
    const r = b % a;
    const m = x - u * q;
    const n = y - v * q;
    b = a, a = r, x = u, y = v, u = m, v = n;
  }
  const gcd2 = b;
  if (gcd2 !== _1n2)
    throw new Error("invert: does not exist");
  return mod(x, modulo);
}
function assertIsSquare(Fp, root, n) {
  if (!Fp.eql(Fp.sqr(root), n))
    throw new Error("Cannot find square root");
}
function sqrt3mod4(Fp, n) {
  const p1div4 = (Fp.ORDER + _1n2) / _4n;
  const root = Fp.pow(n, p1div4);
  assertIsSquare(Fp, root, n);
  return root;
}
function sqrt5mod8(Fp, n) {
  const p5div8 = (Fp.ORDER - _5n) / _8n;
  const n2 = Fp.mul(n, _2n);
  const v = Fp.pow(n2, p5div8);
  const nv = Fp.mul(n, v);
  const i = Fp.mul(Fp.mul(nv, _2n), v);
  const root = Fp.mul(nv, Fp.sub(i, Fp.ONE));
  assertIsSquare(Fp, root, n);
  return root;
}
function sqrt9mod16(P) {
  const Fp_ = Field(P);
  const tn = tonelliShanks(P);
  const c1 = tn(Fp_, Fp_.neg(Fp_.ONE));
  const c2 = tn(Fp_, c1);
  const c3 = tn(Fp_, Fp_.neg(c1));
  const c4 = (P + _7n) / _16n;
  return (Fp, n) => {
    let tv1 = Fp.pow(n, c4);
    let tv2 = Fp.mul(tv1, c1);
    const tv3 = Fp.mul(tv1, c2);
    const tv4 = Fp.mul(tv1, c3);
    const e1 = Fp.eql(Fp.sqr(tv2), n);
    const e2 = Fp.eql(Fp.sqr(tv3), n);
    tv1 = Fp.cmov(tv1, tv2, e1);
    tv2 = Fp.cmov(tv4, tv3, e2);
    const e3 = Fp.eql(Fp.sqr(tv2), n);
    const root = Fp.cmov(tv1, tv2, e3);
    assertIsSquare(Fp, root, n);
    return root;
  };
}
function tonelliShanks(P) {
  if (P < _3n)
    throw new Error("sqrt is not defined for small field");
  let Q = P - _1n2;
  let S = 0;
  while (Q % _2n === _0n2) {
    Q /= _2n;
    S++;
  }
  let Z = _2n;
  const _Fp = Field(P);
  while (FpLegendre(_Fp, Z) === 1) {
    if (Z++ > 1e3)
      throw new Error("Cannot find square root: probably non-prime P");
  }
  if (S === 1)
    return sqrt3mod4;
  let cc = _Fp.pow(Z, Q);
  const Q1div2 = (Q + _1n2) / _2n;
  return function tonelliSlow(Fp, n) {
    if (Fp.is0(n))
      return n;
    if (FpLegendre(Fp, n) !== 1)
      throw new Error("Cannot find square root");
    let M = S;
    let c = Fp.mul(Fp.ONE, cc);
    let t = Fp.pow(n, Q);
    let R = Fp.pow(n, Q1div2);
    while (!Fp.eql(t, Fp.ONE)) {
      if (Fp.is0(t))
        return Fp.ZERO;
      let i = 1;
      let t_tmp = Fp.sqr(t);
      while (!Fp.eql(t_tmp, Fp.ONE)) {
        i++;
        t_tmp = Fp.sqr(t_tmp);
        if (i === M)
          throw new Error("Cannot find square root");
      }
      const exponent = _1n2 << BigInt(M - i - 1);
      const b = Fp.pow(c, exponent);
      M = i;
      c = Fp.sqr(b);
      t = Fp.mul(t, c);
      R = Fp.mul(R, b);
    }
    return R;
  };
}
function FpSqrt(P) {
  if (P % _4n === _3n)
    return sqrt3mod4;
  if (P % _8n === _5n)
    return sqrt5mod8;
  if (P % _16n === _9n)
    return sqrt9mod16(P);
  return tonelliShanks(P);
}
var FIELD_FIELDS = [
  "create",
  "isValid",
  "is0",
  "neg",
  "inv",
  "sqrt",
  "sqr",
  "eql",
  "add",
  "sub",
  "mul",
  "pow",
  "div",
  "addN",
  "subN",
  "mulN",
  "sqrN"
];
function validateField(field) {
  const initial = {
    ORDER: "bigint",
    BYTES: "number",
    BITS: "number"
  };
  const opts = FIELD_FIELDS.reduce((map, val) => {
    map[val] = "function";
    return map;
  }, initial);
  validateObject(field, opts);
  return field;
}
function FpPow(Fp, num, power) {
  if (power < _0n2)
    throw new Error("invalid exponent, negatives unsupported");
  if (power === _0n2)
    return Fp.ONE;
  if (power === _1n2)
    return num;
  let p = Fp.ONE;
  let d = num;
  while (power > _0n2) {
    if (power & _1n2)
      p = Fp.mul(p, d);
    d = Fp.sqr(d);
    power >>= _1n2;
  }
  return p;
}
function FpInvertBatch(Fp, nums, passZero = false) {
  const inverted = new Array(nums.length).fill(passZero ? Fp.ZERO : void 0);
  const multipliedAcc = nums.reduce((acc, num, i) => {
    if (Fp.is0(num))
      return acc;
    inverted[i] = acc;
    return Fp.mul(acc, num);
  }, Fp.ONE);
  const invertedAcc = Fp.inv(multipliedAcc);
  nums.reduceRight((acc, num, i) => {
    if (Fp.is0(num))
      return acc;
    inverted[i] = Fp.mul(acc, inverted[i]);
    return Fp.mul(acc, num);
  }, invertedAcc);
  return inverted;
}
function FpLegendre(Fp, n) {
  const p1mod2 = (Fp.ORDER - _1n2) / _2n;
  const powered = Fp.pow(n, p1mod2);
  const yes = Fp.eql(powered, Fp.ONE);
  const zero = Fp.eql(powered, Fp.ZERO);
  const no = Fp.eql(powered, Fp.neg(Fp.ONE));
  if (!yes && !zero && !no)
    throw new Error("invalid Legendre symbol result");
  return yes ? 1 : zero ? 0 : -1;
}
function nLength(n, nBitLength) {
  if (nBitLength !== void 0)
    anumber(nBitLength);
  const _nBitLength = nBitLength !== void 0 ? nBitLength : n.toString(2).length;
  const nByteLength = Math.ceil(_nBitLength / 8);
  return { nBitLength: _nBitLength, nByteLength };
}
var _Field = class {
  ORDER;
  BITS;
  BYTES;
  isLE;
  ZERO = _0n2;
  ONE = _1n2;
  _lengths;
  _sqrt;
  // cached sqrt
  _mod;
  constructor(ORDER, opts = {}) {
    if (ORDER <= _0n2)
      throw new Error("invalid field: expected ORDER > 0, got " + ORDER);
    let _nbitLength = void 0;
    this.isLE = false;
    if (opts != null && typeof opts === "object") {
      if (typeof opts.BITS === "number")
        _nbitLength = opts.BITS;
      if (typeof opts.sqrt === "function")
        this.sqrt = opts.sqrt;
      if (typeof opts.isLE === "boolean")
        this.isLE = opts.isLE;
      if (opts.allowedLengths)
        this._lengths = opts.allowedLengths?.slice();
      if (typeof opts.modFromBytes === "boolean")
        this._mod = opts.modFromBytes;
    }
    const { nBitLength, nByteLength } = nLength(ORDER, _nbitLength);
    if (nByteLength > 2048)
      throw new Error("invalid field: expected ORDER of <= 2048 bytes");
    this.ORDER = ORDER;
    this.BITS = nBitLength;
    this.BYTES = nByteLength;
    this._sqrt = void 0;
    Object.preventExtensions(this);
  }
  create(num) {
    return mod(num, this.ORDER);
  }
  isValid(num) {
    if (typeof num !== "bigint")
      throw new Error("invalid field element: expected bigint, got " + typeof num);
    return _0n2 <= num && num < this.ORDER;
  }
  is0(num) {
    return num === _0n2;
  }
  // is valid and invertible
  isValidNot0(num) {
    return !this.is0(num) && this.isValid(num);
  }
  isOdd(num) {
    return (num & _1n2) === _1n2;
  }
  neg(num) {
    return mod(-num, this.ORDER);
  }
  eql(lhs, rhs) {
    return lhs === rhs;
  }
  sqr(num) {
    return mod(num * num, this.ORDER);
  }
  add(lhs, rhs) {
    return mod(lhs + rhs, this.ORDER);
  }
  sub(lhs, rhs) {
    return mod(lhs - rhs, this.ORDER);
  }
  mul(lhs, rhs) {
    return mod(lhs * rhs, this.ORDER);
  }
  pow(num, power) {
    return FpPow(this, num, power);
  }
  div(lhs, rhs) {
    return mod(lhs * invert(rhs, this.ORDER), this.ORDER);
  }
  // Same as above, but doesn't normalize
  sqrN(num) {
    return num * num;
  }
  addN(lhs, rhs) {
    return lhs + rhs;
  }
  subN(lhs, rhs) {
    return lhs - rhs;
  }
  mulN(lhs, rhs) {
    return lhs * rhs;
  }
  inv(num) {
    return invert(num, this.ORDER);
  }
  sqrt(num) {
    if (!this._sqrt)
      this._sqrt = FpSqrt(this.ORDER);
    return this._sqrt(this, num);
  }
  toBytes(num) {
    return this.isLE ? numberToBytesLE(num, this.BYTES) : numberToBytesBE(num, this.BYTES);
  }
  fromBytes(bytes, skipValidation = false) {
    abytes(bytes);
    const { _lengths: allowedLengths, BYTES, isLE, ORDER, _mod: modFromBytes } = this;
    if (allowedLengths) {
      if (!allowedLengths.includes(bytes.length) || bytes.length > BYTES) {
        throw new Error("Field.fromBytes: expected " + allowedLengths + " bytes, got " + bytes.length);
      }
      const padded = new Uint8Array(BYTES);
      padded.set(bytes, isLE ? 0 : padded.length - bytes.length);
      bytes = padded;
    }
    if (bytes.length !== BYTES)
      throw new Error("Field.fromBytes: expected " + BYTES + " bytes, got " + bytes.length);
    let scalar = isLE ? bytesToNumberLE(bytes) : bytesToNumberBE(bytes);
    if (modFromBytes)
      scalar = mod(scalar, ORDER);
    if (!skipValidation) {
      if (!this.isValid(scalar))
        throw new Error("invalid field element: outside of range 0..ORDER");
    }
    return scalar;
  }
  // TODO: we don't need it here, move out to separate fn
  invertBatch(lst) {
    return FpInvertBatch(this, lst);
  }
  // We can't move this out because Fp6, Fp12 implement it
  // and it's unclear what to return in there.
  cmov(a, b, condition) {
    return condition ? b : a;
  }
};
function Field(ORDER, opts = {}) {
  return new _Field(ORDER, opts);
}
function getFieldBytesLength(fieldOrder) {
  if (typeof fieldOrder !== "bigint")
    throw new Error("field order must be bigint");
  const bitLength = fieldOrder.toString(2).length;
  return Math.ceil(bitLength / 8);
}
function getMinHashLength(fieldOrder) {
  const length2 = getFieldBytesLength(fieldOrder);
  return length2 + Math.ceil(length2 / 2);
}
function mapHashToField(key, fieldOrder, isLE = false) {
  abytes(key);
  const len = key.length;
  const fieldLen = getFieldBytesLength(fieldOrder);
  const minLen = getMinHashLength(fieldOrder);
  if (len < 16 || len < minLen || len > 1024)
    throw new Error("expected " + minLen + "-1024 bytes of input, got " + len);
  const num = isLE ? bytesToNumberLE(key) : bytesToNumberBE(key);
  const reduced = mod(num, fieldOrder - _1n2) + _1n2;
  return isLE ? numberToBytesLE(reduced, fieldLen) : numberToBytesBE(reduced, fieldLen);
}

// node_modules/@noble/curves/abstract/curve.js
var _0n3 = /* @__PURE__ */ BigInt(0);
var _1n3 = /* @__PURE__ */ BigInt(1);
function negateCt(condition, item) {
  const neg = item.negate();
  return condition ? neg : item;
}
function normalizeZ(c, points) {
  const invertedZs = FpInvertBatch(c.Fp, points.map((p) => p.Z));
  return points.map((p, i) => c.fromAffine(p.toAffine(invertedZs[i])));
}
function validateW(W, bits) {
  if (!Number.isSafeInteger(W) || W <= 0 || W > bits)
    throw new Error("invalid window size, expected [1.." + bits + "], got W=" + W);
}
function calcWOpts(W, scalarBits) {
  validateW(W, scalarBits);
  const windows = Math.ceil(scalarBits / W) + 1;
  const windowSize = 2 ** (W - 1);
  const maxNumber = 2 ** W;
  const mask = bitMask(W);
  const shiftBy = BigInt(W);
  return { windows, windowSize, mask, maxNumber, shiftBy };
}
function calcOffsets(n, window2, wOpts) {
  const { windowSize, mask, maxNumber, shiftBy } = wOpts;
  let wbits = Number(n & mask);
  let nextN = n >> shiftBy;
  if (wbits > windowSize) {
    wbits -= maxNumber;
    nextN += _1n3;
  }
  const offsetStart = window2 * windowSize;
  const offset = offsetStart + Math.abs(wbits) - 1;
  const isZero = wbits === 0;
  const isNeg = wbits < 0;
  const isNegF = window2 % 2 !== 0;
  const offsetF = offsetStart;
  return { nextN, offset, isZero, isNeg, isNegF, offsetF };
}
var pointPrecomputes = /* @__PURE__ */ new WeakMap();
var pointWindowSizes = /* @__PURE__ */ new WeakMap();
function getW(P) {
  return pointWindowSizes.get(P) || 1;
}
function assert0(n) {
  if (n !== _0n3)
    throw new Error("invalid wNAF");
}
var wNAF = class {
  BASE;
  ZERO;
  Fn;
  bits;
  // Parametrized with a given Point class (not individual point)
  constructor(Point2, bits) {
    this.BASE = Point2.BASE;
    this.ZERO = Point2.ZERO;
    this.Fn = Point2.Fn;
    this.bits = bits;
  }
  // non-const time multiplication ladder
  _unsafeLadder(elm, n, p = this.ZERO) {
    let d = elm;
    while (n > _0n3) {
      if (n & _1n3)
        p = p.add(d);
      d = d.double();
      n >>= _1n3;
    }
    return p;
  }
  /**
   * Creates a wNAF precomputation window. Used for caching.
   * Default window size is set by `utils.precompute()` and is equal to 8.
   * Number of precomputed points depends on the curve size:
   * 2^(𝑊−1) * (Math.ceil(𝑛 / 𝑊) + 1), where:
   * - 𝑊 is the window size
   * - 𝑛 is the bitlength of the curve order.
   * For a 256-bit curve and window size 8, the number of precomputed points is 128 * 33 = 4224.
   * @param point Point instance
   * @param W window size
   * @returns precomputed point tables flattened to a single array
   */
  precomputeWindow(point, W) {
    const { windows, windowSize } = calcWOpts(W, this.bits);
    const points = [];
    let p = point;
    let base2 = p;
    for (let window2 = 0; window2 < windows; window2++) {
      base2 = p;
      points.push(base2);
      for (let i = 1; i < windowSize; i++) {
        base2 = base2.add(p);
        points.push(base2);
      }
      p = base2.double();
    }
    return points;
  }
  /**
   * Implements ec multiplication using precomputed tables and w-ary non-adjacent form.
   * More compact implementation:
   * https://github.com/paulmillr/noble-secp256k1/blob/47cb1669b6e506ad66b35fe7d76132ae97465da2/index.ts#L502-L541
   * @returns real and fake (for const-time) points
   */
  wNAF(W, precomputes, n) {
    if (!this.Fn.isValid(n))
      throw new Error("invalid scalar");
    let p = this.ZERO;
    let f = this.BASE;
    const wo = calcWOpts(W, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      const { nextN, offset, isZero, isNeg, isNegF, offsetF } = calcOffsets(n, window2, wo);
      n = nextN;
      if (isZero) {
        f = f.add(negateCt(isNegF, precomputes[offsetF]));
      } else {
        p = p.add(negateCt(isNeg, precomputes[offset]));
      }
    }
    assert0(n);
    return { p, f };
  }
  /**
   * Implements ec unsafe (non const-time) multiplication using precomputed tables and w-ary non-adjacent form.
   * @param acc accumulator point to add result of multiplication
   * @returns point
   */
  wNAFUnsafe(W, precomputes, n, acc = this.ZERO) {
    const wo = calcWOpts(W, this.bits);
    for (let window2 = 0; window2 < wo.windows; window2++) {
      if (n === _0n3)
        break;
      const { nextN, offset, isZero, isNeg } = calcOffsets(n, window2, wo);
      n = nextN;
      if (isZero) {
        continue;
      } else {
        const item = precomputes[offset];
        acc = acc.add(isNeg ? item.negate() : item);
      }
    }
    assert0(n);
    return acc;
  }
  getPrecomputes(W, point, transform) {
    let comp = pointPrecomputes.get(point);
    if (!comp) {
      comp = this.precomputeWindow(point, W);
      if (W !== 1) {
        if (typeof transform === "function")
          comp = transform(comp);
        pointPrecomputes.set(point, comp);
      }
    }
    return comp;
  }
  cached(point, scalar, transform) {
    const W = getW(point);
    return this.wNAF(W, this.getPrecomputes(W, point, transform), scalar);
  }
  unsafe(point, scalar, transform, prev) {
    const W = getW(point);
    if (W === 1)
      return this._unsafeLadder(point, scalar, prev);
    return this.wNAFUnsafe(W, this.getPrecomputes(W, point, transform), scalar, prev);
  }
  // We calculate precomputes for elliptic curve point multiplication
  // using windowed method. This specifies window size and
  // stores precomputed values. Usually only base point would be precomputed.
  createCache(P, W) {
    validateW(W, this.bits);
    pointWindowSizes.set(P, W);
    pointPrecomputes.delete(P);
  }
  hasCache(elm) {
    return getW(elm) !== 1;
  }
};
function mulEndoUnsafe(Point2, point, k1, k2) {
  let acc = point;
  let p1 = Point2.ZERO;
  let p2 = Point2.ZERO;
  while (k1 > _0n3 || k2 > _0n3) {
    if (k1 & _1n3)
      p1 = p1.add(acc);
    if (k2 & _1n3)
      p2 = p2.add(acc);
    acc = acc.double();
    k1 >>= _1n3;
    k2 >>= _1n3;
  }
  return { p1, p2 };
}
function createField(order, field, isLE) {
  if (field) {
    if (field.ORDER !== order)
      throw new Error("Field.ORDER must match order: Fp == p, Fn == n");
    validateField(field);
    return field;
  } else {
    return Field(order, { isLE });
  }
}
function createCurveFields(type, CURVE, curveOpts = {}, FpFnLE) {
  if (FpFnLE === void 0)
    FpFnLE = type === "edwards";
  if (!CURVE || typeof CURVE !== "object")
    throw new Error(`expected valid ${type} CURVE object`);
  for (const p of ["p", "n", "h"]) {
    const val = CURVE[p];
    if (!(typeof val === "bigint" && val > _0n3))
      throw new Error(`CURVE.${p} must be positive bigint`);
  }
  const Fp = createField(CURVE.p, curveOpts.Fp, FpFnLE);
  const Fn2 = createField(CURVE.n, curveOpts.Fn, FpFnLE);
  const _b = type === "weierstrass" ? "b" : "d";
  const params = ["Gx", "Gy", "a", _b];
  for (const p of params) {
    if (!Fp.isValid(CURVE[p]))
      throw new Error(`CURVE.${p} must be valid field element of CURVE.Fp`);
  }
  CURVE = Object.freeze(Object.assign({}, CURVE));
  return { CURVE, Fp, Fn: Fn2 };
}
function createKeygen(randomSecretKey, getPublicKey) {
  return function keygen(seed) {
    const secretKey = randomSecretKey(seed);
    return { secretKey, publicKey: getPublicKey(secretKey) };
  };
}

// node_modules/@noble/curves/node_modules/@noble/hashes/hmac.js
var _HMAC = class {
  oHash;
  iHash;
  blockLen;
  outputLen;
  finished = false;
  destroyed = false;
  constructor(hash, key) {
    ahash(hash);
    abytes(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean(pad);
  }
  update(buf) {
    aexists(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists(this);
    abytes(out, this.outputLen, "output");
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac = (hash, key, message) => new _HMAC(hash, key).update(message).digest();
hmac.create = (hash, key) => new _HMAC(hash, key);

// node_modules/@noble/curves/abstract/weierstrass.js
var divNearest = (num, den) => (num + (num >= 0 ? den : -den) / _2n2) / den;
function _splitEndoScalar(k, basis, n) {
  const [[a1, b1], [a2, b2]] = basis;
  const c1 = divNearest(b2 * k, n);
  const c2 = divNearest(-b1 * k, n);
  let k1 = k - c1 * a1 - c2 * a2;
  let k2 = -c1 * b1 - c2 * b2;
  const k1neg = k1 < _0n4;
  const k2neg = k2 < _0n4;
  if (k1neg)
    k1 = -k1;
  if (k2neg)
    k2 = -k2;
  const MAX_NUM = bitMask(Math.ceil(bitLen(n) / 2)) + _1n4;
  if (k1 < _0n4 || k1 >= MAX_NUM || k2 < _0n4 || k2 >= MAX_NUM) {
    throw new Error("splitScalar (endomorphism): failed, k=" + k);
  }
  return { k1neg, k1, k2neg, k2 };
}
function validateSigFormat(format) {
  if (!["compact", "recovered", "der"].includes(format))
    throw new Error('Signature format must be "compact", "recovered", or "der"');
  return format;
}
function validateSigOpts(opts, def) {
  const optsn = {};
  for (let optName of Object.keys(def)) {
    optsn[optName] = opts[optName] === void 0 ? def[optName] : opts[optName];
  }
  abool(optsn.lowS, "lowS");
  abool(optsn.prehash, "prehash");
  if (optsn.format !== void 0)
    validateSigFormat(optsn.format);
  return optsn;
}
var DERErr = class extends Error {
  constructor(m = "") {
    super(m);
  }
};
var DER = {
  // asn.1 DER encoding utils
  Err: DERErr,
  // Basic building block is TLV (Tag-Length-Value)
  _tlv: {
    encode: (tag, data) => {
      const { Err: E } = DER;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length & 1)
        throw new E("tlv.encode: unpadded data");
      const dataLen = data.length / 2;
      const len = numberToHexUnpadded(dataLen);
      if (len.length / 2 & 128)
        throw new E("tlv.encode: long form length too big");
      const lenLen = dataLen > 127 ? numberToHexUnpadded(len.length / 2 | 128) : "";
      const t = numberToHexUnpadded(tag);
      return t + lenLen + len + data;
    },
    // v - value, l - left bytes (unparsed)
    decode(tag, data) {
      const { Err: E } = DER;
      let pos = 0;
      if (tag < 0 || tag > 256)
        throw new E("tlv.encode: wrong tag");
      if (data.length < 2 || data[pos++] !== tag)
        throw new E("tlv.decode: wrong tlv");
      const first = data[pos++];
      const isLong = !!(first & 128);
      let length2 = 0;
      if (!isLong)
        length2 = first;
      else {
        const lenLen = first & 127;
        if (!lenLen)
          throw new E("tlv.decode(long): indefinite length not supported");
        if (lenLen > 4)
          throw new E("tlv.decode(long): byte length is too big");
        const lengthBytes = data.subarray(pos, pos + lenLen);
        if (lengthBytes.length !== lenLen)
          throw new E("tlv.decode: length bytes not complete");
        if (lengthBytes[0] === 0)
          throw new E("tlv.decode(long): zero leftmost byte");
        for (const b of lengthBytes)
          length2 = length2 << 8 | b;
        pos += lenLen;
        if (length2 < 128)
          throw new E("tlv.decode(long): not minimal encoding");
      }
      const v = data.subarray(pos, pos + length2);
      if (v.length !== length2)
        throw new E("tlv.decode: wrong value length");
      return { v, l: data.subarray(pos + length2) };
    }
  },
  // https://crypto.stackexchange.com/a/57734 Leftmost bit of first byte is 'negative' flag,
  // since we always use positive integers here. It must always be empty:
  // - add zero byte if exists
  // - if next byte doesn't have a flag, leading zero is not allowed (minimal encoding)
  _int: {
    encode(num) {
      const { Err: E } = DER;
      if (num < _0n4)
        throw new E("integer: negative integers are not allowed");
      let hex = numberToHexUnpadded(num);
      if (Number.parseInt(hex[0], 16) & 8)
        hex = "00" + hex;
      if (hex.length & 1)
        throw new E("unexpected DER parsing assertion: unpadded hex");
      return hex;
    },
    decode(data) {
      const { Err: E } = DER;
      if (data[0] & 128)
        throw new E("invalid signature integer: negative");
      if (data[0] === 0 && !(data[1] & 128))
        throw new E("invalid signature integer: unnecessary leading zero");
      return bytesToNumberBE(data);
    }
  },
  toSig(bytes) {
    const { Err: E, _int: int, _tlv: tlv } = DER;
    const data = abytes(bytes, void 0, "signature");
    const { v: seqBytes, l: seqLeftBytes } = tlv.decode(48, data);
    if (seqLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    const { v: rBytes, l: rLeftBytes } = tlv.decode(2, seqBytes);
    const { v: sBytes, l: sLeftBytes } = tlv.decode(2, rLeftBytes);
    if (sLeftBytes.length)
      throw new E("invalid signature: left bytes after parsing");
    return { r: int.decode(rBytes), s: int.decode(sBytes) };
  },
  hexFromSig(sig) {
    const { _tlv: tlv, _int: int } = DER;
    const rs = tlv.encode(2, int.encode(sig.r));
    const ss = tlv.encode(2, int.encode(sig.s));
    const seq = rs + ss;
    return tlv.encode(48, seq);
  }
};
var _0n4 = BigInt(0);
var _1n4 = BigInt(1);
var _2n2 = BigInt(2);
var _3n2 = BigInt(3);
var _4n2 = BigInt(4);
function weierstrass(params, extraOpts = {}) {
  const validated = createCurveFields("weierstrass", params, extraOpts);
  const { Fp, Fn: Fn2 } = validated;
  let CURVE = validated.CURVE;
  const { h: cofactor, n: CURVE_ORDER } = CURVE;
  validateObject(extraOpts, {}, {
    allowInfinityPoint: "boolean",
    clearCofactor: "function",
    isTorsionFree: "function",
    fromBytes: "function",
    toBytes: "function",
    endo: "object"
  });
  const { endo } = extraOpts;
  if (endo) {
    if (!Fp.is0(CURVE.a) || typeof endo.beta !== "bigint" || !Array.isArray(endo.basises)) {
      throw new Error('invalid endo: expected "beta": bigint and "basises": array');
    }
  }
  const lengths = getWLengths(Fp, Fn2);
  function assertCompressionIsSupported() {
    if (!Fp.isOdd)
      throw new Error("compression is not supported: Field does not have .isOdd()");
  }
  function pointToBytes(_c, point, isCompressed) {
    const { x, y } = point.toAffine();
    const bx = Fp.toBytes(x);
    abool(isCompressed, "isCompressed");
    if (isCompressed) {
      assertCompressionIsSupported();
      const hasEvenY = !Fp.isOdd(y);
      return concatBytes(pprefix(hasEvenY), bx);
    } else {
      return concatBytes(Uint8Array.of(4), bx, Fp.toBytes(y));
    }
  }
  function pointFromBytes(bytes) {
    abytes(bytes, void 0, "Point");
    const { publicKey: comp, publicKeyUncompressed: uncomp } = lengths;
    const length2 = bytes.length;
    const head = bytes[0];
    const tail = bytes.subarray(1);
    if (length2 === comp && (head === 2 || head === 3)) {
      const x = Fp.fromBytes(tail);
      if (!Fp.isValid(x))
        throw new Error("bad point: is not on curve, wrong x");
      const y2 = weierstrassEquation(x);
      let y;
      try {
        y = Fp.sqrt(y2);
      } catch (sqrtError) {
        const err = sqrtError instanceof Error ? ": " + sqrtError.message : "";
        throw new Error("bad point: is not on curve, sqrt error" + err);
      }
      assertCompressionIsSupported();
      const evenY = Fp.isOdd(y);
      const evenH = (head & 1) === 1;
      if (evenH !== evenY)
        y = Fp.neg(y);
      return { x, y };
    } else if (length2 === uncomp && head === 4) {
      const L = Fp.BYTES;
      const x = Fp.fromBytes(tail.subarray(0, L));
      const y = Fp.fromBytes(tail.subarray(L, L * 2));
      if (!isValidXY(x, y))
        throw new Error("bad point: is not on curve");
      return { x, y };
    } else {
      throw new Error(`bad point: got length ${length2}, expected compressed=${comp} or uncompressed=${uncomp}`);
    }
  }
  const encodePoint = extraOpts.toBytes || pointToBytes;
  const decodePoint = extraOpts.fromBytes || pointFromBytes;
  function weierstrassEquation(x) {
    const x2 = Fp.sqr(x);
    const x3 = Fp.mul(x2, x);
    return Fp.add(Fp.add(x3, Fp.mul(x, CURVE.a)), CURVE.b);
  }
  function isValidXY(x, y) {
    const left = Fp.sqr(y);
    const right = weierstrassEquation(x);
    return Fp.eql(left, right);
  }
  if (!isValidXY(CURVE.Gx, CURVE.Gy))
    throw new Error("bad curve params: generator point");
  const _4a3 = Fp.mul(Fp.pow(CURVE.a, _3n2), _4n2);
  const _27b2 = Fp.mul(Fp.sqr(CURVE.b), BigInt(27));
  if (Fp.is0(Fp.add(_4a3, _27b2)))
    throw new Error("bad curve params: a or b");
  function acoord(title, n, banZero = false) {
    if (!Fp.isValid(n) || banZero && Fp.is0(n))
      throw new Error(`bad point coordinate ${title}`);
    return n;
  }
  function aprjpoint(other) {
    if (!(other instanceof Point2))
      throw new Error("Weierstrass Point expected");
  }
  function splitEndoScalarN(k) {
    if (!endo || !endo.basises)
      throw new Error("no endo");
    return _splitEndoScalar(k, endo.basises, Fn2.ORDER);
  }
  const toAffineMemo = memoized((p, iz) => {
    const { X, Y, Z } = p;
    if (Fp.eql(Z, Fp.ONE))
      return { x: X, y: Y };
    const is0 = p.is0();
    if (iz == null)
      iz = is0 ? Fp.ONE : Fp.inv(Z);
    const x = Fp.mul(X, iz);
    const y = Fp.mul(Y, iz);
    const zz = Fp.mul(Z, iz);
    if (is0)
      return { x: Fp.ZERO, y: Fp.ZERO };
    if (!Fp.eql(zz, Fp.ONE))
      throw new Error("invZ was invalid");
    return { x, y };
  });
  const assertValidMemo = memoized((p) => {
    if (p.is0()) {
      if (extraOpts.allowInfinityPoint && !Fp.is0(p.Y))
        return;
      throw new Error("bad point: ZERO");
    }
    const { x, y } = p.toAffine();
    if (!Fp.isValid(x) || !Fp.isValid(y))
      throw new Error("bad point: x or y not field elements");
    if (!isValidXY(x, y))
      throw new Error("bad point: equation left != right");
    if (!p.isTorsionFree())
      throw new Error("bad point: not in prime-order subgroup");
    return true;
  });
  function finishEndo(endoBeta, k1p, k2p, k1neg, k2neg) {
    k2p = new Point2(Fp.mul(k2p.X, endoBeta), k2p.Y, k2p.Z);
    k1p = negateCt(k1neg, k1p);
    k2p = negateCt(k2neg, k2p);
    return k1p.add(k2p);
  }
  class Point2 {
    // base / generator point
    static BASE = new Point2(CURVE.Gx, CURVE.Gy, Fp.ONE);
    // zero / infinity / identity point
    static ZERO = new Point2(Fp.ZERO, Fp.ONE, Fp.ZERO);
    // 0, 1, 0
    // math field
    static Fp = Fp;
    // scalar field
    static Fn = Fn2;
    X;
    Y;
    Z;
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    constructor(X, Y, Z) {
      this.X = acoord("x", X);
      this.Y = acoord("y", Y, true);
      this.Z = acoord("z", Z);
      Object.freeze(this);
    }
    static CURVE() {
      return CURVE;
    }
    /** Does NOT validate if the point is valid. Use `.assertValidity()`. */
    static fromAffine(p) {
      const { x, y } = p || {};
      if (!p || !Fp.isValid(x) || !Fp.isValid(y))
        throw new Error("invalid affine point");
      if (p instanceof Point2)
        throw new Error("projective point not allowed");
      if (Fp.is0(x) && Fp.is0(y))
        return Point2.ZERO;
      return new Point2(x, y, Fp.ONE);
    }
    static fromBytes(bytes) {
      const P = Point2.fromAffine(decodePoint(abytes(bytes, void 0, "point")));
      P.assertValidity();
      return P;
    }
    static fromHex(hex) {
      return Point2.fromBytes(hexToBytes(hex));
    }
    get x() {
      return this.toAffine().x;
    }
    get y() {
      return this.toAffine().y;
    }
    /**
     *
     * @param windowSize
     * @param isLazy true will defer table computation until the first multiplication
     * @returns
     */
    precompute(windowSize = 8, isLazy = true) {
      wnaf.createCache(this, windowSize);
      if (!isLazy)
        this.multiply(_3n2);
      return this;
    }
    // TODO: return `this`
    /** A point on curve is valid if it conforms to equation. */
    assertValidity() {
      assertValidMemo(this);
    }
    hasEvenY() {
      const { y } = this.toAffine();
      if (!Fp.isOdd)
        throw new Error("Field doesn't support isOdd");
      return !Fp.isOdd(y);
    }
    /** Compare one point to another. */
    equals(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      const U1 = Fp.eql(Fp.mul(X1, Z2), Fp.mul(X2, Z1));
      const U2 = Fp.eql(Fp.mul(Y1, Z2), Fp.mul(Y2, Z1));
      return U1 && U2;
    }
    /** Flips point to one corresponding to (x, -y) in Affine coordinates. */
    negate() {
      return new Point2(this.X, Fp.neg(this.Y), this.Z);
    }
    // Renes-Costello-Batina exception-free doubling formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 3
    // Cost: 8M + 3S + 3*a + 2*b3 + 15add.
    double() {
      const { a, b } = CURVE;
      const b3 = Fp.mul(b, _3n2);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      let t0 = Fp.mul(X1, X1);
      let t1 = Fp.mul(Y1, Y1);
      let t2 = Fp.mul(Z1, Z1);
      let t3 = Fp.mul(X1, Y1);
      t3 = Fp.add(t3, t3);
      Z3 = Fp.mul(X1, Z1);
      Z3 = Fp.add(Z3, Z3);
      X3 = Fp.mul(a, Z3);
      Y3 = Fp.mul(b3, t2);
      Y3 = Fp.add(X3, Y3);
      X3 = Fp.sub(t1, Y3);
      Y3 = Fp.add(t1, Y3);
      Y3 = Fp.mul(X3, Y3);
      X3 = Fp.mul(t3, X3);
      Z3 = Fp.mul(b3, Z3);
      t2 = Fp.mul(a, t2);
      t3 = Fp.sub(t0, t2);
      t3 = Fp.mul(a, t3);
      t3 = Fp.add(t3, Z3);
      Z3 = Fp.add(t0, t0);
      t0 = Fp.add(Z3, t0);
      t0 = Fp.add(t0, t2);
      t0 = Fp.mul(t0, t3);
      Y3 = Fp.add(Y3, t0);
      t2 = Fp.mul(Y1, Z1);
      t2 = Fp.add(t2, t2);
      t0 = Fp.mul(t2, t3);
      X3 = Fp.sub(X3, t0);
      Z3 = Fp.mul(t2, t1);
      Z3 = Fp.add(Z3, Z3);
      Z3 = Fp.add(Z3, Z3);
      return new Point2(X3, Y3, Z3);
    }
    // Renes-Costello-Batina exception-free addition formula.
    // There is 30% faster Jacobian formula, but it is not complete.
    // https://eprint.iacr.org/2015/1060, algorithm 1
    // Cost: 12M + 0S + 3*a + 3*b3 + 23add.
    add(other) {
      aprjpoint(other);
      const { X: X1, Y: Y1, Z: Z1 } = this;
      const { X: X2, Y: Y2, Z: Z2 } = other;
      let X3 = Fp.ZERO, Y3 = Fp.ZERO, Z3 = Fp.ZERO;
      const a = CURVE.a;
      const b3 = Fp.mul(CURVE.b, _3n2);
      let t0 = Fp.mul(X1, X2);
      let t1 = Fp.mul(Y1, Y2);
      let t2 = Fp.mul(Z1, Z2);
      let t3 = Fp.add(X1, Y1);
      let t4 = Fp.add(X2, Y2);
      t3 = Fp.mul(t3, t4);
      t4 = Fp.add(t0, t1);
      t3 = Fp.sub(t3, t4);
      t4 = Fp.add(X1, Z1);
      let t5 = Fp.add(X2, Z2);
      t4 = Fp.mul(t4, t5);
      t5 = Fp.add(t0, t2);
      t4 = Fp.sub(t4, t5);
      t5 = Fp.add(Y1, Z1);
      X3 = Fp.add(Y2, Z2);
      t5 = Fp.mul(t5, X3);
      X3 = Fp.add(t1, t2);
      t5 = Fp.sub(t5, X3);
      Z3 = Fp.mul(a, t4);
      X3 = Fp.mul(b3, t2);
      Z3 = Fp.add(X3, Z3);
      X3 = Fp.sub(t1, Z3);
      Z3 = Fp.add(t1, Z3);
      Y3 = Fp.mul(X3, Z3);
      t1 = Fp.add(t0, t0);
      t1 = Fp.add(t1, t0);
      t2 = Fp.mul(a, t2);
      t4 = Fp.mul(b3, t4);
      t1 = Fp.add(t1, t2);
      t2 = Fp.sub(t0, t2);
      t2 = Fp.mul(a, t2);
      t4 = Fp.add(t4, t2);
      t0 = Fp.mul(t1, t4);
      Y3 = Fp.add(Y3, t0);
      t0 = Fp.mul(t5, t4);
      X3 = Fp.mul(t3, X3);
      X3 = Fp.sub(X3, t0);
      t0 = Fp.mul(t3, t1);
      Z3 = Fp.mul(t5, Z3);
      Z3 = Fp.add(Z3, t0);
      return new Point2(X3, Y3, Z3);
    }
    subtract(other) {
      return this.add(other.negate());
    }
    is0() {
      return this.equals(Point2.ZERO);
    }
    /**
     * Constant time multiplication.
     * Uses wNAF method. Windowed method may be 10% faster,
     * but takes 2x longer to generate and consumes 2x memory.
     * Uses precomputes when available.
     * Uses endomorphism for Koblitz curves.
     * @param scalar by which the point would be multiplied
     * @returns New point
     */
    multiply(scalar) {
      const { endo: endo2 } = extraOpts;
      if (!Fn2.isValidNot0(scalar))
        throw new Error("invalid scalar: out of range");
      let point, fake;
      const mul = (n) => wnaf.cached(this, n, (p) => normalizeZ(Point2, p));
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(scalar);
        const { p: k1p, f: k1f } = mul(k1);
        const { p: k2p, f: k2f } = mul(k2);
        fake = k1f.add(k2f);
        point = finishEndo(endo2.beta, k1p, k2p, k1neg, k2neg);
      } else {
        const { p, f } = mul(scalar);
        point = p;
        fake = f;
      }
      return normalizeZ(Point2, [point, fake])[0];
    }
    /**
     * Non-constant-time multiplication. Uses double-and-add algorithm.
     * It's faster, but should only be used when you don't care about
     * an exposed secret key e.g. sig verification, which works over *public* keys.
     */
    multiplyUnsafe(sc) {
      const { endo: endo2 } = extraOpts;
      const p = this;
      if (!Fn2.isValid(sc))
        throw new Error("invalid scalar: out of range");
      if (sc === _0n4 || p.is0())
        return Point2.ZERO;
      if (sc === _1n4)
        return p;
      if (wnaf.hasCache(this))
        return this.multiply(sc);
      if (endo2) {
        const { k1neg, k1, k2neg, k2 } = splitEndoScalarN(sc);
        const { p1, p2 } = mulEndoUnsafe(Point2, p, k1, k2);
        return finishEndo(endo2.beta, p1, p2, k1neg, k2neg);
      } else {
        return wnaf.unsafe(p, sc);
      }
    }
    /**
     * Converts Projective point to affine (x, y) coordinates.
     * @param invertedZ Z^-1 (inverted zero) - optional, precomputation is useful for invertBatch
     */
    toAffine(invertedZ) {
      return toAffineMemo(this, invertedZ);
    }
    /**
     * Checks whether Point is free of torsion elements (is in prime subgroup).
     * Always torsion-free for cofactor=1 curves.
     */
    isTorsionFree() {
      const { isTorsionFree } = extraOpts;
      if (cofactor === _1n4)
        return true;
      if (isTorsionFree)
        return isTorsionFree(Point2, this);
      return wnaf.unsafe(this, CURVE_ORDER).is0();
    }
    clearCofactor() {
      const { clearCofactor } = extraOpts;
      if (cofactor === _1n4)
        return this;
      if (clearCofactor)
        return clearCofactor(Point2, this);
      return this.multiplyUnsafe(cofactor);
    }
    isSmallOrder() {
      return this.multiplyUnsafe(cofactor).is0();
    }
    toBytes(isCompressed = true) {
      abool(isCompressed, "isCompressed");
      this.assertValidity();
      return encodePoint(Point2, this, isCompressed);
    }
    toHex(isCompressed = true) {
      return bytesToHex(this.toBytes(isCompressed));
    }
    toString() {
      return `<Point ${this.is0() ? "ZERO" : this.toHex()}>`;
    }
  }
  const bits = Fn2.BITS;
  const wnaf = new wNAF(Point2, extraOpts.endo ? Math.ceil(bits / 2) : bits);
  Point2.BASE.precompute(8);
  return Point2;
}
function pprefix(hasEvenY) {
  return Uint8Array.of(hasEvenY ? 2 : 3);
}
function getWLengths(Fp, Fn2) {
  return {
    secretKey: Fn2.BYTES,
    publicKey: 1 + Fp.BYTES,
    publicKeyUncompressed: 1 + 2 * Fp.BYTES,
    publicKeyHasPrefix: true,
    signature: 2 * Fn2.BYTES
  };
}
function ecdh(Point2, ecdhOpts = {}) {
  const { Fn: Fn2 } = Point2;
  const randomBytes_ = ecdhOpts.randomBytes || randomBytes;
  const lengths = Object.assign(getWLengths(Point2.Fp, Fn2), { seed: getMinHashLength(Fn2.ORDER) });
  function isValidSecretKey(secretKey) {
    try {
      const num = Fn2.fromBytes(secretKey);
      return Fn2.isValidNot0(num);
    } catch (error) {
      return false;
    }
  }
  function isValidPublicKey(publicKey, isCompressed) {
    const { publicKey: comp, publicKeyUncompressed } = lengths;
    try {
      const l = publicKey.length;
      if (isCompressed === true && l !== comp)
        return false;
      if (isCompressed === false && l !== publicKeyUncompressed)
        return false;
      return !!Point2.fromBytes(publicKey);
    } catch (error) {
      return false;
    }
  }
  function randomSecretKey(seed = randomBytes_(lengths.seed)) {
    return mapHashToField(abytes(seed, lengths.seed, "seed"), Fn2.ORDER);
  }
  function getPublicKey(secretKey, isCompressed = true) {
    return Point2.BASE.multiply(Fn2.fromBytes(secretKey)).toBytes(isCompressed);
  }
  function isProbPub(item) {
    const { secretKey, publicKey, publicKeyUncompressed } = lengths;
    if (!isBytes(item))
      return void 0;
    if ("_lengths" in Fn2 && Fn2._lengths || secretKey === publicKey)
      return void 0;
    const l = abytes(item, void 0, "key").length;
    return l === publicKey || l === publicKeyUncompressed;
  }
  function getSharedSecret(secretKeyA, publicKeyB, isCompressed = true) {
    if (isProbPub(secretKeyA) === true)
      throw new Error("first arg must be private key");
    if (isProbPub(publicKeyB) === false)
      throw new Error("second arg must be public key");
    const s = Fn2.fromBytes(secretKeyA);
    const b = Point2.fromBytes(publicKeyB);
    return b.multiply(s).toBytes(isCompressed);
  }
  const utils2 = {
    isValidSecretKey,
    isValidPublicKey,
    randomSecretKey
  };
  const keygen = createKeygen(randomSecretKey, getPublicKey);
  return Object.freeze({ getPublicKey, getSharedSecret, keygen, Point: Point2, utils: utils2, lengths });
}
function ecdsa(Point2, hash, ecdsaOpts = {}) {
  ahash(hash);
  validateObject(ecdsaOpts, {}, {
    hmac: "function",
    lowS: "boolean",
    randomBytes: "function",
    bits2int: "function",
    bits2int_modN: "function"
  });
  ecdsaOpts = Object.assign({}, ecdsaOpts);
  const randomBytes3 = ecdsaOpts.randomBytes || randomBytes;
  const hmac4 = ecdsaOpts.hmac || ((key, msg) => hmac(hash, key, msg));
  const { Fp, Fn: Fn2 } = Point2;
  const { ORDER: CURVE_ORDER, BITS: fnBits } = Fn2;
  const { keygen, getPublicKey, getSharedSecret, utils: utils2, lengths } = ecdh(Point2, ecdsaOpts);
  const defaultSigOpts = {
    prehash: true,
    lowS: typeof ecdsaOpts.lowS === "boolean" ? ecdsaOpts.lowS : true,
    format: "compact",
    extraEntropy: false
  };
  const hasLargeCofactor = CURVE_ORDER * _2n2 < Fp.ORDER;
  function isBiggerThanHalfOrder(number2) {
    const HALF = CURVE_ORDER >> _1n4;
    return number2 > HALF;
  }
  function validateRS(title, num) {
    if (!Fn2.isValidNot0(num))
      throw new Error(`invalid signature ${title}: out of range 1..Point.Fn.ORDER`);
    return num;
  }
  function assertSmallCofactor() {
    if (hasLargeCofactor)
      throw new Error('"recovered" sig type is not supported for cofactor >2 curves');
  }
  function validateSigLength(bytes, format) {
    validateSigFormat(format);
    const size = lengths.signature;
    const sizer = format === "compact" ? size : format === "recovered" ? size + 1 : void 0;
    return abytes(bytes, sizer);
  }
  class Signature {
    r;
    s;
    recovery;
    constructor(r, s, recovery) {
      this.r = validateRS("r", r);
      this.s = validateRS("s", s);
      if (recovery != null) {
        assertSmallCofactor();
        if (![0, 1, 2, 3].includes(recovery))
          throw new Error("invalid recovery id");
        this.recovery = recovery;
      }
      Object.freeze(this);
    }
    static fromBytes(bytes, format = defaultSigOpts.format) {
      validateSigLength(bytes, format);
      let recid;
      if (format === "der") {
        const { r: r2, s: s2 } = DER.toSig(abytes(bytes));
        return new Signature(r2, s2);
      }
      if (format === "recovered") {
        recid = bytes[0];
        format = "compact";
        bytes = bytes.subarray(1);
      }
      const L = lengths.signature / 2;
      const r = bytes.subarray(0, L);
      const s = bytes.subarray(L, L * 2);
      return new Signature(Fn2.fromBytes(r), Fn2.fromBytes(s), recid);
    }
    static fromHex(hex, format) {
      return this.fromBytes(hexToBytes(hex), format);
    }
    assertRecovery() {
      const { recovery } = this;
      if (recovery == null)
        throw new Error("invalid recovery id: must be present");
      return recovery;
    }
    addRecoveryBit(recovery) {
      return new Signature(this.r, this.s, recovery);
    }
    recoverPublicKey(messageHash) {
      const { r, s } = this;
      const recovery = this.assertRecovery();
      const radj = recovery === 2 || recovery === 3 ? r + CURVE_ORDER : r;
      if (!Fp.isValid(radj))
        throw new Error("invalid recovery id: sig.r+curve.n != R.x");
      const x = Fp.toBytes(radj);
      const R = Point2.fromBytes(concatBytes(pprefix((recovery & 1) === 0), x));
      const ir = Fn2.inv(radj);
      const h = bits2int_modN(abytes(messageHash, void 0, "msgHash"));
      const u1 = Fn2.create(-h * ir);
      const u2 = Fn2.create(s * ir);
      const Q = Point2.BASE.multiplyUnsafe(u1).add(R.multiplyUnsafe(u2));
      if (Q.is0())
        throw new Error("invalid recovery: point at infinify");
      Q.assertValidity();
      return Q;
    }
    // Signatures should be low-s, to prevent malleability.
    hasHighS() {
      return isBiggerThanHalfOrder(this.s);
    }
    toBytes(format = defaultSigOpts.format) {
      validateSigFormat(format);
      if (format === "der")
        return hexToBytes(DER.hexFromSig(this));
      const { r, s } = this;
      const rb = Fn2.toBytes(r);
      const sb = Fn2.toBytes(s);
      if (format === "recovered") {
        assertSmallCofactor();
        return concatBytes(Uint8Array.of(this.assertRecovery()), rb, sb);
      }
      return concatBytes(rb, sb);
    }
    toHex(format) {
      return bytesToHex(this.toBytes(format));
    }
  }
  const bits2int = ecdsaOpts.bits2int || function bits2int_def(bytes) {
    if (bytes.length > 8192)
      throw new Error("input is too large");
    const num = bytesToNumberBE(bytes);
    const delta = bytes.length * 8 - fnBits;
    return delta > 0 ? num >> BigInt(delta) : num;
  };
  const bits2int_modN = ecdsaOpts.bits2int_modN || function bits2int_modN_def(bytes) {
    return Fn2.create(bits2int(bytes));
  };
  const ORDER_MASK = bitMask(fnBits);
  function int2octets(num) {
    aInRange("num < 2^" + fnBits, num, _0n4, ORDER_MASK);
    return Fn2.toBytes(num);
  }
  function validateMsgAndHash(message, prehash) {
    abytes(message, void 0, "message");
    return prehash ? abytes(hash(message), void 0, "prehashed message") : message;
  }
  function prepSig(message, secretKey, opts) {
    const { lowS, prehash, extraEntropy } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    const h1int = bits2int_modN(message);
    const d = Fn2.fromBytes(secretKey);
    if (!Fn2.isValidNot0(d))
      throw new Error("invalid private key");
    const seedArgs = [int2octets(d), int2octets(h1int)];
    if (extraEntropy != null && extraEntropy !== false) {
      const e = extraEntropy === true ? randomBytes3(lengths.secretKey) : extraEntropy;
      seedArgs.push(abytes(e, void 0, "extraEntropy"));
    }
    const seed = concatBytes(...seedArgs);
    const m = h1int;
    function k2sig(kBytes) {
      const k = bits2int(kBytes);
      if (!Fn2.isValidNot0(k))
        return;
      const ik = Fn2.inv(k);
      const q = Point2.BASE.multiply(k).toAffine();
      const r = Fn2.create(q.x);
      if (r === _0n4)
        return;
      const s = Fn2.create(ik * Fn2.create(m + r * d));
      if (s === _0n4)
        return;
      let recovery = (q.x === r ? 0 : 2) | Number(q.y & _1n4);
      let normS = s;
      if (lowS && isBiggerThanHalfOrder(s)) {
        normS = Fn2.neg(s);
        recovery ^= 1;
      }
      return new Signature(r, normS, hasLargeCofactor ? void 0 : recovery);
    }
    return { seed, k2sig };
  }
  function sign(message, secretKey, opts = {}) {
    const { seed, k2sig } = prepSig(message, secretKey, opts);
    const drbg = createHmacDrbg(hash.outputLen, Fn2.BYTES, hmac4);
    const sig = drbg(seed, k2sig);
    return sig.toBytes(opts.format);
  }
  function verify(signature2, message, publicKey, opts = {}) {
    const { lowS, prehash, format } = validateSigOpts(opts, defaultSigOpts);
    publicKey = abytes(publicKey, void 0, "publicKey");
    message = validateMsgAndHash(message, prehash);
    if (!isBytes(signature2)) {
      const end = signature2 instanceof Signature ? ", use sig.toBytes()" : "";
      throw new Error("verify expects Uint8Array signature" + end);
    }
    validateSigLength(signature2, format);
    try {
      const sig = Signature.fromBytes(signature2, format);
      const P = Point2.fromBytes(publicKey);
      if (lowS && sig.hasHighS())
        return false;
      const { r, s } = sig;
      const h = bits2int_modN(message);
      const is2 = Fn2.inv(s);
      const u1 = Fn2.create(h * is2);
      const u2 = Fn2.create(r * is2);
      const R = Point2.BASE.multiplyUnsafe(u1).add(P.multiplyUnsafe(u2));
      if (R.is0())
        return false;
      const v = Fn2.create(R.x);
      return v === r;
    } catch (e) {
      return false;
    }
  }
  function recoverPublicKey(signature2, message, opts = {}) {
    const { prehash } = validateSigOpts(opts, defaultSigOpts);
    message = validateMsgAndHash(message, prehash);
    return Signature.fromBytes(signature2, "recovered").recoverPublicKey(message).toBytes();
  }
  return Object.freeze({
    keygen,
    getPublicKey,
    getSharedSecret,
    utils: utils2,
    lengths,
    Point: Point2,
    sign,
    verify,
    recoverPublicKey,
    Signature,
    hash
  });
}

// node_modules/@noble/curves/secp256k1.js
var secp256k1_CURVE = {
  p: BigInt("0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"),
  n: BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141"),
  h: BigInt(1),
  a: BigInt(0),
  b: BigInt(7),
  Gx: BigInt("0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"),
  Gy: BigInt("0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8")
};
var secp256k1_ENDO = {
  beta: BigInt("0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee"),
  basises: [
    [BigInt("0x3086d221a7d46bcde86c90e49284eb15"), -BigInt("0xe4437ed6010e88286f547fa90abfe4c3")],
    [BigInt("0x114ca50f7a8e2f3f657c1108d9d44cfd8"), BigInt("0x3086d221a7d46bcde86c90e49284eb15")]
  ]
};
var _2n3 = /* @__PURE__ */ BigInt(2);
function sqrtMod(y) {
  const P = secp256k1_CURVE.p;
  const _3n3 = BigInt(3), _6n = BigInt(6), _11n = BigInt(11), _22n = BigInt(22);
  const _23n = BigInt(23), _44n = BigInt(44), _88n = BigInt(88);
  const b2 = y * y * y % P;
  const b3 = b2 * b2 * y % P;
  const b6 = pow2(b3, _3n3, P) * b3 % P;
  const b9 = pow2(b6, _3n3, P) * b3 % P;
  const b11 = pow2(b9, _2n3, P) * b2 % P;
  const b22 = pow2(b11, _11n, P) * b11 % P;
  const b44 = pow2(b22, _22n, P) * b22 % P;
  const b88 = pow2(b44, _44n, P) * b44 % P;
  const b176 = pow2(b88, _88n, P) * b88 % P;
  const b220 = pow2(b176, _44n, P) * b44 % P;
  const b223 = pow2(b220, _3n3, P) * b3 % P;
  const t1 = pow2(b223, _23n, P) * b22 % P;
  const t2 = pow2(t1, _6n, P) * b2 % P;
  const root = pow2(t2, _2n3, P);
  if (!Fpk1.eql(Fpk1.sqr(root), y))
    throw new Error("Cannot find square root");
  return root;
}
var Fpk1 = Field(secp256k1_CURVE.p, { sqrt: sqrtMod });
var Pointk1 = /* @__PURE__ */ weierstrass(secp256k1_CURVE, {
  Fp: Fpk1,
  endo: secp256k1_ENDO
});
var secp256k1 = /* @__PURE__ */ ecdsa(Pointk1, sha256);

// node_modules/@scure/bip32/node_modules/@noble/hashes/utils.js
function isBytes2(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber2(n, title = "") {
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new Error(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes2(value2, length2, title = "") {
  const bytes = isBytes2(value2);
  const len = value2?.length;
  const needsLen = length2 !== void 0;
  if (!bytes || needsLen && len !== length2) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length2}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value2}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value2;
}
function ahash2(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash must wrapped by utils.createHasher");
  anumber2(h.outputLen);
  anumber2(h.blockLen);
}
function aexists2(instance2, checkFinished = true) {
  if (instance2.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance2.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput2(out, instance2) {
  abytes2(out, void 0, "digestInto() output");
  const min = instance2.outputLen;
  if (out.length < min) {
    throw new Error('"digestInto() output" expected to be of length >=' + min);
  }
}
function clean2(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView2(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr2(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function rotl(word, shift) {
  return word << shift | word >>> 32 - shift >>> 0;
}
function concatBytes2(...arrays) {
  let sum = 0;
  for (let i = 0; i < arrays.length; i++) {
    const a = arrays[i];
    abytes2(a);
    sum += a.length;
  }
  const res = new Uint8Array(sum);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const a = arrays[i];
    res.set(a, pad);
    pad += a.length;
  }
  return res;
}
function createHasher2(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
var oidNist2 = (suffix) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@scure/bip32/node_modules/@noble/hashes/hmac.js
var _HMAC2 = class {
  oHash;
  iHash;
  blockLen;
  outputLen;
  finished = false;
  destroyed = false;
  constructor(hash, key) {
    ahash2(hash);
    abytes2(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean2(pad);
  }
  update(buf) {
    aexists2(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists2(this);
    abytes2(out, this.outputLen, "output");
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac2 = (hash, key, message) => new _HMAC2(hash, key).update(message).digest();
hmac2.create = (hash, key) => new _HMAC2(hash, key);

// node_modules/@scure/bip32/node_modules/@noble/hashes/_md.js
function Chi2(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj2(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD2 = class {
  blockLen;
  outputLen;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView2(this.buffer);
  }
  update(data) {
    aexists2(this);
    abytes2(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView2(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists2(this);
    aoutput2(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean2(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView2(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to ||= new this.constructor();
    to.set(...this.get());
    const { blockLen, buffer, length: length2, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length2;
    to.pos = pos;
    if (length2 % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV2 = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA512_IV2 = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// node_modules/@scure/bip32/node_modules/@noble/hashes/legacy.js
var Rho160 = /* @__PURE__ */ Uint8Array.from([
  7,
  4,
  13,
  1,
  10,
  6,
  15,
  3,
  12,
  0,
  9,
  5,
  2,
  14,
  11,
  8
]);
var Id160 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
var Pi160 = /* @__PURE__ */ (() => Id160.map((i) => (9 * i + 5) % 16))();
var idxLR = /* @__PURE__ */ (() => {
  const L = [Id160];
  const R = [Pi160];
  const res = [L, R];
  for (let i = 0; i < 4; i++)
    for (let j of res)
      j.push(j[i].map((k) => Rho160[k]));
  return res;
})();
var idxL = /* @__PURE__ */ (() => idxLR[0])();
var idxR = /* @__PURE__ */ (() => idxLR[1])();
var shifts160 = /* @__PURE__ */ [
  [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
  [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
  [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
  [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
  [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
].map((i) => Uint8Array.from(i));
var shiftsL160 = /* @__PURE__ */ idxL.map((idx, i) => idx.map((j) => shifts160[i][j]));
var shiftsR160 = /* @__PURE__ */ idxR.map((idx, i) => idx.map((j) => shifts160[i][j]));
var Kl160 = /* @__PURE__ */ Uint32Array.from([
  0,
  1518500249,
  1859775393,
  2400959708,
  2840853838
]);
var Kr160 = /* @__PURE__ */ Uint32Array.from([
  1352829926,
  1548603684,
  1836072691,
  2053994217,
  0
]);
function ripemd_f(group, x, y, z) {
  if (group === 0)
    return x ^ y ^ z;
  if (group === 1)
    return x & y | ~x & z;
  if (group === 2)
    return (x | ~y) ^ z;
  if (group === 3)
    return x & z | y & ~z;
  return x ^ (y | ~z);
}
var BUF_160 = /* @__PURE__ */ new Uint32Array(16);
var _RIPEMD160 = class extends HashMD2 {
  h0 = 1732584193 | 0;
  h1 = 4023233417 | 0;
  h2 = 2562383102 | 0;
  h3 = 271733878 | 0;
  h4 = 3285377520 | 0;
  constructor() {
    super(64, 20, 8, true);
  }
  get() {
    const { h0, h1, h2, h3, h4 } = this;
    return [h0, h1, h2, h3, h4];
  }
  set(h0, h1, h2, h3, h4) {
    this.h0 = h0 | 0;
    this.h1 = h1 | 0;
    this.h2 = h2 | 0;
    this.h3 = h3 | 0;
    this.h4 = h4 | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      BUF_160[i] = view.getUint32(offset, true);
    let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
    for (let group = 0; group < 5; group++) {
      const rGroup = 4 - group;
      const hbl = Kl160[group], hbr = Kr160[group];
      const rl = idxL[group], rr = idxR[group];
      const sl = shiftsL160[group], sr = shiftsR160[group];
      for (let i = 0; i < 16; i++) {
        const tl = rotl(al + ripemd_f(group, bl, cl, dl) + BUF_160[rl[i]] + hbl, sl[i]) + el | 0;
        al = el, el = dl, dl = rotl(cl, 10) | 0, cl = bl, bl = tl;
      }
      for (let i = 0; i < 16; i++) {
        const tr = rotl(ar + ripemd_f(rGroup, br, cr, dr) + BUF_160[rr[i]] + hbr, sr[i]) + er | 0;
        ar = er, er = dr, dr = rotl(cr, 10) | 0, cr = br, br = tr;
      }
    }
    this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
  }
  roundClean() {
    clean2(BUF_160);
  }
  destroy() {
    this.destroyed = true;
    clean2(this.buffer);
    this.set(0, 0, 0, 0, 0);
  }
};
var ripemd160 = /* @__PURE__ */ createHasher2(() => new _RIPEMD160());

// node_modules/@scure/bip32/node_modules/@noble/hashes/_u64.js
var U32_MASK64 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n = /* @__PURE__ */ BigInt(32);
function fromBig(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK64), l: Number(n >> _32n & U32_MASK64) };
  return { h: Number(n >> _32n & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
}
function split(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var shrSH = (h, _l, s) => h >>> s;
var shrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrSH = (h, l, s) => h >>> s | l << 32 - s;
var rotrSL = (h, l, s) => h << 32 - s | l >>> s;
var rotrBH = (h, l, s) => h << 64 - s | l >>> s - 32;
var rotrBL = (h, l, s) => h >>> s - 32 | l << 64 - s;
function add(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// node_modules/@scure/bip32/node_modules/@noble/hashes/sha2.js
var SHA256_K2 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W2 = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B2 = class extends HashMD2 {
  constructor(outputLen) {
    super(64, outputLen, 8, false);
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W2[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W2[i - 15];
      const W2 = SHA256_W2[i - 2];
      const s0 = rotr2(W15, 7) ^ rotr2(W15, 18) ^ W15 >>> 3;
      const s1 = rotr2(W2, 17) ^ rotr2(W2, 19) ^ W2 >>> 10;
      SHA256_W2[i] = s1 + SHA256_W2[i - 7] + s0 + SHA256_W2[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr2(E, 6) ^ rotr2(E, 11) ^ rotr2(E, 25);
      const T1 = H + sigma1 + Chi2(E, F, G) + SHA256_K2[i] + SHA256_W2[i] | 0;
      const sigma0 = rotr2(A, 2) ^ rotr2(A, 13) ^ rotr2(A, 22);
      const T2 = sigma0 + Maj2(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean2(SHA256_W2);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean2(this.buffer);
  }
};
var _SHA2562 = class extends SHA2_32B2 {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  A = SHA256_IV2[0] | 0;
  B = SHA256_IV2[1] | 0;
  C = SHA256_IV2[2] | 0;
  D = SHA256_IV2[3] | 0;
  E = SHA256_IV2[4] | 0;
  F = SHA256_IV2[5] | 0;
  G = SHA256_IV2[6] | 0;
  H = SHA256_IV2[7] | 0;
  constructor() {
    super(32);
  }
};
var K512 = /* @__PURE__ */ (() => split([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh = /* @__PURE__ */ (() => K512[0])();
var SHA512_Kl = /* @__PURE__ */ (() => K512[1])();
var SHA512_W_H = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L = /* @__PURE__ */ new Uint32Array(80);
var SHA2_64B = class extends HashMD2 {
  constructor(outputLen) {
    super(128, outputLen, 16, false);
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H[i] = view.getUint32(offset);
      SHA512_W_L[i] = view.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H[i - 15] | 0;
      const W15l = SHA512_W_L[i - 15] | 0;
      const s0h = rotrSH(W15h, W15l, 1) ^ rotrSH(W15h, W15l, 8) ^ shrSH(W15h, W15l, 7);
      const s0l = rotrSL(W15h, W15l, 1) ^ rotrSL(W15h, W15l, 8) ^ shrSL(W15h, W15l, 7);
      const W2h = SHA512_W_H[i - 2] | 0;
      const W2l = SHA512_W_L[i - 2] | 0;
      const s1h = rotrSH(W2h, W2l, 19) ^ rotrBH(W2h, W2l, 61) ^ shrSH(W2h, W2l, 6);
      const s1l = rotrSL(W2h, W2l, 19) ^ rotrBL(W2h, W2l, 61) ^ shrSL(W2h, W2l, 6);
      const SUMl = add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
      const SUMh = add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
      SHA512_W_H[i] = SUMh | 0;
      SHA512_W_L[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = rotrSH(Eh, El, 14) ^ rotrSH(Eh, El, 18) ^ rotrBH(Eh, El, 41);
      const sigma1l = rotrSL(Eh, El, 14) ^ rotrSL(Eh, El, 18) ^ rotrBL(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
      const T1h = add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH(Ah, Al, 28) ^ rotrBH(Ah, Al, 34) ^ rotrBH(Ah, Al, 39);
      const sigma0l = rotrSL(Ah, Al, 28) ^ rotrBL(Ah, Al, 34) ^ rotrBL(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L(T1l, sigma0l, MAJl);
      Ah = add3H(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean2(SHA512_W_H, SHA512_W_L);
  }
  destroy() {
    clean2(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var _SHA512 = class extends SHA2_64B {
  Ah = SHA512_IV2[0] | 0;
  Al = SHA512_IV2[1] | 0;
  Bh = SHA512_IV2[2] | 0;
  Bl = SHA512_IV2[3] | 0;
  Ch = SHA512_IV2[4] | 0;
  Cl = SHA512_IV2[5] | 0;
  Dh = SHA512_IV2[6] | 0;
  Dl = SHA512_IV2[7] | 0;
  Eh = SHA512_IV2[8] | 0;
  El = SHA512_IV2[9] | 0;
  Fh = SHA512_IV2[10] | 0;
  Fl = SHA512_IV2[11] | 0;
  Gh = SHA512_IV2[12] | 0;
  Gl = SHA512_IV2[13] | 0;
  Hh = SHA512_IV2[14] | 0;
  Hl = SHA512_IV2[15] | 0;
  constructor() {
    super(64);
  }
};
var sha2562 = /* @__PURE__ */ createHasher2(
  () => new _SHA2562(),
  /* @__PURE__ */ oidNist2(1)
);
var sha512 = /* @__PURE__ */ createHasher2(
  () => new _SHA512(),
  /* @__PURE__ */ oidNist2(3)
);

// node_modules/@scure/bip32/node_modules/@scure/base/index.js
function isBytes3(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function isArrayOf(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  if (isString) {
    return arr.every((item) => typeof item === "string");
  } else {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn(input) {
  if (typeof input !== "function")
    throw new Error("function expected");
  return true;
}
function astr(label, input) {
  if (typeof input !== "string")
    throw new Error(`${label}: string expected`);
  return true;
}
function anumber3(n) {
  if (!Number.isSafeInteger(n))
    throw new Error(`invalid integer: ${n}`);
}
function aArr(input) {
  if (!Array.isArray(input))
    throw new Error("array expected");
}
function astrArr(label, input) {
  if (!isArrayOf(true, input))
    throw new Error(`${label}: array of strings expected`);
}
function anumArr(label, input) {
  if (!isArrayOf(false, input))
    throw new Error(`${label}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function chain(...args) {
  const id = (a) => a;
  const wrap = (a, b) => (c) => a(b(c));
  const encode20 = args.map((x) => x.encode).reduceRight(wrap, id);
  const decode19 = args.map((x) => x.decode).reduce(wrap, id);
  return { encode: encode20, decode: decode19 };
}
// @__NO_SIDE_EFFECTS__
function alphabet(letters) {
  const lettersA = typeof letters === "string" ? letters.split("") : letters;
  const len = lettersA.length;
  astrArr("alphabet", lettersA);
  const indexes = new Map(lettersA.map((l, i) => [l, i]));
  return {
    encode: (digits) => {
      aArr(digits);
      return digits.map((i) => {
        if (!Number.isSafeInteger(i) || i < 0 || i >= len)
          throw new Error(`alphabet.encode: digit index outside alphabet "${i}". Allowed: ${letters}`);
        return lettersA[i];
      });
    },
    decode: (input) => {
      aArr(input);
      return input.map((letter) => {
        astr("alphabet.decode", letter);
        const i = indexes.get(letter);
        if (i === void 0)
          throw new Error(`Unknown letter: "${letter}". Allowed: ${letters}`);
        return i;
      });
    }
  };
}
// @__NO_SIDE_EFFECTS__
function join(separator = "") {
  astr("join", separator);
  return {
    encode: (from) => {
      astrArr("join.decode", from);
      return from.join(separator);
    },
    decode: (to) => {
      astr("join.decode", to);
      return to.split(separator);
    }
  };
}
function convertRadix(data, from, to) {
  if (from < 2)
    throw new Error(`convertRadix: invalid from=${from}, base cannot be less than 2`);
  if (to < 2)
    throw new Error(`convertRadix: invalid to=${to}, base cannot be less than 2`);
  aArr(data);
  if (!data.length)
    return [];
  let pos = 0;
  const res = [];
  const digits = Array.from(data, (d) => {
    anumber3(d);
    if (d < 0 || d >= from)
      throw new Error(`invalid integer: ${d}`);
    return d;
  });
  const dlen = digits.length;
  while (true) {
    let carry = 0;
    let done = true;
    for (let i = pos; i < dlen; i++) {
      const digit = digits[i];
      const fromCarry = from * carry;
      const digitBase = fromCarry + digit;
      if (!Number.isSafeInteger(digitBase) || fromCarry / from !== carry || digitBase - digit !== fromCarry) {
        throw new Error("convertRadix: carry overflow");
      }
      const div = digitBase / to;
      carry = digitBase % to;
      const rounded = Math.floor(div);
      digits[i] = rounded;
      if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase)
        throw new Error("convertRadix: carry overflow");
      if (!done)
        continue;
      else if (!rounded)
        pos = i;
      else
        done = false;
    }
    res.push(carry);
    if (done)
      break;
  }
  for (let i = 0; i < data.length - 1 && data[i] === 0; i++)
    res.push(0);
  return res.reverse();
}
// @__NO_SIDE_EFFECTS__
function radix(num) {
  anumber3(num);
  const _256 = 2 ** 8;
  return {
    encode: (bytes) => {
      if (!isBytes3(bytes))
        throw new Error("radix.encode input should be Uint8Array");
      return convertRadix(Array.from(bytes), _256, num);
    },
    decode: (digits) => {
      anumArr("radix.decode", digits);
      return Uint8Array.from(convertRadix(digits, num, _256));
    }
  };
}
function checksum(len, fn) {
  anumber3(len);
  afn(fn);
  return {
    encode(data) {
      if (!isBytes3(data))
        throw new Error("checksum.encode: input should be Uint8Array");
      const sum = fn(data).slice(0, len);
      const res = new Uint8Array(data.length + len);
      res.set(data);
      res.set(sum, data.length);
      return res;
    },
    decode(data) {
      if (!isBytes3(data))
        throw new Error("checksum.decode: input should be Uint8Array");
      const payload = data.slice(0, -len);
      const oldChecksum = data.slice(-len);
      const newChecksum = fn(payload).slice(0, len);
      for (let i = 0; i < len; i++)
        if (newChecksum[i] !== oldChecksum[i])
          throw new Error("Invalid checksum");
      return payload;
    }
  };
}
var genBase58 = /* @__NO_SIDE_EFFECTS__ */ (abc) => /* @__PURE__ */ chain(/* @__PURE__ */ radix(58), /* @__PURE__ */ alphabet(abc), /* @__PURE__ */ join(""));
var base58 = /* @__PURE__ */ genBase58("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz");
var createBase58check = (sha2566) => /* @__PURE__ */ chain(checksum(4, (data) => sha2566(sha2566(data))), base58);

// node_modules/@scure/bip32/index.js
var Point = secp256k1.Point;
var { Fn } = Point;
var base58check = createBase58check(sha2562);
var MASTER_SECRET = Uint8Array.from("Bitcoin seed".split(""), (char) => char.charCodeAt(0));
var BITCOIN_VERSIONS = { private: 76066276, public: 76067358 };
var HARDENED_OFFSET = 2147483648;
var hash160 = (data) => ripemd160(sha2562(data));
var fromU32 = (data) => createView2(data).getUint32(0, false);
var toU32 = (n) => {
  if (!Number.isSafeInteger(n) || n < 0 || n > 2 ** 32 - 1) {
    throw new Error("invalid number, should be from 0 to 2**32-1, got " + n);
  }
  const buf = new Uint8Array(4);
  createView2(buf).setUint32(0, n, false);
  return buf;
};
var HDKey = class _HDKey {
  get fingerprint() {
    if (!this.pubHash) {
      throw new Error("No publicKey set!");
    }
    return fromU32(this.pubHash);
  }
  get identifier() {
    return this.pubHash;
  }
  get pubKeyHash() {
    return this.pubHash;
  }
  get privateKey() {
    return this._privateKey || null;
  }
  get publicKey() {
    return this._publicKey || null;
  }
  get privateExtendedKey() {
    const priv = this._privateKey;
    if (!priv) {
      throw new Error("No private key");
    }
    return base58check.encode(this.serialize(this.versions.private, concatBytes2(Uint8Array.of(0), priv)));
  }
  get publicExtendedKey() {
    if (!this._publicKey) {
      throw new Error("No public key");
    }
    return base58check.encode(this.serialize(this.versions.public, this._publicKey));
  }
  static fromMasterSeed(seed, versions = BITCOIN_VERSIONS) {
    abytes2(seed);
    if (8 * seed.length < 128 || 8 * seed.length > 512) {
      throw new Error("HDKey: seed length must be between 128 and 512 bits; 256 bits is advised, got " + seed.length);
    }
    const I = hmac2(sha512, MASTER_SECRET, seed);
    const privateKey = I.slice(0, 32);
    const chainCode = I.slice(32);
    return new _HDKey({ versions, chainCode, privateKey });
  }
  static fromExtendedKey(base58key, versions = BITCOIN_VERSIONS) {
    const keyBuffer = base58check.decode(base58key);
    const keyView = createView2(keyBuffer);
    const version = keyView.getUint32(0, false);
    const opt = {
      versions,
      depth: keyBuffer[4],
      parentFingerprint: keyView.getUint32(5, false),
      index: keyView.getUint32(9, false),
      chainCode: keyBuffer.slice(13, 45)
    };
    const key = keyBuffer.slice(45);
    const isPriv = key[0] === 0;
    if (version !== versions[isPriv ? "private" : "public"]) {
      throw new Error("Version mismatch");
    }
    if (isPriv) {
      return new _HDKey({ ...opt, privateKey: key.slice(1) });
    } else {
      return new _HDKey({ ...opt, publicKey: key });
    }
  }
  static fromJSON(json) {
    return _HDKey.fromExtendedKey(json.xpriv);
  }
  versions;
  depth = 0;
  index = 0;
  chainCode = null;
  parentFingerprint = 0;
  _privateKey;
  _publicKey;
  pubHash;
  constructor(opt) {
    if (!opt || typeof opt !== "object") {
      throw new Error("HDKey.constructor must not be called directly");
    }
    this.versions = opt.versions || BITCOIN_VERSIONS;
    this.depth = opt.depth || 0;
    this.chainCode = opt.chainCode || null;
    this.index = opt.index || 0;
    this.parentFingerprint = opt.parentFingerprint || 0;
    if (!this.depth) {
      if (this.parentFingerprint || this.index) {
        throw new Error("HDKey: zero depth with non-zero index/parent fingerprint");
      }
    }
    if (this.depth > 255) {
      throw new Error("HDKey: depth exceeds the serializable value 255");
    }
    if (opt.publicKey && opt.privateKey) {
      throw new Error("HDKey: publicKey and privateKey at same time.");
    }
    if (opt.privateKey) {
      if (!secp256k1.utils.isValidSecretKey(opt.privateKey))
        throw new Error("Invalid private key");
      this._privateKey = opt.privateKey;
      this._publicKey = secp256k1.getPublicKey(opt.privateKey, true);
    } else if (opt.publicKey) {
      this._publicKey = Point.fromBytes(opt.publicKey).toBytes(true);
    } else {
      throw new Error("HDKey: no public or private key provided");
    }
    this.pubHash = hash160(this._publicKey);
  }
  derive(path) {
    if (!/^[mM]'?/.test(path)) {
      throw new Error('Path must start with "m" or "M"');
    }
    if (/^[mM]'?$/.test(path)) {
      return this;
    }
    const parts = path.replace(/^[mM]'?\//, "").split("/");
    let child = this;
    for (const c of parts) {
      const m = /^(\d+)('?)$/.exec(c);
      const m1 = m && m[1];
      if (!m || m.length !== 3 || typeof m1 !== "string")
        throw new Error("invalid child index: " + c);
      let idx = +m1;
      if (!Number.isSafeInteger(idx) || idx >= HARDENED_OFFSET) {
        throw new Error("Invalid index");
      }
      if (m[2] === "'") {
        idx += HARDENED_OFFSET;
      }
      child = child.deriveChild(idx);
    }
    return child;
  }
  deriveChild(index) {
    if (!this._publicKey || !this.chainCode) {
      throw new Error("No publicKey or chainCode set");
    }
    let data = toU32(index);
    if (index >= HARDENED_OFFSET) {
      const priv = this._privateKey;
      if (!priv) {
        throw new Error("Could not derive hardened child key");
      }
      data = concatBytes2(Uint8Array.of(0), priv, data);
    } else {
      data = concatBytes2(this._publicKey, data);
    }
    const I = hmac2(sha512, this.chainCode, data);
    const childTweak = I.slice(0, 32);
    const chainCode = I.slice(32);
    if (!secp256k1.utils.isValidSecretKey(childTweak)) {
      throw new Error("Tweak bigger than curve order");
    }
    const opt = {
      versions: this.versions,
      chainCode,
      depth: this.depth + 1,
      parentFingerprint: this.fingerprint,
      index
    };
    const ctweak = Fn.fromBytes(childTweak);
    try {
      if (this._privateKey) {
        const added = Fn.create(Fn.fromBytes(this._privateKey) + ctweak);
        if (!Fn.isValidNot0(added)) {
          throw new Error("The tweak was out of range or the resulted private key is invalid");
        }
        opt.privateKey = Fn.toBytes(added);
      } else {
        const added = Point.fromBytes(this._publicKey).add(Point.BASE.multiply(ctweak));
        if (added.equals(Point.ZERO)) {
          throw new Error("The tweak was equal to negative P, which made the result key invalid");
        }
        opt.publicKey = added.toBytes(true);
      }
      return new _HDKey(opt);
    } catch (err) {
      return this.deriveChild(index + 1);
    }
  }
  sign(hash) {
    if (!this._privateKey) {
      throw new Error("No privateKey set!");
    }
    abytes2(hash, 32);
    return secp256k1.sign(hash, this._privateKey, { prehash: false });
  }
  verify(hash, signature2) {
    abytes2(hash, 32);
    abytes2(signature2, 64);
    if (!this._publicKey) {
      throw new Error("No publicKey set!");
    }
    return secp256k1.verify(signature2, hash, this._publicKey, { prehash: false });
  }
  wipePrivateData() {
    if (this._privateKey) {
      this._privateKey.fill(0);
      this._privateKey = void 0;
    }
    return this;
  }
  toJSON() {
    return {
      xpriv: this.privateExtendedKey,
      xpub: this.publicExtendedKey
    };
  }
  serialize(version, key) {
    if (!this.chainCode) {
      throw new Error("No chainCode set");
    }
    abytes2(key, 33);
    return concatBytes2(toU32(version), new Uint8Array([this.depth]), toU32(this.parentFingerprint), toU32(this.index), this.chainCode, key);
  }
};

// node_modules/@scure/bip39/node_modules/@noble/hashes/utils.js
function isBytes4(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function anumber4(n, title = "") {
  if (!Number.isSafeInteger(n) || n < 0) {
    const prefix = title && `"${title}" `;
    throw new Error(`${prefix}expected integer >= 0, got ${n}`);
  }
}
function abytes3(value2, length2, title = "") {
  const bytes = isBytes4(value2);
  const len = value2?.length;
  const needsLen = length2 !== void 0;
  if (!bytes || needsLen && len !== length2) {
    const prefix = title && `"${title}" `;
    const ofLen = needsLen ? ` of length ${length2}` : "";
    const got = bytes ? `length=${len}` : `type=${typeof value2}`;
    throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
  }
  return value2;
}
function ahash3(h) {
  if (typeof h !== "function" || typeof h.create !== "function")
    throw new Error("Hash must wrapped by utils.createHasher");
  anumber4(h.outputLen);
  anumber4(h.blockLen);
}
function aexists3(instance2, checkFinished = true) {
  if (instance2.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance2.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput3(out, instance2) {
  abytes3(out, void 0, "digestInto() output");
  const min = instance2.outputLen;
  if (out.length < min) {
    throw new Error('"digestInto() output" expected to be of length >=' + min);
  }
}
function clean3(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView3(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr3(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function utf8ToBytes(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function kdfInputToBytes(data, errorTitle = "") {
  if (typeof data === "string")
    return utf8ToBytes(data);
  return abytes3(data, void 0, errorTitle);
}
function checkOpts(defaults, opts) {
  if (opts !== void 0 && {}.toString.call(opts) !== "[object Object]")
    throw new Error("options must be object or undefined");
  const merged = Object.assign(defaults, opts);
  return merged;
}
function createHasher3(hashCons, info = {}) {
  const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
  const tmp = hashCons(void 0);
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = (opts) => hashCons(opts);
  Object.assign(hashC, info);
  return Object.freeze(hashC);
}
function randomBytes2(bytesLength = 32) {
  const cr = typeof globalThis === "object" ? globalThis.crypto : null;
  if (typeof cr?.getRandomValues !== "function")
    throw new Error("crypto.getRandomValues must be defined");
  return cr.getRandomValues(new Uint8Array(bytesLength));
}
var oidNist3 = (suffix) => ({
  oid: Uint8Array.from([6, 9, 96, 134, 72, 1, 101, 3, 4, 2, suffix])
});

// node_modules/@scure/bip39/node_modules/@noble/hashes/hmac.js
var _HMAC3 = class {
  oHash;
  iHash;
  blockLen;
  outputLen;
  finished = false;
  destroyed = false;
  constructor(hash, key) {
    ahash3(hash);
    abytes3(key, void 0, "key");
    this.iHash = hash.create();
    if (typeof this.iHash.update !== "function")
      throw new Error("Expected instance of class which extends utils.Hash");
    this.blockLen = this.iHash.blockLen;
    this.outputLen = this.iHash.outputLen;
    const blockLen = this.blockLen;
    const pad = new Uint8Array(blockLen);
    pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54;
    this.iHash.update(pad);
    this.oHash = hash.create();
    for (let i = 0; i < pad.length; i++)
      pad[i] ^= 54 ^ 92;
    this.oHash.update(pad);
    clean3(pad);
  }
  update(buf) {
    aexists3(this);
    this.iHash.update(buf);
    return this;
  }
  digestInto(out) {
    aexists3(this);
    abytes3(out, this.outputLen, "output");
    this.finished = true;
    this.iHash.digestInto(out);
    this.oHash.update(out);
    this.oHash.digestInto(out);
    this.destroy();
  }
  digest() {
    const out = new Uint8Array(this.oHash.outputLen);
    this.digestInto(out);
    return out;
  }
  _cloneInto(to) {
    to ||= Object.create(Object.getPrototypeOf(this), {});
    const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
    to = to;
    to.finished = finished;
    to.destroyed = destroyed;
    to.blockLen = blockLen;
    to.outputLen = outputLen;
    to.oHash = oHash._cloneInto(to.oHash);
    to.iHash = iHash._cloneInto(to.iHash);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
  destroy() {
    this.destroyed = true;
    this.oHash.destroy();
    this.iHash.destroy();
  }
};
var hmac3 = (hash, key, message) => new _HMAC3(hash, key).update(message).digest();
hmac3.create = (hash, key) => new _HMAC3(hash, key);

// node_modules/@scure/bip39/node_modules/@noble/hashes/pbkdf2.js
function pbkdf2Init(hash, _password, _salt, _opts) {
  ahash3(hash);
  const opts = checkOpts({ dkLen: 32, asyncTick: 10 }, _opts);
  const { c, dkLen, asyncTick } = opts;
  anumber4(c, "c");
  anumber4(dkLen, "dkLen");
  anumber4(asyncTick, "asyncTick");
  if (c < 1)
    throw new Error("iterations (c) must be >= 1");
  const password = kdfInputToBytes(_password, "password");
  const salt = kdfInputToBytes(_salt, "salt");
  const DK = new Uint8Array(dkLen);
  const PRF = hmac3.create(hash, password);
  const PRFSalt = PRF._cloneInto().update(salt);
  return { c, dkLen, asyncTick, DK, PRF, PRFSalt };
}
function pbkdf2Output(PRF, PRFSalt, DK, prfW, u) {
  PRF.destroy();
  PRFSalt.destroy();
  if (prfW)
    prfW.destroy();
  clean3(u);
  return DK;
}
function pbkdf2(hash, password, salt, opts) {
  const { c, dkLen, DK, PRF, PRFSalt } = pbkdf2Init(hash, password, salt, opts);
  let prfW;
  const arr = new Uint8Array(4);
  const view = createView3(arr);
  const u = new Uint8Array(PRF.outputLen);
  for (let ti = 1, pos = 0; pos < dkLen; ti++, pos += PRF.outputLen) {
    const Ti = DK.subarray(pos, pos + PRF.outputLen);
    view.setInt32(0, ti, false);
    (prfW = PRFSalt._cloneInto(prfW)).update(arr).digestInto(u);
    Ti.set(u.subarray(0, Ti.length));
    for (let ui = 1; ui < c; ui++) {
      PRF._cloneInto(prfW).update(u).digestInto(u);
      for (let i = 0; i < Ti.length; i++)
        Ti[i] ^= u[i];
    }
  }
  return pbkdf2Output(PRF, PRFSalt, DK, prfW, u);
}

// node_modules/@scure/bip39/node_modules/@noble/hashes/_md.js
function Chi3(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj3(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD3 = class {
  blockLen;
  outputLen;
  padOffset;
  isLE;
  // For partial updates less than block size
  buffer;
  view;
  finished = false;
  length = 0;
  pos = 0;
  destroyed = false;
  constructor(blockLen, outputLen, padOffset, isLE) {
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView3(this.buffer);
  }
  update(data) {
    aexists3(this);
    abytes3(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView3(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists3(this);
    aoutput3(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean3(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView3(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen must be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to ||= new this.constructor();
    to.set(...this.get());
    const { blockLen, buffer, length: length2, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length2;
    to.pos = pos;
    if (length2 % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV3 = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);
var SHA512_IV3 = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  4089235720,
  3144134277,
  2227873595,
  1013904242,
  4271175723,
  2773480762,
  1595750129,
  1359893119,
  2917565137,
  2600822924,
  725511199,
  528734635,
  4215389547,
  1541459225,
  327033209
]);

// node_modules/@scure/bip39/node_modules/@noble/hashes/_u64.js
var U32_MASK642 = /* @__PURE__ */ BigInt(2 ** 32 - 1);
var _32n2 = /* @__PURE__ */ BigInt(32);
function fromBig2(n, le = false) {
  if (le)
    return { h: Number(n & U32_MASK642), l: Number(n >> _32n2 & U32_MASK642) };
  return { h: Number(n >> _32n2 & U32_MASK642) | 0, l: Number(n & U32_MASK642) | 0 };
}
function split2(lst, le = false) {
  const len = lst.length;
  let Ah = new Uint32Array(len);
  let Al = new Uint32Array(len);
  for (let i = 0; i < len; i++) {
    const { h, l } = fromBig2(lst[i], le);
    [Ah[i], Al[i]] = [h, l];
  }
  return [Ah, Al];
}
var shrSH2 = (h, _l, s) => h >>> s;
var shrSL2 = (h, l, s) => h << 32 - s | l >>> s;
var rotrSH2 = (h, l, s) => h >>> s | l << 32 - s;
var rotrSL2 = (h, l, s) => h << 32 - s | l >>> s;
var rotrBH2 = (h, l, s) => h << 64 - s | l >>> s - 32;
var rotrBL2 = (h, l, s) => h >>> s - 32 | l << 64 - s;
function add2(Ah, Al, Bh, Bl) {
  const l = (Al >>> 0) + (Bl >>> 0);
  return { h: Ah + Bh + (l / 2 ** 32 | 0) | 0, l: l | 0 };
}
var add3L2 = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
var add3H2 = (low, Ah, Bh, Ch) => Ah + Bh + Ch + (low / 2 ** 32 | 0) | 0;
var add4L2 = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
var add4H2 = (low, Ah, Bh, Ch, Dh) => Ah + Bh + Ch + Dh + (low / 2 ** 32 | 0) | 0;
var add5L2 = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
var add5H2 = (low, Ah, Bh, Ch, Dh, Eh) => Ah + Bh + Ch + Dh + Eh + (low / 2 ** 32 | 0) | 0;

// node_modules/@scure/bip39/node_modules/@noble/hashes/sha2.js
var SHA256_K3 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W3 = /* @__PURE__ */ new Uint32Array(64);
var SHA2_32B3 = class extends HashMD3 {
  constructor(outputLen) {
    super(64, outputLen, 8, false);
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W3[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W3[i - 15];
      const W2 = SHA256_W3[i - 2];
      const s0 = rotr3(W15, 7) ^ rotr3(W15, 18) ^ W15 >>> 3;
      const s1 = rotr3(W2, 17) ^ rotr3(W2, 19) ^ W2 >>> 10;
      SHA256_W3[i] = s1 + SHA256_W3[i - 7] + s0 + SHA256_W3[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr3(E, 6) ^ rotr3(E, 11) ^ rotr3(E, 25);
      const T1 = H + sigma1 + Chi3(E, F, G) + SHA256_K3[i] + SHA256_W3[i] | 0;
      const sigma0 = rotr3(A, 2) ^ rotr3(A, 13) ^ rotr3(A, 22);
      const T2 = sigma0 + Maj3(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean3(SHA256_W3);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean3(this.buffer);
  }
};
var _SHA2563 = class extends SHA2_32B3 {
  // We cannot use array here since array allows indexing by variable
  // which means optimizer/compiler cannot use registers.
  A = SHA256_IV3[0] | 0;
  B = SHA256_IV3[1] | 0;
  C = SHA256_IV3[2] | 0;
  D = SHA256_IV3[3] | 0;
  E = SHA256_IV3[4] | 0;
  F = SHA256_IV3[5] | 0;
  G = SHA256_IV3[6] | 0;
  H = SHA256_IV3[7] | 0;
  constructor() {
    super(32);
  }
};
var K5122 = /* @__PURE__ */ (() => split2([
  "0x428a2f98d728ae22",
  "0x7137449123ef65cd",
  "0xb5c0fbcfec4d3b2f",
  "0xe9b5dba58189dbbc",
  "0x3956c25bf348b538",
  "0x59f111f1b605d019",
  "0x923f82a4af194f9b",
  "0xab1c5ed5da6d8118",
  "0xd807aa98a3030242",
  "0x12835b0145706fbe",
  "0x243185be4ee4b28c",
  "0x550c7dc3d5ffb4e2",
  "0x72be5d74f27b896f",
  "0x80deb1fe3b1696b1",
  "0x9bdc06a725c71235",
  "0xc19bf174cf692694",
  "0xe49b69c19ef14ad2",
  "0xefbe4786384f25e3",
  "0x0fc19dc68b8cd5b5",
  "0x240ca1cc77ac9c65",
  "0x2de92c6f592b0275",
  "0x4a7484aa6ea6e483",
  "0x5cb0a9dcbd41fbd4",
  "0x76f988da831153b5",
  "0x983e5152ee66dfab",
  "0xa831c66d2db43210",
  "0xb00327c898fb213f",
  "0xbf597fc7beef0ee4",
  "0xc6e00bf33da88fc2",
  "0xd5a79147930aa725",
  "0x06ca6351e003826f",
  "0x142929670a0e6e70",
  "0x27b70a8546d22ffc",
  "0x2e1b21385c26c926",
  "0x4d2c6dfc5ac42aed",
  "0x53380d139d95b3df",
  "0x650a73548baf63de",
  "0x766a0abb3c77b2a8",
  "0x81c2c92e47edaee6",
  "0x92722c851482353b",
  "0xa2bfe8a14cf10364",
  "0xa81a664bbc423001",
  "0xc24b8b70d0f89791",
  "0xc76c51a30654be30",
  "0xd192e819d6ef5218",
  "0xd69906245565a910",
  "0xf40e35855771202a",
  "0x106aa07032bbd1b8",
  "0x19a4c116b8d2d0c8",
  "0x1e376c085141ab53",
  "0x2748774cdf8eeb99",
  "0x34b0bcb5e19b48a8",
  "0x391c0cb3c5c95a63",
  "0x4ed8aa4ae3418acb",
  "0x5b9cca4f7763e373",
  "0x682e6ff3d6b2b8a3",
  "0x748f82ee5defb2fc",
  "0x78a5636f43172f60",
  "0x84c87814a1f0ab72",
  "0x8cc702081a6439ec",
  "0x90befffa23631e28",
  "0xa4506cebde82bde9",
  "0xbef9a3f7b2c67915",
  "0xc67178f2e372532b",
  "0xca273eceea26619c",
  "0xd186b8c721c0c207",
  "0xeada7dd6cde0eb1e",
  "0xf57d4f7fee6ed178",
  "0x06f067aa72176fba",
  "0x0a637dc5a2c898a6",
  "0x113f9804bef90dae",
  "0x1b710b35131c471b",
  "0x28db77f523047d84",
  "0x32caab7b40c72493",
  "0x3c9ebe0a15c9bebc",
  "0x431d67c49c100d4c",
  "0x4cc5d4becb3e42b6",
  "0x597f299cfc657e2a",
  "0x5fcb6fab3ad6faec",
  "0x6c44198c4a475817"
].map((n) => BigInt(n))))();
var SHA512_Kh2 = /* @__PURE__ */ (() => K5122[0])();
var SHA512_Kl2 = /* @__PURE__ */ (() => K5122[1])();
var SHA512_W_H2 = /* @__PURE__ */ new Uint32Array(80);
var SHA512_W_L2 = /* @__PURE__ */ new Uint32Array(80);
var SHA2_64B2 = class extends HashMD3 {
  constructor(outputLen) {
    super(128, outputLen, 16, false);
  }
  // prettier-ignore
  get() {
    const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
  }
  // prettier-ignore
  set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
    this.Ah = Ah | 0;
    this.Al = Al | 0;
    this.Bh = Bh | 0;
    this.Bl = Bl | 0;
    this.Ch = Ch | 0;
    this.Cl = Cl | 0;
    this.Dh = Dh | 0;
    this.Dl = Dl | 0;
    this.Eh = Eh | 0;
    this.El = El | 0;
    this.Fh = Fh | 0;
    this.Fl = Fl | 0;
    this.Gh = Gh | 0;
    this.Gl = Gl | 0;
    this.Hh = Hh | 0;
    this.Hl = Hl | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4) {
      SHA512_W_H2[i] = view.getUint32(offset);
      SHA512_W_L2[i] = view.getUint32(offset += 4);
    }
    for (let i = 16; i < 80; i++) {
      const W15h = SHA512_W_H2[i - 15] | 0;
      const W15l = SHA512_W_L2[i - 15] | 0;
      const s0h = rotrSH2(W15h, W15l, 1) ^ rotrSH2(W15h, W15l, 8) ^ shrSH2(W15h, W15l, 7);
      const s0l = rotrSL2(W15h, W15l, 1) ^ rotrSL2(W15h, W15l, 8) ^ shrSL2(W15h, W15l, 7);
      const W2h = SHA512_W_H2[i - 2] | 0;
      const W2l = SHA512_W_L2[i - 2] | 0;
      const s1h = rotrSH2(W2h, W2l, 19) ^ rotrBH2(W2h, W2l, 61) ^ shrSH2(W2h, W2l, 6);
      const s1l = rotrSL2(W2h, W2l, 19) ^ rotrBL2(W2h, W2l, 61) ^ shrSL2(W2h, W2l, 6);
      const SUMl = add4L2(s0l, s1l, SHA512_W_L2[i - 7], SHA512_W_L2[i - 16]);
      const SUMh = add4H2(SUMl, s0h, s1h, SHA512_W_H2[i - 7], SHA512_W_H2[i - 16]);
      SHA512_W_H2[i] = SUMh | 0;
      SHA512_W_L2[i] = SUMl | 0;
    }
    let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
    for (let i = 0; i < 80; i++) {
      const sigma1h = rotrSH2(Eh, El, 14) ^ rotrSH2(Eh, El, 18) ^ rotrBH2(Eh, El, 41);
      const sigma1l = rotrSL2(Eh, El, 14) ^ rotrSL2(Eh, El, 18) ^ rotrBL2(Eh, El, 41);
      const CHIh = Eh & Fh ^ ~Eh & Gh;
      const CHIl = El & Fl ^ ~El & Gl;
      const T1ll = add5L2(Hl, sigma1l, CHIl, SHA512_Kl2[i], SHA512_W_L2[i]);
      const T1h = add5H2(T1ll, Hh, sigma1h, CHIh, SHA512_Kh2[i], SHA512_W_H2[i]);
      const T1l = T1ll | 0;
      const sigma0h = rotrSH2(Ah, Al, 28) ^ rotrBH2(Ah, Al, 34) ^ rotrBH2(Ah, Al, 39);
      const sigma0l = rotrSL2(Ah, Al, 28) ^ rotrBL2(Ah, Al, 34) ^ rotrBL2(Ah, Al, 39);
      const MAJh = Ah & Bh ^ Ah & Ch ^ Bh & Ch;
      const MAJl = Al & Bl ^ Al & Cl ^ Bl & Cl;
      Hh = Gh | 0;
      Hl = Gl | 0;
      Gh = Fh | 0;
      Gl = Fl | 0;
      Fh = Eh | 0;
      Fl = El | 0;
      ({ h: Eh, l: El } = add2(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
      Dh = Ch | 0;
      Dl = Cl | 0;
      Ch = Bh | 0;
      Cl = Bl | 0;
      Bh = Ah | 0;
      Bl = Al | 0;
      const All = add3L2(T1l, sigma0l, MAJl);
      Ah = add3H2(All, T1h, sigma0h, MAJh);
      Al = All | 0;
    }
    ({ h: Ah, l: Al } = add2(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
    ({ h: Bh, l: Bl } = add2(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
    ({ h: Ch, l: Cl } = add2(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
    ({ h: Dh, l: Dl } = add2(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
    ({ h: Eh, l: El } = add2(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
    ({ h: Fh, l: Fl } = add2(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
    ({ h: Gh, l: Gl } = add2(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
    ({ h: Hh, l: Hl } = add2(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
    this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
  }
  roundClean() {
    clean3(SHA512_W_H2, SHA512_W_L2);
  }
  destroy() {
    clean3(this.buffer);
    this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
};
var _SHA5122 = class extends SHA2_64B2 {
  Ah = SHA512_IV3[0] | 0;
  Al = SHA512_IV3[1] | 0;
  Bh = SHA512_IV3[2] | 0;
  Bl = SHA512_IV3[3] | 0;
  Ch = SHA512_IV3[4] | 0;
  Cl = SHA512_IV3[5] | 0;
  Dh = SHA512_IV3[6] | 0;
  Dl = SHA512_IV3[7] | 0;
  Eh = SHA512_IV3[8] | 0;
  El = SHA512_IV3[9] | 0;
  Fh = SHA512_IV3[10] | 0;
  Fl = SHA512_IV3[11] | 0;
  Gh = SHA512_IV3[12] | 0;
  Gl = SHA512_IV3[13] | 0;
  Hh = SHA512_IV3[14] | 0;
  Hl = SHA512_IV3[15] | 0;
  constructor() {
    super(64);
  }
};
var sha2563 = /* @__PURE__ */ createHasher3(
  () => new _SHA2563(),
  /* @__PURE__ */ oidNist3(1)
);
var sha5122 = /* @__PURE__ */ createHasher3(
  () => new _SHA5122(),
  /* @__PURE__ */ oidNist3(3)
);

// node_modules/@scure/bip39/node_modules/@scure/base/index.js
function isBytes5(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function isArrayOf2(isString, arr) {
  if (!Array.isArray(arr))
    return false;
  if (arr.length === 0)
    return true;
  if (isString) {
    return arr.every((item) => typeof item === "string");
  } else {
    return arr.every((item) => Number.isSafeInteger(item));
  }
}
function afn2(input) {
  if (typeof input !== "function")
    throw new Error("function expected");
  return true;
}
function astr2(label, input) {
  if (typeof input !== "string")
    throw new Error(`${label}: string expected`);
  return true;
}
function anumber5(n) {
  if (!Number.isSafeInteger(n))
    throw new Error(`invalid integer: ${n}`);
}
function aArr2(input) {
  if (!Array.isArray(input))
    throw new Error("array expected");
}
function astrArr2(label, input) {
  if (!isArrayOf2(true, input))
    throw new Error(`${label}: array of strings expected`);
}
function anumArr2(label, input) {
  if (!isArrayOf2(false, input))
    throw new Error(`${label}: array of numbers expected`);
}
// @__NO_SIDE_EFFECTS__
function chain2(...args) {
  const id = (a) => a;
  const wrap = (a, b) => (c) => a(b(c));
  const encode20 = args.map((x) => x.encode).reduceRight(wrap, id);
  const decode19 = args.map((x) => x.decode).reduce(wrap, id);
  return { encode: encode20, decode: decode19 };
}
// @__NO_SIDE_EFFECTS__
function alphabet2(letters) {
  const lettersA = typeof letters === "string" ? letters.split("") : letters;
  const len = lettersA.length;
  astrArr2("alphabet", lettersA);
  const indexes = new Map(lettersA.map((l, i) => [l, i]));
  return {
    encode: (digits) => {
      aArr2(digits);
      return digits.map((i) => {
        if (!Number.isSafeInteger(i) || i < 0 || i >= len)
          throw new Error(`alphabet.encode: digit index outside alphabet "${i}". Allowed: ${letters}`);
        return lettersA[i];
      });
    },
    decode: (input) => {
      aArr2(input);
      return input.map((letter) => {
        astr2("alphabet.decode", letter);
        const i = indexes.get(letter);
        if (i === void 0)
          throw new Error(`Unknown letter: "${letter}". Allowed: ${letters}`);
        return i;
      });
    }
  };
}
// @__NO_SIDE_EFFECTS__
function join2(separator = "") {
  astr2("join", separator);
  return {
    encode: (from) => {
      astrArr2("join.decode", from);
      return from.join(separator);
    },
    decode: (to) => {
      astr2("join.decode", to);
      return to.split(separator);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function padding(bits, chr = "=") {
  anumber5(bits);
  astr2("padding", chr);
  return {
    encode(data) {
      astrArr2("padding.encode", data);
      while (data.length * bits % 8)
        data.push(chr);
      return data;
    },
    decode(input) {
      astrArr2("padding.decode", input);
      let end = input.length;
      if (end * bits % 8)
        throw new Error("padding: invalid, string should have whole number of bytes");
      for (; end > 0 && input[end - 1] === chr; end--) {
        const last = end - 1;
        const byte = last * bits;
        if (byte % 8 === 0)
          throw new Error("padding: invalid, string has too much padding");
      }
      return input.slice(0, end);
    }
  };
}
function convertRadix2(data, from, to) {
  if (from < 2)
    throw new Error(`convertRadix: invalid from=${from}, base cannot be less than 2`);
  if (to < 2)
    throw new Error(`convertRadix: invalid to=${to}, base cannot be less than 2`);
  aArr2(data);
  if (!data.length)
    return [];
  let pos = 0;
  const res = [];
  const digits = Array.from(data, (d) => {
    anumber5(d);
    if (d < 0 || d >= from)
      throw new Error(`invalid integer: ${d}`);
    return d;
  });
  const dlen = digits.length;
  while (true) {
    let carry = 0;
    let done = true;
    for (let i = pos; i < dlen; i++) {
      const digit = digits[i];
      const fromCarry = from * carry;
      const digitBase = fromCarry + digit;
      if (!Number.isSafeInteger(digitBase) || fromCarry / from !== carry || digitBase - digit !== fromCarry) {
        throw new Error("convertRadix: carry overflow");
      }
      const div = digitBase / to;
      carry = digitBase % to;
      const rounded = Math.floor(div);
      digits[i] = rounded;
      if (!Number.isSafeInteger(rounded) || rounded * to + carry !== digitBase)
        throw new Error("convertRadix: carry overflow");
      if (!done)
        continue;
      else if (!rounded)
        pos = i;
      else
        done = false;
    }
    res.push(carry);
    if (done)
      break;
  }
  for (let i = 0; i < data.length - 1 && data[i] === 0; i++)
    res.push(0);
  return res.reverse();
}
var gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
var radix2carry = /* @__NO_SIDE_EFFECTS__ */ (from, to) => from + (to - gcd(from, to));
var powers = /* @__PURE__ */ (() => {
  let res = [];
  for (let i = 0; i < 40; i++)
    res.push(2 ** i);
  return res;
})();
function convertRadix22(data, from, to, padding2) {
  aArr2(data);
  if (from <= 0 || from > 32)
    throw new Error(`convertRadix2: wrong from=${from}`);
  if (to <= 0 || to > 32)
    throw new Error(`convertRadix2: wrong to=${to}`);
  if (/* @__PURE__ */ radix2carry(from, to) > 32) {
    throw new Error(`convertRadix2: carry overflow from=${from} to=${to} carryBits=${/* @__PURE__ */ radix2carry(from, to)}`);
  }
  let carry = 0;
  let pos = 0;
  const max = powers[from];
  const mask = powers[to] - 1;
  const res = [];
  for (const n of data) {
    anumber5(n);
    if (n >= max)
      throw new Error(`convertRadix2: invalid data word=${n} from=${from}`);
    carry = carry << from | n;
    if (pos + from > 32)
      throw new Error(`convertRadix2: carry overflow pos=${pos} from=${from}`);
    pos += from;
    for (; pos >= to; pos -= to)
      res.push((carry >> pos - to & mask) >>> 0);
    const pow = powers[pos];
    if (pow === void 0)
      throw new Error("invalid carry");
    carry &= pow - 1;
  }
  carry = carry << to - pos & mask;
  if (!padding2 && pos >= from)
    throw new Error("Excess padding");
  if (!padding2 && carry > 0)
    throw new Error(`Non-zero padding: ${carry}`);
  if (padding2 && pos > 0)
    res.push(carry >>> 0);
  return res;
}
// @__NO_SIDE_EFFECTS__
function radix2(num) {
  anumber5(num);
  const _256 = 2 ** 8;
  return {
    encode: (bytes) => {
      if (!isBytes5(bytes))
        throw new Error("radix.encode input should be Uint8Array");
      return convertRadix2(Array.from(bytes), _256, num);
    },
    decode: (digits) => {
      anumArr2("radix.decode", digits);
      return Uint8Array.from(convertRadix2(digits, num, _256));
    }
  };
}
// @__NO_SIDE_EFFECTS__
function radix22(bits, revPadding = false) {
  anumber5(bits);
  if (bits <= 0 || bits > 32)
    throw new Error("radix2: bits should be in (0..32]");
  if (/* @__PURE__ */ radix2carry(8, bits) > 32 || /* @__PURE__ */ radix2carry(bits, 8) > 32)
    throw new Error("radix2: carry overflow");
  return {
    encode: (bytes) => {
      if (!isBytes5(bytes))
        throw new Error("radix2.encode input should be Uint8Array");
      return convertRadix22(Array.from(bytes), 8, bits, !revPadding);
    },
    decode: (digits) => {
      anumArr2("radix2.decode", digits);
      return Uint8Array.from(convertRadix22(digits, bits, 8, revPadding));
    }
  };
}
function checksum2(len, fn) {
  anumber5(len);
  afn2(fn);
  return {
    encode(data) {
      if (!isBytes5(data))
        throw new Error("checksum.encode: input should be Uint8Array");
      const sum = fn(data).slice(0, len);
      const res = new Uint8Array(data.length + len);
      res.set(data);
      res.set(sum, data.length);
      return res;
    },
    decode(data) {
      if (!isBytes5(data))
        throw new Error("checksum.decode: input should be Uint8Array");
      const payload = data.slice(0, -len);
      const oldChecksum = data.slice(-len);
      const newChecksum = fn(payload).slice(0, len);
      for (let i = 0; i < len; i++)
        if (newChecksum[i] !== oldChecksum[i])
          throw new Error("Invalid checksum");
      return payload;
    }
  };
}
var utils = {
  alphabet: alphabet2,
  chain: chain2,
  checksum: checksum2,
  convertRadix: convertRadix2,
  convertRadix2: convertRadix22,
  radix: radix2,
  radix2: radix22,
  join: join2,
  padding
};

// node_modules/@scure/bip39/index.js
var isJapanese = (wordlist2) => wordlist2[0] === "\u3042\u3044\u3053\u304F\u3057\u3093";
function nfkd(str) {
  if (typeof str !== "string")
    throw new TypeError("invalid mnemonic type: " + typeof str);
  return str.normalize("NFKD");
}
function normalize(str) {
  const norm = nfkd(str);
  const words = norm.split(" ");
  if (![12, 15, 18, 21, 24].includes(words.length))
    throw new Error("Invalid mnemonic");
  return { nfkd: norm, words };
}
function aentropy(ent) {
  abytes3(ent);
  if (![16, 20, 24, 28, 32].includes(ent.length))
    throw new Error("invalid entropy length");
}
function generateMnemonic(wordlist2, strength = 128) {
  anumber4(strength);
  if (strength % 32 !== 0 || strength > 256)
    throw new TypeError("Invalid entropy");
  return entropyToMnemonic(randomBytes2(strength / 8), wordlist2);
}
var calcChecksum = (entropy) => {
  const bitsLeft = 8 - entropy.length / 4;
  return new Uint8Array([sha2563(entropy)[0] >> bitsLeft << bitsLeft]);
};
function getCoder(wordlist2) {
  if (!Array.isArray(wordlist2) || wordlist2.length !== 2048 || typeof wordlist2[0] !== "string")
    throw new Error("Wordlist: expected array of 2048 strings");
  wordlist2.forEach((i) => {
    if (typeof i !== "string")
      throw new Error("wordlist: non-string element: " + i);
  });
  return utils.chain(utils.checksum(1, calcChecksum), utils.radix2(11, true), utils.alphabet(wordlist2));
}
function mnemonicToEntropy(mnemonic, wordlist2) {
  const { words } = normalize(mnemonic);
  const entropy = getCoder(wordlist2).decode(words);
  aentropy(entropy);
  return entropy;
}
function entropyToMnemonic(entropy, wordlist2) {
  aentropy(entropy);
  const words = getCoder(wordlist2).encode(entropy);
  return words.join(isJapanese(wordlist2) ? "\u3000" : " ");
}
function validateMnemonic(mnemonic, wordlist2) {
  try {
    mnemonicToEntropy(mnemonic, wordlist2);
  } catch (e) {
    return false;
  }
  return true;
}
var psalt = (passphrase) => nfkd("mnemonic" + passphrase);
function mnemonicToSeedSync(mnemonic, passphrase = "") {
  return pbkdf2(sha5122, normalize(mnemonic).nfkd, psalt(passphrase), { c: 2048, dkLen: 64 });
}

// node_modules/@scure/bip39/wordlists/english.js
var wordlist = `abandon
ability
able
about
above
absent
absorb
abstract
absurd
abuse
access
accident
account
accuse
achieve
acid
acoustic
acquire
across
act
action
actor
actress
actual
adapt
add
addict
address
adjust
admit
adult
advance
advice
aerobic
affair
afford
afraid
again
age
agent
agree
ahead
aim
air
airport
aisle
alarm
album
alcohol
alert
alien
all
alley
allow
almost
alone
alpha
already
also
alter
always
amateur
amazing
among
amount
amused
analyst
anchor
ancient
anger
angle
angry
animal
ankle
announce
annual
another
answer
antenna
antique
anxiety
any
apart
apology
appear
apple
approve
april
arch
arctic
area
arena
argue
arm
armed
armor
army
around
arrange
arrest
arrive
arrow
art
artefact
artist
artwork
ask
aspect
assault
asset
assist
assume
asthma
athlete
atom
attack
attend
attitude
attract
auction
audit
august
aunt
author
auto
autumn
average
avocado
avoid
awake
aware
away
awesome
awful
awkward
axis
baby
bachelor
bacon
badge
bag
balance
balcony
ball
bamboo
banana
banner
bar
barely
bargain
barrel
base
basic
basket
battle
beach
bean
beauty
because
become
beef
before
begin
behave
behind
believe
below
belt
bench
benefit
best
betray
better
between
beyond
bicycle
bid
bike
bind
biology
bird
birth
bitter
black
blade
blame
blanket
blast
bleak
bless
blind
blood
blossom
blouse
blue
blur
blush
board
boat
body
boil
bomb
bone
bonus
book
boost
border
boring
borrow
boss
bottom
bounce
box
boy
bracket
brain
brand
brass
brave
bread
breeze
brick
bridge
brief
bright
bring
brisk
broccoli
broken
bronze
broom
brother
brown
brush
bubble
buddy
budget
buffalo
build
bulb
bulk
bullet
bundle
bunker
burden
burger
burst
bus
business
busy
butter
buyer
buzz
cabbage
cabin
cable
cactus
cage
cake
call
calm
camera
camp
can
canal
cancel
candy
cannon
canoe
canvas
canyon
capable
capital
captain
car
carbon
card
cargo
carpet
carry
cart
case
cash
casino
castle
casual
cat
catalog
catch
category
cattle
caught
cause
caution
cave
ceiling
celery
cement
census
century
cereal
certain
chair
chalk
champion
change
chaos
chapter
charge
chase
chat
cheap
check
cheese
chef
cherry
chest
chicken
chief
child
chimney
choice
choose
chronic
chuckle
chunk
churn
cigar
cinnamon
circle
citizen
city
civil
claim
clap
clarify
claw
clay
clean
clerk
clever
click
client
cliff
climb
clinic
clip
clock
clog
close
cloth
cloud
clown
club
clump
cluster
clutch
coach
coast
coconut
code
coffee
coil
coin
collect
color
column
combine
come
comfort
comic
common
company
concert
conduct
confirm
congress
connect
consider
control
convince
cook
cool
copper
copy
coral
core
corn
correct
cost
cotton
couch
country
couple
course
cousin
cover
coyote
crack
cradle
craft
cram
crane
crash
crater
crawl
crazy
cream
credit
creek
crew
cricket
crime
crisp
critic
crop
cross
crouch
crowd
crucial
cruel
cruise
crumble
crunch
crush
cry
crystal
cube
culture
cup
cupboard
curious
current
curtain
curve
cushion
custom
cute
cycle
dad
damage
damp
dance
danger
daring
dash
daughter
dawn
day
deal
debate
debris
decade
december
decide
decline
decorate
decrease
deer
defense
define
defy
degree
delay
deliver
demand
demise
denial
dentist
deny
depart
depend
deposit
depth
deputy
derive
describe
desert
design
desk
despair
destroy
detail
detect
develop
device
devote
diagram
dial
diamond
diary
dice
diesel
diet
differ
digital
dignity
dilemma
dinner
dinosaur
direct
dirt
disagree
discover
disease
dish
dismiss
disorder
display
distance
divert
divide
divorce
dizzy
doctor
document
dog
doll
dolphin
domain
donate
donkey
donor
door
dose
double
dove
draft
dragon
drama
drastic
draw
dream
dress
drift
drill
drink
drip
drive
drop
drum
dry
duck
dumb
dune
during
dust
dutch
duty
dwarf
dynamic
eager
eagle
early
earn
earth
easily
east
easy
echo
ecology
economy
edge
edit
educate
effort
egg
eight
either
elbow
elder
electric
elegant
element
elephant
elevator
elite
else
embark
embody
embrace
emerge
emotion
employ
empower
empty
enable
enact
end
endless
endorse
enemy
energy
enforce
engage
engine
enhance
enjoy
enlist
enough
enrich
enroll
ensure
enter
entire
entry
envelope
episode
equal
equip
era
erase
erode
erosion
error
erupt
escape
essay
essence
estate
eternal
ethics
evidence
evil
evoke
evolve
exact
example
excess
exchange
excite
exclude
excuse
execute
exercise
exhaust
exhibit
exile
exist
exit
exotic
expand
expect
expire
explain
expose
express
extend
extra
eye
eyebrow
fabric
face
faculty
fade
faint
faith
fall
false
fame
family
famous
fan
fancy
fantasy
farm
fashion
fat
fatal
father
fatigue
fault
favorite
feature
february
federal
fee
feed
feel
female
fence
festival
fetch
fever
few
fiber
fiction
field
figure
file
film
filter
final
find
fine
finger
finish
fire
firm
first
fiscal
fish
fit
fitness
fix
flag
flame
flash
flat
flavor
flee
flight
flip
float
flock
floor
flower
fluid
flush
fly
foam
focus
fog
foil
fold
follow
food
foot
force
forest
forget
fork
fortune
forum
forward
fossil
foster
found
fox
fragile
frame
frequent
fresh
friend
fringe
frog
front
frost
frown
frozen
fruit
fuel
fun
funny
furnace
fury
future
gadget
gain
galaxy
gallery
game
gap
garage
garbage
garden
garlic
garment
gas
gasp
gate
gather
gauge
gaze
general
genius
genre
gentle
genuine
gesture
ghost
giant
gift
giggle
ginger
giraffe
girl
give
glad
glance
glare
glass
glide
glimpse
globe
gloom
glory
glove
glow
glue
goat
goddess
gold
good
goose
gorilla
gospel
gossip
govern
gown
grab
grace
grain
grant
grape
grass
gravity
great
green
grid
grief
grit
grocery
group
grow
grunt
guard
guess
guide
guilt
guitar
gun
gym
habit
hair
half
hammer
hamster
hand
happy
harbor
hard
harsh
harvest
hat
have
hawk
hazard
head
health
heart
heavy
hedgehog
height
hello
helmet
help
hen
hero
hidden
high
hill
hint
hip
hire
history
hobby
hockey
hold
hole
holiday
hollow
home
honey
hood
hope
horn
horror
horse
hospital
host
hotel
hour
hover
hub
huge
human
humble
humor
hundred
hungry
hunt
hurdle
hurry
hurt
husband
hybrid
ice
icon
idea
identify
idle
ignore
ill
illegal
illness
image
imitate
immense
immune
impact
impose
improve
impulse
inch
include
income
increase
index
indicate
indoor
industry
infant
inflict
inform
inhale
inherit
initial
inject
injury
inmate
inner
innocent
input
inquiry
insane
insect
inside
inspire
install
intact
interest
into
invest
invite
involve
iron
island
isolate
issue
item
ivory
jacket
jaguar
jar
jazz
jealous
jeans
jelly
jewel
job
join
joke
journey
joy
judge
juice
jump
jungle
junior
junk
just
kangaroo
keen
keep
ketchup
key
kick
kid
kidney
kind
kingdom
kiss
kit
kitchen
kite
kitten
kiwi
knee
knife
knock
know
lab
label
labor
ladder
lady
lake
lamp
language
laptop
large
later
latin
laugh
laundry
lava
law
lawn
lawsuit
layer
lazy
leader
leaf
learn
leave
lecture
left
leg
legal
legend
leisure
lemon
lend
length
lens
leopard
lesson
letter
level
liar
liberty
library
license
life
lift
light
like
limb
limit
link
lion
liquid
list
little
live
lizard
load
loan
lobster
local
lock
logic
lonely
long
loop
lottery
loud
lounge
love
loyal
lucky
luggage
lumber
lunar
lunch
luxury
lyrics
machine
mad
magic
magnet
maid
mail
main
major
make
mammal
man
manage
mandate
mango
mansion
manual
maple
marble
march
margin
marine
market
marriage
mask
mass
master
match
material
math
matrix
matter
maximum
maze
meadow
mean
measure
meat
mechanic
medal
media
melody
melt
member
memory
mention
menu
mercy
merge
merit
merry
mesh
message
metal
method
middle
midnight
milk
million
mimic
mind
minimum
minor
minute
miracle
mirror
misery
miss
mistake
mix
mixed
mixture
mobile
model
modify
mom
moment
monitor
monkey
monster
month
moon
moral
more
morning
mosquito
mother
motion
motor
mountain
mouse
move
movie
much
muffin
mule
multiply
muscle
museum
mushroom
music
must
mutual
myself
mystery
myth
naive
name
napkin
narrow
nasty
nation
nature
near
neck
need
negative
neglect
neither
nephew
nerve
nest
net
network
neutral
never
news
next
nice
night
noble
noise
nominee
noodle
normal
north
nose
notable
note
nothing
notice
novel
now
nuclear
number
nurse
nut
oak
obey
object
oblige
obscure
observe
obtain
obvious
occur
ocean
october
odor
off
offer
office
often
oil
okay
old
olive
olympic
omit
once
one
onion
online
only
open
opera
opinion
oppose
option
orange
orbit
orchard
order
ordinary
organ
orient
original
orphan
ostrich
other
outdoor
outer
output
outside
oval
oven
over
own
owner
oxygen
oyster
ozone
pact
paddle
page
pair
palace
palm
panda
panel
panic
panther
paper
parade
parent
park
parrot
party
pass
patch
path
patient
patrol
pattern
pause
pave
payment
peace
peanut
pear
peasant
pelican
pen
penalty
pencil
people
pepper
perfect
permit
person
pet
phone
photo
phrase
physical
piano
picnic
picture
piece
pig
pigeon
pill
pilot
pink
pioneer
pipe
pistol
pitch
pizza
place
planet
plastic
plate
play
please
pledge
pluck
plug
plunge
poem
poet
point
polar
pole
police
pond
pony
pool
popular
portion
position
possible
post
potato
pottery
poverty
powder
power
practice
praise
predict
prefer
prepare
present
pretty
prevent
price
pride
primary
print
priority
prison
private
prize
problem
process
produce
profit
program
project
promote
proof
property
prosper
protect
proud
provide
public
pudding
pull
pulp
pulse
pumpkin
punch
pupil
puppy
purchase
purity
purpose
purse
push
put
puzzle
pyramid
quality
quantum
quarter
question
quick
quit
quiz
quote
rabbit
raccoon
race
rack
radar
radio
rail
rain
raise
rally
ramp
ranch
random
range
rapid
rare
rate
rather
raven
raw
razor
ready
real
reason
rebel
rebuild
recall
receive
recipe
record
recycle
reduce
reflect
reform
refuse
region
regret
regular
reject
relax
release
relief
rely
remain
remember
remind
remove
render
renew
rent
reopen
repair
repeat
replace
report
require
rescue
resemble
resist
resource
response
result
retire
retreat
return
reunion
reveal
review
reward
rhythm
rib
ribbon
rice
rich
ride
ridge
rifle
right
rigid
ring
riot
ripple
risk
ritual
rival
river
road
roast
robot
robust
rocket
romance
roof
rookie
room
rose
rotate
rough
round
route
royal
rubber
rude
rug
rule
run
runway
rural
sad
saddle
sadness
safe
sail
salad
salmon
salon
salt
salute
same
sample
sand
satisfy
satoshi
sauce
sausage
save
say
scale
scan
scare
scatter
scene
scheme
school
science
scissors
scorpion
scout
scrap
screen
script
scrub
sea
search
season
seat
second
secret
section
security
seed
seek
segment
select
sell
seminar
senior
sense
sentence
series
service
session
settle
setup
seven
shadow
shaft
shallow
share
shed
shell
sheriff
shield
shift
shine
ship
shiver
shock
shoe
shoot
shop
short
shoulder
shove
shrimp
shrug
shuffle
shy
sibling
sick
side
siege
sight
sign
silent
silk
silly
silver
similar
simple
since
sing
siren
sister
situate
six
size
skate
sketch
ski
skill
skin
skirt
skull
slab
slam
sleep
slender
slice
slide
slight
slim
slogan
slot
slow
slush
small
smart
smile
smoke
smooth
snack
snake
snap
sniff
snow
soap
soccer
social
sock
soda
soft
solar
soldier
solid
solution
solve
someone
song
soon
sorry
sort
soul
sound
soup
source
south
space
spare
spatial
spawn
speak
special
speed
spell
spend
sphere
spice
spider
spike
spin
spirit
split
spoil
sponsor
spoon
sport
spot
spray
spread
spring
spy
square
squeeze
squirrel
stable
stadium
staff
stage
stairs
stamp
stand
start
state
stay
steak
steel
stem
step
stereo
stick
still
sting
stock
stomach
stone
stool
story
stove
strategy
street
strike
strong
struggle
student
stuff
stumble
style
subject
submit
subway
success
such
sudden
suffer
sugar
suggest
suit
summer
sun
sunny
sunset
super
supply
supreme
sure
surface
surge
surprise
surround
survey
suspect
sustain
swallow
swamp
swap
swarm
swear
sweet
swift
swim
swing
switch
sword
symbol
symptom
syrup
system
table
tackle
tag
tail
talent
talk
tank
tape
target
task
taste
tattoo
taxi
teach
team
tell
ten
tenant
tennis
tent
term
test
text
thank
that
theme
then
theory
there
they
thing
this
thought
three
thrive
throw
thumb
thunder
ticket
tide
tiger
tilt
timber
time
tiny
tip
tired
tissue
title
toast
tobacco
today
toddler
toe
together
toilet
token
tomato
tomorrow
tone
tongue
tonight
tool
tooth
top
topic
topple
torch
tornado
tortoise
toss
total
tourist
toward
tower
town
toy
track
trade
traffic
tragic
train
transfer
trap
trash
travel
tray
treat
tree
trend
trial
tribe
trick
trigger
trim
trip
trophy
trouble
truck
true
truly
trumpet
trust
truth
try
tube
tuition
tumble
tuna
tunnel
turkey
turn
turtle
twelve
twenty
twice
twin
twist
two
type
typical
ugly
umbrella
unable
unaware
uncle
uncover
under
undo
unfair
unfold
unhappy
uniform
unique
unit
universe
unknown
unlock
until
unusual
unveil
update
upgrade
uphold
upon
upper
upset
urban
urge
usage
use
used
useful
useless
usual
utility
vacant
vacuum
vague
valid
valley
valve
van
vanish
vapor
various
vast
vault
vehicle
velvet
vendor
venture
venue
verb
verify
version
very
vessel
veteran
viable
vibrant
vicious
victory
video
view
village
vintage
violin
virtual
virus
visa
visit
visual
vital
vivid
vocal
voice
void
volcano
volume
vote
voyage
wage
wagon
wait
walk
wall
walnut
want
warfare
warm
warrior
wash
wasp
waste
water
wave
way
wealth
weapon
wear
weasel
weather
web
wedding
weekend
weird
welcome
west
wet
whale
what
wheat
wheel
when
where
whip
whisper
wide
width
wife
wild
will
win
window
wine
wing
wink
winner
winter
wire
wisdom
wise
wish
witness
wolf
woman
wonder
wood
wool
word
work
world
worry
worth
wrap
wreck
wrestle
wrist
write
wrong
yard
year
yellow
you
young
youth
zebra
zero
zone
zoo`.split("\n");

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/networks.js
var networks_exports = {};
__export(networks_exports, {
  bitcoin: () => bitcoin,
  regtest: () => regtest,
  testnet: () => testnet
});
var bitcoin = {
  /**
   * The message prefix used for signing Bitcoin messages.
   */
  messagePrefix: "Bitcoin Signed Message:\n",
  /**
   * The Bech32 prefix used for Bitcoin addresses.
   */
  bech32: "bc",
  /**
   * The BIP32 key prefixes for Bitcoin.
   */
  bip32: {
    /**
     * The public key prefix for BIP32 extended public keys.
     */
    public: 76067358,
    /**
     * The private key prefix for BIP32 extended private keys.
     */
    private: 76066276
  },
  /**
   * The prefix for Bitcoin public key hashes.
   */
  pubKeyHash: 0,
  /**
   * The prefix for Bitcoin script hashes.
   */
  scriptHash: 5,
  /**
   * The prefix for Bitcoin Wallet Import Format (WIF) private keys.
   */
  wif: 128
};
var regtest = {
  messagePrefix: "Bitcoin Signed Message:\n",
  bech32: "bcrt",
  bip32: {
    public: 70617039,
    private: 70615956
  },
  pubKeyHash: 111,
  scriptHash: 196,
  wif: 239
};
var testnet = {
  messagePrefix: "Bitcoin Signed Message:\n",
  bech32: "tb",
  bip32: {
    public: 70617039,
    private: 70615956
  },
  pubKeyHash: 111,
  scriptHash: 196,
  wif: 239
};

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/index.js
var payments_exports = {};
__export(payments_exports, {
  embed: () => p2data,
  p2ms: () => p2ms,
  p2pk: () => p2pk,
  p2pkh: () => p2pkh,
  p2sh: () => p2sh,
  p2tr: () => p2tr,
  p2wpkh: () => p2wpkh,
  p2wsh: () => p2wsh
});

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/bip66.js
function check(buffer) {
  if (buffer.length < 8) return false;
  if (buffer.length > 72) return false;
  if (buffer[0] !== 48) return false;
  if (buffer[1] !== buffer.length - 2) return false;
  if (buffer[2] !== 2) return false;
  const lenR = buffer[3];
  if (lenR === 0) return false;
  if (5 + lenR >= buffer.length) return false;
  if (buffer[4 + lenR] !== 2) return false;
  const lenS = buffer[5 + lenR];
  if (lenS === 0) return false;
  if (6 + lenR + lenS !== buffer.length) return false;
  if (buffer[4] & 128) return false;
  if (lenR > 1 && buffer[4] === 0 && !(buffer[5] & 128)) return false;
  if (buffer[lenR + 6] & 128) return false;
  if (lenS > 1 && buffer[lenR + 6] === 0 && !(buffer[lenR + 7] & 128))
    return false;
  return true;
}
function decode(buffer) {
  if (buffer.length < 8) throw new Error("DER sequence length is too short");
  if (buffer.length > 72) throw new Error("DER sequence length is too long");
  if (buffer[0] !== 48) throw new Error("Expected DER sequence");
  if (buffer[1] !== buffer.length - 2)
    throw new Error("DER sequence length is invalid");
  if (buffer[2] !== 2) throw new Error("Expected DER integer");
  const lenR = buffer[3];
  if (lenR === 0) throw new Error("R length is zero");
  if (5 + lenR >= buffer.length) throw new Error("R length is too long");
  if (buffer[4 + lenR] !== 2) throw new Error("Expected DER integer (2)");
  const lenS = buffer[5 + lenR];
  if (lenS === 0) throw new Error("S length is zero");
  if (6 + lenR + lenS !== buffer.length) throw new Error("S length is invalid");
  if (buffer[4] & 128) throw new Error("R value is negative");
  if (lenR > 1 && buffer[4] === 0 && !(buffer[5] & 128))
    throw new Error("R value excessively padded");
  if (buffer[lenR + 6] & 128) throw new Error("S value is negative");
  if (lenS > 1 && buffer[lenR + 6] === 0 && !(buffer[lenR + 7] & 128))
    throw new Error("S value excessively padded");
  return {
    r: buffer.slice(4, 4 + lenR),
    s: buffer.slice(6 + lenR)
  };
}
function encode(r, s) {
  const lenR = r.length;
  const lenS = s.length;
  if (lenR === 0) throw new Error("R length is zero");
  if (lenS === 0) throw new Error("S length is zero");
  if (lenR > 33) throw new Error("R length is too long");
  if (lenS > 33) throw new Error("S length is too long");
  if (r[0] & 128) throw new Error("R value is negative");
  if (s[0] & 128) throw new Error("S value is negative");
  if (lenR > 1 && r[0] === 0 && !(r[1] & 128))
    throw new Error("R value excessively padded");
  if (lenS > 1 && s[0] === 0 && !(s[1] & 128))
    throw new Error("S value excessively padded");
  const signature2 = new Uint8Array(6 + lenR + lenS);
  signature2[0] = 48;
  signature2[1] = signature2.length - 2;
  signature2[2] = 2;
  signature2[3] = r.length;
  signature2.set(r, 4);
  signature2[4 + lenR] = 2;
  signature2[5 + lenR] = s.length;
  signature2.set(s, 6 + lenR);
  return signature2;
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/ops.js
var OPS;
(function(OPS10) {
  OPS10[OPS10["OP_FALSE"] = 0] = "OP_FALSE";
  OPS10[OPS10["OP_0"] = 0] = "OP_0";
  OPS10[OPS10["OP_PUSHDATA1"] = 76] = "OP_PUSHDATA1";
  OPS10[OPS10["OP_PUSHDATA2"] = 77] = "OP_PUSHDATA2";
  OPS10[OPS10["OP_PUSHDATA4"] = 78] = "OP_PUSHDATA4";
  OPS10[OPS10["OP_1NEGATE"] = 79] = "OP_1NEGATE";
  OPS10[OPS10["OP_RESERVED"] = 80] = "OP_RESERVED";
  OPS10[OPS10["OP_TRUE"] = 81] = "OP_TRUE";
  OPS10[OPS10["OP_1"] = 81] = "OP_1";
  OPS10[OPS10["OP_2"] = 82] = "OP_2";
  OPS10[OPS10["OP_3"] = 83] = "OP_3";
  OPS10[OPS10["OP_4"] = 84] = "OP_4";
  OPS10[OPS10["OP_5"] = 85] = "OP_5";
  OPS10[OPS10["OP_6"] = 86] = "OP_6";
  OPS10[OPS10["OP_7"] = 87] = "OP_7";
  OPS10[OPS10["OP_8"] = 88] = "OP_8";
  OPS10[OPS10["OP_9"] = 89] = "OP_9";
  OPS10[OPS10["OP_10"] = 90] = "OP_10";
  OPS10[OPS10["OP_11"] = 91] = "OP_11";
  OPS10[OPS10["OP_12"] = 92] = "OP_12";
  OPS10[OPS10["OP_13"] = 93] = "OP_13";
  OPS10[OPS10["OP_14"] = 94] = "OP_14";
  OPS10[OPS10["OP_15"] = 95] = "OP_15";
  OPS10[OPS10["OP_16"] = 96] = "OP_16";
  OPS10[OPS10["OP_NOP"] = 97] = "OP_NOP";
  OPS10[OPS10["OP_VER"] = 98] = "OP_VER";
  OPS10[OPS10["OP_IF"] = 99] = "OP_IF";
  OPS10[OPS10["OP_NOTIF"] = 100] = "OP_NOTIF";
  OPS10[OPS10["OP_VERIF"] = 101] = "OP_VERIF";
  OPS10[OPS10["OP_VERNOTIF"] = 102] = "OP_VERNOTIF";
  OPS10[OPS10["OP_ELSE"] = 103] = "OP_ELSE";
  OPS10[OPS10["OP_ENDIF"] = 104] = "OP_ENDIF";
  OPS10[OPS10["OP_VERIFY"] = 105] = "OP_VERIFY";
  OPS10[OPS10["OP_RETURN"] = 106] = "OP_RETURN";
  OPS10[OPS10["OP_TOALTSTACK"] = 107] = "OP_TOALTSTACK";
  OPS10[OPS10["OP_FROMALTSTACK"] = 108] = "OP_FROMALTSTACK";
  OPS10[OPS10["OP_2DROP"] = 109] = "OP_2DROP";
  OPS10[OPS10["OP_2DUP"] = 110] = "OP_2DUP";
  OPS10[OPS10["OP_3DUP"] = 111] = "OP_3DUP";
  OPS10[OPS10["OP_2OVER"] = 112] = "OP_2OVER";
  OPS10[OPS10["OP_2ROT"] = 113] = "OP_2ROT";
  OPS10[OPS10["OP_2SWAP"] = 114] = "OP_2SWAP";
  OPS10[OPS10["OP_IFDUP"] = 115] = "OP_IFDUP";
  OPS10[OPS10["OP_DEPTH"] = 116] = "OP_DEPTH";
  OPS10[OPS10["OP_DROP"] = 117] = "OP_DROP";
  OPS10[OPS10["OP_DUP"] = 118] = "OP_DUP";
  OPS10[OPS10["OP_NIP"] = 119] = "OP_NIP";
  OPS10[OPS10["OP_OVER"] = 120] = "OP_OVER";
  OPS10[OPS10["OP_PICK"] = 121] = "OP_PICK";
  OPS10[OPS10["OP_ROLL"] = 122] = "OP_ROLL";
  OPS10[OPS10["OP_ROT"] = 123] = "OP_ROT";
  OPS10[OPS10["OP_SWAP"] = 124] = "OP_SWAP";
  OPS10[OPS10["OP_TUCK"] = 125] = "OP_TUCK";
  OPS10[OPS10["OP_CAT"] = 126] = "OP_CAT";
  OPS10[OPS10["OP_SUBSTR"] = 127] = "OP_SUBSTR";
  OPS10[OPS10["OP_LEFT"] = 128] = "OP_LEFT";
  OPS10[OPS10["OP_RIGHT"] = 129] = "OP_RIGHT";
  OPS10[OPS10["OP_SIZE"] = 130] = "OP_SIZE";
  OPS10[OPS10["OP_INVERT"] = 131] = "OP_INVERT";
  OPS10[OPS10["OP_AND"] = 132] = "OP_AND";
  OPS10[OPS10["OP_OR"] = 133] = "OP_OR";
  OPS10[OPS10["OP_XOR"] = 134] = "OP_XOR";
  OPS10[OPS10["OP_EQUAL"] = 135] = "OP_EQUAL";
  OPS10[OPS10["OP_EQUALVERIFY"] = 136] = "OP_EQUALVERIFY";
  OPS10[OPS10["OP_RESERVED1"] = 137] = "OP_RESERVED1";
  OPS10[OPS10["OP_RESERVED2"] = 138] = "OP_RESERVED2";
  OPS10[OPS10["OP_1ADD"] = 139] = "OP_1ADD";
  OPS10[OPS10["OP_1SUB"] = 140] = "OP_1SUB";
  OPS10[OPS10["OP_2MUL"] = 141] = "OP_2MUL";
  OPS10[OPS10["OP_2DIV"] = 142] = "OP_2DIV";
  OPS10[OPS10["OP_NEGATE"] = 143] = "OP_NEGATE";
  OPS10[OPS10["OP_ABS"] = 144] = "OP_ABS";
  OPS10[OPS10["OP_NOT"] = 145] = "OP_NOT";
  OPS10[OPS10["OP_0NOTEQUAL"] = 146] = "OP_0NOTEQUAL";
  OPS10[OPS10["OP_ADD"] = 147] = "OP_ADD";
  OPS10[OPS10["OP_SUB"] = 148] = "OP_SUB";
  OPS10[OPS10["OP_MUL"] = 149] = "OP_MUL";
  OPS10[OPS10["OP_DIV"] = 150] = "OP_DIV";
  OPS10[OPS10["OP_MOD"] = 151] = "OP_MOD";
  OPS10[OPS10["OP_LSHIFT"] = 152] = "OP_LSHIFT";
  OPS10[OPS10["OP_RSHIFT"] = 153] = "OP_RSHIFT";
  OPS10[OPS10["OP_BOOLAND"] = 154] = "OP_BOOLAND";
  OPS10[OPS10["OP_BOOLOR"] = 155] = "OP_BOOLOR";
  OPS10[OPS10["OP_NUMEQUAL"] = 156] = "OP_NUMEQUAL";
  OPS10[OPS10["OP_NUMEQUALVERIFY"] = 157] = "OP_NUMEQUALVERIFY";
  OPS10[OPS10["OP_NUMNOTEQUAL"] = 158] = "OP_NUMNOTEQUAL";
  OPS10[OPS10["OP_LESSTHAN"] = 159] = "OP_LESSTHAN";
  OPS10[OPS10["OP_GREATERTHAN"] = 160] = "OP_GREATERTHAN";
  OPS10[OPS10["OP_LESSTHANOREQUAL"] = 161] = "OP_LESSTHANOREQUAL";
  OPS10[OPS10["OP_GREATERTHANOREQUAL"] = 162] = "OP_GREATERTHANOREQUAL";
  OPS10[OPS10["OP_MIN"] = 163] = "OP_MIN";
  OPS10[OPS10["OP_MAX"] = 164] = "OP_MAX";
  OPS10[OPS10["OP_WITHIN"] = 165] = "OP_WITHIN";
  OPS10[OPS10["OP_RIPEMD160"] = 166] = "OP_RIPEMD160";
  OPS10[OPS10["OP_SHA1"] = 167] = "OP_SHA1";
  OPS10[OPS10["OP_SHA256"] = 168] = "OP_SHA256";
  OPS10[OPS10["OP_HASH160"] = 169] = "OP_HASH160";
  OPS10[OPS10["OP_HASH256"] = 170] = "OP_HASH256";
  OPS10[OPS10["OP_CODESEPARATOR"] = 171] = "OP_CODESEPARATOR";
  OPS10[OPS10["OP_CHECKSIG"] = 172] = "OP_CHECKSIG";
  OPS10[OPS10["OP_CHECKSIGVERIFY"] = 173] = "OP_CHECKSIGVERIFY";
  OPS10[OPS10["OP_CHECKMULTISIG"] = 174] = "OP_CHECKMULTISIG";
  OPS10[OPS10["OP_CHECKMULTISIGVERIFY"] = 175] = "OP_CHECKMULTISIGVERIFY";
  OPS10[OPS10["OP_NOP1"] = 176] = "OP_NOP1";
  OPS10[OPS10["OP_CHECKLOCKTIMEVERIFY"] = 177] = "OP_CHECKLOCKTIMEVERIFY";
  OPS10[OPS10["OP_NOP2"] = 177] = "OP_NOP2";
  OPS10[OPS10["OP_CHECKSEQUENCEVERIFY"] = 178] = "OP_CHECKSEQUENCEVERIFY";
  OPS10[OPS10["OP_NOP3"] = 178] = "OP_NOP3";
  OPS10[OPS10["OP_NOP4"] = 179] = "OP_NOP4";
  OPS10[OPS10["OP_NOP5"] = 180] = "OP_NOP5";
  OPS10[OPS10["OP_NOP6"] = 181] = "OP_NOP6";
  OPS10[OPS10["OP_NOP7"] = 182] = "OP_NOP7";
  OPS10[OPS10["OP_NOP8"] = 183] = "OP_NOP8";
  OPS10[OPS10["OP_NOP9"] = 184] = "OP_NOP9";
  OPS10[OPS10["OP_NOP10"] = 185] = "OP_NOP10";
  OPS10[OPS10["OP_CHECKSIGADD"] = 186] = "OP_CHECKSIGADD";
  OPS10[OPS10["OP_PUBKEYHASH"] = 253] = "OP_PUBKEYHASH";
  OPS10[OPS10["OP_PUBKEY"] = 254] = "OP_PUBKEY";
  OPS10[OPS10["OP_INVALIDOPCODE"] = 255] = "OP_INVALIDOPCODE";
})(OPS || (OPS = {}));

// node_modules/uint8array-tools/src/mjs/browser.js
var HEX_STRINGS = "0123456789abcdefABCDEF";
var HEX_CODES = HEX_STRINGS.split("").map((c) => c.codePointAt(0));
var HEX_CODEPOINTS = Array(256).fill(true).map((_, i) => {
  const s = String.fromCodePoint(i);
  const index = HEX_STRINGS.indexOf(s);
  return index < 0 ? void 0 : index < 16 ? index : index - 6;
});
var ENCODER = new TextEncoder();
var DECODER = new TextDecoder();
function toUtf8(bytes) {
  return DECODER.decode(bytes);
}
function fromUtf8(s) {
  return ENCODER.encode(s);
}
function concat(arrays) {
  const totalLength = arrays.reduce((a, b) => a + b.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const array2 of arrays) {
    result.set(array2, offset);
    offset += array2.length;
  }
  return result;
}
function toHex(bytes) {
  const b = bytes || new Uint8Array();
  return b.length > 512 ? _toHexLengthPerf(b) : _toHexIterPerf(b);
}
function _toHexIterPerf(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; ++i) {
    s += HEX_STRINGS[HEX_CODEPOINTS[HEX_CODES[bytes[i] >> 4]]];
    s += HEX_STRINGS[HEX_CODEPOINTS[HEX_CODES[bytes[i] & 15]]];
  }
  return s;
}
function _toHexLengthPerf(bytes) {
  const hexBytes = new Uint8Array(bytes.length * 2);
  for (let i = 0; i < bytes.length; ++i) {
    hexBytes[i * 2] = HEX_CODES[bytes[i] >> 4];
    hexBytes[i * 2 + 1] = HEX_CODES[bytes[i] & 15];
  }
  return DECODER.decode(hexBytes);
}
function fromHex(hexString) {
  const hexBytes = ENCODER.encode(hexString || "");
  const resultBytes = new Uint8Array(Math.floor(hexBytes.length / 2));
  let i;
  for (i = 0; i < resultBytes.length; i++) {
    const a = HEX_CODEPOINTS[hexBytes[i * 2]];
    const b = HEX_CODEPOINTS[hexBytes[i * 2 + 1]];
    if (a === void 0 || b === void 0) {
      break;
    }
    resultBytes[i] = a << 4 | b;
  }
  return i === resultBytes.length ? resultBytes : resultBytes.slice(0, i);
}
function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}
function fromBase64(base64) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
function compare(v1, v2) {
  const minLength = Math.min(v1.length, v2.length);
  for (let i = 0; i < minLength; ++i) {
    if (v1[i] !== v2[i]) {
      return v1[i] < v2[i] ? -1 : 1;
    }
  }
  return v1.length === v2.length ? 0 : v1.length > v2.length ? 1 : -1;
}
function writeUInt8(buffer, offset, value2) {
  if (offset + 1 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  if (value2 > 255) {
    throw new Error(`The value of "value" is out of range. It must be >= 0 and <= ${255}. Received ${value2}`);
  }
  buffer[offset] = value2;
  return offset + 1;
}
function writeUInt16(buffer, offset, value2, littleEndian) {
  if (offset + 2 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (value2 > 65535) {
    throw new Error(`The value of "value" is out of range. It must be >= 0 and <= ${65535}. Received ${value2}`);
  }
  if (littleEndian === "LE") {
    buffer[offset] = value2 & 255;
    buffer[offset + 1] = value2 >> 8 & 255;
  } else {
    buffer[offset] = value2 >> 8 & 255;
    buffer[offset + 1] = value2 & 255;
  }
  return offset + 2;
}
function writeUInt32(buffer, offset, value2, littleEndian) {
  if (offset + 4 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (value2 > 4294967295) {
    throw new Error(`The value of "value" is out of range. It must be >= 0 and <= ${4294967295}. Received ${value2}`);
  }
  if (littleEndian === "LE") {
    buffer[offset] = value2 & 255;
    buffer[offset + 1] = value2 >> 8 & 255;
    buffer[offset + 2] = value2 >> 16 & 255;
    buffer[offset + 3] = value2 >> 24 & 255;
  } else {
    buffer[offset] = value2 >> 24 & 255;
    buffer[offset + 1] = value2 >> 16 & 255;
    buffer[offset + 2] = value2 >> 8 & 255;
    buffer[offset + 3] = value2 & 255;
  }
  return offset + 4;
}
function writeUInt64(buffer, offset, value2, littleEndian) {
  if (offset + 8 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (value2 > 0xffffffffffffffffn) {
    throw new Error(`The value of "value" is out of range. It must be >= 0 and <= ${0xffffffffffffffffn}. Received ${value2}`);
  }
  if (littleEndian === "LE") {
    buffer[offset] = Number(value2 & 0xffn);
    buffer[offset + 1] = Number(value2 >> 8n & 0xffn);
    buffer[offset + 2] = Number(value2 >> 16n & 0xffn);
    buffer[offset + 3] = Number(value2 >> 24n & 0xffn);
    buffer[offset + 4] = Number(value2 >> 32n & 0xffn);
    buffer[offset + 5] = Number(value2 >> 40n & 0xffn);
    buffer[offset + 6] = Number(value2 >> 48n & 0xffn);
    buffer[offset + 7] = Number(value2 >> 56n & 0xffn);
  } else {
    buffer[offset] = Number(value2 >> 56n & 0xffn);
    buffer[offset + 1] = Number(value2 >> 48n & 0xffn);
    buffer[offset + 2] = Number(value2 >> 40n & 0xffn);
    buffer[offset + 3] = Number(value2 >> 32n & 0xffn);
    buffer[offset + 4] = Number(value2 >> 24n & 0xffn);
    buffer[offset + 5] = Number(value2 >> 16n & 0xffn);
    buffer[offset + 6] = Number(value2 >> 8n & 0xffn);
    buffer[offset + 7] = Number(value2 & 0xffn);
  }
  return offset + 8;
}
function readUInt8(buffer, offset) {
  if (offset + 1 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  return buffer[offset];
}
function readUInt16(buffer, offset, littleEndian) {
  if (offset + 2 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (littleEndian === "LE") {
    let num = 0;
    num = (num << 8) + buffer[offset + 1];
    num = (num << 8) + buffer[offset];
    return num;
  } else {
    let num = 0;
    num = (num << 8) + buffer[offset];
    num = (num << 8) + buffer[offset + 1];
    return num;
  }
}
function readUInt32(buffer, offset, littleEndian) {
  if (offset + 4 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (littleEndian === "LE") {
    let num = 0;
    num = (num << 8) + buffer[offset + 3] >>> 0;
    num = (num << 8) + buffer[offset + 2] >>> 0;
    num = (num << 8) + buffer[offset + 1] >>> 0;
    num = (num << 8) + buffer[offset] >>> 0;
    return num;
  } else {
    let num = 0;
    num = (num << 8) + buffer[offset] >>> 0;
    num = (num << 8) + buffer[offset + 1] >>> 0;
    num = (num << 8) + buffer[offset + 2] >>> 0;
    num = (num << 8) + buffer[offset + 3] >>> 0;
    return num;
  }
}
function writeInt32(buffer, offset, value2, littleEndian) {
  if (offset + 4 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  if (value2 > 2147483647 || value2 < -2147483648) {
    throw new Error(`The value of "value" is out of range. It must be >= ${-2147483648} and <= ${2147483647}. Received ${value2}`);
  }
  littleEndian = littleEndian.toUpperCase();
  if (littleEndian === "LE") {
    buffer[offset] = value2 & 255;
    buffer[offset + 1] = value2 >> 8 & 255;
    buffer[offset + 2] = value2 >> 16 & 255;
    buffer[offset + 3] = value2 >> 24 & 255;
  } else {
    buffer[offset] = value2 >> 24 & 255;
    buffer[offset + 1] = value2 >> 16 & 255;
    buffer[offset + 2] = value2 >> 8 & 255;
    buffer[offset + 3] = value2 & 255;
  }
  return offset + 4;
}
function writeInt64(buffer, offset, value2, littleEndian) {
  if (offset + 8 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  if (value2 > 0x7fffffffffffffffn || value2 < -0x8000000000000000n) {
    throw new Error(`The value of "value" is out of range. It must be >= ${-0x8000000000000000n} and <= ${0x7fffffffffffffffn}. Received ${value2}`);
  }
  littleEndian = littleEndian.toUpperCase();
  if (littleEndian === "LE") {
    buffer[offset] = Number(value2 & 0xffn);
    buffer[offset + 1] = Number(value2 >> 8n & 0xffn);
    buffer[offset + 2] = Number(value2 >> 16n & 0xffn);
    buffer[offset + 3] = Number(value2 >> 24n & 0xffn);
    buffer[offset + 4] = Number(value2 >> 32n & 0xffn);
    buffer[offset + 5] = Number(value2 >> 40n & 0xffn);
    buffer[offset + 6] = Number(value2 >> 48n & 0xffn);
    buffer[offset + 7] = Number(value2 >> 56n & 0xffn);
  } else {
    buffer[offset] = Number(value2 >> 56n & 0xffn);
    buffer[offset + 1] = Number(value2 >> 48n & 0xffn);
    buffer[offset + 2] = Number(value2 >> 40n & 0xffn);
    buffer[offset + 3] = Number(value2 >> 32n & 0xffn);
    buffer[offset + 4] = Number(value2 >> 24n & 0xffn);
    buffer[offset + 5] = Number(value2 >> 16n & 0xffn);
    buffer[offset + 6] = Number(value2 >> 8n & 0xffn);
    buffer[offset + 7] = Number(value2 & 0xffn);
  }
  return offset + 8;
}
function readInt32(buffer, offset, littleEndian) {
  if (offset + 4 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (littleEndian === "LE") {
    const val = buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16) + (buffer[offset + 3] << 24 >>> 0);
    return buffer[offset + 3] <= 127 ? val : val - 4294967296;
  } else {
    const val = (buffer[offset] << 24 >>> 0) + (buffer[offset + 1] << 16) + (buffer[offset + 2] << 8) + buffer[offset + 3];
    return buffer[offset] <= 127 ? val : val - 4294967296;
  }
}
function readInt64(buffer, offset, littleEndian) {
  if (offset + 8 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  let num = 0n;
  if (littleEndian === "LE") {
    num = (num << 8n) + BigInt(buffer[offset + 7]);
    num = (num << 8n) + BigInt(buffer[offset + 6]);
    num = (num << 8n) + BigInt(buffer[offset + 5]);
    num = (num << 8n) + BigInt(buffer[offset + 4]);
    num = (num << 8n) + BigInt(buffer[offset + 3]);
    num = (num << 8n) + BigInt(buffer[offset + 2]);
    num = (num << 8n) + BigInt(buffer[offset + 1]);
    num = (num << 8n) + BigInt(buffer[offset]);
    return buffer[offset + 7] <= 127 ? num : num - 0x10000000000000000n;
  } else {
    let num2 = 0n;
    num2 = (num2 << 8n) + BigInt(buffer[offset]);
    num2 = (num2 << 8n) + BigInt(buffer[offset + 1]);
    num2 = (num2 << 8n) + BigInt(buffer[offset + 2]);
    num2 = (num2 << 8n) + BigInt(buffer[offset + 3]);
    num2 = (num2 << 8n) + BigInt(buffer[offset + 4]);
    num2 = (num2 << 8n) + BigInt(buffer[offset + 5]);
    num2 = (num2 << 8n) + BigInt(buffer[offset + 6]);
    num2 = (num2 << 8n) + BigInt(buffer[offset + 7]);
    return buffer[offset] <= 127 ? num2 : num2 - 0x10000000000000000n;
  }
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/push_data.js
function encodingLength(i) {
  return i < OPS.OP_PUSHDATA1 ? 1 : i <= 255 ? 2 : i <= 65535 ? 3 : 5;
}
function encode2(buffer, num, offset) {
  const size = encodingLength(num);
  if (size === 1) {
    writeUInt8(buffer, offset, num);
  } else if (size === 2) {
    writeUInt8(buffer, offset, OPS.OP_PUSHDATA1);
    writeUInt8(buffer, offset + 1, num);
  } else if (size === 3) {
    writeUInt8(buffer, offset, OPS.OP_PUSHDATA2);
    writeUInt16(buffer, offset + 1, num, "LE");
  } else {
    writeUInt8(buffer, offset, OPS.OP_PUSHDATA4);
    writeUInt32(buffer, offset + 1, num, "LE");
  }
  return size;
}
function decode2(buffer, offset) {
  const opcode = readUInt8(buffer, offset);
  let num;
  let size;
  if (opcode < OPS.OP_PUSHDATA1) {
    num = opcode;
    size = 1;
  } else if (opcode === OPS.OP_PUSHDATA1) {
    if (offset + 2 > buffer.length) return null;
    num = readUInt8(buffer, offset + 1);
    size = 2;
  } else if (opcode === OPS.OP_PUSHDATA2) {
    if (offset + 3 > buffer.length) return null;
    num = readUInt16(buffer, offset + 1, "LE");
    size = 3;
  } else {
    if (offset + 5 > buffer.length) return null;
    if (opcode !== OPS.OP_PUSHDATA4) throw new Error("Unexpected opcode");
    num = readUInt32(buffer, offset + 1, "LE");
    size = 5;
  }
  return {
    opcode,
    number: num,
    size
  };
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/script_number.js
function decode3(buffer, maxLength, minimal) {
  maxLength = maxLength || 4;
  minimal = minimal === void 0 ? true : minimal;
  const length2 = buffer.length;
  if (length2 === 0) return 0;
  if (length2 > maxLength) throw new TypeError("Script number overflow");
  if (minimal) {
    if ((buffer[length2 - 1] & 127) === 0) {
      if (length2 <= 1 || (buffer[length2 - 2] & 128) === 0)
        throw new Error("Non-minimally encoded script number");
    }
  }
  if (length2 === 5) {
    const a = readUInt32(buffer, 0, "LE");
    const b = readUInt8(buffer, 4);
    if (b & 128) return -((b & ~128) * 4294967296 + a);
    return b * 4294967296 + a;
  }
  let result = 0;
  for (let i = 0; i < length2; ++i) {
    result |= buffer[i] << 8 * i;
  }
  if (buffer[length2 - 1] & 128)
    return -(result & ~(128 << 8 * (length2 - 1)));
  return result;
}
function scriptNumSize(i) {
  return i > 2147483647 ? 5 : i > 8388607 ? 4 : i > 32767 ? 3 : i > 127 ? 2 : i > 0 ? 1 : 0;
}
function encode3(_number) {
  let value2 = Math.abs(_number);
  const size = scriptNumSize(value2);
  const buffer = new Uint8Array(size);
  const negative = _number < 0;
  for (let i = 0; i < size; ++i) {
    writeUInt8(buffer, i, value2 & 255);
    value2 >>= 8;
  }
  if (buffer[size - 1] & 128) {
    writeUInt8(buffer, size - 1, negative ? 128 : 0);
  } else if (negative) {
    buffer[size - 1] |= 128;
  }
  return buffer;
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/script_signature.js
var script_signature_exports = {};
__export(script_signature_exports, {
  decode: () => decode4,
  encode: () => encode4
});

// node_modules/valibot/dist/index.mjs
var store$4;
// @__NO_SIDE_EFFECTS__
function getGlobalConfig(config$1) {
  return {
    lang: config$1?.lang ?? store$4?.lang,
    message: config$1?.message,
    abortEarly: config$1?.abortEarly ?? store$4?.abortEarly,
    abortPipeEarly: config$1?.abortPipeEarly ?? store$4?.abortPipeEarly
  };
}
var store$3;
// @__NO_SIDE_EFFECTS__
function getGlobalMessage(lang) {
  return store$3?.get(lang);
}
var store$2;
// @__NO_SIDE_EFFECTS__
function getSchemaMessage(lang) {
  return store$2?.get(lang);
}
var store$1;
// @__NO_SIDE_EFFECTS__
function getSpecificMessage(reference, lang) {
  return store$1?.get(reference)?.get(lang);
}
// @__NO_SIDE_EFFECTS__
function _stringify(input) {
  const type = typeof input;
  if (type === "string") return `"${input}"`;
  if (type === "number" || type === "bigint" || type === "boolean") return `${input}`;
  if (type === "object" || type === "function") return (input && Object.getPrototypeOf(input)?.constructor?.name) ?? "null";
  return type;
}
function _addIssue(context, label, dataset, config$1, other) {
  const input = other && "input" in other ? other.input : dataset.value;
  const expected14 = other?.expected ?? context.expects ?? null;
  const received = other?.received ?? /* @__PURE__ */ _stringify(input);
  const issue = {
    kind: context.kind,
    type: context.type,
    input,
    expected: expected14,
    received,
    message: `Invalid ${label}: ${expected14 ? `Expected ${expected14} but r` : "R"}eceived ${received}`,
    requirement: context.requirement,
    path: other?.path,
    issues: other?.issues,
    lang: config$1.lang,
    abortEarly: config$1.abortEarly,
    abortPipeEarly: config$1.abortPipeEarly
  };
  const isSchema = context.kind === "schema";
  const message$1 = other?.message ?? context.message ?? /* @__PURE__ */ getSpecificMessage(context.reference, issue.lang) ?? (isSchema ? /* @__PURE__ */ getSchemaMessage(issue.lang) : null) ?? config$1.message ?? /* @__PURE__ */ getGlobalMessage(issue.lang);
  if (message$1 !== void 0) issue.message = typeof message$1 === "function" ? message$1(issue) : message$1;
  if (isSchema) dataset.typed = false;
  if (dataset.issues) dataset.issues.push(issue);
  else dataset.issues = [issue];
}
// @__NO_SIDE_EFFECTS__
function _getStandardProps(context) {
  return {
    version: 1,
    vendor: "valibot",
    validate(value$1) {
      return context["~run"]({ value: value$1 }, /* @__PURE__ */ getGlobalConfig());
    }
  };
}
// @__NO_SIDE_EFFECTS__
function _joinExpects(values$1, separator) {
  const list = [...new Set(values$1)];
  if (list.length > 1) return `(${list.join(` ${separator} `)})`;
  return list[0] ?? "never";
}
var ValiError = class extends Error {
  /**
  * Creates a Valibot error with useful information.
  *
  * @param issues The error issues.
  */
  constructor(issues) {
    super(issues[0].message);
    this.name = "ValiError";
    this.issues = issues;
  }
};
// @__NO_SIDE_EFFECTS__
function everyItem(requirement, message$1) {
  return {
    kind: "validation",
    type: "every_item",
    reference: everyItem,
    async: false,
    expects: null,
    requirement,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !dataset.value.every(this.requirement)) _addIssue(this, "item", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function integer(message$1) {
  return {
    kind: "validation",
    type: "integer",
    reference: integer,
    async: false,
    expects: null,
    requirement: Number.isInteger,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement(dataset.value)) _addIssue(this, "integer", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function length(requirement, message$1) {
  return {
    kind: "validation",
    type: "length",
    reference: length,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && dataset.value.length !== this.requirement) _addIssue(this, "length", dataset, config$1, { received: `${dataset.value.length}` });
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function maxValue(requirement, message$1) {
  return {
    kind: "validation",
    type: "max_value",
    reference: maxValue,
    async: false,
    expects: `<=${requirement instanceof Date ? requirement.toJSON() : /* @__PURE__ */ _stringify(requirement)}`,
    requirement,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !(dataset.value <= this.requirement)) _addIssue(this, "value", dataset, config$1, { received: dataset.value instanceof Date ? dataset.value.toJSON() : /* @__PURE__ */ _stringify(dataset.value) });
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function minValue(requirement, message$1) {
  return {
    kind: "validation",
    type: "min_value",
    reference: minValue,
    async: false,
    expects: `>=${requirement instanceof Date ? requirement.toJSON() : /* @__PURE__ */ _stringify(requirement)}`,
    requirement,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !(dataset.value >= this.requirement)) _addIssue(this, "value", dataset, config$1, { received: dataset.value instanceof Date ? dataset.value.toJSON() : /* @__PURE__ */ _stringify(dataset.value) });
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function regex(requirement, message$1) {
  return {
    kind: "validation",
    type: "regex",
    reference: regex,
    async: false,
    expects: `${requirement}`,
    requirement,
    message: message$1,
    "~run"(dataset, config$1) {
      if (dataset.typed && !this.requirement.test(dataset.value)) _addIssue(this, "format", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function getFallback(schema, dataset, config$1) {
  return typeof schema.fallback === "function" ? schema.fallback(dataset, config$1) : schema.fallback;
}
// @__NO_SIDE_EFFECTS__
function getDefault(schema, dataset, config$1) {
  return typeof schema.default === "function" ? schema.default(dataset, config$1) : schema.default;
}
// @__NO_SIDE_EFFECTS__
function is(schema, input) {
  return !schema["~run"]({ value: input }, { abortEarly: true }).issues;
}
// @__NO_SIDE_EFFECTS__
function any() {
  return {
    kind: "schema",
    type: "any",
    reference: any,
    expects: "any",
    async: false,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset) {
      dataset.typed = true;
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function array(item, message$1) {
  return {
    kind: "schema",
    type: "array",
    reference: array,
    expects: "Array",
    async: false,
    item,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < input.length; key++) {
          const value$1 = input[key];
          const itemDataset = this.item["~run"]({ value: value$1 }, config$1);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value$1
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) issue.path.unshift(pathItem);
              else issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = itemDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) dataset.typed = false;
          dataset.value.push(itemDataset.value);
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function bigint(message$1) {
  return {
    kind: "schema",
    type: "bigint",
    reference: bigint,
    expects: "bigint",
    async: false,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "bigint") dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function custom(check$1, message$1) {
  return {
    kind: "schema",
    type: "custom",
    reference: custom,
    expects: "unknown",
    async: false,
    check: check$1,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (this.check(dataset.value)) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function instance(class_, message$1) {
  return {
    kind: "schema",
    type: "instance",
    reference: instance,
    expects: class_.name,
    async: false,
    class: class_,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (dataset.value instanceof this.class) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function nullable(wrapped, default_) {
  return {
    kind: "schema",
    type: "nullable",
    reference: nullable,
    expects: `(${wrapped.expects} | null)`,
    async: false,
    wrapped,
    default: default_,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (dataset.value === null) {
        if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === null) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function nullish(wrapped, default_) {
  return {
    kind: "schema",
    type: "nullish",
    reference: nullish,
    expects: `(${wrapped.expects} | null | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (dataset.value === null || dataset.value === void 0) {
        if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === null || dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function number(message$1) {
  return {
    kind: "schema",
    type: "number",
    reference: number,
    expects: "number",
    async: false,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "number" && !isNaN(dataset.value)) dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function object(entries$1, message$1) {
  return {
    kind: "schema",
    type: "object",
    reference: object,
    expects: "Object",
    async: false,
    entries: entries$1,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (input && typeof input === "object") {
        dataset.typed = true;
        dataset.value = {};
        for (const key in this.entries) {
          const valueSchema = this.entries[key];
          if (key in input || (valueSchema.type === "exact_optional" || valueSchema.type === "optional" || valueSchema.type === "nullish") && valueSchema.default !== void 0) {
            const value$1 = key in input ? input[key] : /* @__PURE__ */ getDefault(valueSchema);
            const valueDataset = valueSchema["~run"]({ value: value$1 }, config$1);
            if (valueDataset.issues) {
              const pathItem = {
                type: "object",
                origin: "value",
                input,
                key,
                value: value$1
              };
              for (const issue of valueDataset.issues) {
                if (issue.path) issue.path.unshift(pathItem);
                else issue.path = [pathItem];
                dataset.issues?.push(issue);
              }
              if (!dataset.issues) dataset.issues = valueDataset.issues;
              if (config$1.abortEarly) {
                dataset.typed = false;
                break;
              }
            }
            if (!valueDataset.typed) dataset.typed = false;
            dataset.value[key] = valueDataset.value;
          } else if (valueSchema.fallback !== void 0) dataset.value[key] = /* @__PURE__ */ getFallback(valueSchema);
          else if (valueSchema.type !== "exact_optional" && valueSchema.type !== "optional" && valueSchema.type !== "nullish") {
            _addIssue(this, "key", dataset, config$1, {
              input: void 0,
              expected: `"${key}"`,
              path: [{
                type: "object",
                origin: "key",
                input,
                key,
                value: input[key]
              }]
            });
            if (config$1.abortEarly) break;
          }
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function optional(wrapped, default_) {
  return {
    kind: "schema",
    type: "optional",
    reference: optional,
    expects: `(${wrapped.expects} | undefined)`,
    async: false,
    wrapped,
    default: default_,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (dataset.value === void 0) {
        if (this.default !== void 0) dataset.value = /* @__PURE__ */ getDefault(this, dataset, config$1);
        if (dataset.value === void 0) {
          dataset.typed = true;
          return dataset;
        }
      }
      return this.wrapped["~run"](dataset, config$1);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function string(message$1) {
  return {
    kind: "schema",
    type: "string",
    reference: string,
    expects: "string",
    async: false,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      if (typeof dataset.value === "string") dataset.typed = true;
      else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function tuple(items, message$1) {
  return {
    kind: "schema",
    type: "tuple",
    reference: tuple,
    expects: "Array",
    async: false,
    items,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      const input = dataset.value;
      if (Array.isArray(input)) {
        dataset.typed = true;
        dataset.value = [];
        for (let key = 0; key < this.items.length; key++) {
          const value$1 = input[key];
          const itemDataset = this.items[key]["~run"]({ value: value$1 }, config$1);
          if (itemDataset.issues) {
            const pathItem = {
              type: "array",
              origin: "value",
              input,
              key,
              value: value$1
            };
            for (const issue of itemDataset.issues) {
              if (issue.path) issue.path.unshift(pathItem);
              else issue.path = [pathItem];
              dataset.issues?.push(issue);
            }
            if (!dataset.issues) dataset.issues = itemDataset.issues;
            if (config$1.abortEarly) {
              dataset.typed = false;
              break;
            }
          }
          if (!itemDataset.typed) dataset.typed = false;
          dataset.value.push(itemDataset.value);
        }
      } else _addIssue(this, "type", dataset, config$1);
      return dataset;
    }
  };
}
// @__NO_SIDE_EFFECTS__
function _subIssues(datasets) {
  let issues;
  if (datasets) for (const dataset of datasets) if (issues) issues.push(...dataset.issues);
  else issues = dataset.issues;
  return issues;
}
// @__NO_SIDE_EFFECTS__
function union(options, message$1) {
  return {
    kind: "schema",
    type: "union",
    reference: union,
    expects: /* @__PURE__ */ _joinExpects(options.map((option) => option.expects), "|"),
    async: false,
    options,
    message: message$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      let validDataset;
      let typedDatasets;
      let untypedDatasets;
      for (const schema of this.options) {
        const optionDataset = schema["~run"]({ value: dataset.value }, config$1);
        if (optionDataset.typed) if (optionDataset.issues) if (typedDatasets) typedDatasets.push(optionDataset);
        else typedDatasets = [optionDataset];
        else {
          validDataset = optionDataset;
          break;
        }
        else if (untypedDatasets) untypedDatasets.push(optionDataset);
        else untypedDatasets = [optionDataset];
      }
      if (validDataset) return validDataset;
      if (typedDatasets) {
        if (typedDatasets.length === 1) return typedDatasets[0];
        _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(typedDatasets) });
        dataset.typed = true;
      } else if (untypedDatasets?.length === 1) return untypedDatasets[0];
      else _addIssue(this, "type", dataset, config$1, { issues: /* @__PURE__ */ _subIssues(untypedDatasets) });
      return dataset;
    }
  };
}
function parse(schema, input, config$1) {
  const dataset = schema["~run"]({ value: input }, /* @__PURE__ */ getGlobalConfig(config$1));
  if (dataset.issues) throw new ValiError(dataset.issues);
  return dataset.value;
}
// @__NO_SIDE_EFFECTS__
function partial(schema, keys) {
  const entries$1 = {};
  for (const key in schema.entries) entries$1[key] = !keys || keys.includes(key) ? /* @__PURE__ */ optional(schema.entries[key]) : schema.entries[key];
  return {
    ...schema,
    entries: entries$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    }
  };
}
// @__NO_SIDE_EFFECTS__
function pipe(...pipe$1) {
  return {
    ...pipe$1[0],
    pipe: pipe$1,
    get "~standard"() {
      return /* @__PURE__ */ _getStandardProps(this);
    },
    "~run"(dataset, config$1) {
      for (const item of pipe$1) if (item.kind !== "metadata") {
        if (dataset.issues && (item.kind === "schema" || item.kind === "transformation")) {
          dataset.typed = false;
          break;
        }
        if (!dataset.issues || !config$1.abortEarly && !config$1.abortPipeEarly) dataset = item["~run"](dataset, config$1);
      }
      return dataset;
    }
  };
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/types.js
var ZERO32 = new Uint8Array(32);
var EC_P = fromHex(
  "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f"
);
var NBufferSchemaFactory = (size) => pipe(instance(Uint8Array), length(size));
function stacksEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((x, i) => {
    return compare(x, b[i]) === 0;
  });
}
function isPoint(p) {
  if (!(p instanceof Uint8Array)) return false;
  if (p.length < 33) return false;
  const t = p[0];
  const x = p.slice(1, 33);
  if (compare(ZERO32, x) === 0) return false;
  if (compare(x, EC_P) >= 0) return false;
  if ((t === 2 || t === 3) && p.length === 33) {
    return true;
  }
  const y = p.slice(33);
  if (compare(ZERO32, y) === 0) return false;
  if (compare(y, EC_P) >= 0) return false;
  if (t === 4 && p.length === 65) return true;
  return false;
}
var TAPLEAF_VERSION_MASK = 254;
function isTapleaf(o) {
  if (!o || !("output" in o)) return false;
  if (!(o.output instanceof Uint8Array)) return false;
  if (o.version !== void 0)
    return (o.version & TAPLEAF_VERSION_MASK) === o.version;
  return true;
}
function isTaptree(scriptTree) {
  if (!Array.isArray(scriptTree)) return isTapleaf(scriptTree);
  if (scriptTree.length !== 2) return false;
  return scriptTree.every((t) => isTaptree(t));
}
var Buffer256bitSchema = NBufferSchemaFactory(32);
var Hash160bitSchema = NBufferSchemaFactory(20);
var Hash256bitSchema = NBufferSchemaFactory(32);
var BufferSchema = instance(Uint8Array);
var HexSchema = pipe(string(), regex(/^([0-9a-f]{2})+$/i));
var UInt8Schema = pipe(
  number(),
  integer(),
  minValue(0),
  maxValue(255)
);
var UInt32Schema = pipe(
  number(),
  integer(),
  minValue(0),
  maxValue(4294967295)
);
var SatoshiSchema = pipe(
  bigint(),
  minValue(0n),
  maxValue(0x7fffffffffffffffn)
);
var NullablePartial = (a) => object(
  Object.entries(a).reduce(
    (acc, next) => ({ ...acc, [next[0]]: nullish(next[1]) }),
    {}
  )
);

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/script_signature.js
var ZERO = new Uint8Array(1);
function toDER(x) {
  let i = 0;
  while (x[i] === 0) ++i;
  if (i === x.length) return ZERO;
  x = x.slice(i);
  if (x[0] & 128) return concat([ZERO, x]);
  return x;
}
function fromDER(x) {
  if (x[0] === 0) x = x.slice(1);
  const buffer = new Uint8Array(32);
  const bstart = Math.max(0, 32 - x.length);
  buffer.set(x, bstart);
  return buffer;
}
function decode4(buffer) {
  const hashType = readUInt8(buffer, buffer.length - 1);
  if (!isDefinedHashType(hashType)) {
    throw new Error("Invalid hashType " + hashType);
  }
  const decoded = decode(buffer.subarray(0, -1));
  const r = fromDER(decoded.r);
  const s = fromDER(decoded.s);
  const signature2 = concat([r, s]);
  return { signature: signature2, hashType };
}
function encode4(signature2, hashType) {
  parse(
    object({
      signature: NBufferSchemaFactory(64),
      hashType: UInt8Schema
    }),
    { signature: signature2, hashType }
  );
  if (!isDefinedHashType(hashType)) {
    throw new Error("Invalid hashType " + hashType);
  }
  const hashTypeBuffer = new Uint8Array(1);
  writeUInt8(hashTypeBuffer, 0, hashType);
  const r = toDER(signature2.slice(0, 32));
  const s = toDER(signature2.slice(32, 64));
  return concat([encode(r, s), hashTypeBuffer]);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/script.js
var OP_INT_BASE = OPS.OP_RESERVED;
var StackSchema = array(union([instance(Uint8Array), number()]));
function isOPInt(value2) {
  return is(number(), value2) && (value2 === OPS.OP_0 || value2 >= OPS.OP_1 && value2 <= OPS.OP_16 || value2 === OPS.OP_1NEGATE);
}
function isPushOnlyChunk(value2) {
  return is(BufferSchema, value2) || isOPInt(value2);
}
function isPushOnly(value2) {
  return is(pipe(any(), everyItem(isPushOnlyChunk)), value2);
}
function countNonPushOnlyOPs(value2) {
  return value2.length - value2.filter(isPushOnlyChunk).length;
}
function asMinimalOP(buffer) {
  if (buffer.length === 0) return OPS.OP_0;
  if (buffer.length !== 1) return;
  if (buffer[0] >= 1 && buffer[0] <= 16) return OP_INT_BASE + buffer[0];
  if (buffer[0] === 129) return OPS.OP_1NEGATE;
}
function chunksIsBuffer(buf) {
  return buf instanceof Uint8Array;
}
function chunksIsArray(buf) {
  return is(StackSchema, buf);
}
function singleChunkIsBuffer(buf) {
  return buf instanceof Uint8Array;
}
function compile(chunks) {
  if (chunksIsBuffer(chunks)) return chunks;
  parse(StackSchema, chunks);
  const bufferSize = chunks.reduce((accum, chunk) => {
    if (singleChunkIsBuffer(chunk)) {
      if (chunk.length === 1 && asMinimalOP(chunk) !== void 0) {
        return accum + 1;
      }
      return accum + encodingLength(chunk.length) + chunk.length;
    }
    return accum + 1;
  }, 0);
  const buffer = new Uint8Array(bufferSize);
  let offset = 0;
  chunks.forEach((chunk) => {
    if (singleChunkIsBuffer(chunk)) {
      const opcode = asMinimalOP(chunk);
      if (opcode !== void 0) {
        writeUInt8(buffer, offset, opcode);
        offset += 1;
        return;
      }
      offset += encode2(buffer, chunk.length, offset);
      buffer.set(chunk, offset);
      offset += chunk.length;
    } else {
      writeUInt8(buffer, offset, chunk);
      offset += 1;
    }
  });
  if (offset !== buffer.length) throw new Error("Could not decode chunks");
  return buffer;
}
function decompile(buffer) {
  if (chunksIsArray(buffer)) return buffer;
  parse(BufferSchema, buffer);
  const chunks = [];
  let i = 0;
  while (i < buffer.length) {
    const opcode = buffer[i];
    if (opcode > OPS.OP_0 && opcode <= OPS.OP_PUSHDATA4) {
      const d = decode2(buffer, i);
      if (d === null) return null;
      i += d.size;
      if (i + d.number > buffer.length) return null;
      const data = buffer.slice(i, i + d.number);
      i += d.number;
      const op = asMinimalOP(data);
      if (op !== void 0) {
        chunks.push(op);
      } else {
        chunks.push(data);
      }
    } else {
      chunks.push(opcode);
      i += 1;
    }
  }
  return chunks;
}
function toASM(chunks) {
  if (chunksIsBuffer(chunks)) {
    chunks = decompile(chunks);
  }
  if (!chunks) {
    throw new Error("Could not convert invalid chunks to ASM");
  }
  return chunks.map((chunk) => {
    if (singleChunkIsBuffer(chunk)) {
      const op = asMinimalOP(chunk);
      if (op === void 0) return toHex(chunk);
      chunk = op;
    }
    return OPS[chunk];
  }).join(" ");
}
function toStack(chunks) {
  chunks = decompile(chunks);
  parse(custom(isPushOnly), chunks);
  return chunks.map((op) => {
    if (singleChunkIsBuffer(op)) return op;
    if (op === OPS.OP_0) return new Uint8Array(0);
    return encode3(op - OP_INT_BASE);
  });
}
function isCanonicalPubKey(buffer) {
  return isPoint(buffer);
}
function isDefinedHashType(hashType) {
  const hashTypeMod = hashType & ~128;
  return hashTypeMod > 0 && hashTypeMod < 4;
}
function isCanonicalScriptSignature(buffer) {
  if (!(buffer instanceof Uint8Array)) return false;
  if (!isDefinedHashType(buffer[buffer.length - 1])) return false;
  return check(buffer.slice(0, -1));
}
var signature = script_signature_exports;

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/lazy.js
function prop(object2, name, f) {
  Object.defineProperty(object2, name, {
    configurable: true,
    enumerable: true,
    get() {
      const _value = f.call(this);
      this[name] = _value;
      return _value;
    },
    set(_value) {
      Object.defineProperty(this, name, {
        configurable: true,
        enumerable: true,
        value: _value,
        writable: true
      });
    }
  });
}
function value(f) {
  let _value;
  return () => {
    if (_value !== void 0) return _value;
    _value = f();
    return _value;
  };
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/embed.js
var OPS2 = OPS;
function p2data(a, opts) {
  if (!a.data && !a.output) throw new TypeError("Not enough data");
  opts = Object.assign({ validate: true }, opts || {});
  parse(
    partial(
      object({
        network: object({}),
        output: BufferSchema,
        data: array(BufferSchema)
      })
    ),
    a
  );
  const network = a.network || bitcoin;
  const o = { name: "embed", network };
  prop(o, "output", () => {
    if (!a.data) return;
    return compile([OPS2.OP_RETURN].concat(a.data));
  });
  prop(o, "data", () => {
    if (!a.output) return;
    return decompile(a.output).slice(1);
  });
  if (opts.validate) {
    if (a.output) {
      const chunks = decompile(a.output);
      if (chunks[0] !== OPS2.OP_RETURN) throw new TypeError("Output is invalid");
      if (!chunks.slice(1).every((chunk) => is(BufferSchema, chunk)))
        throw new TypeError("Output is invalid");
      if (a.data && !stacksEqual(a.data, o.data))
        throw new TypeError("Data mismatch");
    }
  }
  return Object.assign(o, a);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/p2ms.js
var OPS3 = OPS;
var OP_INT_BASE2 = OPS3.OP_RESERVED;
function encodeSmallOrScriptNum(n) {
  return n <= 16 ? OP_INT_BASE2 + n : encode3(n);
}
function decodeSmallOrScriptNum(chunk) {
  if (typeof chunk === "number") {
    const val = chunk - OP_INT_BASE2;
    if (val < 1 || val > 16)
      throw new TypeError(`Invalid opcode: expected OP_1\u2013OP_16, got ${chunk}`);
    return val;
  } else return decode3(chunk);
}
function isSmallOrScriptNum(chunk) {
  if (typeof chunk === "number")
    return chunk - OP_INT_BASE2 >= 1 && chunk - OP_INT_BASE2 <= 16;
  else return Number.isInteger(decode3(chunk));
}
function p2ms(a, opts) {
  if (!a.input && !a.output && !(a.pubkeys && a.m !== void 0) && !a.signatures)
    throw new TypeError("Not enough data");
  opts = Object.assign({ validate: true }, opts || {});
  function isAcceptableSignature(x) {
    return isCanonicalScriptSignature(x) || (opts.allowIncomplete && x === OPS3.OP_0) !== void 0;
  }
  parse(
    partial(
      object({
        network: object({}),
        m: number(),
        n: number(),
        output: BufferSchema,
        pubkeys: array(custom(isPoint), "Received invalid pubkey"),
        signatures: array(
          custom(isAcceptableSignature),
          "Expected signature to be of type isAcceptableSignature"
        ),
        input: BufferSchema
      })
    ),
    a
  );
  const network = a.network || bitcoin;
  const o = { network };
  let chunks = [];
  let decoded = false;
  function decode19(output) {
    if (decoded) return;
    decoded = true;
    chunks = decompile(output);
    if (chunks.length < 3) throw new TypeError("Output is invalid");
    o.m = decodeSmallOrScriptNum(chunks[0]);
    o.n = decodeSmallOrScriptNum(chunks[chunks.length - 2]);
    o.pubkeys = chunks.slice(1, -2);
  }
  prop(o, "output", () => {
    if (!a.m) return;
    if (!o.n) return;
    if (!a.pubkeys) return;
    return compile(
      [].concat(
        encodeSmallOrScriptNum(a.m),
        a.pubkeys,
        encodeSmallOrScriptNum(o.n),
        OPS3.OP_CHECKMULTISIG
      )
    );
  });
  prop(o, "m", () => {
    if (!o.output) return;
    decode19(o.output);
    return o.m;
  });
  prop(o, "n", () => {
    if (!o.pubkeys) return;
    return o.pubkeys.length;
  });
  prop(o, "pubkeys", () => {
    if (!a.output) return;
    decode19(a.output);
    return o.pubkeys;
  });
  prop(o, "signatures", () => {
    if (!a.input) return;
    return decompile(a.input).slice(1);
  });
  prop(o, "input", () => {
    if (!a.signatures) return;
    return compile([OPS3.OP_0].concat(a.signatures));
  });
  prop(o, "witness", () => {
    if (!o.input) return;
    return [];
  });
  prop(o, "name", () => {
    if (!o.m || !o.n) return;
    return `p2ms(${o.m} of ${o.n})`;
  });
  if (opts.validate) {
    if (a.output) {
      decode19(a.output);
      if (!isSmallOrScriptNum(chunks[0]))
        throw new TypeError("Output is invalid");
      if (!isSmallOrScriptNum(chunks[chunks.length - 2]))
        throw new TypeError("Output is invalid");
      if (chunks[chunks.length - 1] !== OPS3.OP_CHECKMULTISIG)
        throw new TypeError("Output is invalid");
      if (o.m <= 0 || o.n > 20 || o.m > o.n || o.n !== chunks.length - 3)
        throw new TypeError("Output is invalid");
      if (!o.pubkeys.every((x) => isPoint(x)))
        throw new TypeError("Output is invalid");
      if (a.m !== void 0 && a.m !== o.m) throw new TypeError("m mismatch");
      if (a.n !== void 0 && a.n !== o.n) throw new TypeError("n mismatch");
      if (a.pubkeys && !stacksEqual(a.pubkeys, o.pubkeys))
        throw new TypeError("Pubkeys mismatch");
    }
    if (a.pubkeys) {
      if (a.n !== void 0 && a.n !== a.pubkeys.length)
        throw new TypeError("Pubkey count mismatch");
      o.n = a.pubkeys.length;
      if (o.n < o.m) throw new TypeError("Pubkey count cannot be less than m");
    }
    if (a.signatures) {
      if (a.signatures.length < o.m)
        throw new TypeError("Not enough signatures provided");
      if (a.signatures.length > o.m)
        throw new TypeError("Too many signatures provided");
    }
    if (a.input) {
      if (a.input[0] !== OPS3.OP_0) throw new TypeError("Input is invalid");
      if (o.signatures.length === 0 || !o.signatures.every(isAcceptableSignature))
        throw new TypeError("Input has invalid signature(s)");
      if (a.signatures && !stacksEqual(a.signatures, o.signatures))
        throw new TypeError("Signature mismatch");
      if (a.m !== void 0 && a.m !== a.signatures.length)
        throw new TypeError("Signature count mismatch");
    }
  }
  return Object.assign(o, a);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/p2pk.js
var OPS4 = OPS;
function p2pk(a, opts) {
  if (!a.input && !a.output && !a.pubkey && !a.input && !a.signature)
    throw new TypeError("Not enough data");
  opts = Object.assign({ validate: true }, opts || {});
  parse(
    partial(
      object({
        network: object({}),
        output: BufferSchema,
        pubkey: custom(isPoint, "invalid pubkey"),
        signature: custom(
          isCanonicalScriptSignature,
          "Expected signature to be of type isCanonicalScriptSignature"
        ),
        input: BufferSchema
      })
    ),
    a
  );
  const _chunks = value(() => {
    return decompile(a.input);
  });
  const network = a.network || bitcoin;
  const o = { name: "p2pk", network };
  prop(o, "output", () => {
    if (!a.pubkey) return;
    return compile([a.pubkey, OPS4.OP_CHECKSIG]);
  });
  prop(o, "pubkey", () => {
    if (!a.output) return;
    return a.output.slice(1, -1);
  });
  prop(o, "signature", () => {
    if (!a.input) return;
    return _chunks()[0];
  });
  prop(o, "input", () => {
    if (!a.signature) return;
    return compile([a.signature]);
  });
  prop(o, "witness", () => {
    if (!o.input) return;
    return [];
  });
  if (opts.validate) {
    if (a.output) {
      if (a.output[a.output.length - 1] !== OPS4.OP_CHECKSIG)
        throw new TypeError("Output is invalid");
      if (!isPoint(o.pubkey)) throw new TypeError("Output pubkey is invalid");
      if (a.pubkey && compare(a.pubkey, o.pubkey) !== 0)
        throw new TypeError("Pubkey mismatch");
    }
    if (a.signature) {
      if (a.input && compare(a.input, o.input) !== 0)
        throw new TypeError("Signature mismatch");
    }
    if (a.input) {
      if (_chunks().length !== 1) throw new TypeError("Input is invalid");
      if (!isCanonicalScriptSignature(o.signature))
        throw new TypeError("Input has invalid signature");
    }
  }
  return Object.assign(o, a);
}

// node_modules/@noble/hashes/esm/utils.js
function isBytes6(a) {
  return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
function abytes4(b, ...lengths) {
  if (!isBytes6(b))
    throw new Error("Uint8Array expected");
  if (lengths.length > 0 && !lengths.includes(b.length))
    throw new Error("Uint8Array expected of length " + lengths + ", got length=" + b.length);
}
function aexists4(instance2, checkFinished = true) {
  if (instance2.destroyed)
    throw new Error("Hash instance has been destroyed");
  if (checkFinished && instance2.finished)
    throw new Error("Hash#digest() has already been called");
}
function aoutput4(out, instance2) {
  abytes4(out);
  const min = instance2.outputLen;
  if (out.length < min) {
    throw new Error("digestInto() expects output buffer of length at least " + min);
  }
}
function clean4(...arrays) {
  for (let i = 0; i < arrays.length; i++) {
    arrays[i].fill(0);
  }
}
function createView4(arr) {
  return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
function rotr4(word, shift) {
  return word << 32 - shift | word >>> shift;
}
function rotl2(word, shift) {
  return word << shift | word >>> 32 - shift >>> 0;
}
function utf8ToBytes2(str) {
  if (typeof str !== "string")
    throw new Error("string expected");
  return new Uint8Array(new TextEncoder().encode(str));
}
function toBytes(data) {
  if (typeof data === "string")
    data = utf8ToBytes2(data);
  abytes4(data);
  return data;
}
var Hash = class {
};
function createHasher4(hashCons) {
  const hashC = (msg) => hashCons().update(toBytes(msg)).digest();
  const tmp = hashCons();
  hashC.outputLen = tmp.outputLen;
  hashC.blockLen = tmp.blockLen;
  hashC.create = () => hashCons();
  return hashC;
}

// node_modules/@noble/hashes/esm/_md.js
function setBigUint64(view, byteOffset, value2, isLE) {
  if (typeof view.setBigUint64 === "function")
    return view.setBigUint64(byteOffset, value2, isLE);
  const _32n3 = BigInt(32);
  const _u32_max = BigInt(4294967295);
  const wh = Number(value2 >> _32n3 & _u32_max);
  const wl = Number(value2 & _u32_max);
  const h = isLE ? 4 : 0;
  const l = isLE ? 0 : 4;
  view.setUint32(byteOffset + h, wh, isLE);
  view.setUint32(byteOffset + l, wl, isLE);
}
function Chi4(a, b, c) {
  return a & b ^ ~a & c;
}
function Maj4(a, b, c) {
  return a & b ^ a & c ^ b & c;
}
var HashMD4 = class extends Hash {
  constructor(blockLen, outputLen, padOffset, isLE) {
    super();
    this.finished = false;
    this.length = 0;
    this.pos = 0;
    this.destroyed = false;
    this.blockLen = blockLen;
    this.outputLen = outputLen;
    this.padOffset = padOffset;
    this.isLE = isLE;
    this.buffer = new Uint8Array(blockLen);
    this.view = createView4(this.buffer);
  }
  update(data) {
    aexists4(this);
    data = toBytes(data);
    abytes4(data);
    const { view, buffer, blockLen } = this;
    const len = data.length;
    for (let pos = 0; pos < len; ) {
      const take = Math.min(blockLen - this.pos, len - pos);
      if (take === blockLen) {
        const dataView = createView4(data);
        for (; blockLen <= len - pos; pos += blockLen)
          this.process(dataView, pos);
        continue;
      }
      buffer.set(data.subarray(pos, pos + take), this.pos);
      this.pos += take;
      pos += take;
      if (this.pos === blockLen) {
        this.process(view, 0);
        this.pos = 0;
      }
    }
    this.length += data.length;
    this.roundClean();
    return this;
  }
  digestInto(out) {
    aexists4(this);
    aoutput4(out, this);
    this.finished = true;
    const { buffer, view, blockLen, isLE } = this;
    let { pos } = this;
    buffer[pos++] = 128;
    clean4(this.buffer.subarray(pos));
    if (this.padOffset > blockLen - pos) {
      this.process(view, 0);
      pos = 0;
    }
    for (let i = pos; i < blockLen; i++)
      buffer[i] = 0;
    setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
    this.process(view, 0);
    const oview = createView4(out);
    const len = this.outputLen;
    if (len % 4)
      throw new Error("_sha2: outputLen should be aligned to 32bit");
    const outLen = len / 4;
    const state = this.get();
    if (outLen > state.length)
      throw new Error("_sha2: outputLen bigger than state");
    for (let i = 0; i < outLen; i++)
      oview.setUint32(4 * i, state[i], isLE);
  }
  digest() {
    const { buffer, outputLen } = this;
    this.digestInto(buffer);
    const res = buffer.slice(0, outputLen);
    this.destroy();
    return res;
  }
  _cloneInto(to) {
    to || (to = new this.constructor());
    to.set(...this.get());
    const { blockLen, buffer, length: length2, finished, destroyed, pos } = this;
    to.destroyed = destroyed;
    to.finished = finished;
    to.length = length2;
    to.pos = pos;
    if (length2 % blockLen)
      to.buffer.set(buffer);
    return to;
  }
  clone() {
    return this._cloneInto();
  }
};
var SHA256_IV4 = /* @__PURE__ */ Uint32Array.from([
  1779033703,
  3144134277,
  1013904242,
  2773480762,
  1359893119,
  2600822924,
  528734635,
  1541459225
]);

// node_modules/@noble/hashes/esm/legacy.js
var Rho1602 = /* @__PURE__ */ Uint8Array.from([
  7,
  4,
  13,
  1,
  10,
  6,
  15,
  3,
  12,
  0,
  9,
  5,
  2,
  14,
  11,
  8
]);
var Id1602 = /* @__PURE__ */ (() => Uint8Array.from(new Array(16).fill(0).map((_, i) => i)))();
var Pi1602 = /* @__PURE__ */ (() => Id1602.map((i) => (9 * i + 5) % 16))();
var idxLR2 = /* @__PURE__ */ (() => {
  const L = [Id1602];
  const R = [Pi1602];
  const res = [L, R];
  for (let i = 0; i < 4; i++)
    for (let j of res)
      j.push(j[i].map((k) => Rho1602[k]));
  return res;
})();
var idxL2 = /* @__PURE__ */ (() => idxLR2[0])();
var idxR2 = /* @__PURE__ */ (() => idxLR2[1])();
var shifts1602 = /* @__PURE__ */ [
  [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8],
  [12, 13, 11, 15, 6, 9, 9, 7, 12, 15, 11, 13, 7, 8, 7, 7],
  [13, 15, 14, 11, 7, 7, 6, 8, 13, 14, 13, 12, 5, 5, 6, 9],
  [14, 11, 12, 14, 8, 6, 5, 5, 15, 12, 15, 14, 9, 9, 8, 6],
  [15, 12, 13, 13, 9, 5, 8, 6, 14, 11, 12, 11, 8, 6, 5, 5]
].map((i) => Uint8Array.from(i));
var shiftsL1602 = /* @__PURE__ */ idxL2.map((idx, i) => idx.map((j) => shifts1602[i][j]));
var shiftsR1602 = /* @__PURE__ */ idxR2.map((idx, i) => idx.map((j) => shifts1602[i][j]));
var Kl1602 = /* @__PURE__ */ Uint32Array.from([
  0,
  1518500249,
  1859775393,
  2400959708,
  2840853838
]);
var Kr1602 = /* @__PURE__ */ Uint32Array.from([
  1352829926,
  1548603684,
  1836072691,
  2053994217,
  0
]);
function ripemd_f2(group, x, y, z) {
  if (group === 0)
    return x ^ y ^ z;
  if (group === 1)
    return x & y | ~x & z;
  if (group === 2)
    return (x | ~y) ^ z;
  if (group === 3)
    return x & z | y & ~z;
  return x ^ (y | ~z);
}
var BUF_1602 = /* @__PURE__ */ new Uint32Array(16);
var RIPEMD160 = class extends HashMD4 {
  constructor() {
    super(64, 20, 8, true);
    this.h0 = 1732584193 | 0;
    this.h1 = 4023233417 | 0;
    this.h2 = 2562383102 | 0;
    this.h3 = 271733878 | 0;
    this.h4 = 3285377520 | 0;
  }
  get() {
    const { h0, h1, h2, h3, h4 } = this;
    return [h0, h1, h2, h3, h4];
  }
  set(h0, h1, h2, h3, h4) {
    this.h0 = h0 | 0;
    this.h1 = h1 | 0;
    this.h2 = h2 | 0;
    this.h3 = h3 | 0;
    this.h4 = h4 | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      BUF_1602[i] = view.getUint32(offset, true);
    let al = this.h0 | 0, ar = al, bl = this.h1 | 0, br = bl, cl = this.h2 | 0, cr = cl, dl = this.h3 | 0, dr = dl, el = this.h4 | 0, er = el;
    for (let group = 0; group < 5; group++) {
      const rGroup = 4 - group;
      const hbl = Kl1602[group], hbr = Kr1602[group];
      const rl = idxL2[group], rr = idxR2[group];
      const sl = shiftsL1602[group], sr = shiftsR1602[group];
      for (let i = 0; i < 16; i++) {
        const tl = rotl2(al + ripemd_f2(group, bl, cl, dl) + BUF_1602[rl[i]] + hbl, sl[i]) + el | 0;
        al = el, el = dl, dl = rotl2(cl, 10) | 0, cl = bl, bl = tl;
      }
      for (let i = 0; i < 16; i++) {
        const tr = rotl2(ar + ripemd_f2(rGroup, br, cr, dr) + BUF_1602[rr[i]] + hbr, sr[i]) + er | 0;
        ar = er, er = dr, dr = rotl2(cr, 10) | 0, cr = br, br = tr;
      }
    }
    this.set(this.h1 + cl + dr | 0, this.h2 + dl + er | 0, this.h3 + el + ar | 0, this.h4 + al + br | 0, this.h0 + bl + cr | 0);
  }
  roundClean() {
    clean4(BUF_1602);
  }
  destroy() {
    this.destroyed = true;
    clean4(this.buffer);
    this.set(0, 0, 0, 0, 0);
  }
};
var ripemd1602 = /* @__PURE__ */ createHasher4(() => new RIPEMD160());

// node_modules/@noble/hashes/esm/ripemd160.js
var ripemd1603 = ripemd1602;

// node_modules/@noble/hashes/esm/sha2.js
var SHA256_K4 = /* @__PURE__ */ Uint32Array.from([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var SHA256_W4 = /* @__PURE__ */ new Uint32Array(64);
var SHA256 = class extends HashMD4 {
  constructor(outputLen = 32) {
    super(64, outputLen, 8, false);
    this.A = SHA256_IV4[0] | 0;
    this.B = SHA256_IV4[1] | 0;
    this.C = SHA256_IV4[2] | 0;
    this.D = SHA256_IV4[3] | 0;
    this.E = SHA256_IV4[4] | 0;
    this.F = SHA256_IV4[5] | 0;
    this.G = SHA256_IV4[6] | 0;
    this.H = SHA256_IV4[7] | 0;
  }
  get() {
    const { A, B, C, D, E, F, G, H } = this;
    return [A, B, C, D, E, F, G, H];
  }
  // prettier-ignore
  set(A, B, C, D, E, F, G, H) {
    this.A = A | 0;
    this.B = B | 0;
    this.C = C | 0;
    this.D = D | 0;
    this.E = E | 0;
    this.F = F | 0;
    this.G = G | 0;
    this.H = H | 0;
  }
  process(view, offset) {
    for (let i = 0; i < 16; i++, offset += 4)
      SHA256_W4[i] = view.getUint32(offset, false);
    for (let i = 16; i < 64; i++) {
      const W15 = SHA256_W4[i - 15];
      const W2 = SHA256_W4[i - 2];
      const s0 = rotr4(W15, 7) ^ rotr4(W15, 18) ^ W15 >>> 3;
      const s1 = rotr4(W2, 17) ^ rotr4(W2, 19) ^ W2 >>> 10;
      SHA256_W4[i] = s1 + SHA256_W4[i - 7] + s0 + SHA256_W4[i - 16] | 0;
    }
    let { A, B, C, D, E, F, G, H } = this;
    for (let i = 0; i < 64; i++) {
      const sigma1 = rotr4(E, 6) ^ rotr4(E, 11) ^ rotr4(E, 25);
      const T1 = H + sigma1 + Chi4(E, F, G) + SHA256_K4[i] + SHA256_W4[i] | 0;
      const sigma0 = rotr4(A, 2) ^ rotr4(A, 13) ^ rotr4(A, 22);
      const T2 = sigma0 + Maj4(A, B, C) | 0;
      H = G;
      G = F;
      F = E;
      E = D + T1 | 0;
      D = C;
      C = B;
      B = A;
      A = T1 + T2 | 0;
    }
    A = A + this.A | 0;
    B = B + this.B | 0;
    C = C + this.C | 0;
    D = D + this.D | 0;
    E = E + this.E | 0;
    F = F + this.F | 0;
    G = G + this.G | 0;
    H = H + this.H | 0;
    this.set(A, B, C, D, E, F, G, H);
  }
  roundClean() {
    clean4(SHA256_W4);
  }
  destroy() {
    this.set(0, 0, 0, 0, 0, 0, 0, 0);
    clean4(this.buffer);
  }
};
var sha2564 = /* @__PURE__ */ createHasher4(() => new SHA256());

// node_modules/@noble/hashes/esm/sha256.js
var sha2565 = sha2564;

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/crypto.js
function hash1602(buffer) {
  return ripemd1603(sha2565(buffer));
}
function hash256(buffer) {
  return sha2565(sha2565(buffer));
}
var TAGGED_HASH_PREFIXES = {
  "BIP0340/challenge": Uint8Array.from([
    123,
    181,
    45,
    122,
    159,
    239,
    88,
    50,
    62,
    177,
    191,
    122,
    64,
    125,
    179,
    130,
    210,
    243,
    242,
    216,
    27,
    177,
    34,
    79,
    73,
    254,
    81,
    143,
    109,
    72,
    211,
    124,
    123,
    181,
    45,
    122,
    159,
    239,
    88,
    50,
    62,
    177,
    191,
    122,
    64,
    125,
    179,
    130,
    210,
    243,
    242,
    216,
    27,
    177,
    34,
    79,
    73,
    254,
    81,
    143,
    109,
    72,
    211,
    124
  ]),
  "BIP0340/aux": Uint8Array.from([
    241,
    239,
    78,
    94,
    192,
    99,
    202,
    218,
    109,
    148,
    202,
    250,
    157,
    152,
    126,
    160,
    105,
    38,
    88,
    57,
    236,
    193,
    31,
    151,
    45,
    119,
    165,
    46,
    216,
    193,
    204,
    144,
    241,
    239,
    78,
    94,
    192,
    99,
    202,
    218,
    109,
    148,
    202,
    250,
    157,
    152,
    126,
    160,
    105,
    38,
    88,
    57,
    236,
    193,
    31,
    151,
    45,
    119,
    165,
    46,
    216,
    193,
    204,
    144
  ]),
  "BIP0340/nonce": Uint8Array.from([
    7,
    73,
    119,
    52,
    167,
    155,
    203,
    53,
    91,
    155,
    140,
    125,
    3,
    79,
    18,
    28,
    244,
    52,
    215,
    62,
    247,
    45,
    218,
    25,
    135,
    0,
    97,
    251,
    82,
    191,
    235,
    47,
    7,
    73,
    119,
    52,
    167,
    155,
    203,
    53,
    91,
    155,
    140,
    125,
    3,
    79,
    18,
    28,
    244,
    52,
    215,
    62,
    247,
    45,
    218,
    25,
    135,
    0,
    97,
    251,
    82,
    191,
    235,
    47
  ]),
  TapLeaf: Uint8Array.from([
    174,
    234,
    143,
    220,
    66,
    8,
    152,
    49,
    5,
    115,
    75,
    88,
    8,
    29,
    30,
    38,
    56,
    211,
    95,
    28,
    181,
    64,
    8,
    212,
    211,
    87,
    202,
    3,
    190,
    120,
    233,
    238,
    174,
    234,
    143,
    220,
    66,
    8,
    152,
    49,
    5,
    115,
    75,
    88,
    8,
    29,
    30,
    38,
    56,
    211,
    95,
    28,
    181,
    64,
    8,
    212,
    211,
    87,
    202,
    3,
    190,
    120,
    233,
    238
  ]),
  TapBranch: Uint8Array.from([
    25,
    65,
    161,
    242,
    229,
    110,
    185,
    95,
    162,
    169,
    241,
    148,
    190,
    92,
    1,
    247,
    33,
    111,
    51,
    237,
    130,
    176,
    145,
    70,
    52,
    144,
    208,
    91,
    245,
    22,
    160,
    21,
    25,
    65,
    161,
    242,
    229,
    110,
    185,
    95,
    162,
    169,
    241,
    148,
    190,
    92,
    1,
    247,
    33,
    111,
    51,
    237,
    130,
    176,
    145,
    70,
    52,
    144,
    208,
    91,
    245,
    22,
    160,
    21
  ]),
  TapSighash: Uint8Array.from([
    244,
    10,
    72,
    223,
    75,
    42,
    112,
    200,
    180,
    146,
    75,
    242,
    101,
    70,
    97,
    237,
    61,
    149,
    253,
    102,
    163,
    19,
    235,
    135,
    35,
    117,
    151,
    198,
    40,
    228,
    160,
    49,
    244,
    10,
    72,
    223,
    75,
    42,
    112,
    200,
    180,
    146,
    75,
    242,
    101,
    70,
    97,
    237,
    61,
    149,
    253,
    102,
    163,
    19,
    235,
    135,
    35,
    117,
    151,
    198,
    40,
    228,
    160,
    49
  ]),
  TapTweak: Uint8Array.from([
    232,
    15,
    225,
    99,
    156,
    156,
    160,
    80,
    227,
    175,
    27,
    57,
    193,
    67,
    198,
    62,
    66,
    156,
    188,
    235,
    21,
    217,
    64,
    251,
    181,
    197,
    161,
    244,
    175,
    87,
    197,
    233,
    232,
    15,
    225,
    99,
    156,
    156,
    160,
    80,
    227,
    175,
    27,
    57,
    193,
    67,
    198,
    62,
    66,
    156,
    188,
    235,
    21,
    217,
    64,
    251,
    181,
    197,
    161,
    244,
    175,
    87,
    197,
    233
  ]),
  "KeyAgg list": Uint8Array.from([
    72,
    28,
    151,
    28,
    60,
    11,
    70,
    215,
    240,
    178,
    117,
    174,
    89,
    141,
    78,
    44,
    126,
    215,
    49,
    156,
    89,
    74,
    92,
    110,
    199,
    158,
    160,
    212,
    153,
    2,
    148,
    240,
    72,
    28,
    151,
    28,
    60,
    11,
    70,
    215,
    240,
    178,
    117,
    174,
    89,
    141,
    78,
    44,
    126,
    215,
    49,
    156,
    89,
    74,
    92,
    110,
    199,
    158,
    160,
    212,
    153,
    2,
    148,
    240
  ]),
  "KeyAgg coefficient": Uint8Array.from([
    191,
    201,
    4,
    3,
    77,
    28,
    136,
    232,
    200,
    14,
    34,
    229,
    61,
    36,
    86,
    109,
    100,
    130,
    78,
    214,
    66,
    114,
    129,
    192,
    145,
    0,
    249,
    77,
    205,
    82,
    201,
    129,
    191,
    201,
    4,
    3,
    77,
    28,
    136,
    232,
    200,
    14,
    34,
    229,
    61,
    36,
    86,
    109,
    100,
    130,
    78,
    214,
    66,
    114,
    129,
    192,
    145,
    0,
    249,
    77,
    205,
    82,
    201,
    129
  ])
};
function taggedHash(prefix, data) {
  return sha2565(concat([TAGGED_HASH_PREFIXES[prefix], data]));
}

// apps/frontend/node_modules/base-x/src/esm/index.js
function base(ALPHABET2) {
  if (ALPHABET2.length >= 255) {
    throw new TypeError("Alphabet too long");
  }
  const BASE_MAP = new Uint8Array(256);
  for (let j = 0; j < BASE_MAP.length; j++) {
    BASE_MAP[j] = 255;
  }
  for (let i = 0; i < ALPHABET2.length; i++) {
    const x = ALPHABET2.charAt(i);
    const xc = x.charCodeAt(0);
    if (BASE_MAP[xc] !== 255) {
      throw new TypeError(x + " is ambiguous");
    }
    BASE_MAP[xc] = i;
  }
  const BASE = ALPHABET2.length;
  const LEADER = ALPHABET2.charAt(0);
  const FACTOR = Math.log(BASE) / Math.log(256);
  const iFACTOR = Math.log(256) / Math.log(BASE);
  function encode20(source) {
    if (source instanceof Uint8Array) {
    } else if (ArrayBuffer.isView(source)) {
      source = new Uint8Array(source.buffer, source.byteOffset, source.byteLength);
    } else if (Array.isArray(source)) {
      source = Uint8Array.from(source);
    }
    if (!(source instanceof Uint8Array)) {
      throw new TypeError("Expected Uint8Array");
    }
    if (source.length === 0) {
      return "";
    }
    let zeroes = 0;
    let length2 = 0;
    let pbegin = 0;
    const pend = source.length;
    while (pbegin !== pend && source[pbegin] === 0) {
      pbegin++;
      zeroes++;
    }
    const size = (pend - pbegin) * iFACTOR + 1 >>> 0;
    const b58 = new Uint8Array(size);
    while (pbegin !== pend) {
      let carry = source[pbegin];
      let i = 0;
      for (let it1 = size - 1; (carry !== 0 || i < length2) && it1 !== -1; it1--, i++) {
        carry += 256 * b58[it1] >>> 0;
        b58[it1] = carry % BASE >>> 0;
        carry = carry / BASE >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length2 = i;
      pbegin++;
    }
    let it2 = size - length2;
    while (it2 !== size && b58[it2] === 0) {
      it2++;
    }
    let str = LEADER.repeat(zeroes);
    for (; it2 < size; ++it2) {
      str += ALPHABET2.charAt(b58[it2]);
    }
    return str;
  }
  function decodeUnsafe(source) {
    if (typeof source !== "string") {
      throw new TypeError("Expected String");
    }
    if (source.length === 0) {
      return new Uint8Array();
    }
    let psz = 0;
    let zeroes = 0;
    let length2 = 0;
    while (source[psz] === LEADER) {
      zeroes++;
      psz++;
    }
    const size = (source.length - psz) * FACTOR + 1 >>> 0;
    const b256 = new Uint8Array(size);
    while (psz < source.length) {
      const charCode = source.charCodeAt(psz);
      if (charCode > 255) {
        return;
      }
      let carry = BASE_MAP[charCode];
      if (carry === 255) {
        return;
      }
      let i = 0;
      for (let it3 = size - 1; (carry !== 0 || i < length2) && it3 !== -1; it3--, i++) {
        carry += BASE * b256[it3] >>> 0;
        b256[it3] = carry % 256 >>> 0;
        carry = carry / 256 >>> 0;
      }
      if (carry !== 0) {
        throw new Error("Non-zero carry");
      }
      length2 = i;
      psz++;
    }
    let it4 = size - length2;
    while (it4 !== size && b256[it4] === 0) {
      it4++;
    }
    const vch = new Uint8Array(zeroes + (size - it4));
    let j = zeroes;
    while (it4 !== size) {
      vch[j++] = b256[it4++];
    }
    return vch;
  }
  function decode19(string2) {
    const buffer = decodeUnsafe(string2);
    if (buffer) {
      return buffer;
    }
    throw new Error("Non-base" + BASE + " character");
  }
  return {
    encode: encode20,
    decodeUnsafe,
    decode: decode19
  };
}
var esm_default = base;

// apps/frontend/node_modules/bs58/src/esm/index.js
var ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var esm_default2 = esm_default(ALPHABET);

// apps/frontend/node_modules/bs58check/src/esm/base.js
function base_default(checksumFn) {
  function encode20(payload) {
    var payloadU8 = Uint8Array.from(payload);
    var checksum3 = checksumFn(payloadU8);
    var length2 = payloadU8.length + 4;
    var both = new Uint8Array(length2);
    both.set(payloadU8, 0);
    both.set(checksum3.subarray(0, 4), payloadU8.length);
    return esm_default2.encode(both);
  }
  function decodeRaw(buffer) {
    var payload = buffer.slice(0, -4);
    var checksum3 = buffer.slice(-4);
    var newChecksum = checksumFn(payload);
    if (checksum3[0] ^ newChecksum[0] | checksum3[1] ^ newChecksum[1] | checksum3[2] ^ newChecksum[2] | checksum3[3] ^ newChecksum[3])
      return;
    return payload;
  }
  function decodeUnsafe(str) {
    var buffer = esm_default2.decodeUnsafe(str);
    if (buffer == null)
      return;
    return decodeRaw(buffer);
  }
  function decode19(str) {
    var buffer = esm_default2.decode(str);
    var payload = decodeRaw(buffer);
    if (payload == null)
      throw new Error("Invalid checksum");
    return payload;
  }
  return {
    encode: encode20,
    decode: decode19,
    decodeUnsafe
  };
}

// apps/frontend/node_modules/bs58check/src/esm/index.js
function sha256x2(buffer) {
  return sha2565(sha2565(buffer));
}
var esm_default3 = base_default(sha256x2);

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/p2pkh.js
var OPS5 = OPS;
function p2pkh(a, opts) {
  if (!a.address && !a.hash && !a.output && !a.pubkey && !a.input)
    throw new TypeError("Not enough data");
  opts = Object.assign({ validate: true }, opts || {});
  parse(
    partial(
      object({
        network: object({}),
        address: string(),
        hash: Hash160bitSchema,
        output: NBufferSchemaFactory(25),
        pubkey: custom(isPoint),
        signature: custom(isCanonicalScriptSignature),
        input: BufferSchema
      })
    ),
    a
  );
  const _address = value(() => {
    const payload = esm_default3.decode(a.address);
    const version = readUInt8(payload, 0);
    const hash = payload.slice(1);
    return { version, hash };
  });
  const _chunks = value(() => {
    return decompile(a.input);
  });
  const network = a.network || bitcoin;
  const o = { name: "p2pkh", network };
  prop(o, "address", () => {
    if (!o.hash) return;
    const payload = new Uint8Array(21);
    writeUInt8(payload, 0, network.pubKeyHash);
    payload.set(o.hash, 1);
    return esm_default3.encode(payload);
  });
  prop(o, "hash", () => {
    if (a.output) return a.output.slice(3, 23);
    if (a.address) return _address().hash;
    if (a.pubkey || o.pubkey) return hash1602(a.pubkey || o.pubkey);
  });
  prop(o, "output", () => {
    if (!o.hash) return;
    return compile([
      OPS5.OP_DUP,
      OPS5.OP_HASH160,
      o.hash,
      OPS5.OP_EQUALVERIFY,
      OPS5.OP_CHECKSIG
    ]);
  });
  prop(o, "pubkey", () => {
    if (!a.input) return;
    return _chunks()[1];
  });
  prop(o, "signature", () => {
    if (!a.input) return;
    return _chunks()[0];
  });
  prop(o, "input", () => {
    if (!a.pubkey) return;
    if (!a.signature) return;
    return compile([a.signature, a.pubkey]);
  });
  prop(o, "witness", () => {
    if (!o.input) return;
    return [];
  });
  if (opts.validate) {
    let hash = Uint8Array.from([]);
    if (a.address) {
      if (_address().version !== network.pubKeyHash)
        throw new TypeError("Invalid version or Network mismatch");
      if (_address().hash.length !== 20) throw new TypeError("Invalid address");
      hash = _address().hash;
    }
    if (a.hash) {
      if (hash.length > 0 && compare(hash, a.hash) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = a.hash;
    }
    if (a.output) {
      if (a.output.length !== 25 || a.output[0] !== OPS5.OP_DUP || a.output[1] !== OPS5.OP_HASH160 || a.output[2] !== 20 || a.output[23] !== OPS5.OP_EQUALVERIFY || a.output[24] !== OPS5.OP_CHECKSIG)
        throw new TypeError("Output is invalid");
      const hash2 = a.output.slice(3, 23);
      if (hash.length > 0 && compare(hash, hash2) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = hash2;
    }
    if (a.pubkey) {
      const pkh = hash1602(a.pubkey);
      if (hash.length > 0 && compare(hash, pkh) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = pkh;
    }
    if (a.input) {
      const chunks = _chunks();
      if (chunks.length !== 2) throw new TypeError("Input is invalid");
      if (!isCanonicalScriptSignature(chunks[0]))
        throw new TypeError("Input has invalid signature");
      if (!isPoint(chunks[1])) throw new TypeError("Input has invalid pubkey");
      if (a.signature && compare(a.signature, chunks[0]) !== 0)
        throw new TypeError("Signature mismatch");
      if (a.pubkey && compare(a.pubkey, chunks[1]) !== 0)
        throw new TypeError("Pubkey mismatch");
      const pkh = hash1602(chunks[1]);
      if (hash.length > 0 && compare(hash, pkh) !== 0)
        throw new TypeError("Hash mismatch");
    }
  }
  return Object.assign(o, a);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/p2sh.js
var OPS6 = OPS;
function p2sh(a, opts) {
  if (!a.address && !a.hash && !a.output && !a.redeem && !a.input)
    throw new TypeError("Not enough data");
  opts = Object.assign({ validate: true }, opts || {});
  parse(
    partial(
      object({
        network: object({}),
        address: string(),
        hash: NBufferSchemaFactory(20),
        output: NBufferSchemaFactory(23),
        redeem: partial(
          object({
            network: object({}),
            output: BufferSchema,
            input: BufferSchema,
            witness: array(BufferSchema)
          })
        ),
        input: BufferSchema,
        witness: array(BufferSchema)
      })
    ),
    a
  );
  let network = a.network;
  if (!network) {
    network = a.redeem && a.redeem.network || bitcoin;
  }
  const o = { network };
  const _address = value(() => {
    const payload = esm_default3.decode(a.address);
    const version = readUInt8(payload, 0);
    const hash = payload.slice(1);
    return { version, hash };
  });
  const _chunks = value(() => {
    return decompile(a.input);
  });
  const _redeem = value(() => {
    const chunks = _chunks();
    const lastChunk = chunks[chunks.length - 1];
    return {
      network,
      output: lastChunk === OPS6.OP_FALSE ? Uint8Array.from([]) : lastChunk,
      input: compile(chunks.slice(0, -1)),
      witness: a.witness || []
    };
  });
  prop(o, "address", () => {
    if (!o.hash) return;
    const payload = new Uint8Array(21);
    writeUInt8(payload, 0, o.network.scriptHash);
    payload.set(o.hash, 1);
    return esm_default3.encode(payload);
  });
  prop(o, "hash", () => {
    if (a.output) return a.output.slice(2, 22);
    if (a.address) return _address().hash;
    if (o.redeem && o.redeem.output) return hash1602(o.redeem.output);
  });
  prop(o, "output", () => {
    if (!o.hash) return;
    return compile([OPS6.OP_HASH160, o.hash, OPS6.OP_EQUAL]);
  });
  prop(o, "redeem", () => {
    if (!a.input) return;
    return _redeem();
  });
  prop(o, "input", () => {
    if (!a.redeem || !a.redeem.input || !a.redeem.output) return;
    return compile(
      [].concat(decompile(a.redeem.input), a.redeem.output)
    );
  });
  prop(o, "witness", () => {
    if (o.redeem && o.redeem.witness) return o.redeem.witness;
    if (o.input) return [];
  });
  prop(o, "name", () => {
    const nameParts = ["p2sh"];
    if (o.redeem !== void 0 && o.redeem.name !== void 0)
      nameParts.push(o.redeem.name);
    return nameParts.join("-");
  });
  if (opts.validate) {
    let hash = Uint8Array.from([]);
    if (a.address) {
      if (_address().version !== network.scriptHash)
        throw new TypeError("Invalid version or Network mismatch");
      if (_address().hash.length !== 20) throw new TypeError("Invalid address");
      hash = _address().hash;
    }
    if (a.hash) {
      if (hash.length > 0 && compare(hash, a.hash) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = a.hash;
    }
    if (a.output) {
      if (a.output.length !== 23 || a.output[0] !== OPS6.OP_HASH160 || a.output[1] !== 20 || a.output[22] !== OPS6.OP_EQUAL)
        throw new TypeError("Output is invalid");
      const hash2 = a.output.slice(2, 22);
      if (hash.length > 0 && compare(hash, hash2) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = hash2;
    }
    const checkRedeem = (redeem) => {
      if (redeem.output) {
        const decompile2 = decompile(redeem.output);
        if (!decompile2 || decompile2.length < 1)
          throw new TypeError("Redeem.output too short");
        if (redeem.output.byteLength > 520)
          throw new TypeError(
            "Redeem.output unspendable if larger than 520 bytes"
          );
        if (countNonPushOnlyOPs(decompile2) > 201)
          throw new TypeError(
            "Redeem.output unspendable with more than 201 non-push ops"
          );
        const hash2 = hash1602(redeem.output);
        if (hash.length > 0 && compare(hash, hash2) !== 0)
          throw new TypeError("Hash mismatch");
        else hash = hash2;
      }
      if (redeem.input) {
        const hasInput = redeem.input.length > 0;
        const hasWitness = redeem.witness && redeem.witness.length > 0;
        if (!hasInput && !hasWitness) throw new TypeError("Empty input");
        if (hasInput && hasWitness)
          throw new TypeError("Input and witness provided");
        if (hasInput) {
          const richunks = decompile(redeem.input);
          if (!isPushOnly(richunks))
            throw new TypeError("Non push-only scriptSig");
        }
      }
    };
    if (a.input) {
      const chunks = _chunks();
      if (!chunks || chunks.length < 1) throw new TypeError("Input too short");
      if (!(_redeem().output instanceof Uint8Array))
        throw new TypeError("Input is invalid");
      checkRedeem(_redeem());
    }
    if (a.redeem) {
      if (a.redeem.network && a.redeem.network !== network)
        throw new TypeError("Network mismatch");
      if (a.input) {
        const redeem = _redeem();
        if (a.redeem.output && compare(a.redeem.output, redeem.output) !== 0)
          throw new TypeError("Redeem.output mismatch");
        if (a.redeem.input && compare(a.redeem.input, redeem.input) !== 0)
          throw new TypeError("Redeem.input mismatch");
      }
      checkRedeem(a.redeem);
    }
    if (a.witness) {
      if (a.redeem && a.redeem.witness && !stacksEqual(a.redeem.witness, a.witness))
        throw new TypeError("Witness and redeem.witness mismatch");
    }
  }
  return Object.assign(o, a);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/p2wpkh.js
var import_bech32 = __toESM(require_dist(), 1);
var OPS7 = OPS;
var EMPTY_BUFFER = new Uint8Array(0);
function p2wpkh(a, opts) {
  if (!a.address && !a.hash && !a.output && !a.pubkey && !a.witness)
    throw new TypeError("Not enough data");
  opts = Object.assign({ validate: true }, opts || {});
  parse(
    partial(
      object({
        address: string(),
        hash: NBufferSchemaFactory(20),
        input: NBufferSchemaFactory(0),
        network: object({}),
        output: NBufferSchemaFactory(22),
        pubkey: custom(isPoint, "Not a valid pubkey"),
        signature: custom(isCanonicalScriptSignature),
        witness: array(BufferSchema)
      })
    ),
    a
  );
  const _address = value(() => {
    const result = import_bech32.bech32.decode(a.address);
    const version = result.words.shift();
    const data = import_bech32.bech32.fromWords(result.words);
    return {
      version,
      prefix: result.prefix,
      data: Uint8Array.from(data)
    };
  });
  const network = a.network || bitcoin;
  const o = { name: "p2wpkh", network };
  prop(o, "address", () => {
    if (!o.hash) return;
    const words = import_bech32.bech32.toWords(o.hash);
    words.unshift(0);
    return import_bech32.bech32.encode(network.bech32, words);
  });
  prop(o, "hash", () => {
    if (a.output) return a.output.slice(2, 22);
    if (a.address) return _address().data;
    if (a.pubkey || o.pubkey) return hash1602(a.pubkey || o.pubkey);
  });
  prop(o, "output", () => {
    if (!o.hash) return;
    return compile([OPS7.OP_0, o.hash]);
  });
  prop(o, "pubkey", () => {
    if (a.pubkey) return a.pubkey;
    if (!a.witness) return;
    return a.witness[1];
  });
  prop(o, "signature", () => {
    if (!a.witness) return;
    return a.witness[0];
  });
  prop(o, "input", () => {
    if (!o.witness) return;
    return EMPTY_BUFFER;
  });
  prop(o, "witness", () => {
    if (!a.pubkey) return;
    if (!a.signature) return;
    return [a.signature, a.pubkey];
  });
  if (opts.validate) {
    let hash = Uint8Array.from([]);
    if (a.address) {
      if (network && network.bech32 !== _address().prefix)
        throw new TypeError("Invalid prefix or Network mismatch");
      if (_address().version !== 0)
        throw new TypeError("Invalid address version");
      if (_address().data.length !== 20)
        throw new TypeError("Invalid address data");
      hash = _address().data;
    }
    if (a.hash) {
      if (hash.length > 0 && compare(hash, a.hash) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = a.hash;
    }
    if (a.output) {
      if (a.output.length !== 22 || a.output[0] !== OPS7.OP_0 || a.output[1] !== 20)
        throw new TypeError("Output is invalid");
      if (hash.length > 0 && compare(hash, a.output.slice(2)) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = a.output.slice(2);
    }
    if (a.pubkey) {
      const pkh = hash1602(a.pubkey);
      if (hash.length > 0 && compare(hash, pkh) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = pkh;
      if (!isPoint(a.pubkey) || a.pubkey.length !== 33)
        throw new TypeError("Invalid pubkey for p2wpkh");
    }
    if (a.witness) {
      if (a.witness.length !== 2) throw new TypeError("Witness is invalid");
      if (!isCanonicalScriptSignature(a.witness[0]))
        throw new TypeError("Witness has invalid signature");
      if (!isPoint(a.witness[1]) || a.witness[1].length !== 33)
        throw new TypeError("Witness has invalid pubkey");
      if (a.signature && compare(a.signature, a.witness[0]) !== 0)
        throw new TypeError("Signature mismatch");
      if (a.pubkey && compare(a.pubkey, a.witness[1]) !== 0)
        throw new TypeError("Pubkey mismatch");
      const pkh = hash1602(a.witness[1]);
      if (hash.length > 0 && compare(hash, pkh) !== 0)
        throw new TypeError("Hash mismatch");
    }
  }
  return Object.assign(o, a);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/p2wsh.js
var import_bech322 = __toESM(require_dist(), 1);
var OPS8 = OPS;
var EMPTY_BUFFER2 = new Uint8Array(0);
function chunkHasUncompressedPubkey(chunk) {
  if (chunk instanceof Uint8Array && chunk.length === 65 && chunk[0] === 4 && isPoint(chunk)) {
    return true;
  } else {
    return false;
  }
}
function p2wsh(a, opts) {
  if (!a.address && !a.hash && !a.output && !a.redeem && !a.witness)
    throw new TypeError("Not enough data");
  opts = Object.assign({ validate: true }, opts || {});
  parse(
    NullablePartial({
      network: object({}),
      address: string(),
      hash: Buffer256bitSchema,
      output: NBufferSchemaFactory(34),
      redeem: NullablePartial({
        input: BufferSchema,
        network: object({}),
        output: BufferSchema,
        witness: array(BufferSchema)
      }),
      input: NBufferSchemaFactory(0),
      witness: array(BufferSchema)
    }),
    a
  );
  const _address = value(() => {
    const result = import_bech322.bech32.decode(a.address);
    const version = result.words.shift();
    const data = import_bech322.bech32.fromWords(result.words);
    return {
      version,
      prefix: result.prefix,
      data: Uint8Array.from(data)
    };
  });
  const _rchunks = value(() => {
    return decompile(a.redeem.input);
  });
  let network = a.network;
  if (!network) {
    network = a.redeem && a.redeem.network || bitcoin;
  }
  const o = { network };
  prop(o, "address", () => {
    if (!o.hash) return;
    const words = import_bech322.bech32.toWords(o.hash);
    words.unshift(0);
    return import_bech322.bech32.encode(network.bech32, words);
  });
  prop(o, "hash", () => {
    if (a.output) return a.output.slice(2);
    if (a.address) return _address().data;
    if (o.redeem && o.redeem.output) return sha2565(o.redeem.output);
  });
  prop(o, "output", () => {
    if (!o.hash) return;
    return compile([OPS8.OP_0, o.hash]);
  });
  prop(o, "redeem", () => {
    if (!a.witness) return;
    return {
      output: a.witness[a.witness.length - 1],
      input: EMPTY_BUFFER2,
      witness: a.witness.slice(0, -1)
    };
  });
  prop(o, "input", () => {
    if (!o.witness) return;
    return EMPTY_BUFFER2;
  });
  prop(o, "witness", () => {
    if (a.redeem && a.redeem.input && a.redeem.input.length > 0 && a.redeem.output && a.redeem.output.length > 0) {
      const stack = toStack(_rchunks());
      o.redeem = Object.assign({ witness: stack }, a.redeem);
      o.redeem.input = EMPTY_BUFFER2;
      return [].concat(stack, a.redeem.output);
    }
    if (!a.redeem) return;
    if (!a.redeem.output) return;
    if (!a.redeem.witness) return;
    return [].concat(a.redeem.witness, a.redeem.output);
  });
  prop(o, "name", () => {
    const nameParts = ["p2wsh"];
    if (o.redeem !== void 0 && o.redeem.name !== void 0)
      nameParts.push(o.redeem.name);
    return nameParts.join("-");
  });
  if (opts.validate) {
    let hash = Uint8Array.from([]);
    if (a.address) {
      if (_address().prefix !== network.bech32)
        throw new TypeError("Invalid prefix or Network mismatch");
      if (_address().version !== 0)
        throw new TypeError("Invalid address version");
      if (_address().data.length !== 32)
        throw new TypeError("Invalid address data");
      hash = _address().data;
    }
    if (a.hash) {
      if (hash.length > 0 && compare(hash, a.hash) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = a.hash;
    }
    if (a.output) {
      if (a.output.length !== 34 || a.output[0] !== OPS8.OP_0 || a.output[1] !== 32)
        throw new TypeError("Output is invalid");
      const hash2 = a.output.slice(2);
      if (hash.length > 0 && compare(hash, hash2) !== 0)
        throw new TypeError("Hash mismatch");
      else hash = hash2;
    }
    if (a.redeem) {
      if (a.redeem.network && a.redeem.network !== network)
        throw new TypeError("Network mismatch");
      if (a.redeem.input && a.redeem.input.length > 0 && a.redeem.witness && a.redeem.witness.length > 0)
        throw new TypeError("Ambiguous witness source");
      if (a.redeem.output) {
        const decompile2 = decompile(a.redeem.output);
        if (!decompile2 || decompile2.length < 1)
          throw new TypeError("Redeem.output is invalid");
        if (a.redeem.output.byteLength > 3600)
          throw new TypeError(
            "Redeem.output unspendable if larger than 3600 bytes"
          );
        if (countNonPushOnlyOPs(decompile2) > 201)
          throw new TypeError(
            "Redeem.output unspendable with more than 201 non-push ops"
          );
        const hash2 = sha2565(a.redeem.output);
        if (hash.length > 0 && compare(hash, hash2) !== 0)
          throw new TypeError("Hash mismatch");
        else hash = hash2;
      }
      if (a.redeem.input && !isPushOnly(_rchunks()))
        throw new TypeError("Non push-only scriptSig");
      if (a.witness && a.redeem.witness && !stacksEqual(a.witness, a.redeem.witness))
        throw new TypeError("Witness and redeem.witness mismatch");
      if (a.redeem.input && _rchunks().some(chunkHasUncompressedPubkey) || a.redeem.output && (decompile(a.redeem.output) || []).some(
        chunkHasUncompressedPubkey
      )) {
        throw new TypeError(
          "redeem.input or redeem.output contains uncompressed pubkey"
        );
      }
    }
    if (a.witness && a.witness.length > 0) {
      const wScript = a.witness[a.witness.length - 1];
      if (a.redeem && a.redeem.output && compare(a.redeem.output, wScript) !== 0)
        throw new TypeError("Witness and redeem.output mismatch");
      if (a.witness.some(chunkHasUncompressedPubkey) || (decompile(wScript) || []).some(chunkHasUncompressedPubkey))
        throw new TypeError("Witness contains uncompressed pubkey");
    }
  }
  return Object.assign(o, a);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/ecc_lib.js
var _ECCLIB_CACHE = {};
function getEccLib() {
  if (!_ECCLIB_CACHE.eccLib)
    throw new Error(
      "No ECC Library provided. You must call initEccLib() with a valid TinySecp256k1Interface instance"
    );
  return _ECCLIB_CACHE.eccLib;
}

// apps/frontend/node_modules/varuint-bitcoin/src/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  decode: () => decode5,
  encode: () => encode5,
  encodingLength: () => encodingLength2
});

// apps/frontend/node_modules/varuint-bitcoin/node_modules/uint8array-tools/src/mjs/browser.js
var HEX_STRINGS2 = "0123456789abcdefABCDEF";
var HEX_CODES2 = HEX_STRINGS2.split("").map((c) => c.codePointAt(0));
var HEX_CODEPOINTS2 = Array(256).fill(true).map((_, i) => {
  const s = String.fromCodePoint(i);
  const index = HEX_STRINGS2.indexOf(s);
  return index < 0 ? void 0 : index < 16 ? index : index - 6;
});
var ENCODER2 = new TextEncoder();
var DECODER2 = new TextDecoder();
function writeUInt162(buffer, offset, value2, littleEndian) {
  if (offset + 2 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (value2 > 65535) {
    throw new Error(`The value of "value" is out of range. It must be >= 0 and <= ${65535}. Received ${value2}`);
  }
  if (littleEndian === "LE") {
    buffer[offset] = value2 & 255;
    buffer[offset + 1] = value2 >> 8 & 255;
  } else {
    buffer[offset] = value2 >> 8 & 255;
    buffer[offset + 1] = value2 & 255;
  }
}
function writeUInt322(buffer, offset, value2, littleEndian) {
  if (offset + 4 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (value2 > 4294967295) {
    throw new Error(`The value of "value" is out of range. It must be >= 0 and <= ${4294967295}. Received ${value2}`);
  }
  if (littleEndian === "LE") {
    buffer[offset] = value2 & 255;
    buffer[offset + 1] = value2 >> 8 & 255;
    buffer[offset + 2] = value2 >> 16 & 255;
    buffer[offset + 3] = value2 >> 24 & 255;
  } else {
    buffer[offset] = value2 >> 24 & 255;
    buffer[offset + 1] = value2 >> 16 & 255;
    buffer[offset + 2] = value2 >> 8 & 255;
    buffer[offset + 3] = value2 & 255;
  }
}
function writeUInt642(buffer, offset, value2, littleEndian) {
  if (offset + 8 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (value2 > 0xffffffffffffffffn) {
    throw new Error(`The value of "value" is out of range. It must be >= 0 and <= ${0xffffffffffffffffn}. Received ${value2}`);
  }
  if (littleEndian === "LE") {
    buffer[offset] = Number(value2 & 0xffn);
    buffer[offset + 1] = Number(value2 >> 8n & 0xffn);
    buffer[offset + 2] = Number(value2 >> 16n & 0xffn);
    buffer[offset + 3] = Number(value2 >> 24n & 0xffn);
    buffer[offset + 4] = Number(value2 >> 32n & 0xffn);
    buffer[offset + 5] = Number(value2 >> 40n & 0xffn);
    buffer[offset + 6] = Number(value2 >> 48n & 0xffn);
    buffer[offset + 7] = Number(value2 >> 56n & 0xffn);
  } else {
    buffer[offset] = Number(value2 >> 56n & 0xffn);
    buffer[offset + 1] = Number(value2 >> 48n & 0xffn);
    buffer[offset + 2] = Number(value2 >> 40n & 0xffn);
    buffer[offset + 3] = Number(value2 >> 32n & 0xffn);
    buffer[offset + 4] = Number(value2 >> 24n & 0xffn);
    buffer[offset + 5] = Number(value2 >> 16n & 0xffn);
    buffer[offset + 6] = Number(value2 >> 8n & 0xffn);
    buffer[offset + 7] = Number(value2 & 0xffn);
  }
}
function readUInt162(buffer, offset, littleEndian) {
  if (offset + 2 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (littleEndian === "LE") {
    let num = 0;
    num = (num << 8) + buffer[offset + 1];
    num = (num << 8) + buffer[offset];
    return num;
  } else {
    let num = 0;
    num = (num << 8) + buffer[offset];
    num = (num << 8) + buffer[offset + 1];
    return num;
  }
}
function readUInt322(buffer, offset, littleEndian) {
  if (offset + 4 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (littleEndian === "LE") {
    let num = 0;
    num = (num << 8) + buffer[offset + 3] >>> 0;
    num = (num << 8) + buffer[offset + 2] >>> 0;
    num = (num << 8) + buffer[offset + 1] >>> 0;
    num = (num << 8) + buffer[offset] >>> 0;
    return num;
  } else {
    let num = 0;
    num = (num << 8) + buffer[offset] >>> 0;
    num = (num << 8) + buffer[offset + 1] >>> 0;
    num = (num << 8) + buffer[offset + 2] >>> 0;
    num = (num << 8) + buffer[offset + 3] >>> 0;
    return num;
  }
}
function readUInt64(buffer, offset, littleEndian) {
  if (offset + 8 > buffer.length) {
    throw new Error("Offset is outside the bounds of Uint8Array");
  }
  littleEndian = littleEndian.toUpperCase();
  if (littleEndian === "LE") {
    let num = 0n;
    num = (num << 8n) + BigInt(buffer[offset + 7]);
    num = (num << 8n) + BigInt(buffer[offset + 6]);
    num = (num << 8n) + BigInt(buffer[offset + 5]);
    num = (num << 8n) + BigInt(buffer[offset + 4]);
    num = (num << 8n) + BigInt(buffer[offset + 3]);
    num = (num << 8n) + BigInt(buffer[offset + 2]);
    num = (num << 8n) + BigInt(buffer[offset + 1]);
    num = (num << 8n) + BigInt(buffer[offset]);
    return num;
  } else {
    let num = 0n;
    num = (num << 8n) + BigInt(buffer[offset]);
    num = (num << 8n) + BigInt(buffer[offset + 1]);
    num = (num << 8n) + BigInt(buffer[offset + 2]);
    num = (num << 8n) + BigInt(buffer[offset + 3]);
    num = (num << 8n) + BigInt(buffer[offset + 4]);
    num = (num << 8n) + BigInt(buffer[offset + 5]);
    num = (num << 8n) + BigInt(buffer[offset + 6]);
    num = (num << 8n) + BigInt(buffer[offset + 7]);
    return num;
  }
}

// apps/frontend/node_modules/varuint-bitcoin/src/esm/index.js
var checkUInt64 = (n) => {
  if (n < 0 || n > 0xffffffffffffffffn) {
    throw new RangeError("value out of range");
  }
};
function checkUInt53(n) {
  if (n < 0 || n > Number.MAX_SAFE_INTEGER || n % 1 !== 0)
    throw new RangeError("value out of range");
}
function checkUint53OrUint64(n) {
  if (typeof n === "number")
    checkUInt53(n);
  else
    checkUInt64(n);
}
function encode5(n, buffer, offset) {
  checkUint53OrUint64(n);
  if (offset === void 0)
    offset = 0;
  if (buffer === void 0) {
    buffer = new Uint8Array(encodingLength2(n));
  }
  let bytes = 0;
  if (n < 253) {
    buffer.set([Number(n)], offset);
    bytes = 1;
  } else if (n <= 65535) {
    buffer.set([253], offset);
    writeUInt162(buffer, offset + 1, Number(n), "LE");
    bytes = 3;
  } else if (n <= 4294967295) {
    buffer.set([254], offset);
    writeUInt322(buffer, offset + 1, Number(n), "LE");
    bytes = 5;
  } else {
    buffer.set([255], offset);
    writeUInt642(buffer, offset + 1, BigInt(n), "LE");
    bytes = 9;
  }
  return { buffer, bytes };
}
function decode5(buffer, offset) {
  if (offset === void 0)
    offset = 0;
  const first = buffer.at(offset);
  if (first === void 0)
    throw new Error("buffer too small");
  if (first < 253) {
    return { numberValue: first, bigintValue: BigInt(first), bytes: 1 };
  } else if (first === 253) {
    const val = readUInt162(buffer, offset + 1, "LE");
    return {
      numberValue: val,
      bigintValue: BigInt(val),
      bytes: 3
    };
  } else if (first === 254) {
    const val = readUInt322(buffer, offset + 1, "LE");
    return {
      numberValue: val,
      bigintValue: BigInt(val),
      bytes: 5
    };
  } else {
    const number2 = readUInt64(buffer, offset + 1, "LE");
    return { numberValue: number2 <= Number.MAX_SAFE_INTEGER ? Number(number2) : null, bigintValue: number2, bytes: 9 };
  }
}
function encodingLength2(n) {
  checkUint53OrUint64(n);
  return n < 253 ? 1 : n <= 65535 ? 3 : n <= 4294967295 ? 5 : 9;
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/bufferutils.js
var MAX_JS_NUMBER = 9007199254740991;
function verifuint(value2, max) {
  if (typeof value2 !== "number" && typeof value2 !== "bigint")
    throw new Error("cannot write a non-number as a number");
  if (value2 < 0 && value2 < BigInt(0))
    throw new Error("specified a negative value for writing an unsigned value");
  if (value2 > max && value2 > BigInt(max))
    throw new Error("RangeError: value out of range");
  if (Math.floor(Number(value2)) !== Number(value2))
    throw new Error("value has a fractional component");
}
function reverseBuffer(buffer) {
  if (buffer.length < 1) return buffer;
  let j = buffer.length - 1;
  let tmp = 0;
  for (let i = 0; i < buffer.length / 2; i++) {
    tmp = buffer[i];
    buffer[i] = buffer[j];
    buffer[j] = tmp;
    j--;
  }
  return buffer;
}
function cloneBuffer(buffer) {
  const clone = new Uint8Array(buffer.length);
  clone.set(buffer);
  return clone;
}
var BufferWriter = class _BufferWriter {
  buffer;
  offset;
  static withCapacity(size) {
    return new _BufferWriter(new Uint8Array(size));
  }
  constructor(buffer, offset = 0) {
    this.buffer = buffer;
    this.offset = offset;
    parse(tuple([BufferSchema, UInt32Schema]), [
      buffer,
      offset
    ]);
  }
  writeUInt8(i) {
    this.offset = writeUInt8(this.buffer, this.offset, i);
  }
  writeInt32(i) {
    this.offset = writeInt32(this.buffer, this.offset, i, "LE");
  }
  writeInt64(i) {
    this.offset = writeInt64(this.buffer, this.offset, BigInt(i), "LE");
  }
  writeUInt32(i) {
    this.offset = writeUInt32(this.buffer, this.offset, i, "LE");
  }
  writeUInt64(i) {
    this.offset = writeUInt64(this.buffer, this.offset, BigInt(i), "LE");
  }
  writeVarInt(i) {
    const { bytes } = encode5(i, this.buffer, this.offset);
    this.offset += bytes;
  }
  writeSlice(slice) {
    if (this.buffer.length < this.offset + slice.length) {
      throw new Error("Cannot write slice out of bounds");
    }
    this.buffer.set(slice, this.offset);
    this.offset += slice.length;
  }
  writeVarSlice(slice) {
    this.writeVarInt(slice.length);
    this.writeSlice(slice);
  }
  writeVector(vector) {
    this.writeVarInt(vector.length);
    vector.forEach((buf) => this.writeVarSlice(buf));
  }
  end() {
    if (this.buffer.length === this.offset) {
      return this.buffer;
    }
    throw new Error(`buffer size ${this.buffer.length}, offset ${this.offset}`);
  }
};
var BufferReader = class {
  buffer;
  offset;
  constructor(buffer, offset = 0) {
    this.buffer = buffer;
    this.offset = offset;
    parse(tuple([BufferSchema, UInt32Schema]), [
      buffer,
      offset
    ]);
  }
  readUInt8() {
    const result = readUInt8(this.buffer, this.offset);
    this.offset++;
    return result;
  }
  readInt32() {
    const result = readInt32(this.buffer, this.offset, "LE");
    this.offset += 4;
    return result;
  }
  readUInt32() {
    const result = readUInt32(this.buffer, this.offset, "LE");
    this.offset += 4;
    return result;
  }
  readInt64() {
    const result = readInt64(this.buffer, this.offset, "LE");
    this.offset += 8;
    return result;
  }
  readVarInt() {
    const { bigintValue, bytes } = decode5(this.buffer, this.offset);
    this.offset += bytes;
    return bigintValue;
  }
  readSlice(n) {
    verifuint(n, MAX_JS_NUMBER);
    const num = Number(n);
    if (this.buffer.length < this.offset + num) {
      throw new Error("Cannot read slice out of bounds");
    }
    const result = this.buffer.slice(this.offset, this.offset + num);
    this.offset += num;
    return result;
  }
  readVarSlice() {
    return this.readSlice(this.readVarInt());
  }
  readVector() {
    const count = this.readVarInt();
    const vector = [];
    for (let i = 0; i < count; i++) vector.push(this.readVarSlice());
    return vector;
  }
};

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/bip341.js
var LEAF_VERSION_TAPSCRIPT = 192;
var MAX_TAPTREE_DEPTH = 128;
var isHashBranch = (ht) => "left" in ht && "right" in ht;
function rootHashFromPath(controlBlock, leafHash) {
  if (controlBlock.length < 33)
    throw new TypeError(
      `The control-block length is too small. Got ${controlBlock.length}, expected min 33.`
    );
  const m = (controlBlock.length - 33) / 32;
  let kj = leafHash;
  for (let j = 0; j < m; j++) {
    const ej = controlBlock.slice(33 + 32 * j, 65 + 32 * j);
    if (compare(kj, ej) < 0) {
      kj = tapBranchHash(kj, ej);
    } else {
      kj = tapBranchHash(ej, kj);
    }
  }
  return kj;
}
function toHashTree(scriptTree) {
  if (isTapleaf(scriptTree)) return { hash: tapleafHash(scriptTree) };
  const hashes = [toHashTree(scriptTree[0]), toHashTree(scriptTree[1])];
  hashes.sort((a, b) => compare(a.hash, b.hash));
  const [left, right] = hashes;
  return {
    hash: tapBranchHash(left.hash, right.hash),
    left,
    right
  };
}
function findScriptPath(node, hash) {
  if (isHashBranch(node)) {
    const leftPath = findScriptPath(node.left, hash);
    if (leftPath !== void 0) return [...leftPath, node.right.hash];
    const rightPath = findScriptPath(node.right, hash);
    if (rightPath !== void 0) return [...rightPath, node.left.hash];
  } else if (compare(node.hash, hash) === 0) {
    return [];
  }
  return void 0;
}
function tapleafHash(leaf) {
  const version = leaf.version || LEAF_VERSION_TAPSCRIPT;
  return taggedHash(
    "TapLeaf",
    concat([Uint8Array.from([version]), serializeScript(leaf.output)])
  );
}
function tapTweakHash(pubKey, h) {
  return taggedHash(
    "TapTweak",
    concat(h ? [pubKey, h] : [pubKey])
  );
}
function tweakKey(pubKey, h) {
  if (!(pubKey instanceof Uint8Array)) return null;
  if (pubKey.length !== 32) return null;
  if (h && h.length !== 32) return null;
  const tweakHash = tapTweakHash(pubKey, h);
  const res = getEccLib().xOnlyPointAddTweak(pubKey, tweakHash);
  if (!res || res.xOnlyPubkey === null) return null;
  return {
    parity: res.parity,
    x: Uint8Array.from(res.xOnlyPubkey)
  };
}
function tapBranchHash(a, b) {
  return taggedHash("TapBranch", concat([a, b]));
}
function serializeScript(s) {
  const varintLen = esm_exports.encodingLength(s.length);
  const buffer = new Uint8Array(varintLen);
  esm_exports.encode(s.length, buffer);
  return concat([buffer, s]);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/payments/p2tr.js
var import_bech323 = __toESM(require_dist(), 1);
var OPS9 = OPS;
var TAPROOT_WITNESS_VERSION = 1;
var ANNEX_PREFIX = 80;
function p2tr(a, opts) {
  if (!a.address && !a.output && !a.pubkey && !a.internalPubkey && !(a.witness && a.witness.length > 1))
    throw new TypeError("Not enough data");
  opts = Object.assign({ validate: true }, opts || {});
  parse(
    partial(
      object({
        address: string(),
        input: NBufferSchemaFactory(0),
        network: object({}),
        output: NBufferSchemaFactory(34),
        internalPubkey: NBufferSchemaFactory(32),
        hash: NBufferSchemaFactory(32),
        // merkle root hash, the tweak
        pubkey: NBufferSchemaFactory(32),
        // tweaked with `hash` from `internalPubkey`
        signature: union([
          NBufferSchemaFactory(64),
          NBufferSchemaFactory(65)
        ]),
        witness: array(BufferSchema),
        scriptTree: custom(isTaptree, "Taptree is not of type isTaptree"),
        redeem: partial(
          object({
            output: BufferSchema,
            // tapleaf script
            redeemVersion: number(),
            // tapleaf version
            witness: array(BufferSchema)
          })
        ),
        redeemVersion: number()
      })
    ),
    a
  );
  const _address = value(() => {
    return fromBech32(a.address);
  });
  const _witness = value(() => {
    if (!a.witness || !a.witness.length) return;
    if (a.witness.length >= 2 && a.witness[a.witness.length - 1][0] === ANNEX_PREFIX) {
      return a.witness.slice(0, -1);
    }
    return a.witness.slice();
  });
  const _hashTree = value(() => {
    if (a.scriptTree) return toHashTree(a.scriptTree);
    if (a.hash) return { hash: a.hash };
    return;
  });
  const network = a.network || bitcoin;
  const o = { name: "p2tr", network };
  prop(o, "address", () => {
    if (!o.pubkey) return;
    const words = import_bech323.bech32m.toWords(o.pubkey);
    words.unshift(TAPROOT_WITNESS_VERSION);
    return import_bech323.bech32m.encode(network.bech32, words);
  });
  prop(o, "hash", () => {
    const hashTree = _hashTree();
    if (hashTree) return hashTree.hash;
    const w = _witness();
    if (w && w.length > 1) {
      const controlBlock = w[w.length - 1];
      const leafVersion = controlBlock[0] & TAPLEAF_VERSION_MASK;
      const script = w[w.length - 2];
      const leafHash = tapleafHash({ output: script, version: leafVersion });
      return rootHashFromPath(controlBlock, leafHash);
    }
    return null;
  });
  prop(o, "output", () => {
    if (!o.pubkey) return;
    return compile([OPS9.OP_1, o.pubkey]);
  });
  prop(o, "redeemVersion", () => {
    if (a.redeemVersion) return a.redeemVersion;
    if (a.redeem && a.redeem.redeemVersion !== void 0 && a.redeem.redeemVersion !== null) {
      return a.redeem.redeemVersion;
    }
    return LEAF_VERSION_TAPSCRIPT;
  });
  prop(o, "redeem", () => {
    const witness = _witness();
    if (!witness || witness.length < 2) return;
    return {
      output: witness[witness.length - 2],
      witness: witness.slice(0, -2),
      redeemVersion: witness[witness.length - 1][0] & TAPLEAF_VERSION_MASK
    };
  });
  prop(o, "pubkey", () => {
    if (a.pubkey) return a.pubkey;
    if (a.output) return a.output.slice(2);
    if (a.address) return _address().data;
    if (o.internalPubkey) {
      const tweakedKey = tweakKey(o.internalPubkey, o.hash);
      if (tweakedKey) return tweakedKey.x;
    }
  });
  prop(o, "internalPubkey", () => {
    if (a.internalPubkey) return a.internalPubkey;
    const witness = _witness();
    if (witness && witness.length > 1)
      return witness[witness.length - 1].slice(1, 33);
  });
  prop(o, "signature", () => {
    if (a.signature) return a.signature;
    const witness = _witness();
    if (!witness || witness.length !== 1) return;
    return witness[0];
  });
  prop(o, "witness", () => {
    if (a.witness) return a.witness;
    const hashTree = _hashTree();
    if (hashTree && a.redeem && a.redeem.output && a.internalPubkey) {
      const leafHash = tapleafHash({
        output: a.redeem.output,
        version: o.redeemVersion
      });
      const path = findScriptPath(hashTree, leafHash);
      if (!path) return;
      const outputKey = tweakKey(a.internalPubkey, hashTree.hash);
      if (!outputKey) return;
      const controlBock = concat(
        [
          Uint8Array.from([o.redeemVersion | outputKey.parity]),
          a.internalPubkey
        ].concat(path)
      );
      return [a.redeem.output, controlBock];
    }
    if (a.signature) return [a.signature];
  });
  if (opts.validate) {
    let pubkey = Uint8Array.from([]);
    if (a.address) {
      if (network && network.bech32 !== _address().prefix)
        throw new TypeError("Invalid prefix or Network mismatch");
      if (_address().version !== TAPROOT_WITNESS_VERSION)
        throw new TypeError("Invalid address version");
      if (_address().data.length !== 32)
        throw new TypeError("Invalid address data");
      pubkey = _address().data;
    }
    if (a.pubkey) {
      if (pubkey.length > 0 && compare(pubkey, a.pubkey) !== 0)
        throw new TypeError("Pubkey mismatch");
      else pubkey = a.pubkey;
    }
    if (a.output) {
      if (a.output.length !== 34 || a.output[0] !== OPS9.OP_1 || a.output[1] !== 32)
        throw new TypeError("Output is invalid");
      if (pubkey.length > 0 && compare(pubkey, a.output.slice(2)) !== 0)
        throw new TypeError("Pubkey mismatch");
      else pubkey = a.output.slice(2);
    }
    if (a.internalPubkey) {
      const tweakedKey = tweakKey(a.internalPubkey, o.hash);
      if (pubkey.length > 0 && compare(pubkey, tweakedKey.x) !== 0)
        throw new TypeError("Pubkey mismatch");
      else pubkey = tweakedKey.x;
    }
    if (pubkey && pubkey.length) {
      if (!getEccLib().isXOnlyPoint(pubkey))
        throw new TypeError("Invalid pubkey for p2tr");
    }
    const hashTree = _hashTree();
    if (a.hash && hashTree) {
      if (compare(a.hash, hashTree.hash) !== 0)
        throw new TypeError("Hash mismatch");
    }
    if (a.redeem && a.redeem.output && hashTree) {
      const leafHash = tapleafHash({
        output: a.redeem.output,
        version: o.redeemVersion
      });
      if (!findScriptPath(hashTree, leafHash))
        throw new TypeError("Redeem script not in tree");
    }
    const witness = _witness();
    if (a.redeem && o.redeem) {
      if (a.redeem.redeemVersion) {
        if (a.redeem.redeemVersion !== o.redeem.redeemVersion)
          throw new TypeError("Redeem.redeemVersion and witness mismatch");
      }
      if (a.redeem.output) {
        if (decompile(a.redeem.output).length === 0)
          throw new TypeError("Redeem.output is invalid");
        if (o.redeem.output && compare(a.redeem.output, o.redeem.output) !== 0)
          throw new TypeError("Redeem.output and witness mismatch");
      }
      if (a.redeem.witness) {
        if (o.redeem.witness && !stacksEqual(a.redeem.witness, o.redeem.witness))
          throw new TypeError("Redeem.witness and witness mismatch");
      }
    }
    if (witness && witness.length) {
      if (witness.length === 1) {
        if (a.signature && compare(a.signature, witness[0]) !== 0)
          throw new TypeError("Signature mismatch");
      } else {
        const controlBlock = witness[witness.length - 1];
        if (controlBlock.length < 33)
          throw new TypeError(
            `The control-block length is too small. Got ${controlBlock.length}, expected min 33.`
          );
        if ((controlBlock.length - 33) % 32 !== 0)
          throw new TypeError(
            `The control-block length of ${controlBlock.length} is incorrect!`
          );
        const m = (controlBlock.length - 33) / 32;
        if (m > 128)
          throw new TypeError(
            `The script path is too long. Got ${m}, expected max 128.`
          );
        const internalPubkey = controlBlock.slice(1, 33);
        if (a.internalPubkey && compare(a.internalPubkey, internalPubkey) !== 0)
          throw new TypeError("Internal pubkey mismatch");
        if (!getEccLib().isXOnlyPoint(internalPubkey))
          throw new TypeError("Invalid internalPubkey for p2tr witness");
        const leafVersion = controlBlock[0] & TAPLEAF_VERSION_MASK;
        const script = witness[witness.length - 2];
        const leafHash = tapleafHash({ output: script, version: leafVersion });
        const hash = rootHashFromPath(controlBlock, leafHash);
        const outputKey = tweakKey(internalPubkey, hash);
        if (!outputKey)
          throw new TypeError("Invalid outputKey for p2tr witness");
        if (pubkey.length && compare(pubkey, outputKey.x) !== 0)
          throw new TypeError("Pubkey mismatch for p2tr witness");
        if (outputKey.parity !== (controlBlock[0] & 1))
          throw new Error("Incorrect parity");
      }
    }
  }
  return Object.assign(o, a);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/address.js
var import_bech324 = __toESM(require_dist(), 1);
var FUTURE_SEGWIT_MAX_SIZE = 40;
var FUTURE_SEGWIT_MIN_SIZE = 2;
var FUTURE_SEGWIT_MAX_VERSION = 16;
var FUTURE_SEGWIT_MIN_VERSION = 2;
var FUTURE_SEGWIT_VERSION_DIFF = 80;
var FUTURE_SEGWIT_VERSION_WARNING = "WARNING: Sending to a future segwit version address can lead to loss of funds. End users MUST be warned carefully in the GUI and asked if they wish to proceed with caution. Wallets should verify the segwit version from the output of fromBech32, then decide when it is safe to use which version of segwit.";
var WARNING_STATES = [false, false];
function _toFutureSegwitAddress(output, network) {
  const data = output.slice(2);
  if (data.length < FUTURE_SEGWIT_MIN_SIZE || data.length > FUTURE_SEGWIT_MAX_SIZE)
    throw new TypeError("Invalid program length for segwit address");
  const version = output[0] - FUTURE_SEGWIT_VERSION_DIFF;
  if (version < FUTURE_SEGWIT_MIN_VERSION || version > FUTURE_SEGWIT_MAX_VERSION)
    throw new TypeError("Invalid version for segwit address");
  if (output[1] !== data.length)
    throw new TypeError("Invalid script for segwit address");
  if (WARNING_STATES[0] === false) {
    console.warn(FUTURE_SEGWIT_VERSION_WARNING);
    WARNING_STATES[0] = true;
  }
  return toBech32(data, version, network.bech32);
}
function fromBase58Check(address) {
  const payload = esm_default3.decode(address);
  if (payload.length < 21) throw new TypeError(address + " is too short");
  if (payload.length > 21) throw new TypeError(address + " is too long");
  const version = readUInt8(payload, 0);
  const hash = payload.slice(1);
  return { version, hash };
}
function fromBech32(address) {
  let result;
  let version;
  try {
    result = import_bech324.bech32.decode(address);
  } catch (e) {
  }
  if (result) {
    version = result.words[0];
    if (version !== 0) throw new TypeError(address + " uses wrong encoding");
  } else {
    result = import_bech324.bech32m.decode(address);
    version = result.words[0];
    if (version === 0) throw new TypeError(address + " uses wrong encoding");
  }
  const data = import_bech324.bech32.fromWords(result.words.slice(1));
  return {
    version,
    prefix: result.prefix,
    data: Uint8Array.from(data)
  };
}
function toBech32(data, version, prefix) {
  const words = import_bech324.bech32.toWords(data);
  words.unshift(version);
  return version === 0 ? import_bech324.bech32.encode(prefix, words) : import_bech324.bech32m.encode(prefix, words);
}
function fromOutputScript(output, network) {
  network = network || bitcoin;
  try {
    return p2pkh({ output, network }).address;
  } catch (e) {
  }
  try {
    return p2sh({ output, network }).address;
  } catch (e) {
  }
  try {
    return p2wpkh({ output, network }).address;
  } catch (e) {
  }
  try {
    return p2wsh({ output, network }).address;
  } catch (e) {
  }
  try {
    return p2tr({ output, network }).address;
  } catch (e) {
  }
  try {
    return _toFutureSegwitAddress(output, network);
  } catch (e) {
  }
  throw new Error(toASM(output) + " has no matching Address");
}
function toOutputScript(address, network) {
  network = network || bitcoin;
  let decodeBase58;
  let decodeBech32;
  try {
    decodeBase58 = fromBase58Check(address);
  } catch (e) {
  }
  if (decodeBase58) {
    if (decodeBase58.version === network.pubKeyHash)
      return p2pkh({ hash: decodeBase58.hash }).output;
    if (decodeBase58.version === network.scriptHash)
      return p2sh({ hash: decodeBase58.hash }).output;
  } else {
    try {
      decodeBech32 = fromBech32(address);
    } catch (e) {
    }
    if (decodeBech32) {
      if (decodeBech32.prefix !== network.bech32)
        throw new Error(address + " has an invalid prefix");
      if (decodeBech32.version === 0) {
        if (decodeBech32.data.length === 20)
          return p2wpkh({ hash: decodeBech32.data }).output;
        if (decodeBech32.data.length === 32)
          return p2wsh({ hash: decodeBech32.data }).output;
      } else if (decodeBech32.version === 1) {
        if (decodeBech32.data.length === 32)
          return p2tr({ pubkey: decodeBech32.data }).output;
      } else if (decodeBech32.version >= FUTURE_SEGWIT_MIN_VERSION && decodeBech32.version <= FUTURE_SEGWIT_MAX_VERSION && decodeBech32.data.length >= FUTURE_SEGWIT_MIN_SIZE && decodeBech32.data.length <= FUTURE_SEGWIT_MAX_SIZE) {
        if (WARNING_STATES[1] === false) {
          console.warn(FUTURE_SEGWIT_VERSION_WARNING);
          WARNING_STATES[1] = true;
        }
        return compile([
          decodeBech32.version + FUTURE_SEGWIT_VERSION_DIFF,
          decodeBech32.data
        ]);
      }
    }
  }
  throw new Error(address + " has no matching Script");
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/transaction.js
function varSliceSize(someScript) {
  const length2 = someScript.length;
  return esm_exports.encodingLength(length2) + length2;
}
function vectorSize(someVector) {
  const length2 = someVector.length;
  return esm_exports.encodingLength(length2) + someVector.reduce((sum, witness) => {
    return sum + varSliceSize(witness);
  }, 0);
}
var EMPTY_BUFFER3 = new Uint8Array(0);
var EMPTY_WITNESS = [];
var ZERO2 = fromHex(
  "0000000000000000000000000000000000000000000000000000000000000000"
);
var ONE = fromHex(
  "0000000000000000000000000000000000000000000000000000000000000001"
);
var VALUE_UINT64_MAX = fromHex("ffffffffffffffff");
var BLANK_OUTPUT = {
  script: EMPTY_BUFFER3,
  valueBuffer: VALUE_UINT64_MAX
};
function isOutput(out) {
  return out.value !== void 0;
}
var Transaction = class _Transaction {
  static DEFAULT_SEQUENCE = 4294967295;
  static SIGHASH_DEFAULT = 0;
  static SIGHASH_ALL = 1;
  static SIGHASH_NONE = 2;
  static SIGHASH_SINGLE = 3;
  static SIGHASH_ANYONECANPAY = 128;
  static SIGHASH_OUTPUT_MASK = 3;
  static SIGHASH_INPUT_MASK = 128;
  static ADVANCED_TRANSACTION_MARKER = 0;
  static ADVANCED_TRANSACTION_FLAG = 1;
  static fromBuffer(buffer, _NO_STRICT) {
    const bufferReader = new BufferReader(buffer);
    const tx = new _Transaction();
    tx.version = bufferReader.readUInt32();
    const marker = bufferReader.readUInt8();
    const flag = bufferReader.readUInt8();
    let hasWitnesses = false;
    if (marker === _Transaction.ADVANCED_TRANSACTION_MARKER && flag === _Transaction.ADVANCED_TRANSACTION_FLAG) {
      hasWitnesses = true;
    } else {
      bufferReader.offset -= 2;
    }
    const vinLen = bufferReader.readVarInt();
    for (let i = 0; i < vinLen; ++i) {
      tx.ins.push({
        hash: bufferReader.readSlice(32),
        index: bufferReader.readUInt32(),
        script: bufferReader.readVarSlice(),
        sequence: bufferReader.readUInt32(),
        witness: EMPTY_WITNESS
      });
    }
    const voutLen = bufferReader.readVarInt();
    for (let i = 0; i < voutLen; ++i) {
      tx.outs.push({
        value: bufferReader.readInt64(),
        script: bufferReader.readVarSlice()
      });
    }
    if (hasWitnesses) {
      for (let i = 0; i < vinLen; ++i) {
        tx.ins[i].witness = bufferReader.readVector();
      }
      if (!tx.hasWitnesses())
        throw new Error("Transaction has superfluous witness data");
    }
    tx.locktime = bufferReader.readUInt32();
    if (_NO_STRICT) return tx;
    if (bufferReader.offset !== buffer.length)
      throw new Error("Transaction has unexpected data");
    return tx;
  }
  static fromHex(hex) {
    return _Transaction.fromBuffer(fromHex(hex), false);
  }
  static isCoinbaseHash(buffer) {
    parse(Hash256bitSchema, buffer);
    for (let i = 0; i < 32; ++i) {
      if (buffer[i] !== 0) return false;
    }
    return true;
  }
  version = 1;
  locktime = 0;
  ins = [];
  outs = [];
  isCoinbase() {
    return this.ins.length === 1 && _Transaction.isCoinbaseHash(this.ins[0].hash);
  }
  addInput(hash, index, sequence, scriptSig) {
    parse(
      tuple([
        Hash256bitSchema,
        UInt32Schema,
        nullable(optional(UInt32Schema)),
        nullable(optional(BufferSchema))
      ]),
      [hash, index, sequence, scriptSig]
    );
    if (sequence === void 0 || sequence === null) {
      sequence = _Transaction.DEFAULT_SEQUENCE;
    }
    return this.ins.push({
      hash,
      index,
      script: scriptSig || EMPTY_BUFFER3,
      sequence,
      witness: EMPTY_WITNESS
    }) - 1;
  }
  addOutput(scriptPubKey, value2) {
    parse(tuple([BufferSchema, SatoshiSchema]), [
      scriptPubKey,
      value2
    ]);
    return this.outs.push({
      script: scriptPubKey,
      value: value2
    }) - 1;
  }
  hasWitnesses() {
    return this.ins.some((x) => {
      return x.witness.length !== 0;
    });
  }
  stripWitnesses() {
    this.ins.forEach((input) => {
      input.witness = EMPTY_WITNESS;
    });
  }
  weight() {
    const base2 = this.byteLength(false);
    const total = this.byteLength(true);
    return base2 * 3 + total;
  }
  virtualSize() {
    return Math.ceil(this.weight() / 4);
  }
  byteLength(_ALLOW_WITNESS = true) {
    const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
    return (hasWitnesses ? 10 : 8) + esm_exports.encodingLength(this.ins.length) + esm_exports.encodingLength(this.outs.length) + this.ins.reduce((sum, input) => {
      return sum + 40 + varSliceSize(input.script);
    }, 0) + this.outs.reduce((sum, output) => {
      return sum + 8 + varSliceSize(output.script);
    }, 0) + (hasWitnesses ? this.ins.reduce((sum, input) => {
      return sum + vectorSize(input.witness);
    }, 0) : 0);
  }
  clone() {
    const newTx = new _Transaction();
    newTx.version = this.version;
    newTx.locktime = this.locktime;
    newTx.ins = this.ins.map((txIn) => {
      return {
        hash: txIn.hash,
        index: txIn.index,
        script: txIn.script,
        sequence: txIn.sequence,
        witness: txIn.witness
      };
    });
    newTx.outs = this.outs.map((txOut) => {
      return {
        script: txOut.script,
        value: txOut.value
      };
    });
    return newTx;
  }
  /**
   * Hash transaction for signing a specific input.
   *
   * Bitcoin uses a different hash for each signed transaction input.
   * This method copies the transaction, makes the necessary changes based on the
   * hashType, and then hashes the result.
   * This hash can then be used to sign the provided transaction input.
   */
  hashForSignature(inIndex, prevOutScript, hashType) {
    parse(tuple([UInt32Schema, BufferSchema, number()]), [
      inIndex,
      prevOutScript,
      hashType
    ]);
    if (inIndex >= this.ins.length) return ONE;
    const ourScript = compile(
      decompile(prevOutScript).filter((x) => {
        return x !== OPS.OP_CODESEPARATOR;
      })
    );
    const txTmp = this.clone();
    if ((hashType & 31) === _Transaction.SIGHASH_NONE) {
      txTmp.outs = [];
      txTmp.ins.forEach((input, i) => {
        if (i === inIndex) return;
        input.sequence = 0;
      });
    } else if ((hashType & 31) === _Transaction.SIGHASH_SINGLE) {
      if (inIndex >= this.outs.length) return ONE;
      txTmp.outs.length = inIndex + 1;
      for (let i = 0; i < inIndex; i++) {
        txTmp.outs[i] = BLANK_OUTPUT;
      }
      txTmp.ins.forEach((input, y) => {
        if (y === inIndex) return;
        input.sequence = 0;
      });
    }
    if (hashType & _Transaction.SIGHASH_ANYONECANPAY) {
      txTmp.ins = [txTmp.ins[inIndex]];
      txTmp.ins[0].script = ourScript;
    } else {
      txTmp.ins.forEach((input) => {
        input.script = EMPTY_BUFFER3;
      });
      txTmp.ins[inIndex].script = ourScript;
    }
    const buffer = new Uint8Array(txTmp.byteLength(false) + 4);
    writeInt32(buffer, buffer.length - 4, hashType, "LE");
    txTmp.__toBuffer(buffer, 0, false);
    return hash256(buffer);
  }
  hashForWitnessV1(inIndex, prevOutScripts, values, hashType, leafHash, annex) {
    parse(
      tuple([
        UInt32Schema,
        array(BufferSchema),
        array(SatoshiSchema),
        UInt32Schema
      ]),
      [inIndex, prevOutScripts, values, hashType]
    );
    if (values.length !== this.ins.length || prevOutScripts.length !== this.ins.length) {
      throw new Error("Must supply prevout script and value for all inputs");
    }
    const outputType = hashType === _Transaction.SIGHASH_DEFAULT ? _Transaction.SIGHASH_ALL : hashType & _Transaction.SIGHASH_OUTPUT_MASK;
    const inputType = hashType & _Transaction.SIGHASH_INPUT_MASK;
    const isAnyoneCanPay = inputType === _Transaction.SIGHASH_ANYONECANPAY;
    const isNone = outputType === _Transaction.SIGHASH_NONE;
    const isSingle = outputType === _Transaction.SIGHASH_SINGLE;
    let hashPrevouts = EMPTY_BUFFER3;
    let hashAmounts = EMPTY_BUFFER3;
    let hashScriptPubKeys = EMPTY_BUFFER3;
    let hashSequences = EMPTY_BUFFER3;
    let hashOutputs = EMPTY_BUFFER3;
    if (!isAnyoneCanPay) {
      let bufferWriter = BufferWriter.withCapacity(36 * this.ins.length);
      this.ins.forEach((txIn) => {
        bufferWriter.writeSlice(txIn.hash);
        bufferWriter.writeUInt32(txIn.index);
      });
      hashPrevouts = sha2565(bufferWriter.end());
      bufferWriter = BufferWriter.withCapacity(8 * this.ins.length);
      values.forEach((value2) => bufferWriter.writeInt64(value2));
      hashAmounts = sha2565(bufferWriter.end());
      bufferWriter = BufferWriter.withCapacity(
        prevOutScripts.map(varSliceSize).reduce((a, b) => a + b)
      );
      prevOutScripts.forEach(
        (prevOutScript) => bufferWriter.writeVarSlice(prevOutScript)
      );
      hashScriptPubKeys = sha2565(bufferWriter.end());
      bufferWriter = BufferWriter.withCapacity(4 * this.ins.length);
      this.ins.forEach((txIn) => bufferWriter.writeUInt32(txIn.sequence));
      hashSequences = sha2565(bufferWriter.end());
    }
    if (!(isNone || isSingle)) {
      if (!this.outs.length)
        throw new Error("Add outputs to the transaction before signing.");
      const txOutsSize = this.outs.map((output) => 8 + varSliceSize(output.script)).reduce((a, b) => a + b);
      const bufferWriter = BufferWriter.withCapacity(txOutsSize);
      this.outs.forEach((out) => {
        bufferWriter.writeInt64(out.value);
        bufferWriter.writeVarSlice(out.script);
      });
      hashOutputs = sha2565(bufferWriter.end());
    } else if (isSingle && inIndex < this.outs.length) {
      const output = this.outs[inIndex];
      const bufferWriter = BufferWriter.withCapacity(
        8 + varSliceSize(output.script)
      );
      bufferWriter.writeInt64(output.value);
      bufferWriter.writeVarSlice(output.script);
      hashOutputs = sha2565(bufferWriter.end());
    }
    const spendType = (leafHash ? 2 : 0) + (annex ? 1 : 0);
    const sigMsgSize = 174 - (isAnyoneCanPay ? 49 : 0) - (isNone ? 32 : 0) + (annex ? 32 : 0) + (leafHash ? 37 : 0);
    const sigMsgWriter = BufferWriter.withCapacity(sigMsgSize);
    sigMsgWriter.writeUInt8(hashType);
    sigMsgWriter.writeUInt32(this.version);
    sigMsgWriter.writeUInt32(this.locktime);
    sigMsgWriter.writeSlice(hashPrevouts);
    sigMsgWriter.writeSlice(hashAmounts);
    sigMsgWriter.writeSlice(hashScriptPubKeys);
    sigMsgWriter.writeSlice(hashSequences);
    if (!(isNone || isSingle)) {
      sigMsgWriter.writeSlice(hashOutputs);
    }
    sigMsgWriter.writeUInt8(spendType);
    if (isAnyoneCanPay) {
      const input = this.ins[inIndex];
      sigMsgWriter.writeSlice(input.hash);
      sigMsgWriter.writeUInt32(input.index);
      sigMsgWriter.writeInt64(values[inIndex]);
      sigMsgWriter.writeVarSlice(prevOutScripts[inIndex]);
      sigMsgWriter.writeUInt32(input.sequence);
    } else {
      sigMsgWriter.writeUInt32(inIndex);
    }
    if (annex) {
      const bufferWriter = BufferWriter.withCapacity(varSliceSize(annex));
      bufferWriter.writeVarSlice(annex);
      sigMsgWriter.writeSlice(sha2565(bufferWriter.end()));
    }
    if (isSingle) {
      sigMsgWriter.writeSlice(hashOutputs);
    }
    if (leafHash) {
      sigMsgWriter.writeSlice(leafHash);
      sigMsgWriter.writeUInt8(0);
      sigMsgWriter.writeUInt32(4294967295);
    }
    return taggedHash(
      "TapSighash",
      concat([Uint8Array.from([0]), sigMsgWriter.end()])
    );
  }
  hashForWitnessV0(inIndex, prevOutScript, value2, hashType) {
    parse(
      tuple([
        UInt32Schema,
        BufferSchema,
        SatoshiSchema,
        UInt32Schema
      ]),
      [inIndex, prevOutScript, value2, hashType]
    );
    let tbuffer = Uint8Array.from([]);
    let bufferWriter;
    let hashOutputs = ZERO2;
    let hashPrevouts = ZERO2;
    let hashSequence = ZERO2;
    if (!(hashType & _Transaction.SIGHASH_ANYONECANPAY)) {
      tbuffer = new Uint8Array(36 * this.ins.length);
      bufferWriter = new BufferWriter(tbuffer, 0);
      this.ins.forEach((txIn) => {
        bufferWriter.writeSlice(txIn.hash);
        bufferWriter.writeUInt32(txIn.index);
      });
      hashPrevouts = hash256(tbuffer);
    }
    if (!(hashType & _Transaction.SIGHASH_ANYONECANPAY) && (hashType & 31) !== _Transaction.SIGHASH_SINGLE && (hashType & 31) !== _Transaction.SIGHASH_NONE) {
      tbuffer = new Uint8Array(4 * this.ins.length);
      bufferWriter = new BufferWriter(tbuffer, 0);
      this.ins.forEach((txIn) => {
        bufferWriter.writeUInt32(txIn.sequence);
      });
      hashSequence = hash256(tbuffer);
    }
    if ((hashType & 31) !== _Transaction.SIGHASH_SINGLE && (hashType & 31) !== _Transaction.SIGHASH_NONE) {
      const txOutsSize = this.outs.reduce((sum, output) => {
        return sum + 8 + varSliceSize(output.script);
      }, 0);
      tbuffer = new Uint8Array(txOutsSize);
      bufferWriter = new BufferWriter(tbuffer, 0);
      this.outs.forEach((out) => {
        bufferWriter.writeInt64(out.value);
        bufferWriter.writeVarSlice(out.script);
      });
      hashOutputs = hash256(tbuffer);
    } else if ((hashType & 31) === _Transaction.SIGHASH_SINGLE && inIndex < this.outs.length) {
      const output = this.outs[inIndex];
      tbuffer = new Uint8Array(8 + varSliceSize(output.script));
      bufferWriter = new BufferWriter(tbuffer, 0);
      bufferWriter.writeInt64(output.value);
      bufferWriter.writeVarSlice(output.script);
      hashOutputs = hash256(tbuffer);
    }
    tbuffer = new Uint8Array(156 + varSliceSize(prevOutScript));
    bufferWriter = new BufferWriter(tbuffer, 0);
    const input = this.ins[inIndex];
    bufferWriter.writeUInt32(this.version);
    bufferWriter.writeSlice(hashPrevouts);
    bufferWriter.writeSlice(hashSequence);
    bufferWriter.writeSlice(input.hash);
    bufferWriter.writeUInt32(input.index);
    bufferWriter.writeVarSlice(prevOutScript);
    bufferWriter.writeInt64(value2);
    bufferWriter.writeUInt32(input.sequence);
    bufferWriter.writeSlice(hashOutputs);
    bufferWriter.writeUInt32(this.locktime);
    bufferWriter.writeUInt32(hashType);
    return hash256(tbuffer);
  }
  getHash(forWitness) {
    if (forWitness && this.isCoinbase()) return new Uint8Array(32);
    return hash256(this.__toBuffer(void 0, void 0, forWitness));
  }
  getId() {
    return toHex(reverseBuffer(this.getHash(false)));
  }
  toBuffer(buffer, initialOffset) {
    return this.__toBuffer(buffer, initialOffset, true);
  }
  toHex() {
    return toHex(this.toBuffer(void 0, void 0));
  }
  setInputScript(index, scriptSig) {
    parse(tuple([number(), BufferSchema]), [index, scriptSig]);
    this.ins[index].script = scriptSig;
  }
  setWitness(index, witness) {
    parse(tuple([number(), array(BufferSchema)]), [
      index,
      witness
    ]);
    this.ins[index].witness = witness;
  }
  __toBuffer(buffer, initialOffset, _ALLOW_WITNESS = false) {
    if (!buffer) buffer = new Uint8Array(this.byteLength(_ALLOW_WITNESS));
    const bufferWriter = new BufferWriter(buffer, initialOffset || 0);
    bufferWriter.writeUInt32(this.version);
    const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
    if (hasWitnesses) {
      bufferWriter.writeUInt8(_Transaction.ADVANCED_TRANSACTION_MARKER);
      bufferWriter.writeUInt8(_Transaction.ADVANCED_TRANSACTION_FLAG);
    }
    bufferWriter.writeVarInt(this.ins.length);
    this.ins.forEach((txIn) => {
      bufferWriter.writeSlice(txIn.hash);
      bufferWriter.writeUInt32(txIn.index);
      bufferWriter.writeVarSlice(txIn.script);
      bufferWriter.writeUInt32(txIn.sequence);
    });
    bufferWriter.writeVarInt(this.outs.length);
    this.outs.forEach((txOut) => {
      if (isOutput(txOut)) {
        bufferWriter.writeInt64(txOut.value);
      } else {
        bufferWriter.writeSlice(txOut.valueBuffer);
      }
      bufferWriter.writeVarSlice(txOut.script);
    });
    if (hasWitnesses) {
      this.ins.forEach((input) => {
        bufferWriter.writeVector(input.witness);
      });
    }
    bufferWriter.writeUInt32(this.locktime);
    if (initialOffset !== void 0)
      return buffer.slice(initialOffset, bufferWriter.offset);
    return buffer;
  }
};

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/block.js
var errorMerkleNoTxes = new TypeError(
  "Cannot compute merkle root for zero transactions"
);
var errorWitnessNotSegwit = new TypeError(
  "Cannot compute witness commit for non-segwit block"
);

// apps/frontend/node_modules/bip174/src/esm/lib/converter/index.js
var converter_exports = {};
__export(converter_exports, {
  globals: () => globals,
  inputs: () => inputs,
  outputs: () => outputs
});

// apps/frontend/node_modules/bip174/src/esm/lib/typeFields.js
var GlobalTypes;
(function(GlobalTypes2) {
  GlobalTypes2[GlobalTypes2["UNSIGNED_TX"] = 0] = "UNSIGNED_TX";
  GlobalTypes2[GlobalTypes2["GLOBAL_XPUB"] = 1] = "GLOBAL_XPUB";
})(GlobalTypes || (GlobalTypes = {}));
var InputTypes;
(function(InputTypes2) {
  InputTypes2[InputTypes2["NON_WITNESS_UTXO"] = 0] = "NON_WITNESS_UTXO";
  InputTypes2[InputTypes2["WITNESS_UTXO"] = 1] = "WITNESS_UTXO";
  InputTypes2[InputTypes2["PARTIAL_SIG"] = 2] = "PARTIAL_SIG";
  InputTypes2[InputTypes2["SIGHASH_TYPE"] = 3] = "SIGHASH_TYPE";
  InputTypes2[InputTypes2["REDEEM_SCRIPT"] = 4] = "REDEEM_SCRIPT";
  InputTypes2[InputTypes2["WITNESS_SCRIPT"] = 5] = "WITNESS_SCRIPT";
  InputTypes2[InputTypes2["BIP32_DERIVATION"] = 6] = "BIP32_DERIVATION";
  InputTypes2[InputTypes2["FINAL_SCRIPTSIG"] = 7] = "FINAL_SCRIPTSIG";
  InputTypes2[InputTypes2["FINAL_SCRIPTWITNESS"] = 8] = "FINAL_SCRIPTWITNESS";
  InputTypes2[InputTypes2["POR_COMMITMENT"] = 9] = "POR_COMMITMENT";
  InputTypes2[InputTypes2["TAP_KEY_SIG"] = 19] = "TAP_KEY_SIG";
  InputTypes2[InputTypes2["TAP_SCRIPT_SIG"] = 20] = "TAP_SCRIPT_SIG";
  InputTypes2[InputTypes2["TAP_LEAF_SCRIPT"] = 21] = "TAP_LEAF_SCRIPT";
  InputTypes2[InputTypes2["TAP_BIP32_DERIVATION"] = 22] = "TAP_BIP32_DERIVATION";
  InputTypes2[InputTypes2["TAP_INTERNAL_KEY"] = 23] = "TAP_INTERNAL_KEY";
  InputTypes2[InputTypes2["TAP_MERKLE_ROOT"] = 24] = "TAP_MERKLE_ROOT";
})(InputTypes || (InputTypes = {}));
var OutputTypes;
(function(OutputTypes2) {
  OutputTypes2[OutputTypes2["REDEEM_SCRIPT"] = 0] = "REDEEM_SCRIPT";
  OutputTypes2[OutputTypes2["WITNESS_SCRIPT"] = 1] = "WITNESS_SCRIPT";
  OutputTypes2[OutputTypes2["BIP32_DERIVATION"] = 2] = "BIP32_DERIVATION";
  OutputTypes2[OutputTypes2["TAP_INTERNAL_KEY"] = 5] = "TAP_INTERNAL_KEY";
  OutputTypes2[OutputTypes2["TAP_TREE"] = 6] = "TAP_TREE";
  OutputTypes2[OutputTypes2["TAP_BIP32_DERIVATION"] = 7] = "TAP_BIP32_DERIVATION";
})(OutputTypes || (OutputTypes = {}));

// apps/frontend/node_modules/bip174/src/esm/lib/converter/global/globalXpub.js
var globalXpub_exports = {};
__export(globalXpub_exports, {
  canAddToArray: () => canAddToArray,
  check: () => check2,
  decode: () => decode6,
  encode: () => encode6,
  expected: () => expected
});
var range = (n) => [...Array(n).keys()];
function decode6(keyVal) {
  if (keyVal.key[0] !== GlobalTypes.GLOBAL_XPUB) {
    throw new Error(
      "Decode Error: could not decode globalXpub with key 0x" + toHex(keyVal.key)
    );
  }
  if (keyVal.key.length !== 79 || ![2, 3].includes(keyVal.key[46])) {
    throw new Error(
      "Decode Error: globalXpub has invalid extended pubkey in key 0x" + toHex(keyVal.key)
    );
  }
  if (keyVal.value.length / 4 % 1 !== 0) {
    throw new Error(
      "Decode Error: Global GLOBAL_XPUB value length should be multiple of 4"
    );
  }
  const extendedPubkey = keyVal.key.slice(1);
  const data = {
    masterFingerprint: keyVal.value.slice(0, 4),
    extendedPubkey,
    path: "m"
  };
  for (const i of range(keyVal.value.length / 4 - 1)) {
    const val = readUInt32(keyVal.value, i * 4 + 4, "LE");
    const isHard = !!(val & 2147483648);
    const idx = val & 2147483647;
    data.path += "/" + idx.toString(10) + (isHard ? "'" : "");
  }
  return data;
}
function encode6(data) {
  const head = new Uint8Array([GlobalTypes.GLOBAL_XPUB]);
  const key = concat([head, data.extendedPubkey]);
  const splitPath = data.path.split("/");
  const value2 = new Uint8Array(splitPath.length * 4);
  value2.set(data.masterFingerprint, 0);
  let offset = 4;
  splitPath.slice(1).forEach((level) => {
    const isHard = level.slice(-1) === "'";
    let num = 2147483647 & parseInt(isHard ? level.slice(0, -1) : level, 10);
    if (isHard) num += 2147483648;
    writeUInt32(value2, offset, num, "LE");
    offset += 4;
  });
  return {
    key,
    value: value2
  };
}
var expected = "{ masterFingerprint: Uint8Array; extendedPubkey: Uint8Array; path: string; }";
function check2(data) {
  const epk = data.extendedPubkey;
  const mfp = data.masterFingerprint;
  const p = data.path;
  return epk instanceof Uint8Array && epk.length === 78 && [2, 3].indexOf(epk[45]) > -1 && mfp instanceof Uint8Array && mfp.length === 4 && typeof p === "string" && !!p.match(/^m(\/\d+'?)*$/);
}
function canAddToArray(array2, item, dupeSet) {
  const dupeString = toHex(item.extendedPubkey);
  if (dupeSet.has(dupeString)) return false;
  dupeSet.add(dupeString);
  return array2.filter((v) => compare(v.extendedPubkey, item.extendedPubkey)).length === 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/global/unsignedTx.js
var unsignedTx_exports = {};
__export(unsignedTx_exports, {
  encode: () => encode7
});
function encode7(data) {
  return {
    key: new Uint8Array([GlobalTypes.UNSIGNED_TX]),
    value: data.toBuffer()
  };
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/finalScriptSig.js
var finalScriptSig_exports = {};
__export(finalScriptSig_exports, {
  canAdd: () => canAdd,
  check: () => check3,
  decode: () => decode7,
  encode: () => encode8,
  expected: () => expected2
});
function decode7(keyVal) {
  if (keyVal.key[0] !== InputTypes.FINAL_SCRIPTSIG) {
    throw new Error(
      "Decode Error: could not decode finalScriptSig with key 0x" + toHex(keyVal.key)
    );
  }
  return keyVal.value;
}
function encode8(data) {
  const key = new Uint8Array([InputTypes.FINAL_SCRIPTSIG]);
  return {
    key,
    value: data
  };
}
var expected2 = "Uint8Array";
function check3(data) {
  return data instanceof Uint8Array;
}
function canAdd(currentData, newData) {
  return !!currentData && !!newData && currentData.finalScriptSig === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/finalScriptWitness.js
var finalScriptWitness_exports = {};
__export(finalScriptWitness_exports, {
  canAdd: () => canAdd2,
  check: () => check4,
  decode: () => decode8,
  encode: () => encode9,
  expected: () => expected3
});
function decode8(keyVal) {
  if (keyVal.key[0] !== InputTypes.FINAL_SCRIPTWITNESS) {
    throw new Error(
      "Decode Error: could not decode finalScriptWitness with key 0x" + toHex(keyVal.key)
    );
  }
  return keyVal.value;
}
function encode9(data) {
  const key = new Uint8Array([InputTypes.FINAL_SCRIPTWITNESS]);
  return {
    key,
    value: data
  };
}
var expected3 = "Uint8Array";
function check4(data) {
  return data instanceof Uint8Array;
}
function canAdd2(currentData, newData) {
  return !!currentData && !!newData && currentData.finalScriptWitness === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/nonWitnessUtxo.js
var nonWitnessUtxo_exports = {};
__export(nonWitnessUtxo_exports, {
  canAdd: () => canAdd3,
  check: () => check5,
  decode: () => decode9,
  encode: () => encode10,
  expected: () => expected4
});
function decode9(keyVal) {
  if (keyVal.key[0] !== InputTypes.NON_WITNESS_UTXO) {
    throw new Error(
      "Decode Error: could not decode nonWitnessUtxo with key 0x" + toHex(keyVal.key)
    );
  }
  return keyVal.value;
}
function encode10(data) {
  return {
    key: new Uint8Array([InputTypes.NON_WITNESS_UTXO]),
    value: data
  };
}
var expected4 = "Uint8Array";
function check5(data) {
  return data instanceof Uint8Array;
}
function canAdd3(currentData, newData) {
  return !!currentData && !!newData && currentData.nonWitnessUtxo === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/partialSig.js
var partialSig_exports = {};
__export(partialSig_exports, {
  canAddToArray: () => canAddToArray2,
  check: () => check6,
  decode: () => decode10,
  encode: () => encode11,
  expected: () => expected5
});
function decode10(keyVal) {
  if (keyVal.key[0] !== InputTypes.PARTIAL_SIG) {
    throw new Error(
      "Decode Error: could not decode partialSig with key 0x" + toHex(keyVal.key)
    );
  }
  if (!(keyVal.key.length === 34 || keyVal.key.length === 66) || ![2, 3, 4].includes(keyVal.key[1])) {
    throw new Error(
      "Decode Error: partialSig has invalid pubkey in key 0x" + toHex(keyVal.key)
    );
  }
  const pubkey = keyVal.key.slice(1);
  return {
    pubkey,
    signature: keyVal.value
  };
}
function encode11(pSig) {
  const head = new Uint8Array([InputTypes.PARTIAL_SIG]);
  return {
    key: concat([head, pSig.pubkey]),
    value: pSig.signature
  };
}
var expected5 = "{ pubkey: Uint8Array; signature: Uint8Array; }";
function check6(data) {
  return data.pubkey instanceof Uint8Array && data.signature instanceof Uint8Array && [33, 65].includes(data.pubkey.length) && [2, 3, 4].includes(data.pubkey[0]) && isDerSigWithSighash(data.signature);
}
function isDerSigWithSighash(buf) {
  if (!(buf instanceof Uint8Array) || buf.length < 9) return false;
  if (buf[0] !== 48) return false;
  if (buf.length !== buf[1] + 3) return false;
  if (buf[2] !== 2) return false;
  const rLen = buf[3];
  if (rLen > 33 || rLen < 1) return false;
  if (buf[3 + rLen + 1] !== 2) return false;
  const sLen = buf[3 + rLen + 2];
  if (sLen > 33 || sLen < 1) return false;
  if (buf.length !== 3 + rLen + 2 + sLen + 2) return false;
  return true;
}
function canAddToArray2(array2, item, dupeSet) {
  const dupeString = toHex(item.pubkey);
  if (dupeSet.has(dupeString)) return false;
  dupeSet.add(dupeString);
  return array2.filter((v) => compare(v.pubkey, item.pubkey) === 0).length === 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/porCommitment.js
var porCommitment_exports = {};
__export(porCommitment_exports, {
  canAdd: () => canAdd4,
  check: () => check7,
  decode: () => decode11,
  encode: () => encode12,
  expected: () => expected6
});
function decode11(keyVal) {
  if (keyVal.key[0] !== InputTypes.POR_COMMITMENT) {
    throw new Error(
      "Decode Error: could not decode porCommitment with key 0x" + toHex(keyVal.key)
    );
  }
  return toUtf8(keyVal.value);
}
function encode12(data) {
  const key = new Uint8Array([InputTypes.POR_COMMITMENT]);
  return {
    key,
    value: fromUtf8(data)
  };
}
var expected6 = "string";
function check7(data) {
  return typeof data === "string";
}
function canAdd4(currentData, newData) {
  return !!currentData && !!newData && currentData.porCommitment === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/sighashType.js
var sighashType_exports = {};
__export(sighashType_exports, {
  canAdd: () => canAdd5,
  check: () => check8,
  decode: () => decode12,
  encode: () => encode13,
  expected: () => expected7
});
function decode12(keyVal) {
  if (keyVal.key[0] !== InputTypes.SIGHASH_TYPE) {
    throw new Error(
      "Decode Error: could not decode sighashType with key 0x" + toHex(keyVal.key)
    );
  }
  return Number(readUInt32(keyVal.value, 0, "LE"));
}
function encode13(data) {
  const key = Uint8Array.from([InputTypes.SIGHASH_TYPE]);
  const value2 = new Uint8Array(4);
  writeUInt32(value2, 0, data, "LE");
  return {
    key,
    value: value2
  };
}
var expected7 = "number";
function check8(data) {
  return typeof data === "number";
}
function canAdd5(currentData, newData) {
  return !!currentData && !!newData && currentData.sighashType === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/tapKeySig.js
var tapKeySig_exports = {};
__export(tapKeySig_exports, {
  canAdd: () => canAdd6,
  check: () => check9,
  decode: () => decode13,
  encode: () => encode14,
  expected: () => expected8
});
function decode13(keyVal) {
  if (keyVal.key[0] !== InputTypes.TAP_KEY_SIG || keyVal.key.length !== 1) {
    throw new Error(
      "Decode Error: could not decode tapKeySig with key 0x" + toHex(keyVal.key)
    );
  }
  if (!check9(keyVal.value)) {
    throw new Error(
      "Decode Error: tapKeySig not a valid 64-65-byte BIP340 signature"
    );
  }
  return keyVal.value;
}
function encode14(value2) {
  const key = Uint8Array.from([InputTypes.TAP_KEY_SIG]);
  return { key, value: value2 };
}
var expected8 = "Uint8Array";
function check9(data) {
  return data instanceof Uint8Array && (data.length === 64 || data.length === 65);
}
function canAdd6(currentData, newData) {
  return !!currentData && !!newData && currentData.tapKeySig === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/tapLeafScript.js
var tapLeafScript_exports = {};
__export(tapLeafScript_exports, {
  canAddToArray: () => canAddToArray3,
  check: () => check10,
  decode: () => decode14,
  encode: () => encode15,
  expected: () => expected9
});
function decode14(keyVal) {
  if (keyVal.key[0] !== InputTypes.TAP_LEAF_SCRIPT) {
    throw new Error(
      "Decode Error: could not decode tapLeafScript with key 0x" + toHex(keyVal.key)
    );
  }
  if ((keyVal.key.length - 2) % 32 !== 0) {
    throw new Error(
      "Decode Error: tapLeafScript has invalid control block in key 0x" + toHex(keyVal.key)
    );
  }
  const leafVersion = keyVal.value[keyVal.value.length - 1];
  if ((keyVal.key[1] & 254) !== leafVersion) {
    throw new Error(
      "Decode Error: tapLeafScript bad leaf version in key 0x" + toHex(keyVal.key)
    );
  }
  const script = keyVal.value.slice(0, -1);
  const controlBlock = keyVal.key.slice(1);
  return { controlBlock, script, leafVersion };
}
function encode15(tScript) {
  const head = Uint8Array.from([InputTypes.TAP_LEAF_SCRIPT]);
  const verBuf = Uint8Array.from([tScript.leafVersion]);
  return {
    key: concat([head, tScript.controlBlock]),
    value: concat([tScript.script, verBuf])
  };
}
var expected9 = "{ controlBlock: Uint8Array; leafVersion: number, script: Uint8Array; }";
function check10(data) {
  return data.controlBlock instanceof Uint8Array && (data.controlBlock.length - 1) % 32 === 0 && (data.controlBlock[0] & 254) === data.leafVersion && data.script instanceof Uint8Array;
}
function canAddToArray3(array2, item, dupeSet) {
  const dupeString = toHex(item.controlBlock);
  if (dupeSet.has(dupeString)) return false;
  dupeSet.add(dupeString);
  return array2.filter((v) => compare(v.controlBlock, item.controlBlock) === 0).length === 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/tapMerkleRoot.js
var tapMerkleRoot_exports = {};
__export(tapMerkleRoot_exports, {
  canAdd: () => canAdd7,
  check: () => check11,
  decode: () => decode15,
  encode: () => encode16,
  expected: () => expected10
});
function decode15(keyVal) {
  if (keyVal.key[0] !== InputTypes.TAP_MERKLE_ROOT || keyVal.key.length !== 1) {
    throw new Error(
      "Decode Error: could not decode tapMerkleRoot with key 0x" + toHex(keyVal.key)
    );
  }
  if (!check11(keyVal.value)) {
    throw new Error("Decode Error: tapMerkleRoot not a 32-byte hash");
  }
  return keyVal.value;
}
function encode16(value2) {
  const key = Uint8Array.from([InputTypes.TAP_MERKLE_ROOT]);
  return { key, value: value2 };
}
var expected10 = "Uint8Array";
function check11(data) {
  return data instanceof Uint8Array && data.length === 32;
}
function canAdd7(currentData, newData) {
  return !!currentData && !!newData && currentData.tapMerkleRoot === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/tapScriptSig.js
var tapScriptSig_exports = {};
__export(tapScriptSig_exports, {
  canAddToArray: () => canAddToArray4,
  check: () => check12,
  decode: () => decode16,
  encode: () => encode17,
  expected: () => expected11
});
function decode16(keyVal) {
  if (keyVal.key[0] !== InputTypes.TAP_SCRIPT_SIG) {
    throw new Error(
      "Decode Error: could not decode tapScriptSig with key 0x" + toHex(keyVal.key)
    );
  }
  if (keyVal.key.length !== 65) {
    throw new Error(
      "Decode Error: tapScriptSig has invalid key 0x" + toHex(keyVal.key)
    );
  }
  if (keyVal.value.length !== 64 && keyVal.value.length !== 65) {
    throw new Error(
      "Decode Error: tapScriptSig has invalid signature in key 0x" + toHex(keyVal.key)
    );
  }
  const pubkey = keyVal.key.slice(1, 33);
  const leafHash = keyVal.key.slice(33);
  return {
    pubkey,
    leafHash,
    signature: keyVal.value
  };
}
function encode17(tSig) {
  const head = Uint8Array.from([InputTypes.TAP_SCRIPT_SIG]);
  return {
    key: concat([head, tSig.pubkey, tSig.leafHash]),
    value: tSig.signature
  };
}
var expected11 = "{ pubkey: Uint8Array; leafHash: Uint8Array; signature: Uint8Array; }";
function check12(data) {
  return data.pubkey instanceof Uint8Array && data.leafHash instanceof Uint8Array && data.signature instanceof Uint8Array && data.pubkey.length === 32 && data.leafHash.length === 32 && (data.signature.length === 64 || data.signature.length === 65);
}
function canAddToArray4(array2, item, dupeSet) {
  const dupeString = toHex(item.pubkey) + toHex(item.leafHash);
  if (dupeSet.has(dupeString)) return false;
  dupeSet.add(dupeString);
  return array2.filter(
    (v) => compare(v.pubkey, item.pubkey) === 0 && compare(v.leafHash, item.leafHash) === 0
  ).length === 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/input/witnessUtxo.js
var witnessUtxo_exports = {};
__export(witnessUtxo_exports, {
  canAdd: () => canAdd8,
  check: () => check13,
  decode: () => decode17,
  encode: () => encode18,
  expected: () => expected12
});
function decode17(keyVal) {
  if (keyVal.key[0] !== InputTypes.WITNESS_UTXO) {
    throw new Error(
      "Decode Error: could not decode witnessUtxo with key 0x" + toHex(keyVal.key)
    );
  }
  const value2 = readInt64(keyVal.value, 0, "LE");
  let _offset = 8;
  const { numberValue: scriptLen, bytes } = decode5(
    keyVal.value,
    _offset
  );
  _offset += bytes;
  const script = keyVal.value.slice(_offset);
  if (script.length !== scriptLen) {
    throw new Error("Decode Error: WITNESS_UTXO script is not proper length");
  }
  return {
    script,
    value: value2
  };
}
function encode18(data) {
  const { script, value: value2 } = data;
  const varuintlen = encodingLength2(script.length);
  const result = new Uint8Array(8 + varuintlen + script.length);
  writeInt64(result, 0, BigInt(value2), "LE");
  encode5(script.length, result, 8);
  result.set(script, 8 + varuintlen);
  return {
    key: Uint8Array.from([InputTypes.WITNESS_UTXO]),
    value: result
  };
}
var expected12 = "{ script: Uint8Array; value: bigint; }";
function check13(data) {
  return data.script instanceof Uint8Array && typeof data.value === "bigint";
}
function canAdd8(currentData, newData) {
  return !!currentData && !!newData && currentData.witnessUtxo === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/output/tapTree.js
var tapTree_exports = {};
__export(tapTree_exports, {
  canAdd: () => canAdd9,
  check: () => check14,
  decode: () => decode18,
  encode: () => encode19,
  expected: () => expected13
});
function decode18(keyVal) {
  if (keyVal.key[0] !== OutputTypes.TAP_TREE || keyVal.key.length !== 1) {
    throw new Error(
      "Decode Error: could not decode tapTree with key 0x" + toHex(keyVal.key)
    );
  }
  let _offset = 0;
  const data = [];
  while (_offset < keyVal.value.length) {
    const depth = keyVal.value[_offset++];
    const leafVersion = keyVal.value[_offset++];
    const { numberValue: scriptLen, bytes } = decode5(
      keyVal.value,
      _offset
    );
    _offset += bytes;
    data.push({
      depth,
      leafVersion,
      script: keyVal.value.slice(_offset, _offset + scriptLen)
    });
    _offset += scriptLen;
  }
  return { leaves: data };
}
function encode19(tree) {
  const key = Uint8Array.from([OutputTypes.TAP_TREE]);
  const bufs = [].concat(
    ...tree.leaves.map((tapLeaf) => [
      Uint8Array.of(tapLeaf.depth, tapLeaf.leafVersion),
      encode5(BigInt(tapLeaf.script.length)).buffer,
      tapLeaf.script
    ])
  );
  return {
    key,
    value: concat(bufs)
  };
}
var expected13 = "{ leaves: [{ depth: number; leafVersion: number, script: Uint8Array; }] }";
function check14(data) {
  return Array.isArray(data.leaves) && data.leaves.every(
    (tapLeaf) => tapLeaf.depth >= 0 && tapLeaf.depth <= 128 && (tapLeaf.leafVersion & 254) === tapLeaf.leafVersion && tapLeaf.script instanceof Uint8Array
  );
}
function canAdd9(currentData, newData) {
  return !!currentData && !!newData && currentData.tapTree === void 0;
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/shared/bip32Derivation.js
var range2 = (n) => [...Array(n).keys()];
var isValidDERKey = (pubkey) => pubkey.length === 33 && [2, 3].includes(pubkey[0]) || pubkey.length === 65 && 4 === pubkey[0];
function makeConverter(TYPE_BYTE, isValidPubkey = isValidDERKey) {
  function decode19(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        "Decode Error: could not decode bip32Derivation with key 0x" + toHex(keyVal.key)
      );
    }
    const pubkey = keyVal.key.slice(1);
    if (!isValidPubkey(pubkey)) {
      throw new Error(
        "Decode Error: bip32Derivation has invalid pubkey in key 0x" + toHex(keyVal.key)
      );
    }
    if (keyVal.value.length / 4 % 1 !== 0) {
      throw new Error(
        "Decode Error: Input BIP32_DERIVATION value length should be multiple of 4"
      );
    }
    const data = {
      masterFingerprint: keyVal.value.slice(0, 4),
      pubkey,
      path: "m"
    };
    for (const i of range2(keyVal.value.length / 4 - 1)) {
      const val = readUInt32(keyVal.value, i * 4 + 4, "LE");
      const isHard = !!(val & 2147483648);
      const idx = val & 2147483647;
      data.path += "/" + idx.toString(10) + (isHard ? "'" : "");
    }
    return data;
  }
  function encode20(data) {
    const head = Uint8Array.from([TYPE_BYTE]);
    const key = concat([head, data.pubkey]);
    const splitPath = data.path.split("/");
    const value2 = new Uint8Array(splitPath.length * 4);
    value2.set(data.masterFingerprint, 0);
    let offset = 4;
    splitPath.slice(1).forEach((level) => {
      const isHard = level.slice(-1) === "'";
      let num = 2147483647 & parseInt(isHard ? level.slice(0, -1) : level, 10);
      if (isHard) num += 2147483648;
      writeUInt32(value2, offset, num, "LE");
      offset += 4;
    });
    return {
      key,
      value: value2
    };
  }
  const expected14 = "{ masterFingerprint: Uint8Array; pubkey: Uint8Array; path: string; }";
  function check15(data) {
    return data.pubkey instanceof Uint8Array && data.masterFingerprint instanceof Uint8Array && typeof data.path === "string" && isValidPubkey(data.pubkey) && data.masterFingerprint.length === 4;
  }
  function canAddToArray5(array2, item, dupeSet) {
    const dupeString = toHex(item.pubkey);
    if (dupeSet.has(dupeString)) return false;
    dupeSet.add(dupeString);
    return array2.filter((v) => compare(v.pubkey, item.pubkey) === 0).length === 0;
  }
  return {
    decode: decode19,
    encode: encode20,
    check: check15,
    expected: expected14,
    canAddToArray: canAddToArray5
  };
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/shared/checkPubkey.js
function makeChecker(pubkeyTypes) {
  return checkPubkey;
  function checkPubkey(keyVal) {
    let pubkey;
    if (pubkeyTypes.includes(keyVal.key[0])) {
      pubkey = keyVal.key.slice(1);
      if (!(pubkey.length === 33 || pubkey.length === 65) || ![2, 3, 4].includes(pubkey[0])) {
        throw new Error(
          "Format Error: invalid pubkey in key 0x" + toHex(keyVal.key)
        );
      }
    }
    return pubkey;
  }
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/shared/redeemScript.js
function makeConverter2(TYPE_BYTE) {
  function decode19(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        "Decode Error: could not decode redeemScript with key 0x" + toHex(keyVal.key)
      );
    }
    return keyVal.value;
  }
  function encode20(data) {
    const key = Uint8Array.from([TYPE_BYTE]);
    return {
      key,
      value: data
    };
  }
  const expected14 = "Uint8Array";
  function check15(data) {
    return data instanceof Uint8Array;
  }
  function canAdd10(currentData, newData) {
    return !!currentData && !!newData && currentData.redeemScript === void 0;
  }
  return {
    decode: decode19,
    encode: encode20,
    check: check15,
    expected: expected14,
    canAdd: canAdd10
  };
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/shared/tapBip32Derivation.js
var isValidBIP340Key = (pubkey) => pubkey.length === 32;
function makeConverter3(TYPE_BYTE) {
  const parent = makeConverter(TYPE_BYTE, isValidBIP340Key);
  function decode19(keyVal) {
    const { numberValue: nHashes, bytes: nHashesLen } = decode5(
      keyVal.value
    );
    const base2 = parent.decode({
      key: keyVal.key,
      value: keyVal.value.slice(nHashesLen + Number(nHashes) * 32)
    });
    const leafHashes = new Array(Number(nHashes));
    for (let i = 0, _offset = nHashesLen; i < nHashes; i++, _offset += 32) {
      leafHashes[i] = keyVal.value.slice(_offset, _offset + 32);
    }
    return { ...base2, leafHashes };
  }
  function encode20(data) {
    const base2 = parent.encode(data);
    const nHashesLen = encodingLength2(data.leafHashes.length);
    const nHashesBuf = new Uint8Array(nHashesLen);
    encode5(data.leafHashes.length, nHashesBuf);
    const value2 = concat([nHashesBuf, ...data.leafHashes, base2.value]);
    return { ...base2, value: value2 };
  }
  const expected14 = "{ masterFingerprint: Uint8Array; pubkey: Uint8Array; path: string; leafHashes: Uint8Array[]; }";
  function check15(data) {
    return Array.isArray(data.leafHashes) && data.leafHashes.every(
      (leafHash) => leafHash instanceof Uint8Array && leafHash.length === 32
    ) && parent.check(data);
  }
  return {
    decode: decode19,
    encode: encode20,
    check: check15,
    expected: expected14,
    canAddToArray: parent.canAddToArray
  };
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/shared/tapInternalKey.js
function makeConverter4(TYPE_BYTE) {
  function decode19(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE || keyVal.key.length !== 1) {
      throw new Error(
        "Decode Error: could not decode tapInternalKey with key 0x" + toHex(keyVal.key)
      );
    }
    if (keyVal.value.length !== 32) {
      throw new Error(
        "Decode Error: tapInternalKey not a 32-byte x-only pubkey"
      );
    }
    return keyVal.value;
  }
  function encode20(value2) {
    const key = Uint8Array.from([TYPE_BYTE]);
    return { key, value: value2 };
  }
  const expected14 = "Uint8Array";
  function check15(data) {
    return data instanceof Uint8Array && data.length === 32;
  }
  function canAdd10(currentData, newData) {
    return !!currentData && !!newData && currentData.tapInternalKey === void 0;
  }
  return {
    decode: decode19,
    encode: encode20,
    check: check15,
    expected: expected14,
    canAdd: canAdd10
  };
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/shared/witnessScript.js
function makeConverter5(TYPE_BYTE) {
  function decode19(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        "Decode Error: could not decode witnessScript with key 0x" + toHex(keyVal.key)
      );
    }
    return keyVal.value;
  }
  function encode20(data) {
    const key = Uint8Array.from([TYPE_BYTE]);
    return {
      key,
      value: data
    };
  }
  const expected14 = "Uint8Array";
  function check15(data) {
    return data instanceof Uint8Array;
  }
  function canAdd10(currentData, newData) {
    return !!currentData && !!newData && currentData.witnessScript === void 0;
  }
  return {
    decode: decode19,
    encode: encode20,
    check: check15,
    expected: expected14,
    canAdd: canAdd10
  };
}

// apps/frontend/node_modules/bip174/src/esm/lib/converter/index.js
var globals = {
  unsignedTx: unsignedTx_exports,
  globalXpub: globalXpub_exports,
  // pass an Array of key bytes that require pubkey beside the key
  checkPubkey: makeChecker([])
};
var inputs = {
  nonWitnessUtxo: nonWitnessUtxo_exports,
  partialSig: partialSig_exports,
  sighashType: sighashType_exports,
  finalScriptSig: finalScriptSig_exports,
  finalScriptWitness: finalScriptWitness_exports,
  porCommitment: porCommitment_exports,
  witnessUtxo: witnessUtxo_exports,
  bip32Derivation: makeConverter(InputTypes.BIP32_DERIVATION),
  redeemScript: makeConverter2(InputTypes.REDEEM_SCRIPT),
  witnessScript: makeConverter5(InputTypes.WITNESS_SCRIPT),
  checkPubkey: makeChecker([
    InputTypes.PARTIAL_SIG,
    InputTypes.BIP32_DERIVATION
  ]),
  tapKeySig: tapKeySig_exports,
  tapScriptSig: tapScriptSig_exports,
  tapLeafScript: tapLeafScript_exports,
  tapBip32Derivation: makeConverter3(
    InputTypes.TAP_BIP32_DERIVATION
  ),
  tapInternalKey: makeConverter4(InputTypes.TAP_INTERNAL_KEY),
  tapMerkleRoot: tapMerkleRoot_exports
};
var outputs = {
  bip32Derivation: makeConverter(OutputTypes.BIP32_DERIVATION),
  redeemScript: makeConverter2(OutputTypes.REDEEM_SCRIPT),
  witnessScript: makeConverter5(OutputTypes.WITNESS_SCRIPT),
  checkPubkey: makeChecker([OutputTypes.BIP32_DERIVATION]),
  tapBip32Derivation: makeConverter3(
    OutputTypes.TAP_BIP32_DERIVATION
  ),
  tapTree: tapTree_exports,
  tapInternalKey: makeConverter4(OutputTypes.TAP_INTERNAL_KEY)
};

// apps/frontend/node_modules/bip174/src/esm/lib/converter/tools.js
var range3 = (n) => [...Array(n).keys()];
function keyValsToBuffer(keyVals) {
  const buffers = keyVals.map(keyValToBuffer);
  buffers.push(Uint8Array.from([0]));
  return concat(buffers);
}
function keyValToBuffer(keyVal) {
  const keyLen = keyVal.key.length;
  const valLen = keyVal.value.length;
  const keyVarIntLen = encodingLength2(keyLen);
  const valVarIntLen = encodingLength2(valLen);
  const buffer = new Uint8Array(keyVarIntLen + keyLen + valVarIntLen + valLen);
  encode5(keyLen, buffer, 0);
  buffer.set(keyVal.key, keyVarIntLen);
  encode5(valLen, buffer, keyVarIntLen + keyLen);
  buffer.set(keyVal.value, keyVarIntLen + keyLen + valVarIntLen);
  return buffer;
}

// apps/frontend/node_modules/bip174/src/esm/lib/parser/fromBuffer.js
function psbtFromBuffer(buffer, txGetter) {
  let offset = 0;
  function varSlice() {
    const { numberValue: keyLen, bytes } = decode5(buffer, offset);
    offset += bytes;
    const key = buffer.slice(offset, offset + Number(keyLen));
    offset += Number(keyLen);
    return key;
  }
  function readUInt32BE() {
    const num = readUInt32(buffer, offset, "BE");
    offset += 4;
    return num;
  }
  function readUInt82() {
    const num = readUInt8(buffer, offset);
    offset += 1;
    return num;
  }
  function getKeyValue() {
    const key = varSlice();
    const value2 = varSlice();
    return {
      key,
      value: value2
    };
  }
  function checkEndOfKeyValPairs() {
    if (offset >= buffer.length) {
      throw new Error("Format Error: Unexpected End of PSBT");
    }
    const isEnd = readUInt8(buffer, offset) === 0;
    if (isEnd) {
      offset++;
    }
    return isEnd;
  }
  if (readUInt32BE() !== 1886610036) {
    throw new Error("Format Error: Invalid Magic Number");
  }
  if (readUInt82() !== 255) {
    throw new Error(
      "Format Error: Magic Number must be followed by 0xff separator"
    );
  }
  const globalMapKeyVals = [];
  const globalKeyIndex = {};
  while (!checkEndOfKeyValPairs()) {
    const keyVal = getKeyValue();
    const hexKey = toHex(keyVal.key);
    if (globalKeyIndex[hexKey]) {
      throw new Error(
        "Format Error: Keys must be unique for global keymap: key " + hexKey
      );
    }
    globalKeyIndex[hexKey] = 1;
    globalMapKeyVals.push(keyVal);
  }
  const unsignedTxMaps = globalMapKeyVals.filter(
    (keyVal) => keyVal.key[0] === GlobalTypes.UNSIGNED_TX
  );
  if (unsignedTxMaps.length !== 1) {
    throw new Error("Format Error: Only one UNSIGNED_TX allowed");
  }
  const unsignedTx = txGetter(unsignedTxMaps[0].value);
  const { inputCount, outputCount } = unsignedTx.getInputOutputCounts();
  const inputKeyVals = [];
  const outputKeyVals = [];
  for (const index of range3(inputCount)) {
    const inputKeyIndex = {};
    const input = [];
    while (!checkEndOfKeyValPairs()) {
      const keyVal = getKeyValue();
      const hexKey = toHex(keyVal.key);
      if (inputKeyIndex[hexKey]) {
        throw new Error(
          "Format Error: Keys must be unique for each input: input index " + index + " key " + hexKey
        );
      }
      inputKeyIndex[hexKey] = 1;
      input.push(keyVal);
    }
    inputKeyVals.push(input);
  }
  for (const index of range3(outputCount)) {
    const outputKeyIndex = {};
    const output = [];
    while (!checkEndOfKeyValPairs()) {
      const keyVal = getKeyValue();
      const hexKey = toHex(keyVal.key);
      if (outputKeyIndex[hexKey]) {
        throw new Error(
          "Format Error: Keys must be unique for each output: output index " + index + " key " + hexKey
        );
      }
      outputKeyIndex[hexKey] = 1;
      output.push(keyVal);
    }
    outputKeyVals.push(output);
  }
  return psbtFromKeyVals(unsignedTx, {
    globalMapKeyVals,
    inputKeyVals,
    outputKeyVals
  });
}
function checkKeyBuffer(type, keyBuf, keyNum) {
  if (compare(keyBuf, Uint8Array.from([keyNum]))) {
    throw new Error(
      // `Format Error: Invalid ${type} key: ${keyBuf.toString('hex')}`,
      `Format Error: Invalid ${type} key: ${toHex(keyBuf)}`
    );
  }
}
function psbtFromKeyVals(unsignedTx, { globalMapKeyVals, inputKeyVals, outputKeyVals }) {
  const globalMap = {
    unsignedTx
  };
  let txCount = 0;
  for (const keyVal of globalMapKeyVals) {
    switch (keyVal.key[0]) {
      case GlobalTypes.UNSIGNED_TX:
        checkKeyBuffer("global", keyVal.key, GlobalTypes.UNSIGNED_TX);
        if (txCount > 0) {
          throw new Error("Format Error: GlobalMap has multiple UNSIGNED_TX");
        }
        txCount++;
        break;
      case GlobalTypes.GLOBAL_XPUB:
        if (globalMap.globalXpub === void 0) {
          globalMap.globalXpub = [];
        }
        globalMap.globalXpub.push(globals.globalXpub.decode(keyVal));
        break;
      default:
        if (!globalMap.unknownKeyVals) globalMap.unknownKeyVals = [];
        globalMap.unknownKeyVals.push(keyVal);
    }
  }
  const inputCount = inputKeyVals.length;
  const outputCount = outputKeyVals.length;
  const inputs2 = [];
  const outputs2 = [];
  for (const index of range3(inputCount)) {
    const input = {};
    for (const keyVal of inputKeyVals[index]) {
      inputs.checkPubkey(keyVal);
      switch (keyVal.key[0]) {
        case InputTypes.NON_WITNESS_UTXO:
          checkKeyBuffer("input", keyVal.key, InputTypes.NON_WITNESS_UTXO);
          if (input.nonWitnessUtxo !== void 0) {
            throw new Error(
              "Format Error: Input has multiple NON_WITNESS_UTXO"
            );
          }
          input.nonWitnessUtxo = inputs.nonWitnessUtxo.decode(keyVal);
          break;
        case InputTypes.WITNESS_UTXO:
          checkKeyBuffer("input", keyVal.key, InputTypes.WITNESS_UTXO);
          if (input.witnessUtxo !== void 0) {
            throw new Error("Format Error: Input has multiple WITNESS_UTXO");
          }
          input.witnessUtxo = inputs.witnessUtxo.decode(keyVal);
          break;
        case InputTypes.PARTIAL_SIG:
          if (input.partialSig === void 0) {
            input.partialSig = [];
          }
          input.partialSig.push(inputs.partialSig.decode(keyVal));
          break;
        case InputTypes.SIGHASH_TYPE:
          checkKeyBuffer("input", keyVal.key, InputTypes.SIGHASH_TYPE);
          if (input.sighashType !== void 0) {
            throw new Error("Format Error: Input has multiple SIGHASH_TYPE");
          }
          input.sighashType = inputs.sighashType.decode(keyVal);
          break;
        case InputTypes.REDEEM_SCRIPT:
          checkKeyBuffer("input", keyVal.key, InputTypes.REDEEM_SCRIPT);
          if (input.redeemScript !== void 0) {
            throw new Error("Format Error: Input has multiple REDEEM_SCRIPT");
          }
          input.redeemScript = inputs.redeemScript.decode(keyVal);
          break;
        case InputTypes.WITNESS_SCRIPT:
          checkKeyBuffer("input", keyVal.key, InputTypes.WITNESS_SCRIPT);
          if (input.witnessScript !== void 0) {
            throw new Error("Format Error: Input has multiple WITNESS_SCRIPT");
          }
          input.witnessScript = inputs.witnessScript.decode(keyVal);
          break;
        case InputTypes.BIP32_DERIVATION:
          if (input.bip32Derivation === void 0) {
            input.bip32Derivation = [];
          }
          input.bip32Derivation.push(
            inputs.bip32Derivation.decode(keyVal)
          );
          break;
        case InputTypes.FINAL_SCRIPTSIG:
          checkKeyBuffer("input", keyVal.key, InputTypes.FINAL_SCRIPTSIG);
          input.finalScriptSig = inputs.finalScriptSig.decode(keyVal);
          break;
        case InputTypes.FINAL_SCRIPTWITNESS:
          checkKeyBuffer("input", keyVal.key, InputTypes.FINAL_SCRIPTWITNESS);
          input.finalScriptWitness = inputs.finalScriptWitness.decode(
            keyVal
          );
          break;
        case InputTypes.POR_COMMITMENT:
          checkKeyBuffer("input", keyVal.key, InputTypes.POR_COMMITMENT);
          input.porCommitment = inputs.porCommitment.decode(keyVal);
          break;
        case InputTypes.TAP_KEY_SIG:
          checkKeyBuffer("input", keyVal.key, InputTypes.TAP_KEY_SIG);
          input.tapKeySig = inputs.tapKeySig.decode(keyVal);
          break;
        case InputTypes.TAP_SCRIPT_SIG:
          if (input.tapScriptSig === void 0) {
            input.tapScriptSig = [];
          }
          input.tapScriptSig.push(inputs.tapScriptSig.decode(keyVal));
          break;
        case InputTypes.TAP_LEAF_SCRIPT:
          if (input.tapLeafScript === void 0) {
            input.tapLeafScript = [];
          }
          input.tapLeafScript.push(inputs.tapLeafScript.decode(keyVal));
          break;
        case InputTypes.TAP_BIP32_DERIVATION:
          if (input.tapBip32Derivation === void 0) {
            input.tapBip32Derivation = [];
          }
          input.tapBip32Derivation.push(
            inputs.tapBip32Derivation.decode(keyVal)
          );
          break;
        case InputTypes.TAP_INTERNAL_KEY:
          checkKeyBuffer("input", keyVal.key, InputTypes.TAP_INTERNAL_KEY);
          input.tapInternalKey = inputs.tapInternalKey.decode(keyVal);
          break;
        case InputTypes.TAP_MERKLE_ROOT:
          checkKeyBuffer("input", keyVal.key, InputTypes.TAP_MERKLE_ROOT);
          input.tapMerkleRoot = inputs.tapMerkleRoot.decode(keyVal);
          break;
        default:
          if (!input.unknownKeyVals) input.unknownKeyVals = [];
          input.unknownKeyVals.push(keyVal);
      }
    }
    inputs2.push(input);
  }
  for (const index of range3(outputCount)) {
    const output = {};
    for (const keyVal of outputKeyVals[index]) {
      outputs.checkPubkey(keyVal);
      switch (keyVal.key[0]) {
        case OutputTypes.REDEEM_SCRIPT:
          checkKeyBuffer("output", keyVal.key, OutputTypes.REDEEM_SCRIPT);
          if (output.redeemScript !== void 0) {
            throw new Error("Format Error: Output has multiple REDEEM_SCRIPT");
          }
          output.redeemScript = outputs.redeemScript.decode(keyVal);
          break;
        case OutputTypes.WITNESS_SCRIPT:
          checkKeyBuffer("output", keyVal.key, OutputTypes.WITNESS_SCRIPT);
          if (output.witnessScript !== void 0) {
            throw new Error("Format Error: Output has multiple WITNESS_SCRIPT");
          }
          output.witnessScript = outputs.witnessScript.decode(keyVal);
          break;
        case OutputTypes.BIP32_DERIVATION:
          if (output.bip32Derivation === void 0) {
            output.bip32Derivation = [];
          }
          output.bip32Derivation.push(
            outputs.bip32Derivation.decode(keyVal)
          );
          break;
        case OutputTypes.TAP_INTERNAL_KEY:
          checkKeyBuffer("output", keyVal.key, OutputTypes.TAP_INTERNAL_KEY);
          output.tapInternalKey = outputs.tapInternalKey.decode(keyVal);
          break;
        case OutputTypes.TAP_TREE:
          checkKeyBuffer("output", keyVal.key, OutputTypes.TAP_TREE);
          output.tapTree = outputs.tapTree.decode(keyVal);
          break;
        case OutputTypes.TAP_BIP32_DERIVATION:
          if (output.tapBip32Derivation === void 0) {
            output.tapBip32Derivation = [];
          }
          output.tapBip32Derivation.push(
            outputs.tapBip32Derivation.decode(keyVal)
          );
          break;
        default:
          if (!output.unknownKeyVals) output.unknownKeyVals = [];
          output.unknownKeyVals.push(keyVal);
      }
    }
    outputs2.push(output);
  }
  return { globalMap, inputs: inputs2, outputs: outputs2 };
}

// apps/frontend/node_modules/bip174/src/esm/lib/parser/toBuffer.js
function psbtToBuffer({ globalMap, inputs: inputs2, outputs: outputs2 }) {
  const { globalKeyVals, inputKeyVals, outputKeyVals } = psbtToKeyVals({
    globalMap,
    inputs: inputs2,
    outputs: outputs2
  });
  const globalBuffer = keyValsToBuffer(globalKeyVals);
  const keyValsOrEmptyToBuffer = (keyVals) => keyVals.length === 0 ? [Uint8Array.from([0])] : keyVals.map(keyValsToBuffer);
  const inputBuffers = keyValsOrEmptyToBuffer(inputKeyVals);
  const outputBuffers = keyValsOrEmptyToBuffer(outputKeyVals);
  const header = new Uint8Array(5);
  header.set([112, 115, 98, 116, 255], 0);
  return concat(
    [header, globalBuffer].concat(inputBuffers, outputBuffers)
  );
}
var sortKeyVals = (a, b) => {
  return compare(a.key, b.key);
};
function keyValsFromMap(keyValMap, converterFactory) {
  const keyHexSet = /* @__PURE__ */ new Set();
  const keyVals = Object.entries(keyValMap).reduce((result, [key, value2]) => {
    if (key === "unknownKeyVals") return result;
    const converter = converterFactory[key];
    if (converter === void 0) return result;
    const encodedKeyVals = (Array.isArray(value2) ? value2 : [value2]).map(
      converter.encode
    );
    const keyHexes = encodedKeyVals.map((kv) => toHex(kv.key));
    keyHexes.forEach((hex) => {
      if (keyHexSet.has(hex))
        throw new Error("Serialize Error: Duplicate key: " + hex);
      keyHexSet.add(hex);
    });
    return result.concat(encodedKeyVals);
  }, []);
  const otherKeyVals = keyValMap.unknownKeyVals ? keyValMap.unknownKeyVals.filter((keyVal) => {
    return !keyHexSet.has(toHex(keyVal.key));
  }) : [];
  return keyVals.concat(otherKeyVals).sort(sortKeyVals);
}
function psbtToKeyVals({ globalMap, inputs: inputs2, outputs: outputs2 }) {
  return {
    globalKeyVals: keyValsFromMap(globalMap, globals),
    inputKeyVals: inputs2.map((i) => keyValsFromMap(i, inputs)),
    outputKeyVals: outputs2.map((o) => keyValsFromMap(o, outputs))
  };
}

// apps/frontend/node_modules/bip174/src/esm/lib/combiner/index.js
function combine(psbts) {
  const self = psbts[0];
  const selfKeyVals = psbtToKeyVals(self);
  const others = psbts.slice(1);
  if (others.length === 0) throw new Error("Combine: Nothing to combine");
  const selfTx = getTx(self);
  if (selfTx === void 0) {
    throw new Error("Combine: Self missing transaction");
  }
  const selfGlobalSet = getKeySet(selfKeyVals.globalKeyVals);
  const selfInputSets = selfKeyVals.inputKeyVals.map(getKeySet);
  const selfOutputSets = selfKeyVals.outputKeyVals.map(getKeySet);
  for (const other of others) {
    const otherTx = getTx(other);
    if (otherTx === void 0 || compare(otherTx.toBuffer(), selfTx.toBuffer()) !== 0) {
      throw new Error(
        "Combine: One of the Psbts does not have the same transaction."
      );
    }
    const otherKeyVals = psbtToKeyVals(other);
    const otherGlobalSet = getKeySet(otherKeyVals.globalKeyVals);
    otherGlobalSet.forEach(
      keyPusher(
        selfGlobalSet,
        selfKeyVals.globalKeyVals,
        otherKeyVals.globalKeyVals
      )
    );
    const otherInputSets = otherKeyVals.inputKeyVals.map(getKeySet);
    otherInputSets.forEach(
      (inputSet, idx) => inputSet.forEach(
        keyPusher(
          selfInputSets[idx],
          selfKeyVals.inputKeyVals[idx],
          otherKeyVals.inputKeyVals[idx]
        )
      )
    );
    const otherOutputSets = otherKeyVals.outputKeyVals.map(getKeySet);
    otherOutputSets.forEach(
      (outputSet, idx) => outputSet.forEach(
        keyPusher(
          selfOutputSets[idx],
          selfKeyVals.outputKeyVals[idx],
          otherKeyVals.outputKeyVals[idx]
        )
      )
    );
  }
  return psbtFromKeyVals(selfTx, {
    globalMapKeyVals: selfKeyVals.globalKeyVals,
    inputKeyVals: selfKeyVals.inputKeyVals,
    outputKeyVals: selfKeyVals.outputKeyVals
  });
}
function keyPusher(selfSet, selfKeyVals, otherKeyVals) {
  return (key) => {
    if (selfSet.has(key)) return;
    const newKv = otherKeyVals.filter((kv) => toHex(kv.key) === key)[0];
    selfKeyVals.push(newKv);
    selfSet.add(key);
  };
}
function getTx(psbt) {
  return psbt.globalMap.unsignedTx;
}
function getKeySet(keyVals) {
  const set = /* @__PURE__ */ new Set();
  keyVals.forEach((keyVal) => {
    const hex = toHex(keyVal.key);
    if (set.has(hex))
      throw new Error("Combine: KeyValue Map keys should be unique");
    set.add(hex);
  });
  return set;
}

// apps/frontend/node_modules/bip174/src/esm/lib/utils.js
function checkForInput(inputs2, inputIndex) {
  const input = inputs2[inputIndex];
  if (input === void 0) throw new Error(`No input #${inputIndex}`);
  return input;
}
function checkForOutput(outputs2, outputIndex) {
  const output = outputs2[outputIndex];
  if (output === void 0) throw new Error(`No output #${outputIndex}`);
  return output;
}
function checkHasKey(checkKeyVal, keyVals, enumLength) {
  if (checkKeyVal.key[0] < enumLength) {
    throw new Error(
      `Use the method for your specific key instead of addUnknownKeyVal*`
    );
  }
  if (keyVals && keyVals.filter((kv) => compare(kv.key, checkKeyVal.key) === 0).length !== 0) {
    throw new Error(`Duplicate Key: ${toHex(checkKeyVal.key)}`);
  }
}
function getEnumLength(myenum) {
  let count = 0;
  Object.keys(myenum).forEach((val) => {
    if (Number(isNaN(Number(val)))) {
      count++;
    }
  });
  return count;
}
function inputCheckUncleanFinalized(inputIndex, input) {
  let result = false;
  if (input.nonWitnessUtxo || input.witnessUtxo) {
    const needScriptSig = !!input.redeemScript;
    const needWitnessScript = !!input.witnessScript;
    const scriptSigOK = !needScriptSig || !!input.finalScriptSig;
    const witnessScriptOK = !needWitnessScript || !!input.finalScriptWitness;
    const hasOneFinal = !!input.finalScriptSig || !!input.finalScriptWitness;
    result = scriptSigOK && witnessScriptOK && hasOneFinal;
  }
  if (result === false) {
    throw new Error(
      `Input #${inputIndex} has too much or too little data to clean`
    );
  }
}
function throwForUpdateMaker(typeName, name, expected14, data) {
  throw new Error(
    `Data for ${typeName} key ${name} is incorrect: Expected ${expected14} and got ${JSON.stringify(data)}`
  );
}
function updateMaker(typeName) {
  return (updateData, mainData) => {
    for (const name of Object.keys(updateData)) {
      const data = updateData[name];
      const { canAdd: canAdd10, canAddToArray: canAddToArray5, check: check15, expected: expected14 } = (
        // @ts-ignore
        converter_exports[typeName + "s"][name] || {}
      );
      const isArray = !!canAddToArray5;
      if (check15) {
        if (isArray) {
          if (!Array.isArray(data) || // @ts-ignore
          mainData[name] && !Array.isArray(mainData[name])) {
            throw new Error(`Key type ${name} must be an array`);
          }
          if (!data.every(check15)) {
            throwForUpdateMaker(typeName, name, expected14, data);
          }
          const arr = mainData[name] || [];
          const dupeCheckSet = /* @__PURE__ */ new Set();
          if (!data.every((v) => canAddToArray5(arr, v, dupeCheckSet))) {
            throw new Error("Can not add duplicate data to array");
          }
          mainData[name] = arr.concat(data);
        } else {
          if (!check15(data)) {
            throwForUpdateMaker(typeName, name, expected14, data);
          }
          if (!canAdd10(mainData, data)) {
            throw new Error(`Can not add duplicate data to ${typeName}`);
          }
          mainData[name] = data;
        }
      }
    }
  };
}
var updateGlobal = updateMaker("global");
var updateInput = updateMaker("input");
var updateOutput = updateMaker("output");
function addInputAttributes(inputs2, data) {
  const index = inputs2.length - 1;
  const input = checkForInput(inputs2, index);
  updateInput(data, input);
}
function addOutputAttributes(outputs2, data) {
  const index = outputs2.length - 1;
  const output = checkForOutput(outputs2, index);
  updateOutput(data, output);
}

// apps/frontend/node_modules/bip174/src/esm/lib/psbt.js
var Psbt = class {
  constructor(tx) {
    this.inputs = [];
    this.outputs = [];
    this.globalMap = {
      unsignedTx: tx
    };
  }
  static fromBase64(data, txFromBuffer) {
    const buffer = fromBase64(data);
    return this.fromBuffer(buffer, txFromBuffer);
  }
  static fromHex(data, txFromBuffer) {
    const buffer = fromHex(data);
    return this.fromBuffer(buffer, txFromBuffer);
  }
  static fromBuffer(buffer, txFromBuffer) {
    const results = psbtFromBuffer(buffer, txFromBuffer);
    const psbt = new this(results.globalMap.unsignedTx);
    Object.assign(psbt, results);
    return psbt;
  }
  toBase64() {
    const buffer = this.toBuffer();
    return toBase64(buffer);
  }
  toHex() {
    const buffer = this.toBuffer();
    return toHex(buffer);
  }
  toBuffer() {
    return psbtToBuffer(this);
  }
  updateGlobal(updateData) {
    updateGlobal(updateData, this.globalMap);
    return this;
  }
  updateInput(inputIndex, updateData) {
    const input = checkForInput(this.inputs, inputIndex);
    updateInput(updateData, input);
    return this;
  }
  updateOutput(outputIndex, updateData) {
    const output = checkForOutput(this.outputs, outputIndex);
    updateOutput(updateData, output);
    return this;
  }
  addUnknownKeyValToGlobal(keyVal) {
    checkHasKey(
      keyVal,
      this.globalMap.unknownKeyVals,
      getEnumLength(GlobalTypes)
    );
    if (!this.globalMap.unknownKeyVals) this.globalMap.unknownKeyVals = [];
    this.globalMap.unknownKeyVals.push(keyVal);
    return this;
  }
  addUnknownKeyValToInput(inputIndex, keyVal) {
    const input = checkForInput(this.inputs, inputIndex);
    checkHasKey(keyVal, input.unknownKeyVals, getEnumLength(InputTypes));
    if (!input.unknownKeyVals) input.unknownKeyVals = [];
    input.unknownKeyVals.push(keyVal);
    return this;
  }
  addUnknownKeyValToOutput(outputIndex, keyVal) {
    const output = checkForOutput(this.outputs, outputIndex);
    checkHasKey(keyVal, output.unknownKeyVals, getEnumLength(OutputTypes));
    if (!output.unknownKeyVals) output.unknownKeyVals = [];
    output.unknownKeyVals.push(keyVal);
    return this;
  }
  addInput(inputData) {
    this.globalMap.unsignedTx.addInput(inputData);
    this.inputs.push({
      unknownKeyVals: []
    });
    const addKeyVals = inputData.unknownKeyVals || [];
    const inputIndex = this.inputs.length - 1;
    if (!Array.isArray(addKeyVals)) {
      throw new Error("unknownKeyVals must be an Array");
    }
    addKeyVals.forEach(
      (keyVal) => this.addUnknownKeyValToInput(inputIndex, keyVal)
    );
    addInputAttributes(this.inputs, inputData);
    return this;
  }
  addOutput(outputData) {
    this.globalMap.unsignedTx.addOutput(outputData);
    this.outputs.push({
      unknownKeyVals: []
    });
    const addKeyVals = outputData.unknownKeyVals || [];
    const outputIndex = this.outputs.length - 1;
    if (!Array.isArray(addKeyVals)) {
      throw new Error("unknownKeyVals must be an Array");
    }
    addKeyVals.forEach(
      (keyVal) => this.addUnknownKeyValToOutput(outputIndex, keyVal)
    );
    addOutputAttributes(this.outputs, outputData);
    return this;
  }
  clearFinalizedInput(inputIndex) {
    const input = checkForInput(this.inputs, inputIndex);
    inputCheckUncleanFinalized(inputIndex, input);
    for (const key of Object.keys(input)) {
      if (![
        "witnessUtxo",
        "nonWitnessUtxo",
        "finalScriptSig",
        "finalScriptWitness",
        "unknownKeyVals"
      ].includes(key)) {
        delete input[key];
      }
    }
    return this;
  }
  combine(...those) {
    const result = combine([this].concat(those));
    Object.assign(this, result);
    return this;
  }
  getTransaction() {
    return this.globalMap.unsignedTx.toBuffer();
  }
};

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/psbt/psbtutils.js
function isPaymentFactory(payment) {
  return (script) => {
    try {
      payment({ output: script });
      return true;
    } catch (err) {
      return false;
    }
  };
}
var isP2MS = isPaymentFactory(p2ms);
var isP2PK = isPaymentFactory(p2pk);
var isP2PKH = isPaymentFactory(p2pkh);
var isP2WPKH = isPaymentFactory(p2wpkh);
var isP2WSHScript = isPaymentFactory(p2wsh);
var isP2SHScript = isPaymentFactory(p2sh);
var isP2TR = isPaymentFactory(p2tr);
function witnessStackToScriptWitness(witness) {
  let buffer = new Uint8Array(0);
  function writeSlice(slice) {
    buffer = concat([buffer, slice]);
  }
  function writeVarInt(i) {
    const currentLen = buffer.length;
    const varintLen = encodingLength2(i);
    buffer = concat([buffer, new Uint8Array(varintLen)]);
    encode5(i, buffer, currentLen);
  }
  function writeVarSlice(slice) {
    writeVarInt(slice.length);
    writeSlice(slice);
  }
  function writeVector(vector) {
    writeVarInt(vector.length);
    vector.forEach(writeVarSlice);
  }
  writeVector(witness);
  return buffer;
}
function pubkeyPositionInScript(pubkey, script) {
  const pubkeyHash = hash1602(pubkey);
  const pubkeyXOnly = pubkey.slice(1, 33);
  const decompiled = decompile(script);
  if (decompiled === null) throw new Error("Unknown script error");
  return decompiled.findIndex((element) => {
    if (typeof element === "number") return false;
    return compare(pubkey, element) === 0 || compare(pubkeyHash, element) === 0 || compare(pubkeyXOnly, element) === 0;
  });
}
function pubkeyInScript(pubkey, script) {
  return pubkeyPositionInScript(pubkey, script) !== -1;
}
function checkInputForSig(input, action) {
  const pSigs = extractPartialSigs(input);
  return pSigs.some(
    (pSig) => signatureBlocksAction(pSig, signature.decode, action)
  );
}
function signatureBlocksAction(signature2, signatureDecodeFn, action) {
  const { hashType } = signatureDecodeFn(signature2);
  const whitelist = [];
  const isAnyoneCanPay = hashType & Transaction.SIGHASH_ANYONECANPAY;
  if (isAnyoneCanPay) whitelist.push("addInput");
  const hashMod = hashType & 31;
  switch (hashMod) {
    case Transaction.SIGHASH_ALL:
      break;
    case Transaction.SIGHASH_SINGLE:
    case Transaction.SIGHASH_NONE:
      whitelist.push("addOutput");
      whitelist.push("setInputSequence");
      break;
  }
  if (whitelist.indexOf(action) === -1) {
    return true;
  }
  return false;
}
function extractPartialSigs(input) {
  let pSigs = [];
  if ((input.partialSig || []).length === 0) {
    if (!input.finalScriptSig && !input.finalScriptWitness) return [];
    pSigs = getPsigsFromInputFinalScripts(input);
  } else {
    pSigs = input.partialSig;
  }
  return pSigs.map((p) => p.signature);
}
function getPsigsFromInputFinalScripts(input) {
  const scriptItems = !input.finalScriptSig ? [] : decompile(input.finalScriptSig) || [];
  const witnessItems = !input.finalScriptWitness ? [] : decompile(input.finalScriptWitness) || [];
  return scriptItems.concat(witnessItems).filter((item) => {
    return item instanceof Uint8Array && isCanonicalScriptSignature(item);
  }).map((sig) => ({ signature: sig }));
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/psbt/bip371.js
var toXOnly = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
function tapScriptFinalizer(inputIndex, input, tapLeafHashToFinalize) {
  const tapLeaf = findTapLeafToFinalize(
    input,
    inputIndex,
    tapLeafHashToFinalize
  );
  try {
    const sigs = sortSignatures(input, tapLeaf);
    const witness = sigs.concat(tapLeaf.script).concat(tapLeaf.controlBlock);
    return { finalScriptWitness: witnessStackToScriptWitness(witness) };
  } catch (err) {
    throw new Error(`Can not finalize taproot input #${inputIndex}: ${err}`);
  }
}
function serializeTaprootSignature(sig, sighashType) {
  const sighashTypeByte = sighashType ? Uint8Array.from([sighashType]) : Uint8Array.from([]);
  return concat([sig, sighashTypeByte]);
}
function isTaprootInput(input) {
  return input && !!(input.tapInternalKey || input.tapMerkleRoot || input.tapLeafScript && input.tapLeafScript.length || input.tapBip32Derivation && input.tapBip32Derivation.length || input.witnessUtxo && isP2TR(input.witnessUtxo.script));
}
function isTaprootOutput(output, script) {
  return output && !!(output.tapInternalKey || output.tapTree || output.tapBip32Derivation && output.tapBip32Derivation.length || script && isP2TR(script));
}
function checkTaprootInputFields(inputData, newInputData, action) {
  checkMixedTaprootAndNonTaprootInputFields(inputData, newInputData, action);
  checkIfTapLeafInTree(inputData, newInputData, action);
}
function checkTaprootOutputFields(outputData, newOutputData, action) {
  checkMixedTaprootAndNonTaprootOutputFields(outputData, newOutputData, action);
  checkTaprootScriptPubkey(outputData, newOutputData);
}
function checkTaprootScriptPubkey(outputData, newOutputData) {
  if (!newOutputData.tapTree && !newOutputData.tapInternalKey) return;
  const tapInternalKey = newOutputData.tapInternalKey || outputData.tapInternalKey;
  const tapTree = newOutputData.tapTree || outputData.tapTree;
  if (tapInternalKey) {
    const { script: scriptPubkey } = outputData;
    const script = getTaprootScripPubkey(tapInternalKey, tapTree);
    if (scriptPubkey && compare(script, scriptPubkey) !== 0)
      throw new Error("Error adding output. Script or address mismatch.");
  }
}
function getTaprootScripPubkey(tapInternalKey, tapTree) {
  const scriptTree = tapTree && tapTreeFromList(tapTree.leaves);
  const { output } = p2tr({
    internalPubkey: tapInternalKey,
    scriptTree
  });
  return output;
}
function tapTreeFromList(leaves = []) {
  if (leaves.length === 1 && leaves[0].depth === 0)
    return {
      output: leaves[0].script,
      version: leaves[0].leafVersion
    };
  return instertLeavesInTree(leaves);
}
function checkTaprootInputForSigs(input, action) {
  const sigs = extractTaprootSigs(input);
  return sigs.some(
    (sig) => signatureBlocksAction(sig, decodeSchnorrSignature, action)
  );
}
function decodeSchnorrSignature(signature2) {
  return {
    signature: signature2.slice(0, 64),
    hashType: signature2.slice(64)[0] || Transaction.SIGHASH_DEFAULT
  };
}
function extractTaprootSigs(input) {
  const sigs = [];
  if (input.tapKeySig) sigs.push(input.tapKeySig);
  if (input.tapScriptSig)
    sigs.push(...input.tapScriptSig.map((s) => s.signature));
  if (!sigs.length) {
    const finalTapKeySig = getTapKeySigFromWitness(input.finalScriptWitness);
    if (finalTapKeySig) sigs.push(finalTapKeySig);
  }
  return sigs;
}
function getTapKeySigFromWitness(finalScriptWitness) {
  if (!finalScriptWitness) return;
  const witness = finalScriptWitness.slice(2);
  if (witness.length === 64 || witness.length === 65) return witness;
}
function instertLeavesInTree(leaves) {
  let tree;
  for (const leaf of leaves) {
    tree = instertLeafInTree(leaf, tree);
    if (!tree) throw new Error(`No room left to insert tapleaf in tree`);
  }
  return tree;
}
function instertLeafInTree(leaf, tree, depth = 0) {
  if (depth > MAX_TAPTREE_DEPTH) throw new Error("Max taptree depth exceeded.");
  if (leaf.depth === depth) {
    if (!tree)
      return {
        output: leaf.script,
        version: leaf.leafVersion
      };
    return;
  }
  if (isTapleaf(tree)) return;
  const leftSide = instertLeafInTree(leaf, tree && tree[0], depth + 1);
  if (leftSide) return [leftSide, tree && tree[1]];
  const rightSide = instertLeafInTree(leaf, tree && tree[1], depth + 1);
  if (rightSide) return [tree && tree[0], rightSide];
}
function checkMixedTaprootAndNonTaprootInputFields(inputData, newInputData, action) {
  const isBadTaprootUpdate = isTaprootInput(inputData) && hasNonTaprootFields(newInputData);
  const isBadNonTaprootUpdate = hasNonTaprootFields(inputData) && isTaprootInput(newInputData);
  const hasMixedFields = inputData === newInputData && isTaprootInput(newInputData) && hasNonTaprootFields(newInputData);
  if (isBadTaprootUpdate || isBadNonTaprootUpdate || hasMixedFields)
    throw new Error(
      `Invalid arguments for Psbt.${action}. Cannot use both taproot and non-taproot fields.`
    );
}
function checkMixedTaprootAndNonTaprootOutputFields(inputData, newInputData, action) {
  const isBadTaprootUpdate = isTaprootOutput(inputData) && hasNonTaprootFields(newInputData);
  const isBadNonTaprootUpdate = hasNonTaprootFields(inputData) && isTaprootOutput(newInputData);
  const hasMixedFields = inputData === newInputData && isTaprootOutput(newInputData) && hasNonTaprootFields(newInputData);
  if (isBadTaprootUpdate || isBadNonTaprootUpdate || hasMixedFields)
    throw new Error(
      `Invalid arguments for Psbt.${action}. Cannot use both taproot and non-taproot fields.`
    );
}
function checkIfTapLeafInTree(inputData, newInputData, action) {
  if (newInputData.tapMerkleRoot) {
    const newLeafsInTree = (newInputData.tapLeafScript || []).every(
      (l) => isTapLeafInTree(l, newInputData.tapMerkleRoot)
    );
    const oldLeafsInTree = (inputData.tapLeafScript || []).every(
      (l) => isTapLeafInTree(l, newInputData.tapMerkleRoot)
    );
    if (!newLeafsInTree || !oldLeafsInTree)
      throw new Error(
        `Invalid arguments for Psbt.${action}. Tapleaf not part of taptree.`
      );
  } else if (inputData.tapMerkleRoot) {
    const newLeafsInTree = (newInputData.tapLeafScript || []).every(
      (l) => isTapLeafInTree(l, inputData.tapMerkleRoot)
    );
    if (!newLeafsInTree)
      throw new Error(
        `Invalid arguments for Psbt.${action}. Tapleaf not part of taptree.`
      );
  }
}
function isTapLeafInTree(tapLeaf, merkleRoot) {
  if (!merkleRoot) return true;
  const leafHash = tapleafHash({
    output: tapLeaf.script,
    version: tapLeaf.leafVersion
  });
  const rootHash = rootHashFromPath(tapLeaf.controlBlock, leafHash);
  return compare(rootHash, merkleRoot) === 0;
}
function sortSignatures(input, tapLeaf) {
  const leafHash = tapleafHash({
    output: tapLeaf.script,
    version: tapLeaf.leafVersion
  });
  return (input.tapScriptSig || []).filter((tss) => compare(tss.leafHash, leafHash) === 0).map((tss) => addPubkeyPositionInScript(tapLeaf.script, tss)).sort((t1, t2) => t2.positionInScript - t1.positionInScript).map((t) => t.signature);
}
function addPubkeyPositionInScript(script, tss) {
  return Object.assign(
    {
      positionInScript: pubkeyPositionInScript(tss.pubkey, script)
    },
    tss
  );
}
function findTapLeafToFinalize(input, inputIndex, leafHashToFinalize) {
  if (!input.tapScriptSig || !input.tapScriptSig.length)
    throw new Error(
      `Can not finalize taproot input #${inputIndex}. No tapleaf script signature provided.`
    );
  const tapLeaf = (input.tapLeafScript || []).sort((a, b) => a.controlBlock.length - b.controlBlock.length).find(
    (leaf) => canFinalizeLeaf(leaf, input.tapScriptSig, leafHashToFinalize)
  );
  if (!tapLeaf)
    throw new Error(
      `Can not finalize taproot input #${inputIndex}. Signature for tapleaf script not found.`
    );
  return tapLeaf;
}
function canFinalizeLeaf(leaf, tapScriptSig, hash) {
  const leafHash = tapleafHash({
    output: leaf.script,
    version: leaf.leafVersion
  });
  const whiteListedHash = !hash || compare(leafHash, hash) === 0;
  return whiteListedHash && tapScriptSig.find((tss) => compare(tss.leafHash, leafHash) === 0) !== void 0;
}
function hasNonTaprootFields(io) {
  return io && !!(io.redeemScript || io.witnessScript || io.bip32Derivation && io.bip32Derivation.length);
}

// apps/frontend/node_modules/bitcoinjs-lib/src/esm/psbt.js
var DEFAULT_OPTS = {
  /**
   * A bitcoinjs Network object. This is only used if you pass an `address`
   * parameter to addOutput. Otherwise it is not needed and can be left default.
   */
  network: bitcoin,
  /**
   * When extractTransaction is called, the fee rate is checked.
   * THIS IS NOT TO BE RELIED ON.
   * It is only here as a last ditch effort to prevent sending a 500 BTC fee etc.
   */
  maximumFeeRate: 5e3
  // satoshi per byte
};
var Psbt2 = class _Psbt {
  data;
  static fromBase64(data, opts = {}) {
    const buffer = fromBase64(data);
    return this.fromBuffer(buffer, opts);
  }
  static fromHex(data, opts = {}) {
    const buffer = fromHex(data);
    return this.fromBuffer(buffer, opts);
  }
  static fromBuffer(buffer, opts = {}) {
    const psbtBase = Psbt.fromBuffer(buffer, transactionFromBuffer);
    const psbt = new _Psbt(opts, psbtBase);
    checkTxForDupeIns(psbt.__CACHE.__TX, psbt.__CACHE);
    return psbt;
  }
  __CACHE;
  opts;
  constructor(opts = {}, data = new Psbt(new PsbtTransaction())) {
    this.data = data;
    this.opts = Object.assign({}, DEFAULT_OPTS, opts);
    this.__CACHE = {
      __NON_WITNESS_UTXO_TX_CACHE: [],
      __NON_WITNESS_UTXO_BUF_CACHE: [],
      __TX_IN_CACHE: {},
      __TX: this.data.globalMap.unsignedTx.tx,
      // Psbt's predecessor (TransactionBuilder - now removed) behavior
      // was to not confirm input values  before signing.
      // Even though we highly encourage people to get
      // the full parent transaction to verify values, the ability to
      // sign non-segwit inputs without the full transaction was often
      // requested. So the only way to activate is to use @ts-ignore.
      // We will disable exporting the Psbt when unsafe sign is active.
      // because it is not BIP174 compliant.
      __UNSAFE_SIGN_NONSEGWIT: false
    };
    if (this.data.inputs.length === 0) this.setVersion(2);
    const dpew = (obj, attr, enumerable, writable) => Object.defineProperty(obj, attr, {
      enumerable,
      writable
    });
    dpew(this, "__CACHE", false, true);
    dpew(this, "opts", false, true);
  }
  get inputCount() {
    return this.data.inputs.length;
  }
  get version() {
    return this.__CACHE.__TX.version;
  }
  set version(version) {
    this.setVersion(version);
  }
  get locktime() {
    return this.__CACHE.__TX.locktime;
  }
  set locktime(locktime) {
    this.setLocktime(locktime);
  }
  get txInputs() {
    return this.__CACHE.__TX.ins.map((input) => ({
      hash: cloneBuffer(input.hash),
      index: input.index,
      sequence: input.sequence
    }));
  }
  get txOutputs() {
    return this.__CACHE.__TX.outs.map((output) => {
      let address;
      try {
        address = fromOutputScript(output.script, this.opts.network);
      } catch (_) {
      }
      return {
        script: cloneBuffer(output.script),
        value: output.value,
        address
      };
    });
  }
  combine(...those) {
    this.data.combine(...those.map((o) => o.data));
    return this;
  }
  clone() {
    const res = _Psbt.fromBuffer(this.data.toBuffer());
    res.opts = JSON.parse(JSON.stringify(this.opts));
    return res;
  }
  setMaximumFeeRate(satoshiPerByte) {
    check32Bit(satoshiPerByte);
    this.opts.maximumFeeRate = satoshiPerByte;
  }
  setVersion(version) {
    check32Bit(version);
    checkInputsForPartialSig(this.data.inputs, "setVersion");
    const c = this.__CACHE;
    c.__TX.version = version;
    c.__EXTRACTED_TX = void 0;
    return this;
  }
  setLocktime(locktime) {
    check32Bit(locktime);
    checkInputsForPartialSig(this.data.inputs, "setLocktime");
    const c = this.__CACHE;
    c.__TX.locktime = locktime;
    c.__EXTRACTED_TX = void 0;
    return this;
  }
  setInputSequence(inputIndex, sequence) {
    check32Bit(sequence);
    checkInputsForPartialSig(this.data.inputs, "setInputSequence");
    const c = this.__CACHE;
    if (c.__TX.ins.length <= inputIndex) {
      throw new Error("Input index too high");
    }
    c.__TX.ins[inputIndex].sequence = sequence;
    c.__EXTRACTED_TX = void 0;
    return this;
  }
  addInputs(inputDatas) {
    inputDatas.forEach((inputData) => this.addInput(inputData));
    return this;
  }
  addInput(inputData) {
    if (arguments.length > 1 || !inputData || inputData.hash === void 0 || inputData.index === void 0) {
      throw new Error(
        `Invalid arguments for Psbt.addInput. Requires single object with at least [hash] and [index]`
      );
    }
    checkTaprootInputFields(inputData, inputData, "addInput");
    checkInputsForPartialSig(this.data.inputs, "addInput");
    if (inputData.witnessScript) checkInvalidP2WSH(inputData.witnessScript);
    const c = this.__CACHE;
    this.data.addInput(inputData);
    const txIn = c.__TX.ins[c.__TX.ins.length - 1];
    checkTxInputCache(c, txIn);
    const inputIndex = this.data.inputs.length - 1;
    const input = this.data.inputs[inputIndex];
    if (input.nonWitnessUtxo) {
      addNonWitnessTxCache(this.__CACHE, input, inputIndex);
    }
    c.__FEE = void 0;
    c.__FEE_RATE = void 0;
    c.__EXTRACTED_TX = void 0;
    return this;
  }
  addOutputs(outputDatas) {
    outputDatas.forEach((outputData) => this.addOutput(outputData));
    return this;
  }
  addOutput(outputData) {
    if (arguments.length > 1 || !outputData || outputData.value === void 0 || outputData.address === void 0 && outputData.script === void 0) {
      throw new Error(
        `Invalid arguments for Psbt.addOutput. Requires single object with at least [script or address] and [value]`
      );
    }
    checkInputsForPartialSig(this.data.inputs, "addOutput");
    const { address } = outputData;
    if (typeof address === "string") {
      const { network } = this.opts;
      const script = toOutputScript(address, network);
      outputData = Object.assign({}, outputData, { script });
    }
    checkTaprootOutputFields(outputData, outputData, "addOutput");
    const c = this.__CACHE;
    this.data.addOutput(outputData);
    c.__FEE = void 0;
    c.__FEE_RATE = void 0;
    c.__EXTRACTED_TX = void 0;
    return this;
  }
  extractTransaction(disableFeeCheck) {
    if (!this.data.inputs.every(isFinalized)) throw new Error("Not finalized");
    const c = this.__CACHE;
    if (!disableFeeCheck) {
      checkFees(this, c, this.opts);
    }
    if (c.__EXTRACTED_TX) return c.__EXTRACTED_TX;
    const tx = c.__TX.clone();
    inputFinalizeGetAmts(this.data.inputs, tx, c, true);
    return tx;
  }
  getFeeRate() {
    return getTxCacheValue(
      "__FEE_RATE",
      "fee rate",
      this.data.inputs,
      this.__CACHE
    );
  }
  getFee() {
    return getTxCacheValue("__FEE", "fee", this.data.inputs, this.__CACHE);
  }
  finalizeAllInputs() {
    checkForInput(this.data.inputs, 0);
    range4(this.data.inputs.length).forEach((idx) => this.finalizeInput(idx));
    return this;
  }
  finalizeInput(inputIndex, finalScriptsFunc) {
    const input = checkForInput(this.data.inputs, inputIndex);
    if (isTaprootInput(input))
      return this._finalizeTaprootInput(
        inputIndex,
        input,
        void 0,
        finalScriptsFunc
      );
    return this._finalizeInput(inputIndex, input, finalScriptsFunc);
  }
  finalizeTaprootInput(inputIndex, tapLeafHashToFinalize, finalScriptsFunc = tapScriptFinalizer) {
    const input = checkForInput(this.data.inputs, inputIndex);
    if (isTaprootInput(input))
      return this._finalizeTaprootInput(
        inputIndex,
        input,
        tapLeafHashToFinalize,
        finalScriptsFunc
      );
    throw new Error(`Cannot finalize input #${inputIndex}. Not Taproot.`);
  }
  _finalizeInput(inputIndex, input, finalScriptsFunc = getFinalScripts) {
    const { script, isP2SH, isP2WSH, isSegwit } = getScriptFromInput(
      inputIndex,
      input,
      this.__CACHE
    );
    if (!script) throw new Error(`No script found for input #${inputIndex}`);
    checkPartialSigSighashes(input);
    const { finalScriptSig, finalScriptWitness } = finalScriptsFunc(
      inputIndex,
      input,
      script,
      isSegwit,
      isP2SH,
      isP2WSH
    );
    if (finalScriptSig) this.data.updateInput(inputIndex, { finalScriptSig });
    if (finalScriptWitness)
      this.data.updateInput(inputIndex, { finalScriptWitness });
    if (!finalScriptSig && !finalScriptWitness)
      throw new Error(`Unknown error finalizing input #${inputIndex}`);
    this.data.clearFinalizedInput(inputIndex);
    return this;
  }
  _finalizeTaprootInput(inputIndex, input, tapLeafHashToFinalize, finalScriptsFunc = tapScriptFinalizer) {
    if (!input.witnessUtxo)
      throw new Error(
        `Cannot finalize input #${inputIndex}. Missing withness utxo.`
      );
    if (input.tapKeySig) {
      const payment = p2tr({
        output: input.witnessUtxo.script,
        signature: input.tapKeySig
      });
      const finalScriptWitness = witnessStackToScriptWitness(payment.witness);
      this.data.updateInput(inputIndex, { finalScriptWitness });
    } else {
      const { finalScriptWitness } = finalScriptsFunc(
        inputIndex,
        input,
        tapLeafHashToFinalize
      );
      this.data.updateInput(inputIndex, { finalScriptWitness });
    }
    this.data.clearFinalizedInput(inputIndex);
    return this;
  }
  getInputType(inputIndex) {
    const input = checkForInput(this.data.inputs, inputIndex);
    const script = getScriptFromUtxo(inputIndex, input, this.__CACHE);
    const result = getMeaningfulScript(
      script,
      inputIndex,
      "input",
      input.redeemScript || redeemFromFinalScriptSig(input.finalScriptSig),
      input.witnessScript || redeemFromFinalWitnessScript(input.finalScriptWitness)
    );
    const type = result.type === "raw" ? "" : result.type + "-";
    const mainType = classifyScript(result.meaningfulScript);
    return type + mainType;
  }
  inputHasPubkey(inputIndex, pubkey) {
    const input = checkForInput(this.data.inputs, inputIndex);
    return pubkeyInInput(pubkey, input, inputIndex, this.__CACHE);
  }
  inputHasHDKey(inputIndex, root) {
    const input = checkForInput(this.data.inputs, inputIndex);
    const derivationIsMine = bip32DerivationIsMine(root);
    return !!input.bip32Derivation && input.bip32Derivation.some(derivationIsMine);
  }
  outputHasPubkey(outputIndex, pubkey) {
    const output = checkForOutput(this.data.outputs, outputIndex);
    return pubkeyInOutput(pubkey, output, outputIndex, this.__CACHE);
  }
  outputHasHDKey(outputIndex, root) {
    const output = checkForOutput(this.data.outputs, outputIndex);
    const derivationIsMine = bip32DerivationIsMine(root);
    return !!output.bip32Derivation && output.bip32Derivation.some(derivationIsMine);
  }
  validateSignaturesOfAllInputs(validator) {
    checkForInput(this.data.inputs, 0);
    const results = range4(this.data.inputs.length).map(
      (idx) => this.validateSignaturesOfInput(idx, validator)
    );
    return results.reduce((final, res) => res === true && final, true);
  }
  validateSignaturesOfInput(inputIndex, validator, pubkey) {
    const input = this.data.inputs[inputIndex];
    if (isTaprootInput(input))
      return this.validateSignaturesOfTaprootInput(
        inputIndex,
        validator,
        pubkey
      );
    return this._validateSignaturesOfInput(inputIndex, validator, pubkey);
  }
  _validateSignaturesOfInput(inputIndex, validator, pubkey) {
    const input = this.data.inputs[inputIndex];
    const partialSig = (input || {}).partialSig;
    if (!input || !partialSig || partialSig.length < 1)
      throw new Error("No signatures to validate");
    if (typeof validator !== "function")
      throw new Error("Need validator function to validate signatures");
    const mySigs = pubkey ? partialSig.filter((sig) => compare(sig.pubkey, pubkey) === 0) : partialSig;
    if (mySigs.length < 1) throw new Error("No signatures for this pubkey");
    const results = [];
    let hashCache;
    let scriptCache;
    let sighashCache;
    for (const pSig of mySigs) {
      const sig = signature.decode(pSig.signature);
      const { hash, script } = sighashCache !== sig.hashType ? getHashForSig(
        inputIndex,
        Object.assign({}, input, { sighashType: sig.hashType }),
        this.__CACHE,
        true
      ) : { hash: hashCache, script: scriptCache };
      sighashCache = sig.hashType;
      hashCache = hash;
      scriptCache = script;
      checkScriptForPubkey(pSig.pubkey, script, "verify");
      results.push(validator(pSig.pubkey, hash, sig.signature));
    }
    return results.every((res) => res === true);
  }
  validateSignaturesOfTaprootInput(inputIndex, validator, pubkey) {
    const input = this.data.inputs[inputIndex];
    const tapKeySig = (input || {}).tapKeySig;
    const tapScriptSig = (input || {}).tapScriptSig;
    if (!input && !tapKeySig && !(tapScriptSig && !tapScriptSig.length))
      throw new Error("No signatures to validate");
    if (typeof validator !== "function")
      throw new Error("Need validator function to validate signatures");
    pubkey = pubkey && toXOnly(pubkey);
    const allHashses = pubkey ? getTaprootHashesForSigValidation(
      inputIndex,
      input,
      this.data.inputs,
      pubkey,
      this.__CACHE
    ) : getAllTaprootHashesForSigValidation(
      inputIndex,
      input,
      this.data.inputs,
      this.__CACHE
    );
    if (!allHashses.length) throw new Error("No signatures for this pubkey");
    const tapKeyHash = allHashses.find((h) => !h.leafHash);
    let validationResultCount = 0;
    if (tapKeySig && tapKeyHash) {
      const isValidTapkeySig = validator(
        tapKeyHash.pubkey,
        tapKeyHash.hash,
        trimTaprootSig(tapKeySig)
      );
      if (!isValidTapkeySig) return false;
      validationResultCount++;
    }
    if (tapScriptSig) {
      for (const tapSig of tapScriptSig) {
        const tapSigHash = allHashses.find(
          (h) => compare(h.pubkey, tapSig.pubkey) === 0
        );
        if (tapSigHash) {
          const isValidTapScriptSig = validator(
            tapSig.pubkey,
            tapSigHash.hash,
            trimTaprootSig(tapSig.signature)
          );
          if (!isValidTapScriptSig) return false;
          validationResultCount++;
        }
      }
    }
    return validationResultCount > 0;
  }
  signAllInputsHD(hdKeyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
    if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
      throw new Error("Need HDSigner to sign input");
    }
    const results = [];
    for (const i of range4(this.data.inputs.length)) {
      try {
        this.signInputHD(i, hdKeyPair, sighashTypes);
        results.push(true);
      } catch (err) {
        results.push(false);
      }
    }
    if (results.every((v) => v === false)) {
      throw new Error("No inputs were signed");
    }
    return this;
  }
  signAllInputsHDAsync(hdKeyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
    return new Promise((resolve, reject) => {
      if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
        return reject(new Error("Need HDSigner to sign input"));
      }
      const results = [];
      const promises = [];
      for (const i of range4(this.data.inputs.length)) {
        promises.push(
          this.signInputHDAsync(i, hdKeyPair, sighashTypes).then(
            () => {
              results.push(true);
            },
            () => {
              results.push(false);
            }
          )
        );
      }
      return Promise.all(promises).then(() => {
        if (results.every((v) => v === false)) {
          return reject(new Error("No inputs were signed"));
        }
        resolve();
      });
    });
  }
  signInputHD(inputIndex, hdKeyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
    if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
      throw new Error("Need HDSigner to sign input");
    }
    const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
    signers.forEach((signer) => this.signInput(inputIndex, signer, sighashTypes));
    return this;
  }
  signInputHDAsync(inputIndex, hdKeyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
    return new Promise((resolve, reject) => {
      if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
        return reject(new Error("Need HDSigner to sign input"));
      }
      const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
      const promises = signers.map(
        (signer) => this.signInputAsync(inputIndex, signer, sighashTypes)
      );
      return Promise.all(promises).then(() => {
        resolve();
      }).catch(reject);
    });
  }
  signAllInputs(keyPair, sighashTypes) {
    if (!keyPair || !keyPair.publicKey)
      throw new Error("Need Signer to sign input");
    const results = [];
    for (const i of range4(this.data.inputs.length)) {
      try {
        this.signInput(i, keyPair, sighashTypes);
        results.push(true);
      } catch (err) {
        results.push(false);
      }
    }
    if (results.every((v) => v === false)) {
      throw new Error("No inputs were signed");
    }
    return this;
  }
  signAllInputsAsync(keyPair, sighashTypes) {
    return new Promise((resolve, reject) => {
      if (!keyPair || !keyPair.publicKey)
        return reject(new Error("Need Signer to sign input"));
      const results = [];
      const promises = [];
      for (const [i] of this.data.inputs.entries()) {
        promises.push(
          this.signInputAsync(i, keyPair, sighashTypes).then(
            () => {
              results.push(true);
            },
            () => {
              results.push(false);
            }
          )
        );
      }
      return Promise.all(promises).then(() => {
        if (results.every((v) => v === false)) {
          return reject(new Error("No inputs were signed"));
        }
        resolve();
      });
    });
  }
  signInput(inputIndex, keyPair, sighashTypes) {
    if (!keyPair || !keyPair.publicKey)
      throw new Error("Need Signer to sign input");
    const input = checkForInput(this.data.inputs, inputIndex);
    if (isTaprootInput(input)) {
      return this._signTaprootInput(
        inputIndex,
        input,
        keyPair,
        void 0,
        sighashTypes
      );
    }
    return this._signInput(inputIndex, keyPair, sighashTypes);
  }
  signTaprootInput(inputIndex, keyPair, tapLeafHashToSign, sighashTypes) {
    if (!keyPair || !keyPair.publicKey)
      throw new Error("Need Signer to sign input");
    const input = checkForInput(this.data.inputs, inputIndex);
    if (isTaprootInput(input))
      return this._signTaprootInput(
        inputIndex,
        input,
        keyPair,
        tapLeafHashToSign,
        sighashTypes
      );
    throw new Error(`Input #${inputIndex} is not of type Taproot.`);
  }
  _signInput(inputIndex, keyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
    const { hash, sighashType } = getHashAndSighashType(
      this.data.inputs,
      inputIndex,
      keyPair.publicKey,
      this.__CACHE,
      sighashTypes
    );
    const partialSig = [
      {
        pubkey: keyPair.publicKey,
        signature: signature.encode(keyPair.sign(hash), sighashType)
      }
    ];
    this.data.updateInput(inputIndex, { partialSig });
    return this;
  }
  _signTaprootInput(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes = [Transaction.SIGHASH_DEFAULT]) {
    const hashesForSig = this.checkTaprootHashesForSig(
      inputIndex,
      input,
      keyPair,
      tapLeafHashToSign,
      allowedSighashTypes
    );
    const tapKeySig = hashesForSig.filter((h) => !h.leafHash).map(
      (h) => serializeTaprootSignature(
        keyPair.signSchnorr(h.hash),
        input.sighashType
      )
    )[0];
    const tapScriptSig = hashesForSig.filter((h) => !!h.leafHash).map((h) => ({
      pubkey: toXOnly(keyPair.publicKey),
      signature: serializeTaprootSignature(
        keyPair.signSchnorr(h.hash),
        input.sighashType
      ),
      leafHash: h.leafHash
    }));
    if (tapKeySig) {
      this.data.updateInput(inputIndex, { tapKeySig });
    }
    if (tapScriptSig.length) {
      this.data.updateInput(inputIndex, { tapScriptSig });
    }
    return this;
  }
  signInputAsync(inputIndex, keyPair, sighashTypes) {
    return Promise.resolve().then(() => {
      if (!keyPair || !keyPair.publicKey)
        throw new Error("Need Signer to sign input");
      const input = checkForInput(this.data.inputs, inputIndex);
      if (isTaprootInput(input))
        return this._signTaprootInputAsync(
          inputIndex,
          input,
          keyPair,
          void 0,
          sighashTypes
        );
      return this._signInputAsync(inputIndex, keyPair, sighashTypes);
    });
  }
  signTaprootInputAsync(inputIndex, keyPair, tapLeafHash, sighashTypes) {
    return Promise.resolve().then(() => {
      if (!keyPair || !keyPair.publicKey)
        throw new Error("Need Signer to sign input");
      const input = checkForInput(this.data.inputs, inputIndex);
      if (isTaprootInput(input))
        return this._signTaprootInputAsync(
          inputIndex,
          input,
          keyPair,
          tapLeafHash,
          sighashTypes
        );
      throw new Error(`Input #${inputIndex} is not of type Taproot.`);
    });
  }
  _signInputAsync(inputIndex, keyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
    const { hash, sighashType } = getHashAndSighashType(
      this.data.inputs,
      inputIndex,
      keyPair.publicKey,
      this.__CACHE,
      sighashTypes
    );
    return Promise.resolve(keyPair.sign(hash)).then((signature2) => {
      const partialSig = [
        {
          pubkey: keyPair.publicKey,
          signature: signature.encode(signature2, sighashType)
        }
      ];
      this.data.updateInput(inputIndex, { partialSig });
    });
  }
  async _signTaprootInputAsync(inputIndex, input, keyPair, tapLeafHash, sighashTypes = [Transaction.SIGHASH_DEFAULT]) {
    const hashesForSig = this.checkTaprootHashesForSig(
      inputIndex,
      input,
      keyPair,
      tapLeafHash,
      sighashTypes
    );
    const signaturePromises = [];
    const tapKeyHash = hashesForSig.filter((h) => !h.leafHash)[0];
    if (tapKeyHash) {
      const tapKeySigPromise = Promise.resolve(
        keyPair.signSchnorr(tapKeyHash.hash)
      ).then((sig) => {
        return { tapKeySig: serializeTaprootSignature(sig, input.sighashType) };
      });
      signaturePromises.push(tapKeySigPromise);
    }
    const tapScriptHashes = hashesForSig.filter((h) => !!h.leafHash);
    if (tapScriptHashes.length) {
      const tapScriptSigPromises = tapScriptHashes.map((tsh) => {
        return Promise.resolve(keyPair.signSchnorr(tsh.hash)).then(
          (signature2) => {
            const tapScriptSig = [
              {
                pubkey: toXOnly(keyPair.publicKey),
                signature: serializeTaprootSignature(
                  signature2,
                  input.sighashType
                ),
                leafHash: tsh.leafHash
              }
            ];
            return { tapScriptSig };
          }
        );
      });
      signaturePromises.push(...tapScriptSigPromises);
    }
    return Promise.all(signaturePromises).then((results) => {
      results.forEach((v) => this.data.updateInput(inputIndex, v));
    });
  }
  checkTaprootHashesForSig(inputIndex, input, keyPair, tapLeafHashToSign, allowedSighashTypes) {
    if (typeof keyPair.signSchnorr !== "function")
      throw new Error(
        `Need Schnorr Signer to sign taproot input #${inputIndex}.`
      );
    const hashesForSig = getTaprootHashesForSigning(
      inputIndex,
      input,
      this.data.inputs,
      keyPair.publicKey,
      this.__CACHE,
      tapLeafHashToSign,
      allowedSighashTypes
    );
    if (!hashesForSig || !hashesForSig.length)
      throw new Error(
        `Can not sign for input #${inputIndex} with the key ${toHex(keyPair.publicKey)}`
      );
    return hashesForSig;
  }
  toBuffer() {
    checkCache(this.__CACHE);
    return this.data.toBuffer();
  }
  toHex() {
    checkCache(this.__CACHE);
    return this.data.toHex();
  }
  toBase64() {
    checkCache(this.__CACHE);
    return this.data.toBase64();
  }
  updateGlobal(updateData) {
    this.data.updateGlobal(updateData);
    return this;
  }
  updateInput(inputIndex, updateData) {
    if (updateData.witnessScript) checkInvalidP2WSH(updateData.witnessScript);
    checkTaprootInputFields(
      this.data.inputs[inputIndex],
      updateData,
      "updateInput"
    );
    this.data.updateInput(inputIndex, updateData);
    if (updateData.nonWitnessUtxo) {
      addNonWitnessTxCache(
        this.__CACHE,
        this.data.inputs[inputIndex],
        inputIndex
      );
    }
    return this;
  }
  updateOutput(outputIndex, updateData) {
    const outputData = this.data.outputs[outputIndex];
    checkTaprootOutputFields(outputData, updateData, "updateOutput");
    this.data.updateOutput(outputIndex, updateData);
    return this;
  }
  addUnknownKeyValToGlobal(keyVal) {
    this.data.addUnknownKeyValToGlobal(keyVal);
    return this;
  }
  addUnknownKeyValToInput(inputIndex, keyVal) {
    this.data.addUnknownKeyValToInput(inputIndex, keyVal);
    return this;
  }
  addUnknownKeyValToOutput(outputIndex, keyVal) {
    this.data.addUnknownKeyValToOutput(outputIndex, keyVal);
    return this;
  }
  clearFinalizedInput(inputIndex) {
    this.data.clearFinalizedInput(inputIndex);
    return this;
  }
};
var transactionFromBuffer = (buffer) => new PsbtTransaction(buffer);
var PsbtTransaction = class {
  tx;
  constructor(buffer = Uint8Array.from([2, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
    this.tx = Transaction.fromBuffer(buffer);
    checkTxEmpty(this.tx);
    Object.defineProperty(this, "tx", {
      enumerable: false,
      writable: true
    });
  }
  getInputOutputCounts() {
    return {
      inputCount: this.tx.ins.length,
      outputCount: this.tx.outs.length
    };
  }
  addInput(input) {
    if (input.hash === void 0 || input.index === void 0 || !(input.hash instanceof Uint8Array) && typeof input.hash !== "string" || typeof input.index !== "number") {
      throw new Error("Error adding input.");
    }
    const hash = typeof input.hash === "string" ? reverseBuffer(fromHex(input.hash)) : input.hash;
    this.tx.addInput(hash, input.index, input.sequence);
  }
  addOutput(output) {
    if (output.script === void 0 || output.value === void 0 || !(output.script instanceof Uint8Array) || typeof output.value !== "bigint") {
      throw new Error("Error adding output.");
    }
    this.tx.addOutput(output.script, output.value);
  }
  toBuffer() {
    return this.tx.toBuffer();
  }
};
function canFinalize(input, script, scriptType) {
  switch (scriptType) {
    case "pubkey":
    case "pubkeyhash":
    case "witnesspubkeyhash":
      return hasSigs(1, input.partialSig);
    case "multisig":
      const p2ms2 = p2ms({ output: script });
      return hasSigs(p2ms2.m, input.partialSig, p2ms2.pubkeys);
    default:
      return false;
  }
}
function checkCache(cache) {
  if (cache.__UNSAFE_SIGN_NONSEGWIT !== false) {
    throw new Error("Not BIP174 compliant, can not export");
  }
}
function hasSigs(neededSigs, partialSig, pubkeys) {
  if (!partialSig) return false;
  let sigs;
  if (pubkeys) {
    sigs = pubkeys.map((pkey) => {
      const pubkey = compressPubkey(pkey);
      return partialSig.find(
        (pSig) => compare(pSig.pubkey, pubkey) === 0
      );
    }).filter((v) => !!v);
  } else {
    sigs = partialSig;
  }
  if (sigs.length > neededSigs) throw new Error("Too many signatures");
  return sigs.length === neededSigs;
}
function isFinalized(input) {
  return !!input.finalScriptSig || !!input.finalScriptWitness;
}
function bip32DerivationIsMine(root) {
  return (d) => {
    if (compare(root.fingerprint, d.masterFingerprint)) return false;
    if (compare(root.derivePath(d.path).publicKey, d.pubkey))
      return false;
    return true;
  };
}
function check32Bit(num) {
  if (typeof num !== "number" || num !== Math.floor(num) || num > 4294967295 || num < 0) {
    throw new Error("Invalid 32 bit integer");
  }
}
function checkFees(psbt, cache, opts) {
  const feeRate = cache.__FEE_RATE || psbt.getFeeRate();
  const vsize = cache.__EXTRACTED_TX.virtualSize();
  const satoshis = feeRate * vsize;
  if (feeRate >= opts.maximumFeeRate) {
    throw new Error(
      `Warning: You are paying around ${(satoshis / 1e8).toFixed(8)} in fees, which is ${feeRate} satoshi per byte for a transaction with a VSize of ${vsize} bytes (segwit counted as 0.25 byte per byte). Use setMaximumFeeRate method to raise your threshold, or pass true to the first arg of extractTransaction.`
    );
  }
}
function checkInputsForPartialSig(inputs2, action) {
  inputs2.forEach((input) => {
    const throws = isTaprootInput(input) ? checkTaprootInputForSigs(input, action) : checkInputForSig(input, action);
    if (throws)
      throw new Error("Can not modify transaction, signatures exist.");
  });
}
function checkPartialSigSighashes(input) {
  if (!input.sighashType || !input.partialSig) return;
  const { partialSig, sighashType } = input;
  partialSig.forEach((pSig) => {
    const { hashType } = signature.decode(pSig.signature);
    if (sighashType !== hashType) {
      throw new Error("Signature sighash does not match input sighash type");
    }
  });
}
function checkScriptForPubkey(pubkey, script, action) {
  if (!pubkeyInScript(pubkey, script)) {
    throw new Error(
      `Can not ${action} for this input with the key ${toHex(pubkey)}`
    );
  }
}
function checkTxEmpty(tx) {
  const isEmpty = tx.ins.every(
    (input) => input.script && input.script.length === 0 && input.witness && input.witness.length === 0
  );
  if (!isEmpty) {
    throw new Error("Format Error: Transaction ScriptSigs are not empty");
  }
}
function checkTxForDupeIns(tx, cache) {
  tx.ins.forEach((input) => {
    checkTxInputCache(cache, input);
  });
}
function checkTxInputCache(cache, input) {
  const key = toHex(reverseBuffer(Uint8Array.from(input.hash))) + ":" + input.index;
  if (cache.__TX_IN_CACHE[key]) throw new Error("Duplicate input detected.");
  cache.__TX_IN_CACHE[key] = 1;
}
function scriptCheckerFactory(payment, paymentScriptName) {
  return (inputIndex, scriptPubKey, redeemScript, ioType) => {
    const redeemScriptOutput = payment({
      redeem: { output: redeemScript }
    }).output;
    if (compare(scriptPubKey, redeemScriptOutput)) {
      throw new Error(
        `${paymentScriptName} for ${ioType} #${inputIndex} doesn't match the scriptPubKey in the prevout`
      );
    }
  };
}
var checkRedeemScript = scriptCheckerFactory(p2sh, "Redeem script");
var checkWitnessScript = scriptCheckerFactory(
  p2wsh,
  "Witness script"
);
function getTxCacheValue(key, name, inputs2, c) {
  if (!inputs2.every(isFinalized))
    throw new Error(`PSBT must be finalized to calculate ${name}`);
  if (key === "__FEE_RATE" && c.__FEE_RATE) return c.__FEE_RATE;
  if (key === "__FEE" && c.__FEE) return c.__FEE;
  let tx;
  let mustFinalize = true;
  if (c.__EXTRACTED_TX) {
    tx = c.__EXTRACTED_TX;
    mustFinalize = false;
  } else {
    tx = c.__TX.clone();
  }
  inputFinalizeGetAmts(inputs2, tx, c, mustFinalize);
  if (key === "__FEE_RATE") return c.__FEE_RATE;
  else if (key === "__FEE") return c.__FEE;
}
function getFinalScripts(inputIndex, input, script, isSegwit, isP2SH, isP2WSH) {
  const scriptType = classifyScript(script);
  if (!canFinalize(input, script, scriptType))
    throw new Error(`Can not finalize input #${inputIndex}`);
  return prepareFinalScripts(
    script,
    scriptType,
    input.partialSig,
    isSegwit,
    isP2SH,
    isP2WSH
  );
}
function prepareFinalScripts(script, scriptType, partialSig, isSegwit, isP2SH, isP2WSH) {
  let finalScriptSig;
  let finalScriptWitness;
  const payment = getPayment(script, scriptType, partialSig);
  const p2wsh2 = !isP2WSH ? null : p2wsh({ redeem: payment });
  const p2sh2 = !isP2SH ? null : p2sh({ redeem: p2wsh2 || payment });
  if (isSegwit) {
    if (p2wsh2) {
      finalScriptWitness = witnessStackToScriptWitness(p2wsh2.witness);
    } else {
      finalScriptWitness = witnessStackToScriptWitness(payment.witness);
    }
    if (p2sh2) {
      finalScriptSig = p2sh2.input;
    }
  } else {
    if (p2sh2) {
      finalScriptSig = p2sh2.input;
    } else {
      finalScriptSig = payment.input;
    }
  }
  return {
    finalScriptSig,
    finalScriptWitness
  };
}
function getHashAndSighashType(inputs2, inputIndex, pubkey, cache, sighashTypes) {
  const input = checkForInput(inputs2, inputIndex);
  const { hash, sighashType, script } = getHashForSig(
    inputIndex,
    input,
    cache,
    false,
    sighashTypes
  );
  checkScriptForPubkey(pubkey, script, "sign");
  return {
    hash,
    sighashType
  };
}
function getHashForSig(inputIndex, input, cache, forValidate, sighashTypes) {
  const unsignedTx = cache.__TX;
  const sighashType = input.sighashType || Transaction.SIGHASH_ALL;
  checkSighashTypeAllowed(sighashType, sighashTypes);
  let hash;
  let prevout;
  if (input.nonWitnessUtxo) {
    const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
      cache,
      input,
      inputIndex
    );
    const prevoutHash = unsignedTx.ins[inputIndex].hash;
    const utxoHash = nonWitnessUtxoTx.getHash();
    if (compare(prevoutHash, utxoHash) !== 0) {
      throw new Error(
        `Non-witness UTXO hash for input #${inputIndex} doesn't match the hash specified in the prevout`
      );
    }
    const prevoutIndex = unsignedTx.ins[inputIndex].index;
    prevout = nonWitnessUtxoTx.outs[prevoutIndex];
  } else if (input.witnessUtxo) {
    prevout = input.witnessUtxo;
  } else {
    throw new Error("Need a Utxo input item for signing");
  }
  const { meaningfulScript, type } = getMeaningfulScript(
    prevout.script,
    inputIndex,
    "input",
    input.redeemScript,
    input.witnessScript
  );
  if (["p2sh-p2wsh", "p2wsh"].indexOf(type) >= 0) {
    hash = unsignedTx.hashForWitnessV0(
      inputIndex,
      meaningfulScript,
      prevout.value,
      sighashType
    );
  } else if (isP2WPKH(meaningfulScript)) {
    const signingScript = p2pkh({
      hash: meaningfulScript.slice(2)
    }).output;
    hash = unsignedTx.hashForWitnessV0(
      inputIndex,
      signingScript,
      prevout.value,
      sighashType
    );
  } else {
    if (input.nonWitnessUtxo === void 0 && cache.__UNSAFE_SIGN_NONSEGWIT === false)
      throw new Error(
        `Input #${inputIndex} has witnessUtxo but non-segwit script: ${toHex(meaningfulScript)}`
      );
    if (!forValidate && cache.__UNSAFE_SIGN_NONSEGWIT !== false)
      console.warn(
        "Warning: Signing non-segwit inputs without the full parent transaction means there is a chance that a miner could feed you incorrect information to trick you into paying large fees. This behavior is the same as Psbt's predecessor (TransactionBuilder - now removed) when signing non-segwit scripts. You are not able to export this Psbt with toBuffer|toBase64|toHex since it is not BIP174 compliant.\n*********************\nPROCEED WITH CAUTION!\n*********************"
      );
    hash = unsignedTx.hashForSignature(
      inputIndex,
      meaningfulScript,
      sighashType
    );
  }
  return {
    script: meaningfulScript,
    sighashType,
    hash
  };
}
function getAllTaprootHashesForSigValidation(inputIndex, input, inputs2, cache) {
  const allPublicKeys = [];
  if (input.tapInternalKey) {
    const key = getPrevoutTaprootKey(inputIndex, input, cache);
    if (key) {
      allPublicKeys.push(key);
    }
  }
  if (input.tapScriptSig) {
    const tapScriptPubkeys = input.tapScriptSig.map((tss) => tss.pubkey);
    allPublicKeys.push(...tapScriptPubkeys);
  }
  const allHashes = allPublicKeys.map(
    (publicKey) => getTaprootHashesForSigValidation(
      inputIndex,
      input,
      inputs2,
      publicKey,
      cache
    )
  );
  return allHashes.flat();
}
function getPrevoutTaprootKey(inputIndex, input, cache) {
  const { script } = getScriptAndAmountFromUtxo(inputIndex, input, cache);
  return isP2TR(script) ? script.subarray(2, 34) : null;
}
function trimTaprootSig(signature2) {
  return signature2.length === 64 ? signature2 : signature2.subarray(0, 64);
}
function getTaprootHashesForSigning(inputIndex, input, inputs2, pubkey, cache, tapLeafHashToSign, allowedSighashTypes) {
  const sighashType = input.sighashType || Transaction.SIGHASH_DEFAULT;
  checkSighashTypeAllowed(sighashType, allowedSighashTypes);
  const keySpend = Boolean(input.tapInternalKey && !tapLeafHashToSign);
  return getTaprootHashesForSig(
    inputIndex,
    input,
    inputs2,
    pubkey,
    cache,
    keySpend,
    sighashType,
    tapLeafHashToSign
  );
}
function getTaprootHashesForSigValidation(inputIndex, input, inputs2, pubkey, cache) {
  const sighashType = input.sighashType || Transaction.SIGHASH_DEFAULT;
  const keySpend = Boolean(input.tapKeySig);
  return getTaprootHashesForSig(
    inputIndex,
    input,
    inputs2,
    pubkey,
    cache,
    keySpend,
    sighashType
  );
}
function getTaprootHashesForSig(inputIndex, input, inputs2, pubkey, cache, keySpend, sighashType, tapLeafHashToSign) {
  const unsignedTx = cache.__TX;
  const prevOuts = inputs2.map(
    (i, index) => getScriptAndAmountFromUtxo(index, i, cache)
  );
  const signingScripts = prevOuts.map((o) => o.script);
  const values = prevOuts.map((o) => o.value);
  const hashes = [];
  if (keySpend) {
    const outputKey = getPrevoutTaprootKey(inputIndex, input, cache) || Uint8Array.from([]);
    if (compare(toXOnly(pubkey), outputKey) === 0) {
      const tapKeyHash = unsignedTx.hashForWitnessV1(
        inputIndex,
        signingScripts,
        values,
        sighashType
      );
      hashes.push({ pubkey, hash: tapKeyHash });
    }
  }
  const tapLeafHashes = (input.tapLeafScript || []).filter((tapLeaf) => pubkeyInScript(pubkey, tapLeaf.script)).map((tapLeaf) => {
    const hash = tapleafHash({
      output: tapLeaf.script,
      version: tapLeaf.leafVersion
    });
    return Object.assign({ hash }, tapLeaf);
  }).filter(
    (tapLeaf) => !tapLeafHashToSign || compare(tapLeafHashToSign, tapLeaf.hash) === 0
  ).map((tapLeaf) => {
    const tapScriptHash = unsignedTx.hashForWitnessV1(
      inputIndex,
      signingScripts,
      values,
      sighashType,
      tapLeaf.hash
    );
    return {
      pubkey,
      hash: tapScriptHash,
      leafHash: tapLeaf.hash
    };
  });
  return hashes.concat(tapLeafHashes);
}
function checkSighashTypeAllowed(sighashType, sighashTypes) {
  if (sighashTypes && sighashTypes.indexOf(sighashType) < 0) {
    const str = sighashTypeToString(sighashType);
    throw new Error(
      `Sighash type is not allowed. Retry the sign method passing the sighashTypes array of whitelisted types. Sighash type: ${str}`
    );
  }
}
function getPayment(script, scriptType, partialSig) {
  let payment;
  switch (scriptType) {
    case "multisig":
      const sigs = getSortedSigs(script, partialSig);
      payment = p2ms({
        output: script,
        signatures: sigs
      });
      break;
    case "pubkey":
      payment = p2pk({
        output: script,
        signature: partialSig[0].signature
      });
      break;
    case "pubkeyhash":
      payment = p2pkh({
        output: script,
        pubkey: partialSig[0].pubkey,
        signature: partialSig[0].signature
      });
      break;
    case "witnesspubkeyhash":
      payment = p2wpkh({
        output: script,
        pubkey: partialSig[0].pubkey,
        signature: partialSig[0].signature
      });
      break;
  }
  return payment;
}
function getScriptFromInput(inputIndex, input, cache) {
  const unsignedTx = cache.__TX;
  const res = {
    script: null,
    isSegwit: false,
    isP2SH: false,
    isP2WSH: false
  };
  res.isP2SH = !!input.redeemScript;
  res.isP2WSH = !!input.witnessScript;
  if (input.witnessScript) {
    res.script = input.witnessScript;
  } else if (input.redeemScript) {
    res.script = input.redeemScript;
  } else {
    if (input.nonWitnessUtxo) {
      const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
        cache,
        input,
        inputIndex
      );
      const prevoutIndex = unsignedTx.ins[inputIndex].index;
      res.script = nonWitnessUtxoTx.outs[prevoutIndex].script;
    } else if (input.witnessUtxo) {
      res.script = input.witnessUtxo.script;
    }
  }
  if (input.witnessScript || isP2WPKH(res.script)) {
    res.isSegwit = true;
  }
  return res;
}
function getSignersFromHD(inputIndex, inputs2, hdKeyPair) {
  const input = checkForInput(inputs2, inputIndex);
  if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
    throw new Error("Need bip32Derivation to sign with HD");
  }
  const myDerivations = input.bip32Derivation.map((bipDv) => {
    if (compare(bipDv.masterFingerprint, hdKeyPair.fingerprint) === 0) {
      return bipDv;
    } else {
      return;
    }
  }).filter((v) => !!v);
  if (myDerivations.length === 0) {
    throw new Error(
      "Need one bip32Derivation masterFingerprint to match the HDSigner fingerprint"
    );
  }
  const signers = myDerivations.map((bipDv) => {
    const node = hdKeyPair.derivePath(bipDv.path);
    if (compare(bipDv.pubkey, node.publicKey) !== 0) {
      throw new Error("pubkey did not match bip32Derivation");
    }
    return node;
  });
  return signers;
}
function getSortedSigs(script, partialSig) {
  const p2ms2 = p2ms({ output: script });
  return p2ms2.pubkeys.map((pk) => {
    return (partialSig.filter((ps) => {
      return compare(ps.pubkey, pk) === 0;
    })[0] || {}).signature;
  }).filter((v) => !!v);
}
function scriptWitnessToWitnessStack(buffer) {
  let offset = 0;
  function readSlice(n) {
    offset += n;
    return buffer.slice(offset - n, offset);
  }
  function readVarInt() {
    const vi = decode5(buffer, offset);
    offset += encodingLength2(vi.bigintValue);
    return vi.numberValue;
  }
  function readVarSlice() {
    return readSlice(readVarInt());
  }
  function readVector() {
    const count = readVarInt();
    const vector = [];
    for (let i = 0; i < count; i++) vector.push(readVarSlice());
    return vector;
  }
  return readVector();
}
function sighashTypeToString(sighashType) {
  let text = sighashType & Transaction.SIGHASH_ANYONECANPAY ? "SIGHASH_ANYONECANPAY | " : "";
  const sigMod = sighashType & 31;
  switch (sigMod) {
    case Transaction.SIGHASH_ALL:
      text += "SIGHASH_ALL";
      break;
    case Transaction.SIGHASH_SINGLE:
      text += "SIGHASH_SINGLE";
      break;
    case Transaction.SIGHASH_NONE:
      text += "SIGHASH_NONE";
      break;
  }
  return text;
}
function addNonWitnessTxCache(cache, input, inputIndex) {
  cache.__NON_WITNESS_UTXO_BUF_CACHE[inputIndex] = input.nonWitnessUtxo;
  const tx = Transaction.fromBuffer(input.nonWitnessUtxo);
  cache.__NON_WITNESS_UTXO_TX_CACHE[inputIndex] = tx;
  const self = cache;
  const selfIndex = inputIndex;
  delete input.nonWitnessUtxo;
  Object.defineProperty(input, "nonWitnessUtxo", {
    enumerable: true,
    get() {
      const buf = self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex];
      const txCache = self.__NON_WITNESS_UTXO_TX_CACHE[selfIndex];
      if (buf !== void 0) {
        return buf;
      } else {
        const newBuf = txCache.toBuffer();
        self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = newBuf;
        return newBuf;
      }
    },
    set(data) {
      self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = data;
    }
  });
}
function inputFinalizeGetAmts(inputs2, tx, cache, mustFinalize) {
  let inputAmount = 0n;
  inputs2.forEach((input, idx) => {
    if (mustFinalize && input.finalScriptSig)
      tx.ins[idx].script = input.finalScriptSig;
    if (mustFinalize && input.finalScriptWitness) {
      tx.ins[idx].witness = scriptWitnessToWitnessStack(
        input.finalScriptWitness
      );
    }
    if (input.witnessUtxo) {
      inputAmount += input.witnessUtxo.value;
    } else if (input.nonWitnessUtxo) {
      const nwTx = nonWitnessUtxoTxFromCache(cache, input, idx);
      const vout = tx.ins[idx].index;
      const out = nwTx.outs[vout];
      inputAmount += out.value;
    }
  });
  const outputAmount = tx.outs.reduce((total, o) => total + o.value, 0n);
  const fee = inputAmount - outputAmount;
  if (fee < 0) {
    throw new Error("Outputs are spending more than Inputs");
  }
  const bytes = tx.virtualSize();
  cache.__FEE = fee;
  cache.__EXTRACTED_TX = tx;
  cache.__FEE_RATE = Math.floor(Number(fee / BigInt(bytes)));
}
function nonWitnessUtxoTxFromCache(cache, input, inputIndex) {
  const c = cache.__NON_WITNESS_UTXO_TX_CACHE;
  if (!c[inputIndex]) {
    addNonWitnessTxCache(cache, input, inputIndex);
  }
  return c[inputIndex];
}
function getScriptFromUtxo(inputIndex, input, cache) {
  const { script } = getScriptAndAmountFromUtxo(inputIndex, input, cache);
  return script;
}
function getScriptAndAmountFromUtxo(inputIndex, input, cache) {
  if (input.witnessUtxo !== void 0) {
    return {
      script: input.witnessUtxo.script,
      value: input.witnessUtxo.value
    };
  } else if (input.nonWitnessUtxo !== void 0) {
    const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(
      cache,
      input,
      inputIndex
    );
    const o = nonWitnessUtxoTx.outs[cache.__TX.ins[inputIndex].index];
    return { script: o.script, value: o.value };
  } else {
    throw new Error("Can't find pubkey in input without Utxo data");
  }
}
function pubkeyInInput(pubkey, input, inputIndex, cache) {
  const script = getScriptFromUtxo(inputIndex, input, cache);
  const { meaningfulScript } = getMeaningfulScript(
    script,
    inputIndex,
    "input",
    input.redeemScript,
    input.witnessScript
  );
  return pubkeyInScript(pubkey, meaningfulScript);
}
function pubkeyInOutput(pubkey, output, outputIndex, cache) {
  const script = cache.__TX.outs[outputIndex].script;
  const { meaningfulScript } = getMeaningfulScript(
    script,
    outputIndex,
    "output",
    output.redeemScript,
    output.witnessScript
  );
  return pubkeyInScript(pubkey, meaningfulScript);
}
function redeemFromFinalScriptSig(finalScript) {
  if (!finalScript) return;
  const decomp = decompile(finalScript);
  if (!decomp) return;
  const lastItem = decomp[decomp.length - 1];
  if (!(lastItem instanceof Uint8Array) || isPubkeyLike(lastItem) || isSigLike(lastItem))
    return;
  const sDecomp = decompile(lastItem);
  if (!sDecomp) return;
  return lastItem;
}
function redeemFromFinalWitnessScript(finalScript) {
  if (!finalScript) return;
  const decomp = scriptWitnessToWitnessStack(finalScript);
  const lastItem = decomp[decomp.length - 1];
  if (isPubkeyLike(lastItem)) return;
  const sDecomp = decompile(lastItem);
  if (!sDecomp) return;
  return lastItem;
}
function compressPubkey(pubkey) {
  if (pubkey.length === 65) {
    const parity = pubkey[64] & 1;
    const newKey = pubkey.slice(0, 33);
    newKey[0] = 2 | parity;
    return newKey;
  }
  return pubkey.slice();
}
function isPubkeyLike(buf) {
  return buf.length === 33 && isCanonicalPubKey(buf);
}
function isSigLike(buf) {
  return isCanonicalScriptSignature(buf);
}
function getMeaningfulScript(script, index, ioType, redeemScript, witnessScript) {
  const isP2SH = isP2SHScript(script);
  const isP2SHP2WSH = isP2SH && redeemScript && isP2WSHScript(redeemScript);
  const isP2WSH = isP2WSHScript(script);
  if (isP2SH && redeemScript === void 0)
    throw new Error("scriptPubkey is P2SH but redeemScript missing");
  if ((isP2WSH || isP2SHP2WSH) && witnessScript === void 0)
    throw new Error(
      "scriptPubkey or redeemScript is P2WSH but witnessScript missing"
    );
  let meaningfulScript;
  if (isP2SHP2WSH) {
    meaningfulScript = witnessScript;
    checkRedeemScript(index, script, redeemScript, ioType);
    checkWitnessScript(index, redeemScript, witnessScript, ioType);
    checkInvalidP2WSH(meaningfulScript);
  } else if (isP2WSH) {
    meaningfulScript = witnessScript;
    checkWitnessScript(index, script, witnessScript, ioType);
    checkInvalidP2WSH(meaningfulScript);
  } else if (isP2SH) {
    meaningfulScript = redeemScript;
    checkRedeemScript(index, script, redeemScript, ioType);
  } else {
    meaningfulScript = script;
  }
  return {
    meaningfulScript,
    type: isP2SHP2WSH ? "p2sh-p2wsh" : isP2SH ? "p2sh" : isP2WSH ? "p2wsh" : "raw"
  };
}
function checkInvalidP2WSH(script) {
  if (isP2WPKH(script) || isP2SHScript(script)) {
    throw new Error("P2WPKH or P2SH can not be contained within P2WSH");
  }
}
function classifyScript(script) {
  if (isP2WPKH(script)) return "witnesspubkeyhash";
  if (isP2PKH(script)) return "pubkeyhash";
  if (isP2MS(script)) return "multisig";
  if (isP2PK(script)) return "pubkey";
  return "nonstandard";
}
function range4(n) {
  return [...Array(n).keys()];
}

// apps/frontend/client/scripts/pages/donate.js
var import_qrcode = __toESM(require_browser(), 1);

// apps/frontend/client/scripts/config.js
var CLIENT_CONFIG = {
  backendEndpoint: "https://newfreebitcoins.com"
};

// apps/frontend/client/scripts/consts.js
var BACKEND_ENDPOINT = CLIENT_CONFIG.backendEndpoint;
var NETWORK_CONFIG = {
  mainnet: {
    label: "Mainnet",
    bip84CoinType: 0
  },
  regtest: {
    label: "Regtest",
    bip84CoinType: 1
  }
};
function getRuntimeAppConfig() {
  return window.__APP_CONFIG__ ?? null;
}
function getCurrencyCode() {
  return getRuntimeAppConfig()?.unitLabel ?? "BTC";
}
function formatSatsAsCoins(sats) {
  return `${(Number(sats ?? 0) / 1e8).toFixed(8)} ${getCurrencyCode()}`;
}
function isLikelyAddressForNetwork(value2, network) {
  const trimmed = String(value2 ?? "").trim();
  if (!trimmed) {
    return false;
  }
  if (network === "regtest") {
    return /^(bcrt1|[mn2])[a-zA-HJ-NP-Z0-9]{20,90}$/.test(trimmed);
  }
  return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{20,90}$/.test(trimmed);
}

// apps/frontend/client/scripts/api.js
var runtimeConfigPromise = null;
function getElectrsApiBaseUrl() {
  const configured = window.__APP_CONFIG__?.electrs?.apiBaseUrl;
  if (!configured) {
    return "";
  }
  return String(configured).replace(/\/+$/, "");
}
function getExplorerTxBaseUrl() {
  const configured = window.__APP_CONFIG__?.explorer?.txBaseUrl;
  if (!configured) {
    return "";
  }
  return String(configured).replace(/\/+$/, "/");
}
async function getElectrsJson(path) {
  const baseUrl = getElectrsApiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return {
        ok: false,
        error: `request_failed_${response.status}`
      };
    }
    const payload = await parseJson(response);
    return {
      ok: true,
      data: payload
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "network_error"
    };
  }
}
async function getElectrsText(path) {
  const baseUrl = getElectrsApiBaseUrl();
  if (!baseUrl) {
    return null;
  }
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      cache: "no-store"
    });
    if (!response.ok) {
      return {
        ok: false,
        error: `request_failed_${response.status}`
      };
    }
    return {
      ok: true,
      data: await response.text()
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "network_error"
    };
  }
}
async function parseJson(response) {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}
async function getJson(url) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      credentials: "include"
    });
    const payload = await parseJson(response);
    if (!response.ok) {
      return {
        ok: false,
        error: payload?.error ?? `request_failed_${response.status}`
      };
    }
    return {
      ok: true,
      data: payload
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "network_error"
    };
  }
}
async function postJson(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    const responsePayload = await parseJson(response);
    if (!response.ok) {
      return {
        ok: false,
        error: responsePayload?.error ?? `request_failed_${response.status}`
      };
    }
    return {
      ok: true,
      data: responsePayload
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      error: "network_error"
    };
  }
}
async function getAppConfig() {
  if (window.__APP_CONFIG__) {
    return {
      ok: true,
      data: window.__APP_CONFIG__
    };
  }
  if (!runtimeConfigPromise) {
    runtimeConfigPromise = getJson(`${BACKEND_ENDPOINT}/api/config`).then((result) => {
      if (!result.ok) {
        runtimeConfigPromise = null;
        return {
          ok: false,
          error: result.error
        };
      }
      window.__APP_CONFIG__ = result.data;
      return {
        ok: true,
        data: result.data
      };
    });
  }
  return runtimeConfigPromise;
}
async function getRuntimeConfig() {
  return getAppConfig();
}
async function getWalletBalance(address) {
  const electrsResult = await getElectrsJson(
    `/address/${encodeURIComponent(address)}`
  );
  if (electrsResult?.ok) {
    const chainStats = electrsResult.data?.chain_stats ?? {};
    const mempoolStats = electrsResult.data?.mempool_stats ?? {};
    return {
      ok: true,
      data: {
        confirmed: Number(chainStats.funded_txo_sum ?? 0) - Number(chainStats.spent_txo_sum ?? 0),
        unconfirmed: Number(mempoolStats.funded_txo_sum ?? 0) - Number(mempoolStats.spent_txo_sum ?? 0)
      }
    };
  }
  const url = new URL(`${BACKEND_ENDPOINT}/api/wallet/balance`);
  url.searchParams.set("address", address);
  const result = await getJson(url.toString());
  if (!result.ok) {
    return result;
  }
  return {
    ok: true,
    data: result.data
  };
}
async function getWalletUtxos(address) {
  const electrsResult = await getElectrsJson(
    `/address/${encodeURIComponent(address)}/utxo`
  );
  if (electrsResult?.ok) {
    return {
      ok: true,
      data: {
        address,
        utxos: Array.isArray(electrsResult.data) ? electrsResult.data.map((utxo) => ({
          txid: String(utxo.txid ?? ""),
          vout: Number(utxo.vout ?? 0),
          value: Number(utxo.value ?? 0),
          height: utxo.status?.confirmed ? Number(utxo.status?.block_height ?? 0) : 0
        })) : []
      }
    };
  }
  const url = new URL(`${BACKEND_ENDPOINT}/api/donations/wallet-utxos`);
  url.searchParams.set("address", address);
  return getJson(url.toString());
}
async function getWalletActivity(address, limit = 15) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/donations/activity`);
  url.searchParams.set("address", address);
  url.searchParams.set("limit", String(limit));
  return getJson(url.toString());
}
async function getDonorStatus(address) {
  const url = new URL(`${BACKEND_ENDPOINT}/api/donations/donor-status`);
  url.searchParams.set("address", address);
  return getJson(url.toString());
}
async function reserveDonationRequests(donorAddress, maxRequests) {
  return postJson(`${BACKEND_ENDPOINT}/api/donations/reserve-requests`, {
    donorAddress,
    maxRequests
  });
}
async function submitDonationFulfillment(donorAddress, requestIds, rawTransactionHex) {
  return postJson(`${BACKEND_ENDPOINT}/api/donations/submit-fulfillment`, {
    donorAddress,
    requestIds,
    rawTransactionHex
  });
}
async function sendDonationTransaction(donorAddress, rawTransactionHex) {
  return postJson(`${BACKEND_ENDPOINT}/api/donations/send-transaction`, {
    donorAddress,
    rawTransactionHex
  });
}
async function getTransactionStatus(txid) {
  const statusResult = await getElectrsJson(`/tx/${encodeURIComponent(txid)}/status`);
  if (statusResult?.ok) {
    const status = statusResult.data ?? {};
    let confirmations = 0;
    if (status.confirmed && status.block_height) {
      const tipHeightResult = await getElectrsText("/blocks/tip/height");
      const tipHeight = Number(tipHeightResult?.data ?? 0);
      if (Number.isInteger(tipHeight) && tipHeight >= Number(status.block_height)) {
        confirmations = tipHeight - Number(status.block_height) + 1;
      }
    }
    return {
      ok: true,
      data: {
        txid,
        confirmations,
        confirmed: Boolean(status.confirmed),
        blocktime: Number(status.block_time ?? 0) > 0 ? Number(status.block_time) : null,
        explorerUrl: getExplorerTxBaseUrl() ? `${getExplorerTxBaseUrl()}${encodeURIComponent(txid)}` : null
      }
    };
  }
  const url = new URL(`${BACKEND_ENDPOINT}/api/donations/tx-status`);
  url.searchParams.set("txid", txid);
  return getJson(url.toString());
}
async function getDonationChallenge() {
  const result = await getJson(`${BACKEND_ENDPOINT}/api/donations/challenge`);
  if (!result.ok) {
    return result;
  }
  return {
    ok: true,
    data: result.data
  };
}
async function sendDonationHeartbeat(payload) {
  const result = await postJson(`${BACKEND_ENDPOINT}/api/donations/heartbeat`, payload);
  if (!result.ok) {
    return result;
  }
  return {
    ok: true,
    data: result.data
  };
}

// apps/frontend/client/scripts/pages/donate.js
var STORAGE_KEY_PREFIX = "donationWallet";
var LEGACY_STORAGE_KEY = STORAGE_KEY_PREFIX;
var DUST_THRESHOLD = 546;
var WALLET_AUTO_REFRESH_MS = 1e4;
var SEND_REFETCH_DELAY_MS = 1500;
var GRAFFITI_MAX_LENGTH = 80;
var DONATION_HEARTBEAT_CONTEXT = "new-free-bitcoins-donation-heartbeat";
var MAX_FEE_RATE_SAT_PER_VBYTE = 500;
window.Buffer ??= import_buffer.Buffer;
var appConfig = null;
var pendingMnemonic = "";
var pendingWalletMode = "create";
var confirmationIndexes = [];
var confirmationStep = "password";
var unlockedWalletState = null;
var donorStatusState = null;
var donationRuntimeState = {
  enabled: false,
  cycleTimeoutId: null,
  cycleInFlight: false,
  lastHeartbeatAt: 0,
  pendingTxId: ""
};
var walletActivityItems = [];
var walletActivityPage = 1;
var walletAutoRefreshIntervalId = null;
var walletDataRefetchTimeoutId = null;
var WALLET_ACTIVITY_PAGE_SIZE = 8;
var DONATE_HASHES = {
  onboarding: "#donate",
  importWallet: "#import-wallet",
  importPassword: "#import-wallet-password",
  createPassword: "#create-wallet-password",
  createMnemonic: "#create-wallet-mnemonic",
  createWords: "#create-wallet-confirm",
  unlockWallet: "#unlock-wallet",
  donationWallet: "#donation-wallet"
};
function $(selector) {
  return document.querySelector(selector);
}
function showSection(sectionName) {
  const sections = document.querySelectorAll("[data-donate-section]");
  for (const section of sections) {
    section.hidden = section.dataset.donateSection !== sectionName;
  }
}
function getCurrentHash() {
  return window.location.hash || DONATE_HASHES.onboarding;
}
function setHash(hash) {
  if (hash === DONATE_HASHES.onboarding) {
    if (!window.location.hash) {
      applyHashRoute();
      return;
    }
    window.history.pushState(null, "", window.location.pathname + window.location.search);
    applyHashRoute();
    return;
  }
  if (window.location.hash === hash) {
    applyHashRoute();
    return;
  }
  window.location.hash = hash;
}
function getBitcoinNetwork() {
  return appConfig?.network === "mainnet" ? networks_exports.bitcoin : networks_exports.regtest;
}
function getCoinLabel() {
  return appConfig?.unitLabel ?? "BTC";
}
function readStoredWallet(key) {
  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function getCurrentNetwork() {
  return appConfig?.network ?? "mainnet";
}
function getStorageKey(network = getCurrentNetwork()) {
  return `${STORAGE_KEY_PREFIX}:${network}`;
}
function getStoredWalletForNetwork(network) {
  return readStoredWallet(getStorageKey(network));
}
function getLegacyStoredWallet() {
  return readStoredWallet(LEGACY_STORAGE_KEY);
}
function getStoredWallet() {
  return getStoredWalletForNetwork(getCurrentNetwork());
}
function getUnlockSourceWalletInfo() {
  const currentNetwork = getCurrentNetwork();
  const currentWallet = getStoredWalletForNetwork(currentNetwork);
  if (currentWallet) {
    return {
      wallet: currentWallet,
      key: getStorageKey(currentNetwork),
      isCurrentNetwork: true
    };
  }
  const legacyWallet = getLegacyStoredWallet();
  if (legacyWallet) {
    return {
      wallet: legacyWallet,
      key: LEGACY_STORAGE_KEY,
      isCurrentNetwork: legacyWallet.network === currentNetwork
    };
  }
  for (const network of Object.keys(NETWORK_CONFIG)) {
    if (network === currentNetwork) {
      continue;
    }
    const wallet = getStoredWalletForNetwork(network);
    if (wallet) {
      return {
        wallet,
        key: getStorageKey(network),
        isCurrentNetwork: false
      };
    }
  }
  return {
    wallet: null,
    key: "",
    isCurrentNetwork: false
  };
}
function storeWallet(payload, network = getCurrentNetwork()) {
  window.localStorage.setItem(getStorageKey(network), JSON.stringify(payload));
}
function updateStoredWallet(patch) {
  const storedWallet = getStoredWallet();
  if (!storedWallet) {
    return;
  }
  storeWallet({
    ...storedWallet,
    ...patch
  });
}
function clearWallet() {
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  for (const network of Object.keys(NETWORK_CONFIG)) {
    window.localStorage.removeItem(getStorageKey(network));
  }
}
function setMessage(text, type = "") {
  const node = $("[data-donate-message]");
  if (!node) {
    return;
  }
  node.textContent = text;
  node.dataset.messageType = type;
  node.hidden = !text;
}
function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
function base64ToBytes(value2) {
  const binary = atob(value2);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}
async function deriveEncryptionKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 25e4,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function encryptMnemonic(mnemonic, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveEncryptionKey(password, salt);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(mnemonic)
  );
  return {
    cipherText: bytesToBase64(new Uint8Array(cipher)),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv)
  };
}
async function decryptMnemonic(payload, password) {
  const salt = base64ToBytes(payload.salt);
  const iv = base64ToBytes(payload.iv);
  const cipherText = base64ToBytes(payload.cipherText);
  const key = await deriveEncryptionKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    cipherText
  );
  return new TextDecoder().decode(decrypted);
}
function deriveWallet(mnemonic) {
  const metadata = NETWORK_CONFIG[appConfig?.network ?? "mainnet"];
  const seed = mnemonicToSeedSync(mnemonic);
  const root = HDKey.fromMasterSeed(seed);
  const derivationPath = `m/84'/${metadata.bip84CoinType}'/0'/0/0`;
  const child = root.derive(derivationPath);
  const publicKey = import_buffer.Buffer.from(child.publicKey ?? new Uint8Array());
  const payment = payments_exports.p2wpkh({
    pubkey: publicKey,
    network: getBitcoinNetwork()
  });
  return {
    address: payment.address ?? "",
    derivationPath,
    publicKeyHex: publicKey.toString("hex"),
    outputScript: payment.output ? import_buffer.Buffer.from(payment.output) : import_buffer.Buffer.alloc(0),
    signer: {
      publicKey,
      sign(hash) {
        return import_buffer.Buffer.from(child.sign(hash));
      }
    },
    signChallengeHash(challengeHash) {
      return import_buffer.Buffer.from(child.sign(challengeHash)).toString("hex");
    }
  };
}
async function getChallengeHashBytes(challengeHex) {
  const graffiti = String(getStoredWallet()?.graffiti ?? "").trim();
  const payload = new TextEncoder().encode(
    `${DONATION_HEARTBEAT_CONTEXT}\0${challengeHex}\0${graffiti}`
  );
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return new Uint8Array(digest);
}
function clearScheduledCycle() {
  if (donationRuntimeState.cycleTimeoutId) {
    window.clearTimeout(donationRuntimeState.cycleTimeoutId);
    donationRuntimeState.cycleTimeoutId = null;
  }
}
function clearWalletAutoRefresh() {
  if (walletAutoRefreshIntervalId) {
    window.clearInterval(walletAutoRefreshIntervalId);
    walletAutoRefreshIntervalId = null;
  }
}
function clearWalletDataRefetchTimeout() {
  if (walletDataRefetchTimeoutId) {
    window.clearTimeout(walletDataRefetchTimeoutId);
    walletDataRefetchTimeoutId = null;
  }
}
function formatSatsAsBtcValue(sats) {
  return (Number(sats ?? 0) / 1e8).toFixed(8);
}
function parseBtcAmountToSats(value2) {
  const trimmed = String(value2 ?? "").trim();
  if (!/^\d+(?:\.\d{1,8})?$/.test(trimmed)) {
    return null;
  }
  const [wholePart, fractionalPart = ""] = trimmed.split(".");
  const normalizedFractional = `${fractionalPart}00000000`.slice(0, 8);
  return Number(BigInt(wholePart) * 100000000n + BigInt(normalizedFractional));
}
function normalizeMnemonicInput(value2) {
  return String(value2 ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}
function parseFeeRateSatPerVbyte(value2) {
  const trimmed = String(value2 ?? "").trim();
  if (!/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return null;
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > MAX_FEE_RATE_SAT_PER_VBYTE) {
    return null;
  }
  return parsed;
}
function getDefaultFeeRateSatPerVbyte() {
  const configured = Number(
    getStoredWallet()?.feeRateSatPerVbyte ?? appConfig?.donations?.feeRateSatPerVbyte ?? 2
  );
  if (Number.isFinite(configured) && configured > 0 && configured <= MAX_FEE_RATE_SAT_PER_VBYTE) {
    return configured;
  }
  return 2;
}
function getMaxRequestsPerTx() {
  const input = $("[data-max-requests-input]");
  const storedWallet = getStoredWallet();
  const fallback = Number(storedWallet?.maxRequestsPerTx ?? 1) || 1;
  if (!input) {
    return fallback;
  }
  const value2 = Number(input.value ?? fallback);
  return Math.min(Math.max(value2 || fallback, 1), 25);
}
function getFeeRateSatPerVbyte() {
  const input = $("[data-fee-rate-input]");
  const fallback = getDefaultFeeRateSatPerVbyte();
  if (!input) {
    return fallback;
  }
  return parseFeeRateSatPerVbyte(input.value) ?? fallback;
}
function getValidatedFeeRateSatPerVbyte() {
  const input = $("[data-fee-rate-input]");
  return parseFeeRateSatPerVbyte(input?.value ?? "");
}
function getSendAmountSats() {
  const input = $("[data-send-amount]");
  return parseBtcAmountToSats(String(input?.value ?? ""));
}
function getGraffitiValue() {
  const input = $("[data-graffiti-input]");
  const fallback = String(getStoredWallet()?.graffiti ?? "").trim();
  if (!input) {
    return fallback;
  }
  return String(input.value ?? fallback).trim();
}
function setMaxRequestsInputValue(value2) {
  const input = $("[data-max-requests-input]");
  if (input) {
    input.value = String(Math.min(Math.max(Number(value2) || 1, 1), 25));
  }
}
function setFeeRateInputValue(value2) {
  const input = $("[data-fee-rate-input]");
  if (input) {
    input.value = String(parseFeeRateSatPerVbyte(value2) ?? getDefaultFeeRateSatPerVbyte());
  }
}
function setGraffitiInputValue(value2) {
  const input = $("[data-graffiti-input]");
  if (input) {
    input.value = String(value2 ?? "").trim();
  }
}
function setSendAmountInputValueFromSats(sats) {
  const input = $("[data-send-amount]");
  if (input) {
    input.value = formatSatsAsBtcValue(sats);
  }
}
function setMaxRequestsEditing(isEditing) {
  const input = $("[data-max-requests-input]");
  const editButton = $("[data-edit-max-requests]");
  const saveButton = $("[data-save-max-requests]");
  if (input) {
    input.disabled = !isEditing || donationRuntimeState.enabled;
  }
  if (editButton) {
    editButton.disabled = donationRuntimeState.enabled || isEditing;
  }
  if (saveButton) {
    saveButton.hidden = !isEditing;
    saveButton.disabled = donationRuntimeState.enabled;
  }
}
function setFeeRateEditing(isEditing) {
  const input = $("[data-fee-rate-input]");
  const editButton = $("[data-edit-fee-rate]");
  const saveButton = $("[data-save-fee-rate]");
  if (input) {
    input.disabled = !isEditing || donationRuntimeState.enabled;
  }
  if (editButton) {
    editButton.disabled = donationRuntimeState.enabled || isEditing;
  }
  if (saveButton) {
    saveButton.hidden = !isEditing;
    saveButton.disabled = donationRuntimeState.enabled;
  }
}
function setGraffitiEditing(isEditing) {
  const input = $("[data-graffiti-input]");
  const editButton = $("[data-edit-graffiti]");
  const saveButton = $("[data-save-graffiti]");
  if (input) {
    input.disabled = !isEditing;
  }
  if (editButton) {
    editButton.disabled = isEditing;
  }
  if (saveButton) {
    saveButton.hidden = !isEditing;
  }
}
function setSendStatus(text, type = "") {
  const node = $("[data-send-status]");
  if (!node) {
    return;
  }
  node.className = "";
  node.textContent = text;
  node.dataset.messageType = type;
}
function setSendStatusWithTxLink(message, txid, explorerUrl) {
  const node = $("[data-send-status]");
  if (!node) {
    return;
  }
  node.dataset.messageType = "success";
  node.className = "request-success";
  node.textContent = `${message} `;
  if (!explorerUrl || !txid) {
    node.textContent = message;
    return;
  }
  const link = document.createElement("a");
  link.href = explorerUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = txid;
  node.appendChild(link);
}
function isSendFormValid() {
  const destinationAddress = String($("[data-send-address]")?.value ?? "").trim();
  const amountSats = getSendAmountSats();
  const feeRate = getValidatedFeeRateSatPerVbyte();
  if (!unlockedWalletState) {
    return false;
  }
  if (!isLikelyAddressForNetwork(destinationAddress, appConfig?.network ?? "mainnet")) {
    return false;
  }
  if (!Number.isInteger(amountSats) || Number(amountSats) <= 0) {
    return false;
  }
  return feeRate != null;
}
function updateSendControls() {
  const sendButton = $("[data-send-wallet]");
  const maxButton = $("[data-send-max]");
  if (sendButton) {
    sendButton.disabled = !isSendFormValid();
  }
  if (maxButton) {
    maxButton.disabled = !unlockedWalletState || getValidatedFeeRateSatPerVbyte() == null;
  }
}
function renderExecutionStatus(text, isRunning = false) {
  const dot = $("[data-donation-running-dot]");
  const textNode = $("[data-donation-running-text]");
  const startButton = $("[data-start-donations]");
  const stopButton = $("[data-stop-donations]");
  const editButton = $("[data-edit-max-requests]");
  const maxInput = $("[data-max-requests-input]");
  const feeRateEditButton = $("[data-edit-fee-rate]");
  const feeRateInput = $("[data-fee-rate-input]");
  const feeRateSaveButton = $("[data-save-fee-rate]");
  if (dot) {
    dot.hidden = !isRunning;
  }
  if (textNode) {
    textNode.textContent = text;
  }
  if (startButton) {
    startButton.disabled = isRunning || Boolean(getDonorStatusMessage(donorStatusState));
  }
  if (stopButton) {
    stopButton.disabled = !isRunning;
  }
  if (editButton) {
    editButton.disabled = isRunning || !maxInput?.disabled;
  }
  if (feeRateEditButton) {
    feeRateEditButton.disabled = isRunning || !feeRateInput?.disabled;
  }
  if (feeRateInput) {
    feeRateInput.disabled = isRunning || feeRateInput.disabled;
  }
  if (feeRateSaveButton) {
    feeRateSaveButton.disabled = isRunning;
  }
  updateSendControls();
}
function updateGraffitiThresholdNote() {
  const node = $("[data-graffiti-threshold]");
  const minimumGraffitiBtc = String(appConfig?.donations?.minimumGraffitiBtc ?? "").trim();
  if (node) {
    node.textContent = minimumGraffitiBtc ? `${minimumGraffitiBtc} ${getCoinLabel()}` : "the configured minimum";
  }
}
async function updateWalletBalance(address) {
  const balanceNode = $("[data-donation-balance]");
  const result = await getWalletBalance(address);
  if (!balanceNode) {
    return;
  }
  if (!result.ok) {
    balanceNode.textContent = "Unable to load balance";
    return;
  }
  const confirmed = Number(result.data?.confirmed ?? 0);
  const unconfirmed = Number(result.data?.unconfirmed ?? 0);
  balanceNode.textContent = formatSatsAsCoins(confirmed) + (unconfirmed ? ` (${formatSatsAsCoins(unconfirmed)} unconfirmed)` : "");
}
function getDonorStatusMessage(status) {
  if (!status) {
    return "";
  }
  if (status.isBlacklisted) {
    return `This donor is blacklisted at reputation ${status.minimumReputationNeeded}.`;
  }
  if (Number(status.confirmedBalanceSats ?? 0) < Number(status.minSatsForHeartbeat ?? 0)) {
    return `At least ${formatSatsAsCoins(status.minSatsForHeartbeat ?? 0)} confirmed ${getCoinLabel()} is required to heartbeat.`;
  }
  return "";
}
function renderDonorStatus(status) {
  donorStatusState = status ?? null;
  const reputationNode = $("[data-donor-reputation]");
  const startButton = $("[data-start-donations]");
  if (reputationNode) {
    reputationNode.textContent = status == null ? "Unknown" : String(status.reputation ?? 0);
  }
  if (startButton && !donationRuntimeState.enabled) {
    startButton.disabled = Boolean(getDonorStatusMessage(status));
  }
}
function getMaxReservableRequestsFromStatus(status = donorStatusState) {
  const requestAmountSats = Number(appConfig?.faucet?.requestAmountSats ?? 0);
  const availableReserveCapacitySats = Number(
    status?.availableReserveCapacitySats ?? 0
  );
  if (requestAmountSats <= 0 || availableReserveCapacitySats <= 0) {
    return 0;
  }
  return Math.max(
    Math.floor(availableReserveCapacitySats / requestAmountSats),
    0
  );
}
async function updateDonorStatus(address) {
  const result = await getDonorStatus(address);
  if (!result.ok) {
    renderDonorStatus(null);
    return {
      ok: false,
      error: result.error
    };
  }
  renderDonorStatus(result.data ?? null);
  return {
    ok: true,
    data: result.data ?? null
  };
}
function setWalletActivityPagination(page, totalPages) {
  const prev = $("[data-wallet-activity-prev]");
  const next = $("[data-wallet-activity-next]");
  const label = $("[data-wallet-activity-page-label]");
  if (prev) {
    prev.disabled = page <= 1;
  }
  if (next) {
    next.disabled = page >= totalPages;
  }
  if (label) {
    label.textContent = `Page ${page} of ${totalPages}`;
  }
}
function renderWalletActivityTable() {
  const body = $("[data-wallet-activity]");
  if (!body) {
    return;
  }
  body.innerHTML = "";
  if (!walletActivityItems.length) {
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="4">No activity yet.</td>';
    body.appendChild(row);
    setWalletActivityPagination(1, 1);
    return;
  }
  const totalPages = Math.max(
    Math.ceil(walletActivityItems.length / WALLET_ACTIVITY_PAGE_SIZE),
    1
  );
  walletActivityPage = Math.min(Math.max(walletActivityPage, 1), totalPages);
  const visibleItems = walletActivityItems.slice(
    (walletActivityPage - 1) * WALLET_ACTIVITY_PAGE_SIZE,
    walletActivityPage * WALLET_ACTIVITY_PAGE_SIZE
  );
  for (const item of visibleItems) {
    const row = document.createElement("tr");
    const typeCell = document.createElement("td");
    const amountCell = document.createElement("td");
    const whenCell = document.createElement("td");
    const txCell = document.createElement("td");
    const link = document.createElement("a");
    if (item.type === "faucet_fulfillment") {
      typeCell.textContent = `Fulfilled ${item.requestCount} faucet request${item.requestCount === 1 ? "" : "s"}`;
    } else if (item.type === "send") {
      typeCell.textContent = "Sent";
    } else {
      typeCell.textContent = "Deposit";
    }
    amountCell.textContent = formatSatsAsCoins(item.amountSats);
    whenCell.textContent = item.occurredAt ? new Date(item.occurredAt).toLocaleString() : "Pending";
    if (item.explorerUrl) {
      link.href = item.explorerUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "view tx";
      txCell.appendChild(link);
    } else {
      txCell.textContent = "Unavailable";
    }
    row.append(typeCell, amountCell, whenCell, txCell);
    body.append(row);
  }
  setWalletActivityPagination(walletActivityPage, totalPages);
}
async function renderWalletActivity(address) {
  const result = await getWalletActivity(address, 50);
  walletActivityPage = 1;
  if (!result.ok || !Array.isArray(result.data?.items)) {
    walletActivityItems = [];
    renderWalletActivityTable();
    return;
  }
  walletActivityItems = [...result.data.items].sort((left, right) => {
    const leftPending = !left?.occurredAt;
    const rightPending = !right?.occurredAt;
    if (leftPending !== rightPending) {
      return leftPending ? -1 : 1;
    }
    const leftTime = left?.occurredAt ? new Date(left.occurredAt).valueOf() : 0;
    const rightTime = right?.occurredAt ? new Date(right.occurredAt).valueOf() : 0;
    return rightTime - leftTime;
  });
  renderWalletActivityTable();
}
async function refetchWalletData({ followUpMs = 0 } = {}) {
  if (!unlockedWalletState) {
    return;
  }
  await Promise.all([
    updateWalletBalance(unlockedWalletState.address),
    renderWalletActivity(unlockedWalletState.address),
    updateDonorStatus(unlockedWalletState.address)
  ]);
  clearWalletDataRefetchTimeout();
  if (followUpMs > 0) {
    walletDataRefetchTimeoutId = window.setTimeout(() => {
      if (!unlockedWalletState) {
        return;
      }
      void Promise.all([
        updateWalletBalance(unlockedWalletState.address),
        renderWalletActivity(unlockedWalletState.address),
        updateDonorStatus(unlockedWalletState.address)
      ]);
    }, followUpMs);
  }
}
function createRandomConfirmationIndexes(wordCount) {
  const chosen = /* @__PURE__ */ new Set();
  while (chosen.size < 4) {
    chosen.add(Math.floor(Math.random() * wordCount));
  }
  return [...chosen].sort((left, right) => left - right);
}
function showConfirmationStep(stepName) {
  confirmationStep = stepName;
  const steps = document.querySelectorAll("[data-confirm-step]");
  for (const step of steps) {
    step.hidden = step.dataset.confirmStep !== stepName;
  }
}
function showCreateWalletStep(stepName) {
  showSection("confirm");
  showConfirmationStep(stepName);
  const continueButton = $("[data-confirm-next]");
  if (continueButton) {
    continueButton.textContent = pendingWalletMode === "create" ? "Continue" : "Import Donation Wallet";
  }
}
function renderMnemonicWords() {
  const container = $("[data-generated-mnemonic]");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  const words = pendingMnemonic.split(/\s+/);
  for (const [index, word] of words.entries()) {
    const row = document.createElement("div");
    row.className = "mnemonic-word";
    const number2 = document.createElement("strong");
    number2.textContent = `${index + 1}.`;
    const text = document.createElement("span");
    text.textContent = ` ${word}`;
    row.append(number2, text);
    container.append(row);
  }
}
function renderConfirmationPrompts() {
  const container = $("[data-confirm-words]");
  if (!container) {
    return;
  }
  container.innerHTML = "";
  for (const wordIndex of confirmationIndexes) {
    const label = document.createElement("label");
    label.textContent = `What was word ${wordIndex + 1}?`;
    const input = document.createElement("input");
    input.type = "text";
    input.dataset.confirmWordIndex = String(wordIndex);
    input.autocomplete = "off";
    input.addEventListener("input", syncSaveWalletState);
    input.addEventListener(
      "keydown",
      (event) => handleEnterSubmit(event, "[data-save-wallet]")
    );
    container.append(label, input);
  }
}
function validatePendingPassword() {
  const password = String($("[data-wallet-password]")?.value ?? "");
  const confirmPassword = String($("[data-wallet-password-confirm]")?.value ?? "");
  if (password.length < 8) {
    setMessage("Please choose a password with at least 8 characters.", "error");
    return false;
  }
  if (password !== confirmPassword) {
    setMessage("The password confirmation did not match.", "error");
    return false;
  }
  return true;
}
function syncPasswordStepState() {
  const password = String($("[data-wallet-password]")?.value ?? "").trim();
  const confirmPassword = String($("[data-wallet-password-confirm]")?.value ?? "").trim();
  const continueButton = $("[data-confirm-next]");
  if (continueButton) {
    continueButton.disabled = !password || !confirmPassword;
  }
}
function syncImportStepState() {
  const mnemonic = normalizeMnemonicInput($("[data-import-mnemonic]")?.value ?? "");
  const continueButton = $("[data-import-wallet]");
  if (continueButton) {
    continueButton.disabled = !validateMnemonic(mnemonic, wordlist);
  }
}
function handlePasswordStepSubmit(event) {
  if (event.key !== "Enter") {
    return;
  }
  event.preventDefault();
  const continueButton = $("[data-confirm-next]");
  if (!continueButton?.disabled) {
    continueButton.click();
  }
}
function handleEnterSubmit(event, buttonSelector) {
  if (event.key !== "Enter") {
    return;
  }
  event.preventDefault();
  const button = $(buttonSelector);
  if (!button?.disabled) {
    button.click();
  }
}
function validateConfirmationInputs() {
  const words = pendingMnemonic.split(/\s+/);
  const inputs2 = document.querySelectorAll("[data-confirm-word-index]");
  for (const input of inputs2) {
    const index = Number(input.dataset.confirmWordIndex);
    const expectedWord = words[index];
    const providedWord = input.value.trim().toLowerCase();
    if (providedWord !== expectedWord) {
      return false;
    }
  }
  return true;
}
function syncSaveWalletState() {
  const saveButton = $("[data-save-wallet]");
  if (saveButton) {
    saveButton.disabled = !validateConfirmationInputs();
  }
}
function prepareMnemonicFlow(mnemonic, mode = "create") {
  pendingMnemonic = normalizeMnemonicInput(mnemonic);
  pendingWalletMode = mode;
  confirmationIndexes = mode === "create" ? createRandomConfirmationIndexes(pendingMnemonic.split(/\s+/).length) : [];
  const passwordInput = $("[data-wallet-password]");
  const confirmPasswordInput = $("[data-wallet-password-confirm]");
  const unlockPasswordInput = $("[data-unlock-password]");
  if (passwordInput) {
    passwordInput.value = "";
  }
  if (confirmPasswordInput) {
    confirmPasswordInput.value = "";
  }
  if (unlockPasswordInput) {
    unlockPasswordInput.value = "";
  }
  if (mode === "create") {
    renderMnemonicWords();
    renderConfirmationPrompts();
  }
  syncPasswordStepState();
  setMessage("", "");
  setHash(mode === "create" ? DONATE_HASHES.createPassword : DONATE_HASHES.importPassword);
}
function clearUnlockedWalletRuntime() {
  clearScheduledCycle();
  clearWalletAutoRefresh();
  unlockedWalletState = null;
  donorStatusState = null;
  donationRuntimeState = {
    enabled: false,
    cycleTimeoutId: null,
    cycleInFlight: false,
    lastHeartbeatAt: 0,
    pendingTxId: ""
  };
}
function estimateFee(inputCount, outputCount, feeRateSatPerVbyte) {
  const virtualBytes = 11 + inputCount * 68 + outputCount * 31;
  return Math.ceil(virtualBytes * feeRateSatPerVbyte);
}
async function maybeHeartbeat() {
  if (!unlockedWalletState || !donationRuntimeState.enabled) {
    return true;
  }
  const donorStatusMessage = getDonorStatusMessage(donorStatusState);
  if (donorStatusMessage) {
    setMessage(donorStatusMessage, "error");
    stopDonationLoop();
    return false;
  }
  const heartbeatIntervalMs = Number(appConfig?.donations?.heartbeatPollMs) || 6e4;
  if (donationRuntimeState.lastHeartbeatAt && Date.now() - donationRuntimeState.lastHeartbeatAt < heartbeatIntervalMs) {
    return true;
  }
  const challengeResult = await getDonationChallenge();
  if (!challengeResult.ok) {
    setMessage("Unable to refresh the donation challenge right now.", "error");
    return false;
  }
  const challenge = String(challengeResult.data?.challenge ?? "");
  const challengeHash = await getChallengeHashBytes(challenge);
  const signatureHex = unlockedWalletState.signChallengeHash(challengeHash);
  const heartbeatResult = await sendDonationHeartbeat({
    address: unlockedWalletState.address,
    publicKeyHex: unlockedWalletState.publicKeyHex,
    challenge,
    signatureHex,
    graffiti: String(getStoredWallet()?.graffiti ?? "").trim()
  });
  if (!heartbeatResult.ok) {
    const donorStatusResult = await updateDonorStatus(unlockedWalletState.address);
    const nextStatusMessage = donorStatusResult.ok ? getDonorStatusMessage(donorStatusResult.data) : "";
    setMessage(
      nextStatusMessage || "Unable to prove donation wallet activity right now.",
      "error"
    );
    if (nextStatusMessage) {
      stopDonationLoop();
    }
    return false;
  }
  if (heartbeatResult.data?.donor) {
    renderDonorStatus(heartbeatResult.data.donor);
  }
  donationRuntimeState.lastHeartbeatAt = Date.now();
  return true;
}
async function buildFulfillmentTransaction(reservedRequests) {
  const utxoResult = await getWalletUtxos(unlockedWalletState.address);
  if (!utxoResult.ok) {
    throw new Error("Unable to load donation wallet UTXOs.");
  }
  const confirmedUtxos = [...utxoResult.data?.utxos ?? []].filter((utxo) => Number(utxo.height ?? 0) > 0).sort((left, right) => left.value - right.value);
  const feeRate = getFeeRateSatPerVbyte();
  const outputs2 = reservedRequests.map((request) => ({
    address: request.bitcoinAddress,
    value: Number(request.amountSats)
  }));
  const totalOutputs = outputs2.reduce((sum, output) => sum + output.value, 0);
  const selectedInputs = [];
  let totalInputs = 0;
  for (const utxo of confirmedUtxos) {
    selectedInputs.push(utxo);
    totalInputs += Number(utxo.value ?? 0);
    const feeWithChange = estimateFee(
      selectedInputs.length,
      outputs2.length + 1,
      feeRate
    );
    if (totalInputs >= totalOutputs + feeWithChange) {
      break;
    }
  }
  if (!selectedInputs.length) {
    throw new Error("This donation wallet has no confirmed spendable UTXOs.");
  }
  let fee = estimateFee(selectedInputs.length, outputs2.length + 1, feeRate);
  let changeValue = totalInputs - totalOutputs - fee;
  let hasChange = changeValue > DUST_THRESHOLD;
  if (!hasChange) {
    fee = estimateFee(selectedInputs.length, outputs2.length, feeRate);
    changeValue = totalInputs - totalOutputs - fee;
  }
  if (changeValue < 0) {
    throw new Error(
      `This donation wallet does not have enough confirmed ${getCoinLabel()} to fulfill the reserved requests.`
    );
  }
  const psbt = new Psbt2({ network: getBitcoinNetwork() });
  for (const input of selectedInputs) {
    psbt.addInput({
      hash: input.txid,
      index: Number(input.vout),
      witnessUtxo: {
        script: unlockedWalletState.outputScript,
        value: BigInt(input.value)
      }
    });
  }
  for (const output of outputs2) {
    psbt.addOutput({
      address: output.address,
      value: BigInt(output.value)
    });
  }
  if (hasChange && changeValue > DUST_THRESHOLD) {
    psbt.addOutput({
      address: unlockedWalletState.address,
      value: BigInt(changeValue)
    });
  }
  selectedInputs.forEach((_input, index) => {
    psbt.signInput(index, unlockedWalletState.signer);
  });
  psbt.finalizeAllInputs();
  return {
    rawTransactionHex: psbt.extractTransaction().toHex(),
    feeSats: fee
  };
}
async function buildSendTransaction(destinationAddress, amountSats) {
  const utxoResult = await getWalletUtxos(unlockedWalletState.address);
  if (!utxoResult.ok) {
    throw new Error("Unable to load donation wallet UTXOs.");
  }
  const confirmedUtxos = [...utxoResult.data?.utxos ?? []].filter((utxo) => Number(utxo.height ?? 0) > 0).sort((left, right) => left.value - right.value);
  const feeRate = getValidatedFeeRateSatPerVbyte();
  if (feeRate == null) {
    throw new Error("Enter a valid sats/vbyte fee rate.");
  }
  const outputs2 = [{ address: destinationAddress, value: Number(amountSats) }];
  const selectedInputs = [];
  let totalInputs = 0;
  for (const utxo of confirmedUtxos) {
    selectedInputs.push(utxo);
    totalInputs += Number(utxo.value ?? 0);
    const feeWithChange = estimateFee(selectedInputs.length, 2, feeRate);
    if (totalInputs >= Number(amountSats) + feeWithChange) {
      break;
    }
  }
  if (!selectedInputs.length) {
    throw new Error("This donation wallet has no confirmed spendable UTXOs.");
  }
  let fee = estimateFee(selectedInputs.length, 2, feeRate);
  let changeValue = totalInputs - Number(amountSats) - fee;
  let hasChange = changeValue > DUST_THRESHOLD;
  if (!hasChange) {
    fee = estimateFee(selectedInputs.length, 1, feeRate);
    changeValue = totalInputs - Number(amountSats) - fee;
  }
  if (changeValue < 0) {
    throw new Error(
      `This donation wallet does not have enough confirmed ${getCoinLabel()} to send ${formatSatsAsCoins(amountSats)}.`
    );
  }
  const psbt = new Psbt2({ network: getBitcoinNetwork() });
  for (const input of selectedInputs) {
    psbt.addInput({
      hash: input.txid,
      index: Number(input.vout),
      witnessUtxo: {
        script: unlockedWalletState.outputScript,
        value: BigInt(input.value)
      }
    });
  }
  psbt.addOutput({
    address: destinationAddress,
    value: BigInt(amountSats)
  });
  if (hasChange && changeValue > DUST_THRESHOLD) {
    psbt.addOutput({
      address: unlockedWalletState.address,
      value: BigInt(changeValue)
    });
  }
  selectedInputs.forEach((_input, index) => {
    psbt.signInput(index, unlockedWalletState.signer);
  });
  psbt.finalizeAllInputs();
  return {
    rawTransactionHex: psbt.extractTransaction().toHex(),
    feeSats: fee
  };
}
async function calculateMaxSendAmountSats() {
  if (!unlockedWalletState) {
    throw new Error("Unlock the donation wallet first.");
  }
  const utxoResult = await getWalletUtxos(unlockedWalletState.address);
  if (!utxoResult.ok) {
    throw new Error("Unable to load donation wallet UTXOs.");
  }
  const confirmedUtxos = [...utxoResult.data?.utxos ?? []].filter(
    (utxo) => Number(utxo.height ?? 0) > 0
  );
  if (!confirmedUtxos.length) {
    throw new Error("This donation wallet has no confirmed spendable UTXOs.");
  }
  const feeRate = getValidatedFeeRateSatPerVbyte();
  if (feeRate == null) {
    throw new Error("Enter a valid sats/vbyte fee rate.");
  }
  const totalInputs = confirmedUtxos.reduce(
    (sum, utxo) => sum + Number(utxo.value ?? 0),
    0
  );
  const fee = estimateFee(confirmedUtxos.length, 1, feeRate);
  const maxSendSats = totalInputs - fee;
  if (maxSendSats <= 0) {
    throw new Error("This donation wallet does not have enough confirmed funds to cover the fee.");
  }
  return maxSendSats;
}
function scheduleNextCycle(delayMs = null) {
  if (!donationRuntimeState.enabled) {
    return;
  }
  clearScheduledCycle();
  const delay = (delayMs ?? Number(appConfig?.donations?.executionPollMs)) || 15e3;
  donationRuntimeState.cycleTimeoutId = window.setTimeout(() => {
    void runDonationExecutionCycle();
  }, delay);
}
function shouldAbortExecutionCycle() {
  return !donationRuntimeState.enabled || !unlockedWalletState;
}
async function runDonationExecutionCycle() {
  if (!donationRuntimeState.enabled || !unlockedWalletState || donationRuntimeState.cycleInFlight) {
    return;
  }
  donationRuntimeState.cycleInFlight = true;
  try {
    const donorStatusResult = await updateDonorStatus(unlockedWalletState.address);
    if (!donorStatusResult.ok) {
      setMessage("Unable to refresh donor reputation right now.", "error");
      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }
    const donorStatusMessage = getDonorStatusMessage(donorStatusResult.data);
    if (donorStatusMessage) {
      setMessage(donorStatusMessage, "error");
      stopDonationLoop();
      return;
    }
    const heartbeatOk = await maybeHeartbeat();
    if (!heartbeatOk || shouldAbortExecutionCycle()) {
      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }
    if (donationRuntimeState.pendingTxId) {
      const txStatusResult = await getTransactionStatus(
        donationRuntimeState.pendingTxId
      );
      if (!txStatusResult.ok) {
        setMessage("Unable to refresh the pending donation transaction.", "error");
        renderExecutionStatus("Donation wallet is running...", true);
        return;
      }
      if (shouldAbortExecutionCycle()) {
        return;
      }
      if (!txStatusResult.data?.confirmed) {
        void refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
        renderExecutionStatus(
          `Donation wallet is running... waiting for confirmation on ${donationRuntimeState.pendingTxId.slice(0, 12)}...`,
          true
        );
        return;
      }
      donationRuntimeState.pendingTxId = "";
      await refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
    }
    const maxReservableRequests = getMaxReservableRequestsFromStatus(donorStatusState);
    const requestedMaxRequests = getMaxRequestsPerTx();
    const reserveRequestCount = Math.min(requestedMaxRequests, maxReservableRequests);
    if (reserveRequestCount <= 0) {
      renderExecutionStatus(
        "Donation wallet is running... waiting for more confirmed balance.",
        true
      );
      return;
    }
    const reserveResult = await reserveDonationRequests(
      unlockedWalletState.address,
      reserveRequestCount
    );
    if (!reserveResult.ok) {
      const nextStatusResult = await updateDonorStatus(unlockedWalletState.address);
      const nextStatusMessage = nextStatusResult.ok ? getDonorStatusMessage(nextStatusResult.data) : "";
      const reserveMessage = reserveResult.error === "donor_promised_balance_exceeded" ? "This wallet cannot reserve that many requests with its current confirmed balance." : nextStatusMessage || "Unable to reserve faucet requests right now.";
      setMessage(reserveMessage, "error");
      if (nextStatusMessage) {
        stopDonationLoop();
        return;
      }
      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }
    if (reserveResult.data?.donor) {
      renderDonorStatus(reserveResult.data.donor);
    }
    if (shouldAbortExecutionCycle()) {
      return;
    }
    const reservedRequests = reserveResult.data?.requests ?? [];
    if (!reservedRequests.length) {
      renderExecutionStatus(
        "Donation wallet is running... no queued faucet requests right now.",
        true
      );
      return;
    }
    const transaction = await buildFulfillmentTransaction(reservedRequests);
    if (shouldAbortExecutionCycle()) {
      return;
    }
    const submitResult = await submitDonationFulfillment(
      unlockedWalletState.address,
      reservedRequests.map((request) => request.id),
      transaction.rawTransactionHex
    );
    if (!submitResult.ok) {
      setMessage(
        "The signed donation transaction could not be submitted.",
        "error"
      );
      renderExecutionStatus("Donation wallet is running...", true);
      return;
    }
    donationRuntimeState.pendingTxId = String(submitResult.data?.txid ?? "");
    await refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
    renderExecutionStatus(
      `Donation wallet is running... submitted ${donationRuntimeState.pendingTxId.slice(0, 12)}...`,
      true
    );
  } catch (error) {
    console.error(error);
    setMessage(
      error instanceof Error ? error.message : "Unable to run the donation wallet.",
      "error"
    );
    renderExecutionStatus("Donation wallet is running...", true);
  } finally {
    donationRuntimeState.cycleInFlight = false;
    if (donationRuntimeState.enabled) {
      scheduleNextCycle();
    }
  }
}
function startDonationLoop() {
  if (!unlockedWalletState) {
    return;
  }
  donationRuntimeState.enabled = true;
  donationRuntimeState.lastHeartbeatAt = 0;
  renderExecutionStatus("Donation wallet is running...", true);
  void runDonationExecutionCycle();
}
function stopDonationLoop() {
  donationRuntimeState.enabled = false;
  donationRuntimeState.pendingTxId = "";
  clearScheduledCycle();
  renderExecutionStatus("Donation wallet is stopped.", false);
}
async function saveWalletFromPendingMnemonic() {
  const password = String($("[data-wallet-password]")?.value ?? "");
  if (!pendingMnemonic) {
    setMessage("No mnemonic is ready to save.", "error");
    return;
  }
  if (!validatePendingPassword()) {
    return;
  }
  if (pendingWalletMode === "create" && !validateConfirmationInputs()) {
    setMessage("The mnemonic confirmation words did not match.", "error");
    return;
  }
  const encrypted = await encryptMnemonic(pendingMnemonic, password);
  const wallet = deriveWallet(pendingMnemonic);
  unlockedWalletState = wallet;
  storeWallet({
    network: appConfig.network,
    maxRequestsPerTx: 1,
    feeRateSatPerVbyte: Number(appConfig?.donations?.feeRateSatPerVbyte ?? 2) || 2,
    graffiti: "",
    ...encrypted,
    address: wallet.address,
    derivationPath: wallet.derivationPath,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  });
  await renderUnlockedWallet(wallet.address);
}
async function renderUnlockedWallet(addressOverride) {
  const storedWallet = getStoredWallet();
  const address = addressOverride ?? storedWallet?.address ?? "";
  const addressNode = $("[data-donation-address]");
  const networkNode = $("[data-donation-network]");
  const deleteButton = $("[data-delete-wallet]");
  const canvas = $("[data-wallet-qr]");
  if (addressNode) {
    addressNode.textContent = address;
  }
  if (networkNode) {
    networkNode.textContent = NETWORK_CONFIG[appConfig.network].label;
  }
  if (deleteButton) {
    deleteButton.hidden = appConfig.network !== "regtest";
  }
  if (canvas) {
    await import_qrcode.default.toCanvas(canvas, address, {
      width: 180,
      margin: 1
    });
  }
  setMaxRequestsInputValue(storedWallet?.maxRequestsPerTx ?? 1);
  setFeeRateInputValue(
    storedWallet?.feeRateSatPerVbyte ?? appConfig?.donations?.feeRateSatPerVbyte ?? 2
  );
  setGraffitiInputValue(storedWallet?.graffiti ?? "");
  setMaxRequestsEditing(false);
  setFeeRateEditing(false);
  setGraffitiEditing(false);
  updateGraffitiThresholdNote();
  renderDonorStatus(null);
  renderExecutionStatus("Donation wallet is stopped.", false);
  await refetchWalletData();
  clearWalletAutoRefresh();
  walletAutoRefreshIntervalId = window.setInterval(() => {
    if (!unlockedWalletState) {
      clearWalletAutoRefresh();
      return;
    }
    void refetchWalletData();
  }, WALLET_AUTO_REFRESH_MS);
  setMessage(getDonorStatusMessage(donorStatusState), getDonorStatusMessage(donorStatusState) ? "error" : "");
  showSection("wallet");
  if (getCurrentHash() !== DONATE_HASHES.donationWallet) {
    window.history.replaceState(null, "", DONATE_HASHES.donationWallet);
  }
}
async function unlockStoredWallet(password) {
  const { wallet: storedWallet } = getUnlockSourceWalletInfo();
  if (!storedWallet) {
    showSection("onboarding");
    return;
  }
  try {
    setMessage("", "");
    const mnemonic = await decryptMnemonic(storedWallet, password);
    if (!validateMnemonic(mnemonic, wordlist)) {
      throw new Error("The saved mnemonic could not be validated.");
    }
    const wallet = deriveWallet(mnemonic);
    unlockedWalletState = wallet;
    storeWallet({
      ...storedWallet,
      network: appConfig.network,
      address: wallet.address,
      derivationPath: wallet.derivationPath
    });
    await renderUnlockedWallet(wallet.address);
  } catch {
    setMessage("Unable to unlock the donation wallet with that password.", "error");
    showSection("locked");
  }
}
function renderLockedState() {
  const deleteButton = $("[data-delete-wallet]");
  const addressNode = $("[data-locked-address]");
  const unlockSource = getUnlockSourceWalletInfo();
  const storedWallet = unlockSource.wallet;
  if (addressNode) {
    addressNode.textContent = unlockSource.isCurrentNetwork ? storedWallet?.address ?? "" : "";
  }
  if (deleteButton) {
    deleteButton.hidden = appConfig?.network !== "regtest";
  }
  if (storedWallet && !unlockSource.isCurrentNetwork) {
    setMessage(
      `Unlock this donation wallet to load its ${NETWORK_CONFIG[appConfig.network].label} address.`,
      ""
    );
  } else {
    setMessage("", "");
  }
  showSection("locked");
  window.history.replaceState(null, "", DONATE_HASHES.unlockWallet);
}
function applyHashRoute() {
  const hash = getCurrentHash();
  const hasStoredWallet = Boolean(getUnlockSourceWalletInfo().wallet);
  const hasPendingMnemonic = Boolean(pendingMnemonic);
  if (hash === DONATE_HASHES.importWallet) {
    setMessage("", "");
    showSection("import");
    syncImportStepState();
    return;
  }
  if (hash === DONATE_HASHES.importPassword) {
    if (!hasPendingMnemonic || pendingWalletMode !== "import") {
      setHash(DONATE_HASHES.importWallet);
      return;
    }
    showCreateWalletStep("password");
    return;
  }
  if (hash === DONATE_HASHES.createPassword) {
    if (!hasPendingMnemonic) {
      setHash(DONATE_HASHES.onboarding);
      return;
    }
    showCreateWalletStep("password");
    return;
  }
  if (hash === DONATE_HASHES.createMnemonic) {
    if (!hasPendingMnemonic) {
      setHash(DONATE_HASHES.onboarding);
      return;
    }
    if (pendingWalletMode !== "create") {
      setHash(DONATE_HASHES.importPassword);
      return;
    }
    showCreateWalletStep("mnemonic");
    return;
  }
  if (hash === DONATE_HASHES.createWords) {
    if (!hasPendingMnemonic) {
      setHash(DONATE_HASHES.onboarding);
      return;
    }
    if (pendingWalletMode !== "create") {
      setHash(DONATE_HASHES.importPassword);
      return;
    }
    showCreateWalletStep("words");
    return;
  }
  if (hash === DONATE_HASHES.unlockWallet || hash === DONATE_HASHES.donationWallet) {
    if (hasStoredWallet) {
      renderLockedState();
      return;
    }
    setHash(DONATE_HASHES.onboarding);
    return;
  }
  if (hasStoredWallet) {
    renderLockedState();
    return;
  }
  setMessage("", "");
  showSection("onboarding");
}
async function initDonatePage() {
  const configResult = await getRuntimeConfig();
  if (!configResult.ok) {
    setMessage("Unable to load app configuration.", "error");
    showSection("onboarding");
    return;
  }
  appConfig = configResult.data;
  const createButton = $("[data-create-wallet]");
  const revealImportButton = $("[data-show-import]");
  const importButton = $("[data-import-wallet]");
  const importCancelButton = $("[data-import-cancel]");
  const unlockButton = $("[data-unlock-wallet]");
  const saveButton = $("[data-save-wallet]");
  const confirmNextButton = $("[data-confirm-next]");
  const mnemonicNextButton = $("[data-mnemonic-next]");
  const confirmBackButtons = document.querySelectorAll("[data-confirm-back]");
  const confirmCancelButton = $("[data-confirm-cancel]");
  const lockButton = $("[data-lock-wallet]");
  const deleteButton = $("[data-delete-wallet]");
  const startButton = $("[data-start-donations]");
  const stopButton = $("[data-stop-donations]");
  const editMaxRequestsButton = $("[data-edit-max-requests]");
  const saveMaxRequestsButton = $("[data-save-max-requests]");
  const editFeeRateButton = $("[data-edit-fee-rate]");
  const saveFeeRateButton = $("[data-save-fee-rate]");
  const graffitiInput = $("[data-graffiti-input]");
  const editGraffitiButton = $("[data-edit-graffiti]");
  const saveGraffitiButton = $("[data-save-graffiti]");
  const activityPrevButton = $("[data-wallet-activity-prev]");
  const activityNextButton = $("[data-wallet-activity-next]");
  const sendButton = $("[data-send-wallet]");
  const sendMaxButton = $("[data-send-max]");
  const sendAddressInput = $("[data-send-address]");
  const sendAmountInput = $("[data-send-amount]");
  const feeRateInput = $("[data-fee-rate-input]");
  const passwordInput = $("[data-wallet-password]");
  const confirmPasswordInput = $("[data-wallet-password-confirm]");
  const importMnemonicInput = $("[data-import-mnemonic]");
  const unlockPasswordInput = $("[data-unlock-password]");
  passwordInput?.addEventListener("input", syncPasswordStepState);
  confirmPasswordInput?.addEventListener("input", syncPasswordStepState);
  passwordInput?.addEventListener("keydown", handlePasswordStepSubmit);
  confirmPasswordInput?.addEventListener("keydown", handlePasswordStepSubmit);
  importMnemonicInput?.addEventListener("input", syncImportStepState);
  importMnemonicInput?.addEventListener("change", syncImportStepState);
  importMnemonicInput?.addEventListener("keyup", syncImportStepState);
  importMnemonicInput?.addEventListener("paste", () => {
    window.setTimeout(syncImportStepState, 0);
  });
  importMnemonicInput?.addEventListener(
    "keydown",
    (event) => handleEnterSubmit(event, "[data-import-wallet]")
  );
  unlockPasswordInput?.addEventListener(
    "keydown",
    (event) => handleEnterSubmit(event, "[data-unlock-wallet]")
  );
  graffitiInput?.addEventListener(
    "keydown",
    (event) => handleEnterSubmit(event, "[data-save-graffiti]")
  );
  sendAddressInput?.addEventListener("input", updateSendControls);
  sendAmountInput?.addEventListener("input", updateSendControls);
  feeRateInput?.addEventListener("input", updateSendControls);
  createButton?.addEventListener("click", () => {
    prepareMnemonicFlow(generateMnemonic(wordlist, 128), "create");
  });
  revealImportButton?.addEventListener("click", () => {
    setHash(DONATE_HASHES.importWallet);
  });
  importButton?.addEventListener("click", () => {
    const mnemonic = normalizeMnemonicInput($("[data-import-mnemonic]")?.value ?? "");
    if (!validateMnemonic(mnemonic, wordlist)) {
      setMessage("Please enter a valid BIP39 mnemonic phrase.", "error");
      return;
    }
    prepareMnemonicFlow(mnemonic, "import");
  });
  importCancelButton?.addEventListener("click", () => {
    setHash(DONATE_HASHES.onboarding);
  });
  confirmNextButton?.addEventListener("click", async () => {
    if (!validatePendingPassword()) {
      return;
    }
    if (pendingWalletMode !== "create") {
      await saveWalletFromPendingMnemonic();
      return;
    }
    setMessage("", "");
    setHash(DONATE_HASHES.createMnemonic);
  });
  mnemonicNextButton?.addEventListener("click", () => {
    setMessage("", "");
    setHash(DONATE_HASHES.createWords);
  });
  for (const button of confirmBackButtons) {
    button.addEventListener("click", () => {
      if (confirmationStep === "words") {
        setHash(DONATE_HASHES.createMnemonic);
        return;
      }
      setHash(
        pendingWalletMode === "create" ? DONATE_HASHES.createPassword : DONATE_HASHES.importWallet
      );
    });
  }
  confirmCancelButton?.addEventListener("click", () => {
    pendingMnemonic = "";
    pendingWalletMode = "create";
    confirmationIndexes = [];
    clearUnlockedWalletRuntime();
    setMessage("", "");
    setHash(DONATE_HASHES.onboarding);
  });
  unlockButton?.addEventListener("click", async () => {
    const password = String($("[data-unlock-password]")?.value ?? "");
    setMessage("", "");
    await unlockStoredWallet(password);
  });
  saveButton?.addEventListener("click", async () => {
    await saveWalletFromPendingMnemonic();
  });
  editMaxRequestsButton?.addEventListener("click", () => {
    setMaxRequestsEditing(true);
  });
  saveMaxRequestsButton?.addEventListener("click", () => {
    const maxRequestsPerTx = getMaxRequestsPerTx();
    updateStoredWallet({ maxRequestsPerTx });
    setMaxRequestsInputValue(maxRequestsPerTx);
    setMaxRequestsEditing(false);
  });
  editFeeRateButton?.addEventListener("click", () => {
    setFeeRateEditing(true);
  });
  saveFeeRateButton?.addEventListener("click", () => {
    const feeRateSatPerVbyte = getFeeRateSatPerVbyte();
    updateStoredWallet({ feeRateSatPerVbyte });
    setFeeRateInputValue(feeRateSatPerVbyte);
    setFeeRateEditing(false);
    updateSendControls();
  });
  editGraffitiButton?.addEventListener("click", () => {
    setGraffitiEditing(true);
  });
  saveGraffitiButton?.addEventListener("click", () => {
    const graffiti = getGraffitiValue();
    if ([...graffiti].length > GRAFFITI_MAX_LENGTH) {
      setMessage(`Graffiti must be ${GRAFFITI_MAX_LENGTH} characters or fewer.`, "error");
      return;
    }
    updateStoredWallet({ graffiti });
    setGraffitiInputValue(graffiti);
    setGraffitiEditing(false);
    if (donationRuntimeState.enabled) {
      donationRuntimeState.lastHeartbeatAt = 0;
    }
    setMessage("", "");
  });
  activityPrevButton?.addEventListener("click", () => {
    if (walletActivityPage <= 1) {
      return;
    }
    walletActivityPage -= 1;
    renderWalletActivityTable();
  });
  activityNextButton?.addEventListener("click", () => {
    const totalPages = Math.max(
      Math.ceil(walletActivityItems.length / WALLET_ACTIVITY_PAGE_SIZE),
      1
    );
    if (walletActivityPage >= totalPages) {
      return;
    }
    walletActivityPage += 1;
    renderWalletActivityTable();
  });
  startButton?.addEventListener("click", () => {
    setMessage("", "");
    setMaxRequestsEditing(false);
    startDonationLoop();
  });
  stopButton?.addEventListener("click", () => {
    stopDonationLoop();
  });
  sendAddressInput?.addEventListener(
    "keydown",
    (event) => handleEnterSubmit(event, "[data-send-wallet]")
  );
  sendAmountInput?.addEventListener(
    "keydown",
    (event) => handleEnterSubmit(event, "[data-send-wallet]")
  );
  sendMaxButton?.addEventListener("click", async () => {
    setSendStatus("", "");
    try {
      const maxSendSats = await calculateMaxSendAmountSats();
      setSendAmountInputValueFromSats(maxSendSats);
      updateSendControls();
      await refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
    } catch (error) {
      setSendStatus(
        error instanceof Error ? error.message : "Unable to calculate the max send amount.",
        "error"
      );
    }
  });
  sendButton?.addEventListener("click", async () => {
    const destinationAddress = String(sendAddressInput?.value ?? "").trim();
    const amountSats = getSendAmountSats();
    setSendStatus("", "");
    if (!unlockedWalletState) {
      setSendStatus("Unlock the donation wallet first.", "error");
      return;
    }
    if (!isLikelyAddressForNetwork(destinationAddress, appConfig?.network ?? "mainnet")) {
      setSendStatus("Enter a valid address for the current network.", "error");
      return;
    }
    if (!Number.isInteger(amountSats) || Number(amountSats) <= 0) {
      setSendStatus(`Enter a valid amount in ${getCoinLabel()}.`, "error");
      return;
    }
    if (getValidatedFeeRateSatPerVbyte() == null) {
      setSendStatus("Enter a valid sats/vbyte fee rate.", "error");
      return;
    }
    sendButton.disabled = true;
    if (sendMaxButton) {
      sendMaxButton.disabled = true;
    }
    try {
      const transaction = await buildSendTransaction(destinationAddress, amountSats);
      const result = await sendDonationTransaction(
        unlockedWalletState.address,
        transaction.rawTransactionHex
      );
      if (!result.ok) {
        setSendStatus("The transaction could not be broadcast.", "error");
        return;
      }
      setSendStatusWithTxLink(
        "Sent.",
        String(result.data?.txid ?? ""),
        result.data?.explorerUrl ?? ""
      );
      if (sendAddressInput) {
        sendAddressInput.value = "";
      }
      if (sendAmountInput) {
        sendAmountInput.value = "";
      }
      updateSendControls();
      await refetchWalletData({ followUpMs: SEND_REFETCH_DELAY_MS });
    } catch (error) {
      setSendStatus(
        error instanceof Error ? error.message : "Unable to send from this wallet.",
        "error"
      );
    } finally {
      updateSendControls();
    }
  });
  lockButton?.addEventListener("click", () => {
    const unlockInput = $("[data-unlock-password]");
    if (unlockInput) {
      unlockInput.value = "";
    }
    stopDonationLoop();
    clearUnlockedWalletRuntime();
    renderLockedState();
  });
  deleteButton?.addEventListener("click", () => {
    if (appConfig?.network !== "regtest") {
      return;
    }
    stopDonationLoop();
    clearWallet();
    pendingMnemonic = "";
    pendingWalletMode = "create";
    confirmationIndexes = [];
    clearUnlockedWalletRuntime();
    setMessage("", "");
    setHash(DONATE_HASHES.onboarding);
  });
  window.addEventListener("hashchange", applyHashRoute);
  window.addEventListener("beforeunload", () => {
    clearScheduledCycle();
    clearWalletAutoRefresh();
    clearWalletDataRefetchTimeout();
  });
  syncImportStepState();
  updateSendControls();
  applyHashRoute();
}
export {
  initDonatePage
};
/*! Bundled license information:

ieee754/index.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)

buffer/index.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <https://feross.org>
   * @license  MIT
   *)

@noble/hashes/utils.js:
@noble/hashes/utils.js:
@noble/hashes/utils.js:
@noble/hashes/esm/utils.js:
  (*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@noble/curves/utils.js:
@noble/curves/abstract/modular.js:
@noble/curves/abstract/curve.js:
@noble/curves/abstract/weierstrass.js:
@noble/curves/secp256k1.js:
  (*! noble-curves - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/base/index.js:
@scure/base/index.js:
  (*! scure-base - MIT License (c) 2022 Paul Miller (paulmillr.com) *)

@scure/bip32/index.js:
  (*! scure-bip32 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)

@scure/bip39/index.js:
  (*! scure-bip39 - MIT License (c) 2022 Patricio Palladino, Paul Miller (paulmillr.com) *)
*/
