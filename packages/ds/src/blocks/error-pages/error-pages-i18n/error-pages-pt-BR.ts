import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const errorPagesPtBR = defineFmaNamespace("errorPages", {
  errorDetails: {
    details: "Detalhes do erro",
    copy: "Copiar detalhes",
    copied: "Copiado",
    copyFailed: "Não foi possível copiar",
  },
  notFound: {
    title: "Página não encontrada",
    description: "A página que você procura não existe ou mudou de endereço.",
  },
  forbidden: {
    title: "Acesso negado",
    description: "Você não tem permissão para ver esta página. Peça acesso a um administrador.",
  },
  unexpectedError: {
    title: "Algo deu errado",
    description: "Ocorreu um erro inesperado. Tente novamente; se continuar, fale com o suporte.",
    retry: "Tentar novamente",
    details: "Detalhes do erro",
    copy: "Copiar detalhes",
    copied: "Copiado",
    copyFailed: "Não foi possível copiar",
  },
});
