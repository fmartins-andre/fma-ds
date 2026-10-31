fma-ds makes no network requests at runtime, with one exception. There is no telemetry, and themes don't load fonts from a CDN.

This was audited against every published item, looking for `fetch`, `XMLHttpRequest`, `sendBeacon`, WebSockets, remote imports and hard-coded URLs.

## The exception: emoji-picker

`EmojiPicker` downloads its data from `cdn.jsdelivr.net` (a pinned `emojibase-data` release) the first time it opens. To avoid that, do one of these:

- **`data`**: pass the emoji you already have, bundled or loaded on your server. Nothing is fetched.
- **`dataUrl`**: point it at your own copy of `emojibase-data`.
- **`shortcodes={false}`**: skips the optional shortcode requests.

## Fonts

Themes with catalog fonts install them as `@fontsource` packages, imported into your CSS and bundled by your build. A theme using a font outside the catalog says so when installed, and loading that font is up to you.

## Images

`Avatar`, `FileUpload` and similar components only load the URLs you give them. Nothing points to an external image by default.

## Offline-first apps

With the emoji data handled, the components work with no connection. Component code is in your bundle, so it's cached the way the rest of your app is.
