O fma-ds não faz requisições de rede em tempo de execução, com uma exceção. Não há telemetria, e os temas não carregam fontes de uma CDN.

Isso foi auditado em todos os itens publicados, procurando `fetch`, `XMLHttpRequest`, `sendBeacon`, WebSockets, imports remotos e URLs fixas.

## A exceção: emoji-picker

O `EmojiPicker` baixa seus dados de `cdn.jsdelivr.net` (uma versão fixa do `emojibase-data`) na primeira vez que abre. Para evitar isso, faça uma destas opções:

- **`data`**: passe os emojis que você já tem, empacotados ou carregados no seu servidor. Nada é baixado.
- **`dataUrl`**: aponte para a sua própria cópia do `emojibase-data`.
- **`shortcodes={false}`**: pula as requisições opcionais de shortcodes.

## Fontes

Temas com fontes do catálogo as instalam como pacotes `@fontsource`, importados no seu CSS e empacotados pelo seu build. Um tema com fonte fora do catálogo avisa isso ao ser instalado, e carregar essa fonte fica por sua conta.

## Imagens

`Avatar`, `FileUpload` e componentes parecidos só carregam as URLs que você passa. Nada aponta para uma imagem externa por padrão.

## Apps offline-first

Com os dados de emoji resolvidos, os componentes funcionam sem conexão. O código dos componentes está no seu bundle, então é armazenado em cache como o resto do seu app.
