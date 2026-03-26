import { useEffect } from "react";
import { X } from "lucide-react";

export default function ModalAvaliacao({ aberto, onFechar, paciente }) {
  // Bloqueador do scroll da página atrás enquanto o modal estiver aberto
  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [aberto]);

  // - Render Condicional -
  if (!aberto || !paciente) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onFechar}
      />
      <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* - Cabeçalho -*/}
        <div
          className="flex items-center gap-3 px-6 py-4 shrink-0"
          style={{ background: "linear-gradient(90deg, #2D6D7F, #51C5E5)" }}
        >
          <button
            onClick={onFechar}
            className="text-white hover:opacity-70 transition-opacity shrink-0"
          >
            <X size={22} />
          </button>
          <h2 className="text-white text-xl font-bold">Avaliação</h2>
        </div>

        {/* - Conteúdo principal - */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          <div className="text-center mb-4">
            <span className="font-semibold text-black text-lg">Paciente: </span>
            <span className="font-normal text-black text-lg wrap-break-word">
              {paciente.nome}
            </span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 min-h-40">
            {paciente.avaliacao ? (
              <p className="text-gray-700 text-sm leading-relaxed wrap-break-word">
                {paciente.avaliacao}
              </p>
            ) : (
              <p className="text-gray-400 text-sm text-center mt-8">
                Nenhuma avaliação registrada para este paciente.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
