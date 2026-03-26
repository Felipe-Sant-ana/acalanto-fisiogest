import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ModalEsqueciSenha from "../components/ModalEsqueciSenha";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Função auxiliar para limpar erro ao digitar
  const handleInputChange = (setter, value) => {
    setter(value);
    if (error) setError("");
  };

  // Função de login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: loginError } = await signIn(email, password, rememberMe);

    if (loginError) {
      setError("Email ou senha incorretos. Tente novamente.");
      setLoading(false);
    } else {
      navigate("/home");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-between gap-6 py-8 px-4"
      style={{ background: "linear-gradient(180deg,#2D6D7F, #51C5E5)" }}
    >
      <img src="/Logo.svg" alt="Logo" className="w-28 sm:w-40 max-w-[60vw]" />

      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm mx-auto">
        <h1 className="text-2xl font-black text-center underline mb-1">
          BEM-VINDO!
        </h1>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Faça login para acessar o sistema
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Campo Email */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Email</label>
            <div
              className={`flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2 focus-within:border-black group ${loading ? "bg-gray-100" : ""}`}
            >
              <div className="pr-2 mr-2 border-r border-gray-300 flex items-center shrink-0 group-focus-within:border-black">
                <User
                  size={16}
                  className="text-gray-400 group-focus-within:text-black"
                />
              </div>
              <input
                type="email"
                placeholder="Insira seu email"
                value={email}
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                disabled={loading}
                className="flex-1 min-w-0 outline-none text-sm disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-700">Senha</label>
            <div
              className={`flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2 focus-within:border-black group min-w-0 ${loading ? "bg-gray-100" : ""}`}
            >
              <div className="shrink-0 pr-2 mr-1 border-r border-gray-300 flex items-center group-focus-within:border-black">
                <Lock
                  size={16}
                  className="text-gray-400 group-focus-within:text-black"
                />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Insira sua senha"
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                disabled={loading}
                className="flex-1 min-w-0 outline-none text-sm bg-transparent disabled:cursor-not-allowed"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="shrink-0 ml-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Lembrar-me e Esqueci a senha */}
          <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
            <label
              className={`flex items-center gap-2 cursor-pointer ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 shrink-0"
              />
              <span className="text-gray-600">Lembrar-me</span>
            </label>
            <button
              type="button"
              onClick={() => setModalSenhaAberto(true)}
              disabled={loading}
              className="text-[#2D6D7F] hover:underline font-normal disabled:no-underline disabled:opacity-50"
            >
              Esqueci a senha
            </button>
          </div>

          {/* Estilização da mensagem de erro */}
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-linear-to-b from-[#3B7F92] to-[#45A7C3] text-white font-bold shadow-[1px_3px_3.8px_1px_#2D6D7F] hover:scale-105 py-3 rounded-full mt-2 transition-all duration-150 active:scale-95 disabled:opacity-60 disabled:scale-100 disabled:cursor-wait w-full"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <p className="text-white text-xs opacity-80 text-center px-4">
        @ {currentYear} Acalanto FisioGest. Todos os direitos reservados.
      </p>
      <ModalEsqueciSenha
        aberto={modalSenhaAberto}
        onFechar={() => setModalSenhaAberto(false)}
      />
    </div>
  );
}
