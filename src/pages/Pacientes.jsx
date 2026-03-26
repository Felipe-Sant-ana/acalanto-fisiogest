import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Pencil,
  Trash2,
  User,
  Phone,
  MapPin,
  Mail,
  BriefcaseMedical,
} from "lucide-react";
import Layout from "../components/Layout";
import { supabase } from "../lib/supabaseClient";
import ModalPaciente from "../components/ModalPaciente";
import ModalAvaliacao from "../components/ModalAvaliacao";

const STATUS_LABEL = {
  aguardando_avaliacao: "Aguardando Avaliação",
  em_tratamento: "Em tratamento",
  alta: "Alta",
};

const STATUS_STYLE = {
  aguardando_avaliacao: "bg-[#EEAD34] text-white",
  em_tratamento: "bg-[#2F5D8A] text-white",
  alta: "bg-[#2E7D5A] text-white",
};

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalPacienteAberto, setModalPacienteAberto] = useState(false);
  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  useEffect(() => {
    fetchPacientes();

    // Escutador de mudanças em tempo real e gerenciador de dados
    const canal = supabase
      .channel("pacientes-pagina-realtime")
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

    return () => supabase.removeChannel(canal);
  }, []);

  const fetchPacientes = async () => {
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .order("nome");
    if (!error) setPacientes(data);
    setLoading(false);
  };

  const pacientesFiltrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cpf.includes(busca),
  );

  // Função para registrar um novo paciente
  const handleNovoPaciente = () => {
    setPacienteSelecionado(null);
    setModalPacienteAberto(true);
  };

  const handleEditar = (paciente) => {
    setPacienteSelecionado(paciente);
    setModalPacienteAberto(true);
  };

  // Função para ver avaliação escrita
  const handleVerAvaliacao = (paciente) => {
    setPacienteSelecionado(paciente);
    setModalAvaliacaoAberto(true);
  };

  // Função para excluir um paciente
  const handleExcluir = async (id) => {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir permanentemente este paciente?",
    );
    if (!confirmar) return;

    const { error } = await supabase.from("pacientes").delete().eq("id", id);
    if (error) console.error("Erro ao excluir:", error);
  };

  const handleSalvar = () => {};

  // Feedback de carregando a lista de pacientes
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 animate-pulse">
            Carregando pacientes cadastrados...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/*Cabeçalho*/}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-black">Pacientes</h1>
          <p className="text-gray-500 text-sm">
            Gerencie todos os pacientes cadastrados
          </p>
        </div>
        <button
          onClick={handleNovoPaciente}
          className="flex items-center justify-center gap-2 bg-linear-to-r
            from-[#2D6D7F] to-[#51C5E5] hover:shadow-md transition-all duration-150
            active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl w-full sm:w-auto"
        >
          <Plus size={18} /> Novo Paciente
        </button>
      </div>

      {/*Barra de pesquisa*/}
      <div
        className="flex items-center gap-2 bg-white border border-gray-200
        hover:shadow-md rounded-xl px-4 py-2.5 mb-6 shadow-sm"
      >
        <Search size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Busque por nome ou CPF..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-700"
        />
      </div>
      {pacientesFiltrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <User size={48} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum paciente encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pacientesFiltrados.map((paciente) => (
            <div
              key={paciente.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-md
                flex flex-col gap-3"
            >
              {/* Paciente: Nome, CPF e status*/}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-black wrap-break-word leading-snug">
                    {paciente.nome}
                  </p>
                  <p className="text-sm text-gray-500">{paciente.cpf}</p>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full
      whitespace-nowrap shrink-0 ${STATUS_STYLE[paciente.status]}`}
                >
                  {STATUS_LABEL[paciente.status]}
                </span>
              </div>

              {/* Demais Informações: telefone, endereço, email, etc*/}
              <div className="flex flex-col gap-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0" />
                  <span className="font-medium shrink-0">Telefone:</span>
                  <span className="wrap-break-word min-w-0">
                    {paciente.telefone}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span className="font-medium shrink-0">Endereço:</span>
                  <span className="wrap-break-word min-w-0">
                    {paciente.endereco}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Mail size={16} className="shrink-0 mt-0.5" />
                  <span className="font-medium shrink-0">Email:</span>
                  <span className="wrap-break-word min-w-0">
                    {paciente.email || "Não informado"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseMedical size={16} className="shrink-0" />
                  <span className="font-medium shrink-0">
                    Sessões combinadas:
                  </span>
                  <span>{paciente.sessoes_combinadas ?? "Indeterminado"}</span>
                </div>
              </div>

              {/* Botões: Ver Avaliação, Editar e Excluir */}
              <div className="flex flex-col gap-2 mt-1">
                <button
                  onClick={() => handleVerAvaliacao(paciente)}
                  className="flex items-center justify-center gap-1.5 bg-linear-to-r
                    from-[#2D6D7F] to-[#51C5E5] hover:shadow-md transition-all duration-150
                    active:scale-95 text-white text-sm font-semibold px-4 py-2
                    rounded-lg w-full"
                >
                  <FileText size={16} />
                  Ver Avaliação
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditar(paciente)}
                    className="flex flex-1 items-center justify-center gap-1.5
                      border border-gray-300 text-gray-700 text-sm font-semibold
                      px-4 py-2 rounded-lg hover:shadow-md transition-all duration-150
                      active:scale-95"
                  >
                    <Pencil size={15} />
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(paciente.id)}
                    className="flex flex-1 items-center justify-center gap-1.5
                      border border-gray-300 text-red-500 text-sm font-semibold
                      px-4 py-2 rounded-lg hover:shadow-md transition-all duration-150
                      active:scale-95"
                  >
                    <Trash2 size={15} />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalPaciente
        aberto={modalPacienteAberto}
        onFechar={() => setModalPacienteAberto(false)}
        paciente={pacienteSelecionado}
        onSalvar={handleSalvar}
      />
      <ModalAvaliacao
        aberto={modalAvaliacaoAberto}
        onFechar={() => setModalAvaliacaoAberto(false)}
        paciente={pacienteSelecionado}
      />
    </Layout>
  );
}
