import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { User } from "lucide-react";
import Layout from "../components/Layout";
import KanbanColuna from "../components/KanbanColuna";
import { supabase } from "../lib/supabaseClient";

const COLUNAS = [
  {
    id: "aguardando_avaliacao",
    label: "Aguardando Avaliação",
    bg: "bg-[#F6E7C1]",
    header: "bg-[#EEAD34]",
    text: "text-white",
  },
  {
    id: "em_tratamento",
    label: "Em Tratamento",
    bg: "bg-[#E6EEF6]",
    header: "bg-[#2F5D8A]",
    text: "text-white",
  },
  {
    id: "alta",
    label: "Alta",
    bg: "bg-[#E4F2EC]",
    header: "bg-[#2E7D5A]",
    text: "text-white",
  },
];

export default function Home() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ativo, setAtivo] = useState(null);

  // - Sensores -
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  useEffect(() => {
    fetchPacientes();

    // Escutador de mudanças em tempo real na tabela pacientes
    const canal = supabase
      .channel("pacientes-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pacientes" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPacientes((prev) =>
              [...prev, payload.new].sort((a, b) =>
                a.nome.localeCompare(b.nome),
              ),
            );
          }
          if (payload.eventType === "UPDATE") {
            setPacientes((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? { ...p, ...payload.new } : p,
              ),
            );
          }
          if (payload.eventType === "DELETE") {
            setPacientes((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    // Cancela a escuta ao sair da página
    return () => supabase.removeChannel(canal);
  }, []);

  // Buscador da lista inicial de pacientes no banco de dados
  const fetchPacientes = async () => {
    const { data, error } = await supabase
      .from("pacientes")
      .select("id, nome, cpf, status")
      .order("nome");
    if (!error) setPacientes(data);
    setLoading(false);
  };

  const getPacientesPorStatus = (status) =>
    pacientes.filter((p) => p.status === status);

  const handleDragStart = (event) => {
    const paciente = pacientes.find((p) => p.id === event.active.id);
    setAtivo(paciente);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setAtivo(null);
    if (!over) return;

    const novoStatus = over.id;
    const pacienteId = active.id;
    const statusAtual = active.data.current.status;
    if (novoStatus === statusAtual) return;

    setPacientes((prev) =>
      prev.map((p) => (p.id === pacienteId ? { ...p, status: novoStatus } : p)),
    );

    const { error } = await supabase
      .from("pacientes")
      .update({ status: novoStatus })
      .eq("id", pacienteId);

    if (error) {
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteId ? { ...p, status: statusAtual } : p,
        ),
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 animate-pulse">
            Carregando pacientes e o quadro Kanban...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black">
          Gestão de Pacientes
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Acompanhe e gerencie o status de cada paciente em tempo real com o
          quadro Kanban
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUNAS.map((coluna) => (
            <KanbanColuna
              key={coluna.id}
              coluna={coluna}
              pacientes={getPacientesPorStatus(coluna.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {ativo && (
            <div className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl cursor-grabbing opacity-95">
              <div className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-800 truncate">
                  {ativo.nome}
                </p>
                <p className="text-xs text-gray-500">{ativo.cpf}</p>
              </div>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </Layout>
  );
}
