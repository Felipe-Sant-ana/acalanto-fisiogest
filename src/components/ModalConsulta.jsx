import { useEffect, useState, useRef } from "react";
import { Save, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const VAZIO = {
  paciente_id: "",
  servico: "",
  data: "",
  hora: "",
  status: "agendada",
  valor_cobrado: "",
  observacoes: "",
};

const SERVICOS = [
  "Avaliação (Anamnese)",
  "Reavaliação",
  "Reabilitação Motora",
  "Reabilitação Neurofuncional",
  "Reabilitação Funcional",
  "Reabilitação Ortopédica",
  "Reabilitação Geriátrica",
  "Reabilitação Pediátrica",
  "Terapias Manuais",
];

// Função para retornar a data atual
const hojeISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Regra de negócio: consultas canceladas expiram em 12 meses, as demais em 18 meses
const calcularExpiracao = (dataConsulta, status) => {
  const base = new Date(dataConsulta + "T00:00:00");
  const meses = status === "cancelada" ? 12 : 18;
  base.setMonth(base.getMonth() + meses);
  return base.toISOString().split("T")[0];
};

export default function ModalConsulta({
  aberto,
  onFechar,
  consulta,
  dataSelecionada,
  onSalvar,
}) {
  const [form, setForm] = useState(VAZIO);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false); // Armazena a lista de pacientes cadastrados
  const [erros, setErros] = useState({}); // Armazena mensagens de erro específicas para cada campo
  const editando = !!consulta;

  // Refs para scroll automático até o campo com erro
  const refs = {
    paciente_id: useRef(null),
    servico: useRef(null),
    data: useRef(null),
    hora: useRef(null),
    valor_cobrado: useRef(null),
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  useEffect(() => {
    if (consulta) {
      setForm({
        paciente_id: consulta.paciente_id || "",
        servico: consulta.servico || "",
        data: consulta.data || "",
        hora: consulta.hora?.slice(0, 5) || "",
        status: consulta.status || "agendada",
        valor_cobrado: consulta.valor_cobrado ?? "",
        observacoes: consulta.observacoes || "",
      });
    } else {
      setForm({ ...VAZIO, data: dataSelecionada || "" });
    }
    setErros({});
  }, [consulta, aberto, dataSelecionada]);

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

  // Função que traz a lista de pacientes do banco de dados
  const fetchPacientes = async () => {
    const { data } = await supabase
      .from("pacientes")
      .select("id, nome")
      .order("nome");
    if (data) setPacientes(data);
  };

  // Manipulador de entradas
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: "" }));
  };

  // Função para levar até o primeiro campo com erro
  const scrollParaErro = (camposComErro) => {
    const ordem = ["paciente_id", "servico", "data", "hora", "valor_cobrado"];
    for (const campo of ordem) {
      if (camposComErro[campo] && refs[campo]?.current) {
        refs[campo].current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        refs[campo].current.focus?.();
        break;
      }
    }
  };

  const handleSubmit = async () => {
    const novosErros = {};

    // - Validações: Campo obrigatório, horário permitido, valor negativo e data do passado
    if (!form.paciente_id) novosErros.paciente_id = "Este campo é obrigatório.";
    if (!form.servico) novosErros.servico = "Este campo é obrigatório.";
    if (!form.data) novosErros.data = "Este campo é obrigatório.";
    if (!form.hora) novosErros.hora = "Este campo é obrigatório.";
    if (form.hora && (form.hora < "07:00" || form.hora > "23:00")) {
      novosErros.hora = "O horário deve estar entre 07:00 e 23:00.";
    }
    if (!form.valor_cobrado)
      novosErros.valor_cobrado = "Este campo é obrigatório.";

    if (form.valor_cobrado && parseFloat(form.valor_cobrado) < 0) {
      novosErros.valor_cobrado = "O valor não pode ser negativo.";
    }

    if (form.data && form.data < hojeISO()) {
      // Permite editar consultas já existentes com data passada,
      // mas bloqueia criar novas consultas em datas passadas
      if (!editando) {
        novosErros.data =
          "Não é possível agendar em uma data anterior à atual.";
      }
    }

    // Se há erros básicos, mostra e rola até o primeiro
    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      scrollParaErro(novosErros);
      return;
    }

    setLoading(true);

    // - Verificação de conflitos no banco -
    // Busca consultas no mesmo dia e horário (excluindo a atual em caso de edição)
    const { data: conflitos } = await supabase
      .from("consultas")
      .select("id, paciente_id, status")
      .eq("data", form.data)
      .eq("hora", form.hora)
      .neq("status", "cancelada");

    const conflitosRelevantes = editando
      ? conflitos?.filter((c) => c.id !== consulta.id)
      : conflitos;

    if (conflitosRelevantes && conflitosRelevantes.length > 0) {
      const mesmoPaciente = conflitosRelevantes.some(
        (c) => c.paciente_id === form.paciente_id,
      );
      const outroNoMesmoHorario = conflitosRelevantes.some(
        (c) => c.paciente_id !== form.paciente_id,
      );

      if (mesmoPaciente) {
        // Mesmo paciente, mesmo dia, mesmo horário
        setErros({
          hora: "Este paciente já possui uma consulta neste dia e horário.",
        });
        scrollParaErro({ hora: true });
        setLoading(false);
        return;
      }

      if (outroNoMesmoHorario) {
        // Outro paciente já ocupa o horário selecionado
        setErros({
          hora: "Já existe uma consulta agendada para este dia e horário.",
        });
        scrollParaErro({ hora: true });
        setLoading(false);
        return;
      }
    }

    // - Payload com data de expiração da consulta -
    const payload = {
      paciente_id: form.paciente_id,
      servico: form.servico,
      data: form.data,
      hora: form.hora,
      status: form.status,
      valor_cobrado: parseFloat(form.valor_cobrado),
      observacoes: form.observacoes || null,
      expira_em: calcularExpiracao(form.data, form.status),
    };

    // - Salva ou atualiza -
    if (editando) {
      const { data, error } = await supabase
        .from("consultas")
        .update(payload)
        .eq("id", consulta.id)
        .select(`*, pacientes(nome)`)
        .single();

      if (error) {
        setErros({ geral: "Erro ao salvar a consulta. Tente novamente." });
      } else {
        onSalvar(data, true);
        onFechar();
      }
    } else {
      const { data, error } = await supabase
        .from("consultas")
        .insert(payload)
        .select(`*, pacientes(nome)`)
        .single();

      if (error) {
        setErros({ geral: "Erro ao criar a consulta. Tente novamente." });
      } else {
        onSalvar(data, false);
        onFechar();
      }
    }

    setLoading(false);
  };

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[3px]"
        onClick={onFechar}
      />

      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabeçalho */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ background: "linear-gradient(90deg, #2D6D7F, #51C5E5)" }}
        >
          <button
            onClick={onFechar}
            className="text-white hover:opacity-70 transition-opacity"
          >
            <X size={22} />
          </button>
          <h2 className="text-white text-xl font-bold">
            {editando ? "Editar Consulta" : "Nova Consulta"}
          </h2>
        </div>

        {/* Formulário */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          <Campo
            label="Paciente*"
            erro={erros.paciente_id}
            refProp={refs.paciente_id}
          >
            <select
              ref={refs.paciente_id}
              name="paciente_id"
              value={form.paciente_id}
              onChange={handleChange}
              className={inputClass(erros.paciente_id)}
            >
              <option value="">Selecione um paciente</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Serviço*" erro={erros.servico} refProp={refs.servico}>
            <select
              ref={refs.servico}
              name="servico"
              value={form.servico}
              onChange={handleChange}
              className={inputClass(erros.servico)}
            >
              <option value="">Selecione o serviço</option>
              {SERVICOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Campo>

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Data*" erro={erros.data} refProp={refs.data}>
              <input
                ref={refs.data}
                name="data"
                type="date"
                value={form.data}
                onChange={handleChange}
                // Bloqueia datas passadas no seletor (somente para novas consultas)
                min={!editando ? hojeISO() : undefined}
                className={inputClass(erros.data)}
              />
            </Campo>
            <Campo label="Hora*" erro={erros.hora} refProp={refs.hora}>
              <input
                ref={refs.hora}
                name="hora"
                type="time"
                value={form.hora}
                onChange={handleChange}
                min="07:00"
                max="23:00"
                className={inputClass(erros.hora)}
              />
            </Campo>
          </div>

          <Campo label="Status*">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass()}
            >
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </Campo>

          <Campo
            label="Valor cobrado*"
            erro={erros.valor_cobrado}
            refProp={refs.valor_cobrado}
          >
            <input
              ref={refs.valor_cobrado}
              name="valor_cobrado"
              type="number"
              step="5"
              min="0"
              value={form.valor_cobrado}
              onChange={handleChange}
              placeholder="Digite o valor cobrado"
              className={inputClass(erros.valor_cobrado)}
            />
          </Campo>

          <Campo label="Observações">
            <textarea
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              placeholder="Adicione observações sobre a consulta"
              rows={3}
              className={`${inputClass()} resize-none`}
            />
          </Campo>

          {/* Erro geral (falha no banco) */}
          {erros.geral && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 text-center">
              {erros.geral}
            </p>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onFechar}
            className="flex-1 border border-[#2D6D7F] text-[#2D6D7F] font-semibold
              py-2.5 rounded-xl hover:scale-105 transition-all duration-150 active:scale-95"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2
              bg-linear-to-r from-[#2D6D7F] to-[#51C5E5] text-white font-semibold
              py-3 rounded-xl hover:scale-105 transition-all duration-150 active:scale-95
              disabled:opacity-70 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          >
            {loading ? (
              "Salvando..."
            ) : (
              <>
                <Save size={15} strokeWidth={2.5} />
                <span>Salvar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Campo({ label, erro, refProp, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-black">{label}</label>
      {children}
      {erro && (
        <p className="text-red-500 text-xs mt-0.5 flex items-center gap-1">
          {erro}
        </p>
      )}
    </div>
  );
}

// Desing qunado ocorre algum erro
const inputClass = (erro) =>
  `border ${erro ? "border-red-500" : "border-gray-300 bg-white"}
  rounded-xl px-4 py-2.5 text-sm outline-none
  focus:border-black w-full transition-colors`;
