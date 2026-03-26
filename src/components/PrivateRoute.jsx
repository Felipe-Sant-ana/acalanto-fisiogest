import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(#2D6D7F, #51C5E5)",
        }}
      >
        <div className="text-white text-lg font-semibold animate-pulse">
          Carregando...
        </div>
      </div>
    );
  }

  // Se não estiver logado, redireciona para o login
  return user ? children : <Navigate to="/" replace />;
}
