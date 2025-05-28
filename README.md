# Pixelift

> **Cross-environment raw image decoder with pixel-perfect consistency**
> Decode any image source into exact, consistent 8-bit RGBA pixels — identically in both browser and Node.js — via one simple, lightweight API.

---

## 📋 Table of Contents

1. [Why Pixelift?](#why-pixelift)
2. [The Pixel-Exact Promise](#the-pixel-exact-promise)
3. [Features](#features)
4. [Installation](#installation)
5. [Quick Start](#quick-start)
6. [Browser vs Server](#browser-vs-server)
7. [Advanced Usage](#advanced-usage)
8. [API Reference](#api-reference)
9. [Contributing](#contributing)
10. [License](#license)

---

## Why Pixelift?

Pixelift was born out of a clear need: a **universal, reliable, and performant way to extract raw pixel data from images, consistent across environments**.

* 🎯 **Unified API** for any image input — URLs, file paths, buffers, blobs, HTML elements, streams, and more
* ⚡️ **High performance** by leveraging native browser APIs like OffscreenCanvas and WebCodecs, and the Sharp library on Node.js
* 🔍 **Broad format support**: PNG, JPEG, GIF, WebP, AVIF, SVG, and beyond
* 🔧 **Pure TypeScript** with zero browser dependencies — lightweight and tree-shakable
* 🔄 **Automatic environment detection:** seamless experience whether on the client or server

---

## The Pixel-Exact Promise

A cornerstone of Pixelift is its **guarantee of pixel-perfect identical RGBA output for all lossless image formats across environments**.

This means:
* Your decoded pixel data will be **bit-for-bit the same** whether you decode in the browser or Node.js
* Consistency extends to color, transparency, and pixel layout, eliminating subtle platform differences
* Enables **reliable, reproducible image processing** workflows and pixel-level comparisons
* Empowers developers to build confidently without environment-specific hacks or compromises

Pixelift is designed around this principle — the promise of **true cross-environment fidelity**.

---

## Features

* Decode from `string`, `URL`, `File`, `Blob`, `BufferSource`, `HTMLImageElement`, `HTMLVideoElement`, `Canvas`, and more
* Automatic runtime detection (browser vs Node.js) with unified API
* Streaming support with progress callbacks for large images
* Pure TypeScript implementation with full typings and zero dependencies in the browser
* Modular exports to enable tree-shaking and optimized bundles
* Clear, robust error handling with custom error codes (`PixeliftError`)
* Lightweight, no runtime side effects, and designed for easy integration

---

## Installation

```bash
npm install pixelift
# or
yarn add pixelift
```

---

## Quick Start

```ts
import { decode } from 'pixelift';

const pixelData = await decode('https://example.com/image.png');

console.log(pixelData.width, pixelData.height);
console.log(pixelData.data); // Uint8ClampedArray of RGBA pixels
```

---

## Browser vs Server

Pixelift intelligently detects your environment and uses the best available tools:

* **Browser:** Uses OffscreenCanvas and native browser APIs for efficient decoding
* **Server:** Uses the Sharp library, optimized for Node.js environments

Both sides produce **identical pixel output** for lossless formats, enabling seamless cross-platform workflows.

---

## Advanced Usage

* Decode from streams with progress notifications
* Pass options to control decoding behavior and performance
* Handle various image-like inputs seamlessly

(Refer to the [API Reference](#api-reference) for detailed examples and typings.)

---

## API Reference

Detailed docs are available in the [API Reference](./docs/API.md).

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [contributing guidelines](./CONTRIBUTING.md).

---

## License

MIT License © Your Name or Organization

