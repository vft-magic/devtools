# vite-plugin-tmagic-devtools

> `vite-plugin-tmagic-devtools` is a `Vite` plugin designed to enhance the `Vue` developer experience.

## Installation

```sh

npm add -D vite-plugin-tmagic-devtools

```

## Usage

### Configuration Vite

```ts
import { defineConfig } from 'vite'
import VueDevTools from 'vite-plugin-tmagic-devtools'

export default defineConfig({
  plugins: [
    VueDevTools(),
    vue(),
  ],
})
```

## Documentation

Check out all the DevTools details at [devtools-next.vuejs.org](https://devtools-next.vuejs.org).
