import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { useSocket } from "./SocketContext";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "status" | "promo" | "info";
}

interface NotificationContextData {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: "status" | "promo" | "info") => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

// 🔤 Dicionário para traduzir o status do backend para o usuário final
const STATUS_PT: Record<string, string> = {
  PENDING: "Pendente ⏳",
  PREPARING: "Sendo Preparado 👨‍🍳",
  DISPATCHED: "Saiu para Entrega 🛵",
  DELIVERED: "Entregue ✅",
  CANCELED: "Cancelado ❌"
};

export function NotificationProvider({ children }: { children: ReactNode }) {

  // 1. 🧠 MÁGICA DA PERSISTÊNCIA: Iniciamos o estado lendo do LocalStorage
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const savedNotifications = localStorage.getItem('@MyGastronomy:notifications');

    if (savedNotifications) {
      return JSON.parse(savedNotifications);
    }

    // Se for a primeira vez do usuário, mostramos a de boas-vindas
    return [
      {
        id: "welcome-1",
        title: "Bem-vindo ao My Gastronomy! 🎉",
        message: "Aproveite nosso cardápio. Qualquer dúvida, chame a IA!",
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        type: "info",
      }
    ];
  });

  const { socket } = useSocket();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 2. 💾 SALVAMENTO AUTOMÁTICO: Sempre que o array de notificações mudar, salvamos no navegador
  useEffect(() => {
    localStorage.setItem('@MyGastronomy:notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = useCallback((title: string, message: string, type: "status" | "promo" | "info" = "info") => {
    const newNotification: AppNotification = {
      id: Date.now().toString(),
      title,
      message,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  // 3. 🎧 O ESCUTADOR DE TEMPO REAL (Agora mais inteligente)
  useEffect(() => {
    if (!socket) return;

    socket.on('order_status_updated', (updatedOrder) => {

      // Pegamos o nome do prato para deixar a notificação personalizada
      const firstItem = updatedOrder.items && updatedOrder.items.length > 0 ? updatedOrder.items[0] : null;
      const mainTitle = firstItem ? firstItem.name : "Seu pedido";

      // Pegamos a tradução amigável do status
      const statusAmigavel = STATUS_PT[updatedOrder.status] || updatedOrder.status;

      // Dispara para o Drawer
      addNotification(
        `Atualização no Pedido #${updatedOrder.id}`,
        `Seu pedido de "${mainTitle}" agora está: ${statusAmigavel}`,
        "status"
      );

      // Dispara o Toast
      toast.success(`${mainTitle} está ${statusAmigavel}!`, { duration: 5000 });
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, [socket, addNotification]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification deve ser usado dentro de um NotificationProvider");
  return context;
}