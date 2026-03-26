import { useState } from "react";
import { X, Mail, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

export default function ModalEsqueciSenha({ aberto, onFechar }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");

  const handleEnviar = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    // Por segurança o Supabase sempre retornará sucesso mesmo se
    // o email não existir
    if (error) {
      setErro("Erro ao enviar o email. Tente novamente.");
    } else {
      setEnviado(true);
    }

    setLoading(false);
  };

  const handleFechar = () => {
    setEmail("");
    setErro("");
    setEnviado(false);
    onFechar();
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={handleFechar}
      />

      <div
        className="relative bg-white rounded-2xl w-full max-w-sm
        shadow-2xl overflow-hidden"
      >
        {/* Cabeçalho */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ background: "linear-gradient(90deg, #2D6D7F, #51C5E5)" }}
        >
          <button
            onClick={handleFechar}
            className="text-white hover:opacity-70"
          >
            <X size={22} />
          </button>
          <h2 className="text-white text-xl font-bold">Esqueci a senha</h2>
        </div>

        <div className="px-6 py-6">
          {enviado ? (
            // Confirmação de envio
            <div className="flex flex-col items-center gap-4 py-2">
              <CheckCircle size={52} className="text-teal-500" />
              <h3 className="text-lg font-bold text-gray-800 text-center">
                Email enviado!
              </h3>
              <p className="text-gray-500 text-sm text-center leading-relaxed">
                Se este email estiver cadastrado no sistema, você receberá um
                link para redefinir sua senha. Verifique também sua caixa de
                spam.
              </p>
              <button
                onClick={handleFechar}
                className="w-full bg-linear-to-r from-[#2D6D7F] to-[#51C5E5]
                  text-white font-bold py-2.5 rounded-xl hover:scale-105
                  transition-all duration-150 active:scale-95 mt-2"
              >
                Fechar
              </button>
            </div>
          ) : (
            // Formulário
            <form onSubmit={handleEnviar} className="flex flex-col gap-4">
              <p className="text-gray-600 text-sm leading-relaxed">
                Digite o email cadastrado no sistema. Enviaremos um link para
                você criar uma nova senha.
              </p>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Email
                </label>
                <div
                  className="flex items-center border border-gray-300 rounded-lg
                  px-3 py-2 gap-2 focus-within:border-black group"
                >
                  <div
                    className="pr-2 mr-2 border-r border-gray-300 flex
                    items-center shrink-0 group-focus-within:border-black"
                  >
                    <Mail
                      size={16}
                      className="text-gray-400 group-focus-within:text-black"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Insira seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 min-w-0 outline-none text-sm"
                    required
                  />
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

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleFechar}
                  className="flex-1 border border-[#2D6D7F] text-[#2D6D7F]
                    font-semibold py-2.5 rounded-xl hover:scale-105
                    transition-all duration-150 active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-linear-to-r from-[#2D6D7F] to-[#51C5E5]
                    text-white font-semibold py-2.5 rounded-xl hover:scale-105
                    transition-all duration-150 active:scale-95 disabled:opacity-60"
                >
                  {loading ? "Enviando..." : "Enviar link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
