import { Toaster } from "react-hot-toast";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { SocketProvider } from "./contexts/SocketContext";
import { AuthPage } from "./pages/auth/AuthPage";
import { Home } from "./pages/home/Home";
import { Orders } from "./pages/orders/Orders";
import { ProtectedRoute } from "./routers/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AuthPage />} />
                {/* 🔒 Rotas Protegidas (O Leão de Chácara toma conta) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/pedidos" element={<Orders />} />
                  {/* <Route path="/perfil" element={<Perfil />} /> */}
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster position="top-right" />
          </CartProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;