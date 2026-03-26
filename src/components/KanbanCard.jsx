import { useDraggable } from "@dnd-kit/core";
import { User } from "lucide-react";
import { useEffect } from "react";

export default function KanbanCard({ paciente }) {
  // Gerenciador da lógica de arrastar
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: paciente.id,
      data: { status: paciente.status },
    });

  // Lógica de Estilização Dinâmica
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
    : undefined;

  // Bloqueador do scroll da página enquanto o card está sendo arrastado
  useEffect(() => {
    if (isDragging) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    // Limpeza ao desmontar o componente
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isDragging]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-white rounded-xl px-4 py-3 flex items-center gap-3
        shadow-sm cursor-grab active:cursor-grabbing transition-shadow
        touch-none select-none
        ${isDragging ? "opacity-50 shadow-xl scale-105" : "hover:shadow-md"}`}
    >
      <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center shrink-0">
        <User size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm text-gray-800 truncate">
          {paciente.nome}
        </p>
        <p className="text-xs text-gray-500">{paciente.cpf}</p>
      </div>
    </div>
  );
}
