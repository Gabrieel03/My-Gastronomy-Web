import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useNotification } from "../../contexts/NotificationContext";
import toast from "react-hot-toast"; // <-- Importamos o toast para as notificações!

interface TopAppBarProps {
  onOpenCart: () => void;
  onOpenNotifications: () => void;
  onOpenAi: () => void;
}

export function TopAppBar({ onOpenCart, onOpenNotifications, onOpenAi }: TopAppBarProps) {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(AuthContext);
  const { cartCount } = useCart();
  const { unreadCount } = useNotification();
  
  const [imgError, setImgError] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Lógica unificada para a foto de perfil com fallback inteligente
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=ffb693&color=171717&bold=true`;
  const fotoPerfil = user?.foto && !imgError ? user.foto : fallbackAvatar;

  // Função para pegar iniciais
  const getInitials = (name?: string) => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // --- FUNÇÃO DE LOGOUT COMPLETA ---
  const onLogoutClick = () => {
    setIsProfileMenuOpen(false);
    if (handleLogout) handleLogout(); // Limpa o Contexto e LocalStorage
    toast.success("Você saiu da conta com sucesso! 👋"); // Avisa o usuário
    navigate('/'); // <-- Redireciona! (Se a sua rota de login for '/login' ou '/', mude aqui)
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md shadow-sm border-b border-surface-container-low/50">
      <div className="flex justify-between items-center px-4 md:px-10 h-20 w-full max-w-[1280px] mx-auto">
        
        {/* LOGO */}
        <div 
          onClick={() => navigate('/home')}
          className="text-3xl md:text-4xl font-bold text-primary tracking-tight cursor-pointer"
          style={{ fontFamily: 'serif' }}
        >
          My Gastronomy
        </div>

        {/* BARRA DE PESQUISA */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline select-none">search</span>
          <input 
            className="w-full bg-[#1A1A1D] border border-[#202023] rounded-full py-2 pl-10 pr-4 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors"
            placeholder="Search plates..."
          />
        </div>

        {/* MENU DIREITO */}
        <div className="flex items-center gap-4 md:gap-6">
          
          {/* BOTÃO PEDIDOS */}
          <button 
            onClick={() => navigate('/pedidos')}
            className="hidden md:flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            Pedidos
          </button>

          {/* BOTÃO IA */}
          <button 
            onClick={onOpenAi}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-primary-container text-primary hover:bg-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined select-none">auto_awesome</span>
            <span className="text-sm font-semibold">Recomendação com IA</span>
          </button>

          {/* NOTIFICAÇÕES */}
          <button 
            onClick={onOpenNotifications}
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 active:scale-95 relative"
          >
            <span className="material-symbols-outlined select-none">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-surface-container-low animate-pulse"></span>
            )}
          </button>

          {/* CARRINHO */}
          <button 
            onClick={onOpenCart}
            className="text-on-surface-variant hover:text-primary transition-colors duration-300 active:scale-95 relative"
          >
            <span className="material-symbols-outlined select-none">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-[#171717] text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* AVATAR DO USUÁRIO COM DROPDOWN */}
          <div className="relative">
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="h-10 w-10 rounded-full border-2 border-primary-container overflow-hidden cursor-pointer hover:shadow-[0_0_10px_rgba(255,182,147,0.3)] transition-all bg-surface-variant"
              title={user?.name}
            >
              {user?.foto ? (
                <img 
                  src={fotoPerfil} 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <span className="font-bold text-sm tracking-wider flex items-center justify-center w-full h-full text-on-surface">
                  {getInitials(user?.name)}
                </span>
              )}
            </button>

            {/* MENU DROPDOWN (Agora com cor sólida e opaca!) */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#1A1A1D] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] border border-[#202023] py-2 z-50 flex flex-col">
                <div className="px-4 py-3 border-b border-[#202023] mb-1">
                  <p className="text-sm font-bold text-on-surface line-clamp-1">{user?.name || "Usuário Convidado"}</p>
                  <p className="text-xs text-on-surface-variant truncate">{user?.email || "Faça login"}</p>
                </div>
                
                <button 
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/perfil');
                  }}
                  className="px-4 py-2.5 text-left text-sm text-on-surface hover:bg-white/5 transition-colors flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  Meu Perfil
                </button>
                
                {/* O Botão de Logout Agora Chama a Nova Função */}
                <button 
                  onClick={onLogoutClick}
                  className="px-4 py-2.5 text-left text-sm text-red-500 hover:bg-white/5 transition-colors flex items-center gap-3 mt-1"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Sair
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}