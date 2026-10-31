import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const authPtBR = defineFmaNamespace("auth", {
  resendCode: {
    resend: "Reenviar código",
    resendIn: (time) => `Reenviar código em ${time}`,
  },
});
