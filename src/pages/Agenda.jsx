import { useEffect, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Tag,
  Trash2,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Layout from "../components/Layout";
import ModalConsulta from "../components/ModalConsulta";
import { supabase } from "../lib/supabaseClient";

const STATUS_COR = {
  agendada: "bg-[#3FA7B5] text-white",
  realizada: "bg-[#5CB85C] text-white",
  cancelada: "bg-[#E57373] text-white",
};

const STATUS_COR_CARD = {
  agendada: "bg-[#76B6BE] border-teal-300",
  realizada: "bg-[#89D089] border-green-300",
  cancelada: "bg-[#F5B0B0] border-red-300",
};

const OPCOES_VISUALIZACAO = [
  { value: "mes", label: "Mês" },
  { value: "dia", label: "Dia" },
];

export default function Agenda() {
  const [visualizacao, setVisualizacao] = useState("mes");
  const [dataAtual, setDataAtual] = useState(new Date());
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);

  useEffect(() => {
    fetchConsultas();

    // Escutador de mudanças em tempo real e gerenciador de dados
    const canal = supabase
      .channel("consultas-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consultas" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Busca o nome do paciente para o novo registro
            supabase
              .from("pacientes")
              .select("nome")
              .eq("id", payload.new.paciente_id)
              .single()
              .then(({ data }) => {
                const novaConsulta = {
                  ...payload.new,
                  pacientes: { nome: data?.nome || "" },
                };
                setConsultas((prev) =>
                  [...prev, novaConsulta].sort(
                    (a, b) =>
                      a.data.localeCompare(b.data) ||
                      a.hora.localeCompare(b.hora),
                  ),
                );
              });
          }
          if (payload.eventType === "UPDATE") {
            supabase
              .from("pacientes")
              .select("nome")
              .eq("id", payload.new.paciente_id)
              .single()
              .then(({ data }) => {
                setConsultas((prev) =>
                  prev.map((c) =>
                    c.id === payload.new.id
                      ? {
                          ...payload.new,
                          pacientes: { nome: data?.nome || "" },
                        }
                      : c,
                  ),
                );
              });
          }
          if (payload.eventType === "DELETE") {
            setConsultas((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    return () => supabase.removeChannel(canal);
  }, []);

  const fetchConsultas = async () => {
    const { data, error } = await supabase
      .from("consultas")
      .select(`*, pacientes(nome)`)
      .order("data")
      .order("hora");
    if (!error) setConsultas(data);
    setLoading(false);
  };

  const getConsultasDoDia = useCallback(
    (data) => {
      const dataStr = format(data, "yyyy-MM-dd");
      return consultas
        .filter((c) => c.data === dataStr)
        .sort((a, b) => a.hora.localeCompare(b.hora));
    },
    [consultas],
  );

  const formatarHora = (hora) => {
    const [h, m] = hora.split(":");
    return `${String(parseInt(h)).padStart(2, "0")}:${m}`;
  };

  const handleNovaConsulta = () => {
    setConsultaSelecionada(null);
    setModalAberto(true);
  };

  const handleEditarConsulta = (consulta) => {
    setConsultaSelecionada(consulta);
    setModalAberto(true);
  };

  // Função para excluir uma consulta
  const handleExcluirConsulta = async (e, id) => {
    e.stopPropagation();
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta consulta?",
    );
    if (!confirmar) return;

    await supabase.from("consultas").delete().eq("id", id);
  };

  const handleSalvar = () => {};

  // - Visão Mensal -
  const renderMes = () => {
    const inicioMes = startOfMonth(dataAtual);
    const fimMes = endOfMonth(dataAtual);
    const inicioCal = startOfWeek(inicioMes, { weekStartsOn: 0 });
    const fimCal = endOfWeek(fimMes, { weekStartsOn: 0 });

    const dias = [];
    let dia = inicioCal;
    while (dia <= fimCal) {
      dias.push(dia);
      dia = addDays(dia, 1);
    }

    const semanas = [];
    for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));

    const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {diasSemana.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-x1 font-semibold text-black"
            >
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d[0]}</span>
            </div>
          ))}
        </div>

        {/* Semanas */}
        {semanas.map((semana, si) => (
          <div
            key={si}
            className="grid grid-cols-7 border-b border-gray-200 last:border-0"
          >
            {semana.map((diaItem, di) => {
              const consultasDoDia = getConsultasDoDia(diaItem);
              const foraDoMes = !isSameMonth(diaItem, dataAtual);
              const hoje = isToday(diaItem);
              const MAX_VISIVEIS = 2;

              return (
                <div
                  key={di}
                  onClick={() => {
                    setDataAtual(diaItem);
                    setVisualizacao("dia");
                  }}
                  className={`min-h-16 md:min-h-20 p-1 md:p-1.5 border-r border-gray-200 last:border-0
                    cursor-pointer hover:bg-gray-50 transition-colors
                    ${foraDoMes ? "bg-gray-50" : ""}`}
                >
                  {/* Número do dia */}
                  <div
                    className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center
                    rounded-full text-xs font-semibold mb-1
                    ${
                      hoje
                        ? "bg-black text-white"
                        : foraDoMes
                          ? "text-gray-300"
                          : "text-black"
                    }`}
                  >
                    {format(diaItem, "d")}
                  </div>

                  {/* Chips (PC/Tablet)*/}
                  <div className="hidden sm:flex flex-col gap-1.5">
                    {consultasDoDia.slice(0, MAX_VISIVEIS).map((c) => (
                      <div
                        key={c.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditarConsulta(c);
                        }}
                        className={`text-xs px-1.5 py-1 rounded-lg font-medium
                          cursor-pointer flex flex-col gap-0.5 ${STATUS_COR[c.status]}`}
                      >
                        {/* Horário e nome do paciente= (PC) */}
                        <span className="flex items-center gap-1">
                          <Clock size={10} className="shrink-0" />
                          {formatarHora(c.hora)}
                        </span>
                        <span className="truncate leading-tight">
                          {c.pacientes?.nome}
                        </span>
                      </div>
                    ))}
                    {consultasDoDia.length > MAX_VISIVEIS && (
                      <p className="text-xs text-gray-400 pl-1">
                        +{consultasDoDia.length - MAX_VISIVEIS} mais
                      </p>
                    )}
                  </div>

                  {/* Pontos coloridos (Celular) */}
                  <div className="flex sm:hidden flex-wrap gap-0.5 mt-0.5">
                    {consultasDoDia.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_COR[c.status].split(" ")[0]}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  // - Visão Diária -
  const renderDia = () => {
    const consultasDoDia = getConsultasDoDia(dataAtual);
    const horas = Array.from({ length: 17 }, (_, i) => i + 7);

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-200">
          {horas.map((hora) => {
            const consultasNaHora = consultasDoDia.filter((c) => {
              const [h] = c.hora.split(":");
              return parseInt(h) === hora;
            });

            return (
              <div key={hora} className="flex min-h-14">
                {/* Hora */}
                <div
                  className="w-14 md:w-16 shrink-0 flex items-start justify-center
                  pt-3 text-xs text-gray-500 font-medium border-r border-gray-200"
                >
                  {String(hora).padStart(2, "0")}:00
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 flex flex-col gap-2 min-w-0">
                  {consultasNaHora.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => handleEditarConsulta(c)}
                      className={`relative overflow-hidden rounded-2xl px-4 py-4 cursor-pointer
                        hover:shadow-[0_8px_14px_rgba(0,0,0,0.3)] transition-all
                        ${STATUS_COR_CARD[c.status]}`}
                    >
                      {/* Faixa lateral do card */}
                      <div className="absolute left-0 top-0 h-full w-3 bg-black/15" />

                      {/* Linha superior: hora, status e botão excluir */}
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <div className="flex items-center gap-1.5 text-sm text-black shrink-0">
                          <Clock size={13} className="shrink-0" />
                          {formatarHora(c.hora)}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full
      capitalize shrink-0 ${STATUS_COR[c.status]}`}
                          >
                            {c.status.charAt(0).toUpperCase() +
                              c.status.slice(1)}
                          </span>

                          <button
                            onClick={(e) => handleExcluirConsulta(e, c.id)}
                            className="p-1 rounded-lg bg-white hover:bg-red-100
        hover:text-red-600 text-black hover:shadow-md
        transition-all duration-150 active:scale-85 shrink-0"
                            title="Excluir consulta"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Paciente */}
                      <div className="flex items-start gap-1.5 text-sm text-black mt-0.5">
                        <User size={13} className="shrink-0 mt-0.5" />
                        <span className="wrap-break-word line-clamp-2 leading-snug">
                          {c.pacientes?.nome}
                        </span>
                      </div>

                      {/* Serviço */}
                      <div className="flex items-center gap-1.5 text-sm text-black mt-0.5">
                        <Tag size={13} className="shrink-0" />
                        <span className="truncate">{c.servico}</span>
                      </div>

                      {/* Observações */}
                      <div
                        className="text-xs mt-1.5 px-2 py-1 rounded-lg bg-white/60
  text-gray-500 wrap-break-word line-clamp-3"
                      >
                        {c.observacoes || "Nenhuma observação."}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // - Navegação -
  const avancar = () => {
    if (visualizacao === "mes") setDataAtual(addMonths(dataAtual, 1));
    else setDataAtual(addDays(dataAtual, 1));
  };

  const voltar = () => {
    if (visualizacao === "mes") setDataAtual(subMonths(dataAtual, 1));
    else setDataAtual(subDays(dataAtual, 1));
  };

  const tituloAtual =
    visualizacao === "mes"
      ? format(dataAtual, "MMMM yyyy", { locale: ptBR }).replace(/^\w/, (c) =>
          c.toUpperCase(),
        )
      : format(dataAtual, "dd 'de' MMMM", { locale: ptBR }).replace(
          /de (\w)/,
          (_, c) => `de ${c.toUpperCase()}`,
        );

  // Feedback de carregando a agenda
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400 animate-pulse">Carregando agenda...</p>
        </div>
      </Layout>
    );
  }

  return (
    // - Barra de controles -
    <Layout>
      {/* - Layout Mobile/Tablet -*/}
      <div className="flex flex-col gap-2 mb-4 lg:hidden">
        {/* Navegação de data */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={voltar}
            className="p-2 rounded-lg border border-gray-200 hover:shadow-md
        transition-all duration-150 active:scale-95"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>

          <h2 className="text-base font-bold text-gray-800 min-w-32 text-center">
            {tituloAtual}
          </h2>

          <button
            onClick={avancar}
            className="p-2 rounded-lg border border-gray-200 hover:shadow-md
        transition-all duration-150 active:scale-95"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Dropdown e botão "Nova Consulta" */}
        <div className="flex items-center gap-2">
          <select
            value={visualizacao}
            onChange={(e) => setVisualizacao(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold
        text-gray-700 bg-white cursor-pointer hover:shadow-md
        transition-all duration-150 outline-none"
          >
            {OPCOES_VISUALIZACAO.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleNovaConsulta}
            className="flex-1 flex items-center justify-center gap-2
        bg-linear-to-r from-[#2D6D7F] to-[#51C5E5]
        hover:shadow-md transition-all duration-150 active:scale-95
        text-white font-bold px-4 py-2 rounded-xl"
          >
            <Plus size={18} />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* - Layout PC -*/}
      <div className="hidden lg:flex items-center gap-2 mb-4 flex-wrap">
        {/* Navegação de data */}
        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={voltar}
            className="p-2 rounded-lg border border-gray-200 hover:shadow-md
        transition-all duration-150 active:scale-95"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>

          <h2 className="text-base md:text-lg font-bold text-gray-800 min-w-32 md:min-w-40 text-center">
            {tituloAtual}
          </h2>

          <button
            onClick={avancar}
            className="p-2 rounded-lg border border-gray-200 hover:shadow-md
        transition-all duration-150 active:scale-95"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Botão "Hoje" */}
        <button
          onClick={() => setDataAtual(new Date())}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold
      text-black hover:shadow-md transition-all duration-150 active:scale-95"
        >
          Hoje
        </button>

        {/* Dropdown e botão de "Nova Consulta" */}
        <div className="flex items-center gap-2 ml-auto">
          <select
            value={visualizacao}
            onChange={(e) => setVisualizacao(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold
        text-gray-700 bg-gray-50 cursor-pointer hover:shadow-md
        transition-all duration-150 outline-none"
          >
            {OPCOES_VISUALIZACAO.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleNovaConsulta}
            className="flex items-center gap-2
        bg-linear-to-r from-[#2D6D7F] to-[#51C5E5]
        hover:shadow-md transition-all duration-150 active:scale-95
        text-white font-bold px-4 md:px-5 py-2 rounded-xl"
          >
            <Plus size={18} />
            Nova Consulta
          </button>
        </div>
      </div>

      {/* Calendário ou Dia */}
      {visualizacao === "mes" ? renderMes() : renderDia()}

      {/* Modal */}
      <ModalConsulta
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        consulta={consultaSelecionada}
        dataSelecionada={format(dataAtual, "yyyy-MM-dd")}
        onSalvar={handleSalvar}
      />
    </Layout>
  );
}
