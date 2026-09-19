import { useCart } from "../../contexts/CartContext";

interface ProductCardProps {
  id: string; 
  image: string;
  category: string;
  title: string;
  description: string;
  price: number;
  isOutOfStock?: boolean;
}

export function ProductCard({
  id,
  image,
  category,
  title,
  description,
  price,
  isOutOfStock = false,
}: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({ id, title, price, image });
  };

  return (
    <div className={`card-bg rounded-xl overflow-hidden relative group transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg ${isOutOfStock ? "opacity-75" : ""}`}>
      <div className="h-48 overflow-hidden relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-sm border border-outline/30">
          <span className="text-primary text-[10px] font-bold tracking-wider uppercase">
            {category}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-2">
        <h3 className="text-xl font-bold text-on-surface line-clamp-1">{title}</h3>
        <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed">
          {description}
        </p>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}
          </span>
        </div>

        {isOutOfStock ? (
          <div className="absolute bottom-4 right-4 px-3 py-1 bg-surface-container-low border border-outline rounded-full text-outline text-sm font-medium">
            Esgotado
          </div>
        ) : (
          <button 
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 h-10 w-10 rounded-full btn-primary flex items-center justify-center text-white hover:scale-110 transition-transform shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        )}
      </div>
    </div>
  );
}