import { defineFmaNamespace } from "@/lib/i18n/i18n";

export const notificationCenterPtBR = defineFmaNamespace("notificationCenter", {
  labels: {
    title: "Notificações",
    trigger: (unread) =>
      unread > 0 ? `Notificações, ${unread} não lidas` : "Notificações, nenhuma não lida",
    unread: "Não lida",
    read: "Lida",
    markAsRead: "Marcar como lida",
    markAllAsRead: "Marcar todas como lidas",
    delete: "Excluir",
    empty: "Nenhuma notificação",
    emptyDescription: "Você está em dia.",
    loading: "Carregando notificações…",
    viewAll: "Ver todas as notificações",
  },
});
