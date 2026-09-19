import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";


export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // Se o contexto ainda estiver verificando o LocalStorage, mostramos um loading
  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center text-primary">Carregando...</div>;
  }

  // Se NÃO estiver autenticado, redireciona para o login e substitui o histórico (replace)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Se estiver tudo certo, renderiza as rotas filhas
  return <Outlet />;
}