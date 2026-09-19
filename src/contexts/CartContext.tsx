import { createContext, useContext, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextData {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  updateQuantity: (id: string, type: "increase" | "decrease") => void; 
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addToCart = (product: Omit<CartItem, "quantity">) => {
    const itemExists = cartItems.some((item) => item.id === product.id);

    const msg = itemExists
      ? `Mais um ${product.title} adicionado!`
      : `${product.title} adicionado ao carrinho!`;

    toast.success(
      (t) => (
        <span className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-800">{msg}</span>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex items-center justify-center p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
            title="Fechar"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </span>
      )
    );

    setCartItems((prevItems) => {
      const exists = prevItems.find((item) => item.id === product.id);
      if (exists) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, type: "increase" | "decrease") => { // <-- Alterado para string
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const newQuantity = type === "increase" ? item.quantity + 1 : item.quantity - 1;
          return { ...item, quantity: Math.max(1, newQuantity) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id: string) => { // <-- Alterado para string
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));

    toast.error(
      (t) => (
        <span className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-800">Item removido do carrinho.</span>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex items-center justify-center p-1 rounded-full hover:bg-gray-200 transition-colors text-gray-500"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </span>
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}