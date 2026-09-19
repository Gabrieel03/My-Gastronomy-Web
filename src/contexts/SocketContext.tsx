
import { io, Socket } from 'socket.io-client';
import { AuthContext } from './AuthContext'; // Ajuste o caminho se necessário
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface SocketContextData {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Se o usuário não está logado, não fazemos nada (segurança e performance)
    if (!isAuthenticated || !user?.id) return;

    // 🔗 Conecta ao servidor NestJS (Ajuste a porta se o seu NestJS não rodar na 3000)
    const socketConnection = io('http://localhost:4000');

    socketConnection.on('connect', () => {
      console.log('🔌 React conectado ao WebSocket!', socketConnection.id);
      
      // Assim que conecta, manda o ID do usuário para entrar na sala exclusiva!
      socketConnection.emit('join_user_room', user.id);
    });

    setSocket(socketConnection);

    // 🧹 Clean-up function (Muito Sênior!): 
    // Se o componente for destruído (ex: usuário fez logout), fechamos o túnel.
    return () => {
      socketConnection.disconnect();
    };
  }, [user, isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

// Hook customizado para facilitar nossa vida
export function useSocket() {
  return useContext(SocketContext);
}