# Plano: provider de i18n e dicionário central

Objetivo: configurar o idioma de todos os componentes do registro de uma vez, com pt-BR pronto, e
deixar o idioma deles seguir o do app (seletor de idioma, rota, detecção). Os textos do próprio app
ficam com o i18next (ou outra lib de i18n), e uma ponte sincroniza o idioma. Hoje cada item tem a
própria prop `i18n` (ou `labels`) com padrão em inglês, e o app repassa um objeto em cada uso para
os textos ficarem em português e consistentes entre si.

Combinado em 2026-10-29 (modelo híbrido com i18next decidido no mesmo dia).

## Por quê

- Os componentes serão usados principalmente no Brasil, mas o padrão é inglês. Hoje são ~30 itens
  com texto (props `i18n` em `core/carousel`, `data-grid`, `emoji-picker`, `file-upload`,
  `time-picker` e nos blocos `auth`, `collection-field`, `error-pages`, `event-calendar`,
  `filter-toolbar`, `form-wizard`, `notification-center`, `order-summary`, `panel-card`,
  `payment-card`, `plan-builder`, `pricing-plans`, `settings-form`, `stat-cards`; props `labels` em
  `copy-button`, `color-picker`, `credit-card`, `code-block` etc.; o hook `use-file-upload`), e ainda
  há strings fixas em inglês sem prop.
- Traduzir item por item no app é repetitivo, e a terminologia diverge ("Próximo" num lugar,
  "Avançar" em outro).
- Os apps já precisam de i18n próprio: mensagens de toast fora do React e
  erros do zod.

## Objetivos

1. Um provider na raiz do app define o idioma, e todos os componentes do registro seguem.
2. pt-BR pronto para todos os componentes; inglês continua como padrão e como fallback.
3. O dev pode sobrescrever qualquer texto ou fornecer um idioma inteiro que o registro não traz,
   com a tipagem guiando.
4. O provider é **opcional**: sem ele, cada componente se comporta exatamente como hoje.
5. **Modelo híbrido** (decisão do usuário): os textos do app ficam com o **i18next**, e o pacote
   `@fma-ds/i18n-i18next` faz o provider seguir o idioma dele, sem misturar idiomas na troca.
   Outras libs (Paraglide, Lingui, next-intl) usam o mesmo mecanismo, o `locale` controlado, por
   receita.
6. **Sem lib de i18n**, o provider também funciona sozinho (store enxuto, decisão do usuário):
   idioma fixo, idioma da rota, ou ele mesmo controla o idioma (detecção, `setLocale` para um
   seletor, pacotes carregados sob demanda, SSR).
7. O mesmo `locale` alimenta o react-aria (`I18nProvider`) e a formatação de datas/números dos
   componentes; há receitas documentadas para o `date-fns-compat` do app e para o zod 4.

## Não objetivos

- Traduzir os textos do app. Isso fica com o i18next ou outra lib, junto com ICU, JSON para
  tradutores, extração de chaves e plataformas de tradução. A lib não tem `inject`, namespaces do
  app nem `t` fora do React.
- Traduzir os textos dos componentes pelos arquivos do i18next (namespace `fma` virando
  `overrides`). É possível depois, mas as mensagens que são funções não cabem em JSON. Fica fora
  desta entrega.
- Roteamento por idioma (`/en/...`) e persistência da escolha (cookie, perfil). Isso é do app (o
  provider expõe `initialLocale` e `onLocaleChange`). A detecção do idioma do usuário **é**
  objetivo (ver "Detecção de idioma").
- Outros idiomas além de en e pt-BR nesta entrega. O formato tem que comportar 10+ idiomas sem
  pesar em quem instala um só.
- Dependência do zod na lib.

## Anti-objetivos (falha mesmo se "funcionar")

- Quebrar a prop `i18n`/`labels` atual de qualquer componente, ou mudar o texto de quem não usa o
  provider.
- Instalar um componente puxar os componentes de outros (ex.: o pacote pt-BR importar tipos de cada
  componente e o `shadcn add` trazer os 30 junto).
- Todo app carregar todos os idiomas no bundle.
- Obrigar o projeto consumidor a adotar uma biblioteca de i18n de terceiros, um plugin de Vite ou um
  passo de build. O i18next só entra com o pacote da ponte, que o app instala se quiser.
- Texto piscando em inglês no primeiro paint do SSR, ou mistura de idiomas durante a troca.
- Vazar o idioma de um usuário para outro no servidor (store global compartilhado entre requisições).

## Alternativas descartadas (e por quê)

- **Traduções dentro de cada componente** (cada arquivo com en + pt-BR): com 10 idiomas, cada
  componente carregaria todos. O usuário preferiu o dicionário central.
- **`@internationalized/string`** (o motor de strings do react-aria): não é exportado pelo
  `react-aria-components`; usa chaves planas e variáveis por objeto (`format("goToSlide",
  { slide, total })`), incompatível com a API aninhada e tipada de hoje; não interpreta ICU em
  runtime (o react-aria compila no build dele) e o `plural` do formatter é `protected`; não tem
  provider, troca de idioma nem lazy loading. O ganho real (negociação de locale e cache de
  `Intl.PluralRules`) cabe em poucas linhas nossas.
- **i18next / Paraglide / Lingui como base dos componentes**: obrigariam todo consumidor a adotar
  a biblioteca (e, nos dois últimos, um compilador). Também não guardam mensagens que são funções
  (fábricas do `event-calendar`, `time-picker`).
- **Textos do app pela nossa lib (`createFmaI18n` + `inject` por feature, no modelo do
  `injectEndpoints` do RTK Query)**: chegou a ser planejado e foi trocado pelo i18next. Seria
  reescrever store, detecção, SSR e carregamento por namespace que o i18next já tem, sem extração
  de chaves, JSON e ferramentas de tradução. Perdas aceitas:
  - lógica livre por idioma dentro da mensagem: no i18next a condição vira escolha de chave, plural
    ou `context`;
  - tipos locais por feature: a tipagem do i18next é uma declaração global, `CustomTypeOptions`;
  - completude entre idiomas checada pelo compilador sem configuração extra.
- **Registro do shadcn**: nenhum dos 508 registros do índice oficial tem provider de i18n.

## Desenho

### Itens do registro

- **`@fma-ds/i18n`** (`registry:lib`, pasta `src/lib/i18n/` com `meta.json`; importada por arquivo,
  `@/lib/i18n/index`, regra 5). Contém:
  - o provider e os hooks;
  - um store enxuto, criado por instância do provider;
  - os helpers `plural`, `number`, `currency` e `date`;
  - a negociação de locale;
  - **os tipos das mensagens de todos os componentes** (`FmaMessages`);
  - **o dicionário inglês** (`en`).

  Sem dependência npm além de `react` e `react-aria-components`.
- **Um item por idioma**: `@fma-ds/i18n-pt-br` (`registry:lib`), exporta `default` do tipo
  `FmaMessages`. Importa só tipos/helpers de `@/lib/i18n/index`, então instalar o pacote traz só a
  lib, nunca os componentes.
- **`@fma-ds/i18n-i18next`** (`registry:lib`): a ponte. Depende de `@fma-ds/i18n`, `i18next` e
  `react-i18next`. É o único item que traz o i18next.
- **Todos os componentes e blocos com texto** passam a depender de `@fma-ds/i18n` (detectado pelo
  import, regra 4).

Os tipos e o inglês moram na lib central justamente para que o pacote de idioma não dependa dos
componentes. Consequência aceita: quem instala só o carousel recebe os tipos e o inglês de todos
os componentes (texto pequeno) e não recebe nenhum outro idioma.

### Forma do dicionário

Um namespace por item, com a mesma forma que a prop `i18n` dele tem hoje (`labels`, `functions`,
`formats`, `viewNames`, `messages`…):

```ts
type FmaMessages = {
  carousel: CarouselI18nConfig;      // { labels: { previous, next, ..., goToSlide(slide, total) } }
  dataGrid: DataGridI18nConfig;
  eventCalendar: EventCalendarI18nConfig;
  // ...
};
```

Mensagens são strings ou funções TS com argumentos posicionais (`goToSlide: (slide, total) =>
...`). Plural via helper `plural(locale, n, { one, other, "=0"? })` em cima de `Intl.PluralRules`
(com cache).

**`functions` no dicionário são fábricas** (decisão do planejamento): onde a prop de hoje tem
`functions` padrão construídas a partir de `labels`/`formats` (`makeDefaultFunctions` do
`event-calendar`, `time-picker`…), o pacote de idioma traz
`functions: ({ labels, formats }) => ({ ... })`, e a lib/componente chama a fábrica com os
`labels`/`formats` já mesclados. Assim um `overrides` de um label chega às funções do pacote. Por
isso o tipo de namespace em `FmaMessages` pode diferir do `XI18nConfig` da prop (a prop continua
aceitando `functions` prontas, que vencem).

### Precedência

Para cada texto, do mais forte para o mais fraco:

1. prop `i18n`/`labels` do componente (como hoje);
2. `overrides` do provider (objeto parcial, por namespace);
3. dicionário do idioma ativo;
4. dicionário do idioma de fallback;
5. inglês da lib.

A mescla segue o contrato que já existe (`mergeEventCalendarI18n`, `mergeTimePickerI18n`,
`mergeDataGridI18n`): parcial por seção aninhada, nunca substitui uma seção inteira, e as
`functions` padrão são religadas aos `labels`/`formats` **mesclados** (sobrescrever um label muda
as funções que o usam), salvo `functions` explícitas, que vencem.

Sem provider, o componente usa o inglês da lib, e o resultado é idêntico ao de hoje.

### API do provider

Um único `FmaI18nProvider`, em quatro usos:

```tsx
import { FmaI18nProvider } from "@/lib/fma-ds/i18n/index";
import ptBR from "@/lib/fma-ds/i18n-pt-br/index";

// 1. idioma fixo (o caso mais comum: app só em português)
<FmaI18nProvider locale="pt-BR" locales={{ "pt-BR": ptBR }} overrides={{ carousel: { labels: { next: "Avançar" } } }}>

// 2. idioma da rota (/$lang/...)
<FmaI18nProvider locale={params.lang} locales={{ "pt-BR": ptBR }}>

// 3. outra lib controla o idioma (Paraglide, Lingui...): igual ao 2
<FmaI18nProvider locale={getLocale()} locales={…}>

// 4. o provider controla o idioma (app sem lib de i18n, com seletor)
<FmaI18nProvider
  defaultLocale="pt-BR"
  initialLocale={localeDoServidor}                  // cookie / Accept-Language (SSR)
  locales={{ "pt-BR": () => import("@/lib/fma-ds/i18n-pt-br/index") }}
  onLocaleChange={(l) => salvarCookie(l)}
>
```

- `locales` mapeia locale → pacote (objeto) ou loader (`() => import(...)`). O inglês está sempre
  disponível, porque vem da lib. Sem `locales`, só há inglês.
- `useFmaLocale()` → `{ locale, locales, isPending, setLocale } | null` (null sem provider). Os
  componentes usam `locale`; o seletor do app usa `setLocale`.
- O store é **por instância do provider**, não um singleton. Por isso não existe acesso fora do
  React. Textos fora do React (toasts de tratamento de erro) são do i18next ou da lib do
  app.
- Para SSR sem suspender: `loadFmaMessages(locales, pedido)` no loader da rota carrega o pacote
  (cache por loader) e devolve o locale negociado, que vai para `locale`/`initialLocale`. Sem isso,
  o provider suspende (React `use`) até o pacote carregar.

### Ponte com o i18next (`@fma-ds/i18n-i18next`)

```tsx
<I18nextProvider i18n={i18n}>
  <FmaI18nextProvider locales={{ "pt-BR": ptBR }} overrides={…}>
    <App />
  </FmaI18nextProvider>
</I18nextProvider>
```

- `FmaI18nextProvider` lê a instância do `useTranslation()`, que re-renderiza no
  `languageChanged`, e renderiza `FmaI18nProvider` com:
  - `locale={i18n.resolvedLanguage ?? i18n.language}` (controlado);
  - detecção desligada, porque quem detecta é o i18next;
  - `fallbackLocale` derivado do `fallbackLng`.
- **Troca sem mistura de idiomas.**
  - A ponte escuta o `languageChanging` do i18next e começa a baixar o nosso pacote em paralelo
    com os recursos do i18next.
  - Se o i18next terminar antes, os componentes ficam no idioma anterior até o pacote chegar
    (`isPending`, sem misturar dentro dos componentes).
  - Para trocar tudo no mesmo frame, a ponte exporta `changeLanguage(i18n, lng, locales)`: carrega
    o nosso pacote e só então chama `i18n.changeLanguage(lng)`.
  - Com pacotes importados estaticamente, os dois caminhos são instantâneos. Esse é o padrão
    recomendado na doc.
- **SSR**: o app cria uma instância do i18next por requisição (`createInstance()`), e a ponte lê a
  instância do contexto. Nada vaza entre requisições.
- `<html lang>`, zod e `date-fns-compat` do app seguem o i18next (`i18n.on("languageChanged")`),
  por receita.

### Variáveis, condições e formatação (dicionários dos componentes)

- **Variáveis** são argumentos de função, tipados. O tipo `FmaMessages` obriga cada idioma a ter a
  mesma assinatura, e cada idioma monta a frase na própria ordem.
- **Condições** são código: ternário ou `switch` dentro da função do pacote.
- **Helpers de formatação** recebem o locale explícito, porque cada arquivo de idioma sabe o seu:
  `plural(locale, n, {...})`, `currency(locale, v, "BRL")`, `number`, `date`, com cache de `Intl`.
- Mensagens dos componentes são só `string` (viram `aria-label`, `title`, `placeholder`).
- Nos textos do app, variáveis, plural, `context` e JSX (`<Trans>`) seguem a sintaxe do i18next.
  A doc mostra um exemplo e aponta para a documentação dele.

### Comportamento

- **Troca de idioma** (modo 4, ou `locale` controlado mudando): o provider mantém o idioma atual
  até o pacote novo carregar (`isPending`), depois troca de uma vez os textos dos componentes, o
  `I18nProvider` do react-aria e o formato das máscaras. Nenhum frame com idiomas misturados nos
  componentes. Para a sincronia com os textos do app, ver "Ponte com o i18next".
- **Negociação de locale**: igual à do react-aria: match exato, depois idioma+script, depois idioma
  (`pt-PT` → `pt-BR` se só houver este), depois fallback. Exportada como
  `negotiateLocale(pedidos, disponíveis)`.
- **Detecção de idioma, ligada por padrão no modo 4** (decisão do usuário; com a ponte, quem detecta
  é o i18next): o idioma do usuário vence o
  `defaultLocale`. Ordem: escolha salva pelo app (`initialLocale`, vindo de cookie/perfil) >
  idioma detectado > `defaultLocale`. Depois que o usuário troca no seletor, vale a escolha dele.
  Desligável (`detect={false}`).
  - Cliente (SPA): `navigator.languages`, lido na criação do store, para já começar no idioma
    certo.
  - SSR: a lib exporta `parseAcceptLanguage(header)`; o app passa o resultado (ou o header) a
    `loadFmaMessages` e a `initialLocale` no loader (no TanStack Start,
    `getRequestHeader("accept-language")`).
    A detecção no cliente não pode trocar o idioma de um HTML que veio do servidor (evita
    mismatch de hidratação e o "piscar"): quando há locale do servidor, ele vence.
  - Ciente: um usuário brasileiro com navegador em inglês verá inglês; o usuário aceitou isso.
- **Idioma vindo da rota** (decisão do usuário): o app que tem rotas por idioma (`/$lang/...`)
  passa o idioma da rota na prop `locale` (modo controlado), e ele vence tudo: escolha salva,
  detecção e `defaultLocale`, enquanto aquela rota estiver ativa. Ordem completa: `locale`
  controlado > `initialLocale` > detectado > `defaultLocale`. No modo controlado, `setLocale`
  (o seletor) não troca o idioma sozinho: chama `onLocaleChange`, e o app navega para a rota do
  outro idioma. No SSR, o loader faz `loadFmaMessages(locales, params.lang)`. Um `locale` da rota que não está em
  `locales` passa pela negociação (`pt` → `pt-BR`); sem match, fallback e aviso em dev. Receita na
  doc com TanStack Router (`/$lang` + `beforeLoad`).
- **SSR e isolamento**: o store é por instância do provider, e o único estado de módulo é o cache
  das promessas dos loaders, que guarda dicionários imutáveis. Duas requisições simultâneas em
  idiomas diferentes não se enxergam. Sem `AsyncLocalStorage` (exigiria `nodejs_compat` no Workers
  e é API de Node).
- **Formatação dependente de locale** (decisão do planejamento): com o provider, o `locale` dele
  vale também para datas, números e início da semana. Precedência: prop `locale` do componente >
  provider > ambiente. Como o provider renderiza o `I18nProvider` do react-aria, quem já usa
  `useLocale()` (`calendar`, `notification-center`, `panel-card`…) segue sozinho; o
  `event-calendar`, que hoje cai no `Intl` do ambiente (`resolveDefaultLocale`), passa a cair no
  `useLocale()`.
- **`date-fns-compat`** (decisão do planejamento): a lib de i18n **não** importa o
  `date-fns-compat` (mantém zero dependências e não mexe em estado global no servidor). Os
  componentes passam o locale explícito nas chamadas do adapter. Chamar `setDefaultLocale` para o
  código do próprio app é receita na doc, via `onLocaleChange` ou o `languageChanged` do i18next
  (só no cliente).
- **Componentes sem provider**: `useContext` devolve `null` → inglês da lib + prop.

### Interop

- **i18next**: pela ponte (acima).
- **Paraglide, Lingui, next-intl**: `locale` controlado com o idioma da lib; troca via a API da
  lib. Receita na doc.
- **zod 4**: receita na doc, sem dependência na lib:
  `i18n.on("languageChanged", (l) => z.config(zodLocales[l]()))` com `z.locales.ptBR`/`en`, ou
  `onLocaleChange` no modo 4. Mensagens próprias com `error: () => i18n.t(...)` (resolvidas na
  validação, acompanham a troca). Para um app em zod 3 + `zod-i18n-map` + i18next só para isso,
  migrar para zod 4 remove o `zod-i18n-map`; o i18next pode ficar para os textos do app. Isso é
  recomendação para o app, fora deste plano.
- **react-aria**: o provider renderiza o `I18nProvider` (o `core/direction` já embrulha ele; ver se
  reaproveita).

### Máscaras (decisão do usuário)

Idioma e formato andam **juntos**: um único `locale`. Separar os dois (`formatLocale`) foi
descartado porque não fica coerente: o `Intl` não tem "inglês com formato brasileiro" (`en-BR` cai
no `en`: `1,234.5`, `10/29/2026`; o override `-u-rg-brzzzz` não muda separadores nem ordem), e o
react-aria aceita um locale só, que vale para os textos e para o formato dele.

- **Documentos** (CPF, CNPJ, CEP, telefone, cartão): fixos. São formato do documento, não do
  idioma.
- **Decimal**: separadores vêm do `locale` (`Intl.NumberFormat(locale).formatToParts`).
  - O valor bruto continua neutro (`"1234.50"`).
  - O `decimalMaskRemover` passa a receber os separadores (hoje mantém só dígitos e `,`, o que em
    inglês leria `"1,234.50"` como `"1.23450"`).
  - Troca de idioma com valor digitado: o texto exibido é refeito a partir do valor bruto (desfaz
    com os separadores antigos, aplica com os novos).
  - `prefix`/`postfix` (`"R$ "`) continuam por parâmetro: moeda não é idioma.
- **Data, data-hora, período**: a ordem dos campos vem do `locale`
  (`Intl.DateTimeFormat(locale).formatToParts`), coerente com o `DateField` do react-aria. O
  placeholder (`dd/mm/aaaa`, onde "aaaa" é português) vai para o dicionário (`yyyy` em inglês).
  O valor bruto continua ISO.
- **Hora**: 24h fixa hoje; seguir o `hourCycle` do locale fica a critério de quem implementa,
  coerente com o `time-picker`.
- **Precedência**: parâmetro explícito da máscara (`decimalSeparator`, `mode`) > locale do provider
  > `pt-BR` (padrão de hoje). **Sem provider, nada muda**: as máscaras continuam brasileiras.
- **Onde o locale entra**: as funções puras de `lib/input-masks` ganham `locale` opcional (padrão
  `pt-BR`); `useMask`/`MaskedInput` resolvem o locale do contexto e passam adiante.
- Consequência aceita: com detecção ligada, quem usa o navegador em inglês digita `1,234.50` e
  `10/29/2026`. Um app que quiser formato brasileiro sempre fixa o idioma (`detect={false}` ou
  `locale` controlado) ou passa os parâmetros na máscara.

### Atualização dos itens instalados (decisão do usuário)

Como os tipos e o inglês de todos os componentes moram na lib, adicionar um componente novo num app
que já tem a lib exige sobrescrevê-la (o `shadcn add` pergunta). Regras:

- A lib é "não editar localmente; sobrescrever sempre". Personalização vai em `overrides`, nunca no
  arquivo da lib. A doc diz isso.
- Pacotes de idioma são completos **neste repo** (type-check + gate). No app, o tipo público do
  pacote tolera namespaces faltando: um pacote desatualizado não quebra o type-check, e o que
  faltar cai no fallback e depois no inglês até ele ser reinstalado.

## Escopo da migração

- Todos os itens com prop `i18n`/`labels` passam a ler o default do contexto.
- Strings fixas em inglês sem prop (aria-labels, "No results", "Close" de leitor de tela etc.) em
  `core/` e `blocks/` ganham entrada no dicionário. Os componentes vendorizados que forem tocados
  viram `source: "customized"` (regra 3). Quando a string fixa estiver num componente que hoje
  não tem prop, vale dar a ele a prop `i18n` no mesmo formato, para manter a precedência uniforme.
- O hook `use-file-upload` (mensagens fora de componente) também.
- `lib/input-masks`, `use-mask` e `masked-input`, conforme "Máscaras".
- O pacote pt-BR cobre tudo; os textos pt-BR que já existem nas stories são a fonte inicial (e
  servem para alinhar a terminologia entre componentes).

## Testes e gates

- Testes unit da lib (`tests/`, importando `@/lib/i18n/index`, regra 2):
  - precedência e mescla com religação de `functions`;
  - negociação de locale;
  - troca sem estado intermediário;
  - `loadFmaMessages`, suspensão com pacote não carregado e `plural`;
  - isolamento no servidor;
  - detecção (`navigator.languages`, `parseAcceptLanguage`, locale do servidor vencendo o do
    cliente).
- Testes da ponte: locale seguindo o i18next, `changeLanguage` atômico, pré-carga no
  `languageChanging`, duas instâncias simultâneas no SSR e `fallbackLng`.
- Completude: o pacote pt-BR é tipado como `FmaMessages` completo (o type-check falha se faltar
  chave).
- Gate estrutural (no espírito de `tests/interaction-tokens.test.ts`): todo item em `core/` e
  `blocks/` que tem prop `i18n`/`labels` lê o default do contexto; cada namespace de `FmaMessages`
  corresponde a um item existente.
- Stories: cada componente mantém as stories atuais; uma story/página mostra o provider com o
  seletor de idioma (o render é o exemplo copiável, regra 7).

## Documentação

- Página `/docs` sobre i18n, cobrindo:
  - os quatro usos do provider;
  - overrides e idioma novo;
  - a ponte com o i18next e um exemplo de textos do app por feature com namespaces do i18next;
  - SSR com TanStack Start;
  - máscaras e formato;
  - receitas para zod 4, `date-fns-compat` e outras libs.
- Descrições dos `meta.json` da lib, do pacote pt-BR e da ponte.

## Entrega

Em PRs empilhados (`gh stack`), mais ou menos:

1. Este plano.
2. Lib `@fma-ds/i18n` (store, provider, tipos, inglês) + testes, migrando 1–2 componentes como
   prova.
3. Migração dos demais componentes em lotes (core, blocos), incluindo strings fixas.
4. Máscaras sensíveis a locale.
5. Pacote `@fma-ds/i18n-pt-br`.
6. Ponte `@fma-ds/i18n-i18next`.
7. Docs do site.
8. **O `apps/web` como primeiro caso de uso** (decisão do usuário): interface do site e do editor
   de temas (`/themes`) traduzida para pt-BR, com seletor de idioma e detecção ligada, usando
   i18next (um namespace por área) + a ponte. É o exemplo real da integração. Só a interface: conteúdo (descrições dos `meta.json`,
   páginas de `/docs`, nomes das stories, `/llms.txt`) fica para depois. Precisa respeitar o limite
   de tamanho do Worker e o SSR (idioma inicial pelo `Accept-Language`/cookie, sem piscar).

## Fica a critério de quem implementa

- Nomes finais dos exports e dos namespaces (camelCase do nome do item é a sugestão).
- Organização interna da pasta `src/lib/i18n/` e onde ficam os tipos de cada componente (desde que
  o pacote de idioma não importe componentes).
- Divisão exata dos lotes de migração.
- Se `useFormat()` (number/currency/date/relativeTime com `Intl` do idioma ativo) entra agora ou
  depois.
