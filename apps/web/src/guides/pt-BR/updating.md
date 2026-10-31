O código fica no seu projeto, então nada se atualiza sozinho: você escolhe quando trazer mudanças e quais manter.

Os itens não têm número de versão. Cada um tem um hash de conteúdo, que muda sempre que o código publicado muda:

```bash
curl -s https://<registry>/r/button.json | jq -r .meta.contentHash
```

Guarde o hash ao instalar um item, em um comentário ou em uma mensagem de commit, e um valor diferente depois significa que há novidade. O CLI reescreve imports ao instalar, então um hash da sua cópia local não vai bater. Para ver o que mudou, abra o link **Histórico de mudanças** na página do item: é o histórico do Git daquele item.

## Confira antes de sobrescrever

```bash
npx shadcn@latest add @fma-ds/button --dry-run
npx shadcn@latest add @fma-ds/button --diff
```

`--dry-run` lista o que mudaria, e `--diff` mostra a diferença de um arquivo. Nenhum dos dois escreve nada.

## Aplique uma atualização

```bash
npx shadcn@latest add @fma-ds/button --overwrite
```

Isso substitui a sua cópia, incluindo edições locais. Faça um commit antes, depois revise o diff no git e traga suas mudanças de volta. Manter as personalizações em componentes que envolvem os itens, em vez de editar os arquivos, facilita muito as atualizações.
