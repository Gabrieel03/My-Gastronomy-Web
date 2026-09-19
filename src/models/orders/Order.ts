export type OrderStatus = "Pendente" | "Preparando" | "Entregue" | "Cancelado";

export interface OrderItem {
  plateId: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string; // Pode ser Date se você for converter depois
}