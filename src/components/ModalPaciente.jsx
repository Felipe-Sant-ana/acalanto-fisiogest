import { useEffect, useState, useRef } from "react";
import { X, Save } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const VAZIO = {
  nome: "",
  sexo: "",
  cpf: "",
  data_nascimento: "",
  email: "",
  telefone: "",
  endereco: "",
  sessoes_combinadas: "",
  avaliacao: "",
  status: "aguardando_avaliacao",
};

// Função para retornar data de ontem
const ontemISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

// Formatador de CPF
const formatarCPF = (valor) => {
  const nums = valor.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9)
    return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
};

// Formatador de telefone: fixo (10 dígitos) ou celular (11 dígitos)
const formatarTelefone = (valor) => {
  const nums = valor.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 2) return nums;
  if (nums.length <= 6) return `(${nums.slice(0, 2)}) ${nums.slice(2)}`;
  if (nums.length <= 10)
    return `(${nums.slice(0, 2)}) ${nums.slice(2, 6)}-${nums.slice(6)}`;
  return `(${nums.slice(0, 2)}) ${nums.slice(2, 7)}-${nums.slice(7)}`;
};

export default function ModalPaciente({
  aberto,
  onFechar,
  paciente,
  onSalvar,
}) {
  const [form, setForm] = useState(VAZIO);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState({});
  const editando = !!paciente;

  // Refs para scroll automático até o campo com erro
  const refs = {
    nome: useRef(null),
    sexo: useRef(null),
    cpf: useRef(null),
    data_nascimento: useRef(null),
    email: useRef(null),
    telefone: useRef(null),
    endereco: useRef(null),
    sessoes_combinadas: useRef(null),
  };

  useEffect(() => {
    if (paciente) {
      setForm({
        nome: paciente.nome || "",
        sexo: paciente.sexo || "",
        cpf: paciente.cpf || "",
        data_nascimento: paciente.data_nascimento || "",
        email: paciente.email || "",
        telefone: paciente.telefone || "",
        endereco: paciente.endereco || "",
        sessoes_combinadas: paciente.sessoes_combinadas ?? "",
        avaliacao: paciente.avaliacao || "",
        status: paciente.status || "aguardando_avaliacao",
      });
    } else {
      setForm(VAZIO);
    }
    setErros({});
  }, [paciente, aberto]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Aplicador de  formatação automática por campo
    let valorFormatado = value;
    if (name === "cpf") valorFormatado = formatarCPF(value);
    if (name === "telefone") valorFormatado = formatarTelefone(value);

    setForm((prev) => ({ ...prev, [name]: valorFormatado }));

    if (erros[name]) setErros((prev) => ({ ...prev, [name]: "" }));
  };

  // Função para levar até o campo com erro
  const scrollParaErro = (camposComErro) => {
    const ordem = [
      "nome",
      "sexo",
      "cpf",
      "data_nascimento",
      "email",
      "telefone",
      "endereco",
      "sessoes_combinadas",
    ];
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

    // - Validações -

    if (!form.nome.trim()) novosErros.nome = "Este campo é obrigatório.";

    if (!form.sexo) novosErros.sexo = "Este campo é obrigatório.";

    if (!form.cpf) novosErros.cpf = "Este campo é obrigatório.";

    if (!form.data_nascimento)
      novosErros.data_nascimento = "Este campo é obrigatório.";

    if (!form.telefone) novosErros.telefone = "Este campo é obrigatório.";

    if (!form.endereco.trim())
      novosErros.endereco = "Este campo é obrigatório.";

    if (
      form.sessoes_combinadas !== "" &&
      parseInt(form.sessoes_combinadas) < 0
    ) {
      novosErros.sessoes_combinadas =
        "O número de sessões não pode ser negativo.";
    }
    if (
      form.sessoes_combinadas !== "" &&
      parseInt(form.sessoes_combinadas) > 9999
    ) {
      novosErros.sessoes_combinadas =
        "O número de sessões não pode ser maior que 9999.";
    }

    if (form.cpf && form.cpf.replace(/\D/g, "").length !== 11) {
      novosErros.cpf = "CPF incompleto. Digite os 11 números.";
    }

    if (form.telefone && form.telefone.replace(/\D/g, "").length < 10) {
      novosErros.telefone = "Telefone incompleto. Digite DDD + número.";
    }

    if (form.data_nascimento && form.data_nascimento >= ontemISO()) {
      novosErros.data_nascimento =
        "A data de nascimento não pode ser a data atual ou uma data futura.";
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      novosErros.email = "Digite um email válido.";
    }

    if (Object.keys(novosErros).length > 0) {
      setErros(novosErros);
      scrollParaErro(novosErros);
      return;
    }

    setLoading(true);

    // -  Criação do Payload -
    const payload = {
      nome: form.nome.trim(),
      sexo: form.sexo,
      cpf: form.cpf,
      data_nascimento: form.data_nascimento,
      email: form.email || null,
      telefone: form.telefone,
      endereco: form.endereco.trim(),
      sessoes_combinadas: form.sessoes_combinadas
        ? parseInt(form.sessoes_combinadas)
        : null,
      avaliacao: form.avaliacao || null,
      status: form.status,
    };

    if (editando) {
      const { data, error } = await supabase
        .from("pacientes")
        .update(payload)
        .eq("id", paciente.id)
        .select()
        .single();

      if (error) {
        setErros({ cpf: "Este CPF já está cadastrado para outro paciente." });
        scrollParaErro({ cpf: true });
      } else {
        onSalvar(data, true);
        onFechar();
      }
    } else {
      const { data, error } = await supabase
        .from("pacientes")
        .insert(payload)
        .select()
        .single();

      if (error) {
        setErros({ cpf: "Este CPF já está cadastrado." });
        scrollParaErro({ cpf: true });
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
            {editando ? "Editar Paciente" : "Novo Paciente"}
          </h2>
        </div>

        {/* Formulário */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          <Campo label="Nome*" erro={erros.nome}>
            <input
              ref={refs.nome}
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Digite o nome do(a) paciente"
              maxLength={150}
              className={inputClass(erros.nome)}
            />
          </Campo>

          <Campo label="Sexo*" erro={erros.sexo}>
            <select
              ref={refs.sexo}
              name="sexo"
              value={form.sexo}
              onChange={handleChange}
              className={inputClass(erros.sexo)}
            >
              <option value="">Selecione o sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </Campo>

          <Campo label="CPF*" erro={erros.cpf}>
            <input
              ref={refs.cpf}
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              inputMode="numeric"
              className={inputClass(erros.cpf)}
            />
          </Campo>

          <Campo label="Data do nascimento*" erro={erros.data_nascimento}>
            <input
              ref={refs.data_nascimento}
              name="data_nascimento"
              type="date"
              value={form.data_nascimento}
              onChange={handleChange}
              max={ontemISO()}
              className={inputClass(erros.data_nascimento)}
            />
          </Campo>

          <Campo label="Email" erro={erros.email}>
            <input
              ref={refs.email}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="exemplo@gmail.com"
              maxLength={250}
              className={inputClass(erros.email)}
            />
          </Campo>

          <Campo label="Telefone para contato*" erro={erros.telefone}>
            <input
              ref={refs.telefone}
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
              className={inputClass(erros.telefone)}
            />
          </Campo>

          <Campo label="Endereço*" erro={erros.endereco}>
            <input
              ref={refs.endereco}
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Digite o endereço"
              maxLength={250}
              className={inputClass(erros.endereco)}
            />
          </Campo>

          <Campo
            label="Número de sessões combinadas"
            erro={erros.sessoes_combinadas}
          >
            <input
              ref={refs.sessoes_combinadas}
              name="sessoes_combinadas"
              type="number"
              min="0"
              max="9999"
              value={form.sessoes_combinadas}
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              placeholder="Padrão: Indeterminado"
              className={inputClass(erros.sessoes_combinadas)}
            />
          </Campo>

          <Campo label="Status*">
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClass()}
            >
              <option value="aguardando_avaliacao">Aguardando Avaliação</option>
              <option value="em_tratamento">Em Tratamento</option>
              <option value="alta">Alta</option>
            </select>
          </Campo>

          <Campo label="Avaliação">
            <textarea
              name="avaliacao"
              value={form.avaliacao}
              onChange={handleChange}
              placeholder="Descreva a avaliação do paciente"
              rows={4}
              className={`${inputClass()} resize-none`}
            />
          </Campo>
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

function Campo({ label, erro, children }) {
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

// Desing qunado ocorre algun erro
const inputClass = (erro) =>
  `border ${erro ? "border-red-500" : "border-gray-300 bg-white"}
  rounded-xl px-4 py-2.5 text-sm outline-none
  focus:border-black w-full transition-colors`;
