import { useEffect, useState } from "react";
import { ProductCard } from "../../components/ui/ProductCard";
import { CartDrawer } from "../../components/ui/CartDrawer";
import { NotificationDrawer } from "../../components/ui/NotificationDrawer";
import { AiDrawer } from "../../components/ui/AiDrawer";
import type { Plate } from "../../models/plates/Plate";
import { plateService } from "../../services/Services";
import { Toast } from "../../utils/toastConfig";
import { TopAppBar } from "../../components/layouts/TopAppBar";
import { BottomNavBar } from "../../components/layouts/BottomNavBar";

// Adicionei o "Todos" para o filtro inicial funcionar corretamente
const CATEGORIES = ["Todos", "Prato Principal", "Bebida", "Sobremesa", "Entradas"];

export function Home() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  
  // Estados para controlar a API
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Drawers
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Efeito Colateral: Busca os pratos assim que a Home é montada
  useEffect(() => {
    async function loadPlates() {
      try {
        setIsLoading(true);
        const data = await plateService.getAll();
        setPlates(data);
      } catch (error) {
        Toast.error("Erro ao carregar o cardápio. O servidor está rodando?");
        console.error("Erro ao buscar plates:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadPlates();
  }, []);

  // Filtro inteligente no front-end
  const filteredPlates = activeCategory === "Todos" 
    ? plates 
    : plates.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      
      <TopAppBar 
        onOpenCart={() => setIsCartOpen(true)} 
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAi={() => setIsAiOpen(true)} 
      />

      <main className="pt-28 pb-12 px-4 md:px-10 max-w-[1280px] mx-auto">
        
        <section className="mb-12">
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-all duration-300 ${
                  activeCategory === category
                    ? "btn-primary shadow-[0_0_15px_rgba(255,107,0,0.3)] border-none"
                    : "border border-outline text-on-surface-variant hover:border-primary hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Renderização Condicional: Loading ou Lista de Pratos */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin">
              autorenew
            </span>
          </div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPlates.length > 0 ? (
              filteredPlates.map((plate) => (
                <ProductCard
                  key={plate.id}
                  id={plate.id} // RESOLUÇÃO DO ERRO DO TYPESCRIPT AQUI! Convertendo string para number
                  image={plate.image}
                  category={plate.category}
                  title={plate.name} 
                  description={plate.description}
                  price={plate.price}
                  isOutOfStock={plate.quantity === 0}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-on-surface-variant">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">restaurant</span>
                <p className="text-lg">Nenhum prato encontrado para esta categoria.</p>
              </div>
            )}
          </section>
        )}
        
      </main>

      <BottomNavBar onOpenAi={() => setIsAiOpen(true)} />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      
      <NotificationDrawer 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
      
      <AiDrawer 
        isOpen={isAiOpen} 
        onClose={() => setIsAiOpen(false)} 
      />
      
    </div>
  );
}