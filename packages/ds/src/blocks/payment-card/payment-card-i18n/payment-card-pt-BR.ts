import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const paymentCardPtBR = defineFmaNamespace("paymentCard", {
  fields: {
    cardNumber: "Número do cartão",
    expiryDate: "Validade",
    securityCode: "Código de segurança",
  },
  details: {
    issuer: "Cartão",
    number: "Número",
    holder: "Nome no cartão",
    expiry: "Validade",
  },
  remove: {
    remove: "Remover cartão",
    confirmTitle: "Remover este cartão?",
    confirmDescription: "Para pagar com cartão, será preciso adicionar um novamente.",
    confirm: "Remover cartão",
    cancel: "Cancelar",
    pending: "Removendo…",
    error: "Não foi possível remover o cartão. Tente novamente.",
  },
});
