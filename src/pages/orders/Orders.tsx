import { useState, useEffect, useContext } from "react";
import { BottomNavBar } from "../../components/layouts/BottomNavBar";
import { TopAppBar } from "../../components/layouts/TopAppBar";
import { AiDrawer } from "../../components/ui/AiDrawer";
import { CartDrawer } from "../../components/ui/CartDrawer";
import { NotificationDrawer } from "../../components/ui/NotificationDrawer";
import { useSocket } from "../../contexts/SocketContext";
import { AuthContext } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

type OrderStatus = "PENDING" | "PREPARING" | "DISPATCHED" | "DELIVERED" | "CANCELED";

interface BackendOrderItem {
  plateId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string; // <-- Adicionamos isso para o futuro
}

interface BackendOrder {
  id: string;
  userId: string;
  clientName: string;
  items: BackendOrderItem[];
  total: number;
  status: OrderStatus;
}

// 🎨 DICIONÁRIO DE CORES REFATORADO (Mais vida para a UI!)
const STATUS_STYLES: Record<string, any> = {
  PENDING: {
    badgeClass: "text-amber-500 border-amber-500/30 bg-amber-500/10", // <-- Era cinza, agora é âmbar
    icon: "schedule",
    btnText: "Aguardando",
    btnClass: "bg-amber-500 text-black font-bold hover:bg-amber-600 border border-transparent shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    display: "Pendente"
  },
  PREPARING: {
    badgeClass: "text-[#FF6B00] border-[#FF6B00]/30 bg-[#FF6B00]/10",
    icon: "soup_kitchen",
    btnText: "Acompanhar",
    btnClass: "bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 border border-transparent shadow-[0_0_15px_rgba(255,107,0,0.2)]",
    display: "Preparando"
  },
  DISPATCHED: {
    badgeClass: "text-blue-400 border-blue-400/30 bg-blue-400/10",
    icon: "two_wheeler",
    btnText: "Rastrear",
    btnClass: "bg-blue-500 text-white hover:bg-blue-600 border border-transparent",
    display: "A Caminho"
  },
  DELIVERED: {
    badgeClass: "text-green-500 border-green-500/30 bg-green-500/10",
    icon: "check_circle",
    btnText: "Avaliar",
    btnClass: "bg-transparent text-on-surface border border-outline-variant hover:bg-white/5",
    display: "Entregue"
  },
  CANCELED: {
    badgeClass: "text-red-500 border-red-500/30 bg-red-500/10",
    icon: "cancel",
    btnText: "Refazer Pedido",
    btnClass: "bg-transparent text-on-surface border border-outline-variant hover:bg-white/5",
    display: "Cancelado"
  }
};

// 🛠️ HELPER SÊNIOR: Fallback de Imagem
// Se o backend não mandar a foto, a gente "finge" uma imagem bonita de prato baseada no nome
const getFallbackImage = (plateName: string) => {
  if (plateName.toLowerCase().includes('macarrão') || plateName.toLowerCase().includes('carbonara')) {
    return "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop";
  }
  if (plateName.toLowerCase().includes('risoto')) {
    return "https://images.unsplash.com/photo-1476124369491-e73f50764e5f?w=500&auto=format&fit=crop";
  }
  return "https://images.unsplash.com/photo-1544025162-8315ea07f4ac?w=500&auto=format&fit=crop"; // Prato genérico chique
};

export function Orders() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const [ordersList, setOrdersList] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🧠 O ESTADO DA NOSSA NOVA FEATURE: Guarda qual pedido está expandido
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const { socket } = useSocket();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    async function fetchMyOrders() {
      const token = localStorage.getItem('@MyGastronomy:token'); 
      if (!token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`http://localhost:4000/orders/me`, {
           headers: {
             'Authorization': `Bearer ${token}`, 
             'Content-Type': 'application/json'
           }
        });

        if (!response.ok) throw new Error("Falha ao buscar pedidos");

        const data: BackendOrder[] = await response.json();
        setOrdersList(data);
      } catch (error) {
        console.error("Erro:", error);
        toast.error("Não foi possível carregar seus pedidos.");
      } finally {
        setIsLoading(false);
      }
    }

    if (user?.id) fetchMyOrders();
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    socket.on('order_status_updated', (updatedOrder: BackendOrder) => {
      setOrdersList((prev) =>
        prev.map((order) => order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order)
      );
    });
    return () => { socket.off('order_status_updated'); };
  }, [socket]);

  // Função para abrir/fechar o pedido
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(prev => prev === orderId ? null : orderId);
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <TopAppBar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAi={() => setIsAiOpen(true)}
      />

      <main className="pt-28 pb-12 px-4 md:px-10 max-w-[768px] mx-auto min-h-screen">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-2">Meus Pedidos</h1>
          <p className="text-on-surface-variant text-sm">Acompanhe suas experiências gastronômicas.</p>
        </div>

        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="text-center text-on-surface-variant py-10 animate-pulse">
              Buscando seus pedidos... 🧑‍🍳
            </div>
          ) : ordersList.length === 0 ? (
            <div className="text-center text-on-surface-variant py-10">
              Você ainda não tem nenhum pedido. Que tal pedir algo delicioso? 🍔
            </div>
          ) : (
            ordersList.map((order) => {
              const config = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
              
              const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
              const mainTitle = firstItem ? firstItem.name : "Pedido Misterioso";
              const hasMoreItems = order.items && order.items.length > 1;
              const extraItemsText = hasMoreItems ? ` + ${order.items.length - 1} item(s)` : "";
              
              // Define a imagem (do banco se tiver, senão usa o fallback)
              const plateImage = firstItem?.imageUrl || getFallbackImage(mainTitle);

              // Verifica se este card específico está aberto
              const isExpanded = expandedOrderId === order.id;

              return (
                <div key={order.id} className="bg-level-1 rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all duration-300">
                  
                  {/* Clicar em qualquer lugar da parte de cima abre os detalhes */}
                  <div 
                    className="flex gap-4 items-start cursor-pointer group"
                    onClick={() => toggleOrderDetails(order.id)}
                  >
                    {/* Imagem do Prato com Fallback */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                       <img src={plateImage} alt={mainTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-on-surface text-base pr-2 truncate">
                        {mainTitle} <span className="text-primary font-normal">{extraItemsText}</span>
                      </h3>
                      <p className="text-on-surface-variant text-xs mt-1">Pedido #{order.id}</p>
                      
                      {/* Ícone indicando que pode expandir (Clean UX) */}
                      {hasMoreItems && (
                        <p className="text-[10px] text-primary/70 mt-1 flex items-center gap-1">
                          {isExpanded ? 'Ocultar itens' : 'Ver todos os itens'}
                          <span className="material-symbols-outlined text-[12px]">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.badgeClass} shrink-0 transition-colors`}>
                      <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
                      <span className="text-[10px] font-bold tracking-wide">{config.display}</span>
                    </div>
                  </div>

                  {/* 🔽 ÁREA EXPANSÍVEL (O Acordeão) */}
                  {isExpanded && order.items && (
                    <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 fade-in duration-300">
                      <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Resumo do Pedido</h4>
                      <ul className="flex flex-col gap-3">
                        {order.items.map((item, index) => (
                          <li key={index} className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2 text-on-surface">
                              <span className="bg-level-2 px-2 py-0.5 rounded-md text-xs font-bold text-on-surface-variant">{item.quantity}x</span>
                              <span className="truncate max-w-[150px] md:max-w-[300px]">{item.name}</span>
                            </div>
                            <span className="text-on-surface-variant whitespace-nowrap">
                              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Footer do Card */}
                  <div className="mt-6 flex items-end justify-between">
                    <div className="flex flex-col">
                      <span className="text-on-surface-variant text-xs mb-1">Total</span>
                      <span className="text-on-surface font-bold text-lg">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.total)}
                      </span>
                    </div>

                    <button className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95 ${config.btnClass}`}>
                      {config.btnText}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <BottomNavBar onOpenAi={() => setIsAiOpen(true)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      <AiDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}