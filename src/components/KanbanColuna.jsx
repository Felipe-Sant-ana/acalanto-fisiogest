import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

export default function KanbanColuna({ coluna, pacientes }) {
  // Hook de Drop
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id });

  return (
    <div className="rounded-xl overflow-hidden flex flex-col">
      {/* - Cabeçalho -*/}
      <div className={`${coluna.header} px-4 py-2.5`}>
        <h2 className={`font-bold text-center text-sm ${coluna.text}`}>
          {coluna.label}
        </h2>
      </div>

      {/* - Área de drop - */}
      <div
        ref={setNodeRef}
        className={`${coluna.bg} flex-1 p-3 flex flex-col gap-2 rounded-b-xl
          transition-all min-h-32 md:min-h-64 touch-none
          ${isOver ? "brightness-95 ring-2 ring-inset ring-black/5" : ""}`}
      >
        {/* - Renderização da Lista - */}
        {pacientes.map((paciente) => (
          <KanbanCard key={paciente.id} paciente={paciente} />
        ))}

        {pacientes.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4">
            Nenhum paciente
          </p>
        )}
      </div>
    </div>
  );
}
