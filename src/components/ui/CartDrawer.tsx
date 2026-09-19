import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";
import { orderService } from "../../services/Services";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const navigate = useNavigate();

  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { addNotification } = useNotification();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false);

  const deliveryFee = 5.0;
  const total = cartTotal > 0 ? cartTotal + deliveryFee : 0;

  // --- LÓGICA DE CHECKOUT REAL ---
  const confirmCheckout = async () => {
    if (cartItems.length === 0) return;

    try {
      setIsSubmitting(true);
      const toastId = toast.loading("Enviando pedido para a cozinha...");

      // 1. Mapeamos os itens do carrinho para o DTO do NestJS
      const payload = cartItems.map((item) => ({
        plateId: String(item.id),
        quantity: item.quantity,
      }));

      // 2. Disparamos para a API (sem os colchetes!)
      await orderService.createOrder(payload);

      // 3. Sucesso! Resolvemos a UI
      toast.dismiss(toastId);
      toast.success("Pedido realizado com sucesso!");

      const nomeDoPrato = cartItems[0].title;
      const extraItemsCount = cartItems.length - 1;
      const textoExtra = extraItemsCount > 0 ? ` e mais ${extraItemsCount} item(s)` : '';

      // Mantendo sua lógica de notificação interna que é excelente para UX
      addNotification(
        "Pedido Recebido! 🍽️",
        `Seu pedido de "${nomeDoPrato}${textoExtra}" foi enviado para o restaurante. Aguardando confirmação da cozinha.`,
        "status"
      );

      clearCart();
      setIsCheckoutConfirmOpen(false);
      onClose();
      navigate('/pedidos');

    } catch (error) {
      toast.dismiss();
      toast.error("Falha ao enviar o pedido. Tente novamente.");
      console.error("Erro no checkout:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    if (itemToDelete !== null) {
      removeFromCart(itemToDelete);
      setItemToDelete(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] z-[70] glass-panel shadow-2xl flex flex-col overflow-hidden"
          >

            {/* Modal de Exclusão */}
            <AnimatePresence>
              {itemToDelete !== null && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                >
                  <div className="bg-level-2 p-6 rounded-xl border border-white/10 text-center max-w-[320px] w-full shadow-2xl">
                    <span className="material-symbols-outlined text-red-500 text-[48px] mb-2">delete_forever</span>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Remover item?</h3>
                    <p className="text-sm text-on-surface-variant mb-6">
                      Tem certeza que deseja remover este prato do seu carrinho?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setItemToDelete(null)}
                        className="flex-1 py-2.5 rounded-lg border border-outline text-on-surface hover:bg-white/5 transition-colors font-semibold text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-500 border border-red-500/20 hover:bg-red-500/30 transition-colors font-semibold text-sm"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal de Checkout */}
            <AnimatePresence>
              {isCheckoutConfirmOpen && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                >
                  <div className="bg-level-2 p-6 rounded-xl border border-white/10 text-center max-w-[320px] w-full shadow-2xl">
                    <span className="material-symbols-outlined text-primary text-[48px] mb-2">receipt_long</span>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Finalizar Pedido?</h3>
                    <p className="text-sm text-on-surface-variant mb-6">
                      Seu total é de {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}. Confirmar envio para a cozinha?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsCheckoutConfirmOpen(false)}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-lg border border-outline text-on-surface hover:bg-white/5 transition-colors font-semibold text-sm disabled:opacity-50"
                      >
                        Revisar
                      </button>

                      {/* O botão agora responde ao estado isSubmitting */}
                      <button
                        onClick={confirmCheckout}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-lg btn-primary font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[18px]">autorenew</span>
                            Processando
                          </>
                        ) : (
                          "Confirmar"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header do Drawer */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant/30 shrink-0">
              <h2 className="text-xl font-bold text-on-surface">Seu Carrinho</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-surface-variant/50 transition-colors text-on-surface-variant hover:text-primary flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-8 empty-cart-glow">
                    <span
                      className="material-symbols-outlined text-primary-container text-[120px] font-thin opacity-80"
                      style={{ fontVariationSettings: "'wght' 200" }}
                    >
                      shopping_bag
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-on-surface mb-3">Seu carrinho está vazio</h3>
                  <p className="text-sm text-on-surface-variant mb-10 max-w-[300px] mx-auto leading-relaxed">
                    Explore nosso cardápio e descubra pratos exclusivos preparados por nossos chefs.
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-primary w-full max-w-[320px] py-4 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 tracking-wider"
                  >
                    <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
                    VER CARDÁPIO
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 p-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-level-1 rounded-xl p-4 flex gap-4 border border-white/5 relative group">
                      <img src={item.image} alt={item.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                      <div className="flex flex-col justify-between flex-1">
                        <div className="flex justify-between items-start pr-6">
                          <h4 className="font-semibold text-on-surface line-clamp-2 leading-tight">{item.title}</h4>
                        </div>
                        <div className="flex justify-between items-end mt-2">
                          <span className="text-primary font-bold">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                          </span>
                          <div className="bg-level-2 rounded-full flex items-center px-2 py-1 border border-white/5">
                            <button
                              onClick={() => updateQuantity(item.id, "decrease")}
                              className="text-on-surface-variant hover:text-primary transition-colors px-1"
                            >
                              <span className="material-symbols-outlined text-sm">remove</span>
                            </button>
                            <span className="text-sm font-semibold text-on-surface px-3">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, "increase")}
                              className="text-on-surface-variant hover:text-primary transition-colors px-1"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setItemToDelete(item.id)}
                        className="absolute top-4 right-4 text-on-surface-variant hover:text-red-500 transition-colors opacity-70 group-hover:opacity-100"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="bg-level-1 p-6 border-t border-white/5 shrink-0">
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Subtotal</span>
                    <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Taxa de Entrega</span>
                    <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-on-surface pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-primary">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCheckoutConfirmOpen(true)}
                  className="w-full btn-primary rounded-lg py-4 font-bold uppercase tracking-wider"
                >
                  Finalizar Pedido
                </button>
                <div className="h-2 w-full bg-gradient-to-r from-transparent via-primary-container/20 to-transparent shrink-0"></div>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}