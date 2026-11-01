O fma-ds é código que você copia, então ele roda com as ferramentas do seu projeto. Estas são as versões com que ele é construído e testado.

| Requisito | Versão | Como obter |
| --- | --- | --- |
| React e React DOM | `{{react}}` | Seu projeto |
| Tailwind CSS | `{{tailwindcss}}` | Seu projeto; a v3 não funciona, os tokens são CSS-first |
| CLI do shadcn | `{{shadcn}}` | Rode com `npx`, ou como dependência de desenvolvimento |
| react-aria-components | `{{react-aria-components}}` | Instalado pelo CLI com cada item |

Cada item lista o restante das dependências npm no seu arquivo de registro, e o CLI as instala.

O Node.js só importa para o CLI do shadcn, então use uma versão que ele suporte. As versões de Node e pnpm no `package.json` deste repositório valem para trabalhar no próprio registro, não para usá-lo.

## Configuração do projeto

Você precisa de um projeto inicializado para o shadcn/ui: um `components.json` e uma folha de estilos com Tailwind v4. Depois, siga os [passos de instalação](/docs).
