import type { site } from "./en";

export const sitePtBR = {
  brand: {
    tagline: "Componentes acessíveis para o seu projeto shadcn",
    description: "Componentes react-aria acessíveis, blocos e temas para o CLI do shadcn.",
  },
  header: {
    main: "Principal",
    docs: "Documentação",
    components: "Componentes",
    blocks: "Blocos",
    themes: "Temas",
    browseComponents: "Ver todos os componentes",
    browseBlocks: "Ver todos os blocos",
    openMenu: "Abrir menu",
    toLight: "Mudar para o modo claro",
    toDark: "Mudar para o modo escuro",
    language: "Idioma",
    themePreset: "Tema predefinido",
    imported: "{{title}} (importado)",
  },
  footer: {
    license: "Licença",
    source: "Código no GitHub",
    builtOn:
      "Feito sobre <aria>react-aria-components</aria>, distribuído no formato de <registry>registro do shadcn</registry>. Licença MIT.",
  },
  search: {
    button: "Buscar na documentação...",
    title: "Buscar",
    description: "Busque na documentação, nos componentes e nos blocos",
    placeholder: "Buscar componentes e blocos...",
    results: "Resultados",
    empty: "Nenhum resultado encontrado.",
    pages: "Páginas",
  },
  nav: {
    docs: "Documentação",
    gettingStarted: "Primeiros passos",
    guides: "Guias",
    components: "Componentes",
    blocks: "Blocos",
    introduction: "Introdução",
    themeEditor: "Editor de temas",
    themes: "Temas",
  },
  guides: {
    compatibility: "Compatibilidade",
    "dark-mode": "Modo escuro",
    routing: "Roteamento",
    offline: "Offline e privacidade",
    touch: "Toque",
    i18n: "Internacionalização",
    updating: "Atualizando itens",
    contributing: "Como contribuir",
  },
  docs: {
    lead: "Um registro pessoal de componentes no formato do shadcn/ui: {{components}} componentes, {{blocks}} blocos e {{themes}} temas, feitos sobre react-aria-components.",
    intro:
      "Isto não é um pacote que você instala pelo npm. Como no shadcn/ui, o código é copiado para o seu projeto pelo CLI <c>shadcn</c>, e a partir daí é seu. Tudo vai para pastas <c>fma-ds</c> (<c>components/fma-ds/</c>, <c>hooks/fma-ds/</c>, <c>lib/fma-ds/</c>), então nunca colide com os componentes oficiais do shadcn.",
    installation: "Instalação",
    start:
      "Comece de um projeto configurado para o shadcn/ui (Tailwind v4, um <c>components.json</c>; veja <compat>compatibilidade</compat>). Depois, registre o namespace <c>@fma-ds</c>:",
    add: "E adicione qualquer componente ou bloco pelo nome:",
    deps: "As dependências entre itens são resolvidas pelo mesmo namespace, então adicionar um bloco traz os componentes de que ele é feito.",
    index:
      "O índice completo do registro, com todos os componentes, blocos, libs, hooks e temas, está em <index><c>{{url}}</c></index>. Ele serve para explorar o que existe, para ferramentas e para comandos do <c>shadcn</c> que leem um índice de registro, como <c>shadcn search @fma-ds</c>.",
    llms: "Para agentes de IA e LLMs, o registro também é descrito em <llms><c>llms.txt</c></llms> (resumo, configuração e um link para cada item) e <full><c>llms-full.txt</c></full> (o mesmo, mais o comando de instalação, as dependências e um exemplo de uso de cada item), seguindo a convenção de <org>llmstxt.org</org>.",
    aria: "Feito sobre React Aria",
    ariaText:
      "Interação, gerenciamento de foco e acessibilidade vêm do react-aria-components, então as APIs seguem o React Aria, não o Radix: <c>isDisabled</c> em vez de <c>disabled</c>, <c>onPress</c> em vez de <c>onClick</c>, e sem <c>asChild</c> (use <c>LinkButton</c> para um link com cara de botão). Envolva seu app no <c>RouterProvider</c> do React Aria para os links navegarem no cliente (veja <routing>roteamento</routing>).",
    themes: "Temas",
    themesText:
      "Cada cor, raio, fonte e sombra é uma variável CSS. Escolha um dos temas curados, ajuste no editor de temas e exporte como CSS, ou instale direto do registro com <c>@fma-ds/theme-{{name}}</c>. Todo tema tem uma paleta clara e uma escura (veja <dark>modo escuro</dark>).",
    openEditor: "Abrir o editor de temas",
    storybook: "Storybook",
    storybookText:
      "Todo componente tem stories com testes de interação; os exemplos destas páginas são essas mesmas stories. O Storybook também documenta as props e mostra as verificações de acessibilidade.",
    openStorybook: "Abrir o Storybook",
    license: "Licença",
    licenseText:
      "MIT, então você pode usar o código em projetos abertos e proprietários. Os temas adaptados do tweakcn são Apache-2.0. Cada item informa sua licença na própria página e em <code>meta.license</code>; os direitos autorais de origem estão <notices>nos avisos</notices>.",
  },
  categories: {
    buttons: "Botões",
    chat: "Chat",
    "data-display": "Exibição de dados",
    disclosure: "Divulgação progressiva",
    feedback: "Feedback",
    forms: "Formulários",
    layout: "Layout",
    navigation: "Navegação",
    overlay: "Sobreposição",
  },
  home: {
    counts: "{{components}} componentes · {{blocks}} blocos · {{themes}} temas",
    lead: "Um registro de componentes react-aria, blocos e temas no formato do shadcn/ui. Copie para o seu app com o CLI e deixe do seu jeito.",
    getStarted: "Começar",
    browseComponents: "Ver componentes",
    showcase: "Vitrine",
    features: "Recursos",
    browse: "Explore o registro",
    accessible: {
      title: "Acessível por padrão",
      text: "Feito sobre react-aria-components: teclado, foco e leitores de tela já funcionam.",
    },
    cli: {
      title: "Compatível com o CLI do shadcn",
      text: "Instale com shadcn add @fma-ds/<name>. O código é copiado para o seu projeto: ele é seu.",
    },
    themeable: {
      title: "Personalizável",
      text: "Cada token é uma variável CSS. Escolha um tema pronto ou crie o seu no editor.",
    },
    tested: {
      title: "Testado no Storybook",
      text: "Cada componente vem com stories e testes de interação, que também são os exemplos daqui.",
    },
  },
  lists: {
    componentsLead:
      "{{count}} componentes feitos sobre react-aria-components. Cada um é instalado com o CLI do shadcn em <code>components/fma-ds/</code>.",
    blocksLead:
      "Composições de vários arquivos com os componentes do registro, prontas para usar em um app. São instaladas em <code>components/fma-ds/{{block}}/</code>. Cada uma nasceu da necessidade de um app real, então isto não é um kit genérico de aplicação.",
    viewBlock: "Ver bloco",
    preview: "Prévia de {{title}}",
  },
  item: {
    pager: "Paginação",
    breadcrumb: "Trilha de navegação",
    onThisPage: "Nesta página",
    overview: "Visão geral",
    installation: "Instalação",
    examples: "Exemplos",
    dependencies: "Dependências",
    changelog: "Histórico de mudanças",
    noPreview: "Nenhuma prévia disponível.",
    none: "Nenhuma",
    registry: "Registro",
    method: "Forma de instalação",
    manual: "Manual",
    registerNamespace: "Registre o namespace @fma-ds no components.json (uma vez)",
    addItem: "Adicione o item",
    filesLand:
      "Os arquivos vão para <code>{{target}}</code>, e as dependências do npm e do registro são instaladas junto.",
    filesLandMore:
      "Os arquivos vão para <code>{{target}}</code> e mais {{count}}, e as dependências do npm e do registro são instaladas junto.",
    installNpm: "Instale as dependências do npm",
    addRegistry: "Adicione os itens do registro de que ele depende",
    copySource: "Copie o código para o seu projeto",
    updateImports: "Ajuste os caminhos de import ao seu projeto",
    importsNote:
      "O código importa itens vizinhos como <code>@/core/{{name}}/{{name}}</code>; o CLI reescreve isso para você.",
  },
  story: {
    failed: "Este exemplo não pôde ser renderizado: {{message}}",
    example: "Exemplo {{name}}",
    preview: "Prévia",
    code: "Código",
    newTab: "Abrir em nova aba",
    openStorybook: "Abrir no Storybook",
    notFound: "Story não encontrada.",
  },
  notFound: { title: "Página não encontrada", back: "Voltar para a página inicial" },
} satisfies typeof site;
