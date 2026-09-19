import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface AiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Message = {
  id: string;
  role: "user" | "ai";
  text: string;
  product?: {
    title: string;
    price: number;
    image: string;
    tag: string;
  };
};

const SUGGESTIONS = [
  { icon: "wine_bar", label: "Recomende uma bebida" },
  { icon: "cake", label: "Algo doce" },
  { icon: "restaurant", label: "Prato principal" },
  { icon: "local_fire_department", label: "Bem apimentado" },
];

export function AiDrawer({ isOpen, onClose }: AiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Simulação de chamada para o backend (NestJS + OpenAI/Gemini)
  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // 1. Adiciona a mensagem do usuário
    const newUserMsg: Message = { id: Date.now().toString(), role: "user", text };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // 2. Simula o delay da rede e a resposta da IA
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "Excellent choice. For a sophisticated palate, I highly recommend our signature Pan-Seared Duck Breast. It perfectly balances savory richness with tart fruit notes.",
        product: {
          title: "Pan-Seared Duck Breast",
          price: 42.0,
          image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500&auto=format&fit=crop", // Mock de imagem similar ao pato
          tag: "CHEF'S CHOICE"
        }
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] z-[70] bg-background shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-surface border-b border-surface-container-low shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-on-surface leading-tight">
                    {messages.length === 0 ? "Recomendação da IA" : "AI Sommelier"}
                  </h2>
                  {messages.length > 0 && (
                    <span className="text-[10px] text-primary tracking-wider uppercase font-bold">Active Culinary Guide</span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content Area (State Driven) */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-[#17171A]">
              {messages.length === 0 ? (
                /* ESTADO VAZIO: Boas-vindas */
                <div className="flex flex-col items-center justify-center h-full text-center mt-[-40px]">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full"></div>
                    <span className="material-symbols-outlined text-[64px] text-primary relative z-10">smart_toy</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-on-surface mb-4">Olá! O que você<br/>deseja hoje?</h3>
                  <p className="text-sm text-on-surface-variant max-w-[280px] mx-auto mb-10 leading-relaxed">
                    Estou aqui para ajudar você a encontrar o prato perfeito ou a bebida ideal.
                  </p>

                  <div className="w-full text-left">
                    <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-4 block">Sugestões Rápidas</span>
                    <div className="flex flex-wrap gap-3">
                      {SUGGESTIONS.map((sug, idx) => (
                        <button 
                          key={idx}
                          onClick={() => handleSendMessage(sug.label)}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-sm text-on-surface-variant hover:text-primary hover:border-primary transition-all bg-surface-container-lowest/50"
                        >
                          <span className="material-symbols-outlined text-[16px]">{sug.icon}</span>
                          {sug.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ESTADO CHAT: Conversa ativa */
                <div className="flex flex-col gap-6">
                  <div className="text-center">
                    <span className="text-[10px] bg-surface-container-low text-on-surface-variant px-3 py-1 rounded-full">Today, 19:30</span>
                  </div>
                  
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mr-3 mt-1">
                          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] flex flex-col gap-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-surface-variant text-on-surface rounded-tr-sm' 
                            : 'bg-surface-container-high text-on-surface rounded-tl-sm'
                        }`}>
                          {msg.text}
                        </div>

                        {/* Card de Produto Recomendado (se houver) */}
                        {msg.product && (
                          <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 w-[280px]">
                            <div className="h-[140px] relative">
                              <img src={msg.product.image} alt={msg.product.title} className="w-full h-full object-cover" />
                              <div className="absolute bottom-2 left-2 bg-primary text-[#171717] text-[10px] font-bold px-2 py-1 rounded">
                                {msg.product.tag}
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-on-surface text-base leading-tight pr-2">{msg.product.title}</h4>
                                <span className="font-bold text-primary">${msg.product.price}</span>
                              </div>
                              <button className="w-full mt-3 py-2 border border-primary text-primary rounded-lg text-xs font-bold uppercase hover:bg-primary/10 transition-colors">
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex w-full justify-start items-center gap-3 opacity-70">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      </div>
                      <div className="bg-surface-container-high p-4 rounded-2xl rounded-tl-sm flex gap-1">
                        <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Input */}
            <div className="p-4 bg-surface border-t border-surface-container-low shrink-0 flex flex-col gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder="Digite sua preferência..."
                  className="w-full bg-[#17171A] border border-outline-variant/30 rounded-full py-3 pl-4 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                />
                <button 
                  onClick={() => handleSendMessage(inputValue)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-[#171717] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-[20px]">send</span>
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[9px] text-on-surface-variant tracking-wider uppercase">
                  Powered by <strong className="text-primary font-serif">My Gastronomy</strong> AI
                </span>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}