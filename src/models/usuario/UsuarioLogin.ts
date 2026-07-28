export interface UsuarioLogin {
  id: number;
  name: string;
  password: string;
  email: string;
  foto?: string | null;
  token: string;
}