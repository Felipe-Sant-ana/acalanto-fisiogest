import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function RedefinirSenha() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Validação de Sessão
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/");
    });
  }, [navigate]);

  const handleRedefinir = async (e) => {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      setErro("Erro ao redefinir senha. Tente novamente.");
    } else {
      setSucesso(true);
      setTimeout(() => navigate("/"), 3000);
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-10 px-4"
      style={{ background: "linear-gradient(#2D6D7F, #51C5E5)" }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center">
        <img
          src="/Logo.svg"
          alt="Logo Acalanto FisioGest"
          className="w-28 sm:w-40"
        />
      </div>

      {/* Card */}
      <div
        className="bg-white rounded-2xl shadow-[5px_4px_7.8px_4px_#2D6D7F]
        p-8 w-full max-w-sm"
      >
        {sucesso ? (
          // Tela de sucesso
          <div className="flex flex-col items-center gap-4 py-4">
            <CheckCircle size={56} className="text-teal-500" />
            <h2 className="text-xl font-bold text-gray-800 text-center">
              Senha redefinida!
            </h2>
            <p className="text-gray-500 text-sm text-center">
              Sua senha foi alterada com sucesso. Você será redirecionado para o
              login em instantes...
            </p>
          </div>
        ) : (
          // Formulário
          <>
            <h1 className="text-2xl font-black text-center underline mb-1">
              NOVA SENHA
            </h1>
            <p className="text-center text-gray-600 mb-6 text-sm">
              Digite e confirme sua nova senha
            </p>

            <form onSubmit={handleRedefinir} className="flex flex-col gap-4">
              {/* Nova senha */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Nova senha
                </label>
                <div
                  className="flex items-center border border-gray-300 rounded-lg
                  px-3 py-2 gap-2 focus-within:border-black group"
                >
                  <div
                    className="pr-2 mr-2 border-r border-gray-300 flex
                    items-center shrink-0 group-focus-within:border-black"
                  >
                    <Lock
                      size={16}
                      className="text-gray-400 group-focus-within:text-black"
                    />
                  </div>
                  <input
                    type={showNova ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="flex-1 min-w-0 outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNova(!showNova)}
                    className="text-gray-400 hover:text-gray-600 shrink-0 ml-1"
                  >
                    {showNova ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirmar senha */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Confirmar nova senha
                </label>
                <div
                  className="flex items-center border border-gray-300 rounded-lg
                  px-3 py-2 gap-2 focus-within:border-black group"
                >
                  <div
                    className="pr-2 mr-2 border-r border-gray-300 flex
                    items-center shrink-0 group-focus-within:border-black"
                  >
                    <Lock
                      size={16}
                      className="text-gray-400 group-focus-within:text-black"
                    />
                  </div>
                  <input
                    type={showConfirmar ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="flex-1 min-w-0 outline-none text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmar(!showConfirmar)}
                    className="text-gray-400 hover:text-gray-600 shrink-0 ml-1"
                  >
                    {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {erro && (
                <p
                  className="text-red-500 text-sm text-center bg-red-50
                  rounded-lg py-2 px-3"
                >
                  {erro}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-linear-to-b from-[#3B7F92] to-[#45A7C3] text-white
                  font-bold shadow-[1px_3px_3.8px_1px_#2D6D7F] hover:scale-105 py-3
                  rounded-full mt-2 transition-all duration-150 active:scale-95
                  disabled:opacity-60"
              >
                {loading ? "Salvando..." : "Redefinir senha"}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Rodapé */}
      <p className="text-white text-xs opacity-80 text-center">
        @ {currentYear} Acalanto FisioGest. Todos os direitos reservados.
      </p>
    </div>
  );
}
