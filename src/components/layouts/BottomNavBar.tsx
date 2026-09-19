import { NavLink } from "react-router-dom";

interface BottomNavBarProps {
  onOpenAi: () => void;
}

export function BottomNavBar({ onOpenAi }: BottomNavBarProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-between items-center px-4 py-2 bg-background/95 backdrop-blur-md border-t border-surface-container-low z-40 pb-safe">
      
      {/* Botão Home */}
      <NavLink 
        to="/home" // Ou to="/" dependendo de como está configurado no seu App.tsx
        className={({ isActive }) => `flex flex-col items-center justify-center w-12 transition-all active:scale-90 ${isActive ? 'text-primary' : 'text-outline hover:text-primary'}`}
      >
        <span className="material-symbols-outlined">home</span>
        <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Home</span>
      </NavLink>
      
      {/* Botão Pedidos */}
      <NavLink 
        to="/pedidos" 
        className={({ isActive }) => `flex flex-col items-center justify-center w-12 transition-all active:scale-90 ${isActive ? 'text-primary' : 'text-outline hover:text-primary'}`}
      >
        <span className="material-symbols-outlined">receipt_long</span>
        <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Pedidos</span>
      </NavLink>

      {/* Botão Central de IA (FAB) */}
      <button 
        onClick={onOpenAi}
        className="flex flex-col items-center justify-center w-14 h-14 rounded-full btn-primary text-white shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:scale-105 active:scale-95 transition-all -translate-y-5 border-[3px] border-background"
      >
        <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
      </button>

      {/* Botão Menu (Mantenha como placeholder ou crie a rota depois) */}
      <button className="flex flex-col items-center justify-center w-12 text-outline hover:text-primary active:scale-90 transition-all">
        <span className="material-symbols-outlined">restaurant</span>
        <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Menu</span>
      </button>

      {/* Botão Perfil (Mantenha como placeholder ou crie a rota depois) */}
      <button className="flex flex-col items-center justify-center w-12 text-outline hover:text-primary active:scale-90 transition-all">
        <span className="material-symbols-outlined">person</span>
        <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">Perfil</span>
      </button>
      
    </nav>
  );
}