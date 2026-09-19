import { AnimatePresence, motion } from "framer-motion";
import { useNotification } from "../../contexts/NotificationContext";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  // 🛠️ HELPER SÊNIOR: Ícones dinâmicos baseados no conteúdo da mensagem!
  const getNotificationIcon = (type: string, message: string) => {
    if (type === 'promo') return 'sell';
    if (message.includes('Entregue')) return 'check_circle';
    if (message.includes('Cancelado')) return 'cancel';
    if (message.includes('Preparado')) return 'soup_kitchen';
    if (type === 'status') return 'local_shipping';
    return 'info';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Escuro / Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Painel do Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] z-[70] bg-surface shadow-2xl flex flex-col"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-on-surface">Notificações</h2>
                {unreadCount > 0 && (
                  <span className="bg-primary text-[#171717] text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} Nova{unreadCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-primary uppercase font-bold tracking-wider hover:underline mr-2"
                  >
                    Lidas
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-surface-variant/50 transition-colors text-on-surface-variant hover:text-primary flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Lista de Notificações */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col p-4 gap-3">
              {notifications.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                  <span className="material-symbols-outlined text-[64px] mb-4">notifications_off</span>
                  <p>Nenhuma notificação por enquanto.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-colors relative ${notif.read
                        ? 'bg-level-1 border-white/5 opacity-70'
                        : 'bg-primary/10 border-primary/30'
                      }`}
                  >
                    {!notif.read && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    )}

                    <div className="flex gap-3">
                      <span className={`material-symbols-outlined shrink-0 mt-0.5 ${notif.read ? 'text-on-surface-variant' : 'text-primary'
                        }`}>
                        {getNotificationIcon(notif.type, notif.message)}
                      </span>

                      <div>
                        <h4 className={`font-semibold ${notif.read ? 'text-on-surface' : 'text-primary'}`}>
                          {notif.title}
                        </h4>
                        <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-xs text-on-surface-variant/70 mt-3 block font-mono">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Decoração da base (Opcional, vi no seu código e achei estiloso) */}
            <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent shrink-0"></div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}