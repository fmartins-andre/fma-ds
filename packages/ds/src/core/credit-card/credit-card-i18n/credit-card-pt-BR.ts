import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const creditCardPtBR = defineFmaNamespace("creditCard", {
  labels: {
    validThru: "válido até",
    namePlaceholder: "SEU NOME AQUI",
    card: ({ issuer, lastDigits, expiry }) =>
      `Cartão ${issuer ?? "de crédito"}${lastDigits ? ` com final ${lastDigits}` : ""}${
        expiry ? `, vence em ${expiry}` : ""
      }`,
  },
});
