# Acalanto FisioGest

Sistema web de gestão para fisioterapeuta desenvolvido em React, com banco de dados em nuvem via Supabase.

Este projeto faz parte do **Projeto Integrador III-B** do curso de Análise e Desenvolvimento de Sistemas da PUC Goiás.

---

## 🎥 Vídeo de Demonstração

Abaixo encontra-se o vídeo de demonstração das principais telas e funcionalidades
do sistema.



https://github.com/user-attachments/assets/0b9353b6-fadf-47ec-a9d0-5de71a2fd672

---

## 🔗 Acesso ao Sistema (Ambiente de Homologação)

Este repositório contém o **ambiente de homologação** do sistema — com dados fictícios para fins de teste e avaliação.

| Campo                  | Valor                     |
| ---------------------- | ------------------------- |
| 🌐 **Link do sistema** | https://acalanto-fisiogest.vercel.app/        |
| 📧 **Email de acesso** | *test.user@fisiogest.com* |
| 🔑 **Senha**           | *Teste@1452*             |

> ⚠️ Qualquer pessoa com essas credenciais pode entrar e testar todas as funcionalidades. Os dados inseridos neste sistema devem ser exclusivamente fictícios, sendo proibido o uso de informações reais. Todos os dados podem ser alterados ou excluídos livremente a qualquer momento.

---

## 📋 Sobre o Projeto

O **Acalanto FisioGest** é um sistema web desenvolvido em parceria com a **Pousada Acalanto**, onde um fisioterapeuta atua como profissional residente. O sistema foi criado para uso exclusivo desse profissional, permitindo que ele gerencie seus pacientes e consultas de forma digital, organizada e acessível de qualquer dispositivo.

Anteriormente, o controle era feito de forma manual, sujeito a erros e desorganização. O sistema substitui esse processo por uma solução tecnológica completa, com banco de dados em nuvem e atualização em tempo real.

---

## ✨ Funcionalidades

### 🏠 Início — Quadro Kanban

- Visualização dos pacientes organizados por status: **Aguardando Avaliação**, **Em Tratamento** e **Alta**
- Movimentação dos pacientes entre colunas por **arrastar e soltar** (drag and drop)
- Atualização em **tempo real** — mudanças feitas em um dispositivo aparecem automaticamente em todos os outros sem recarregar a página

### 📅 Agenda

- Calendário mensal com visualização de todas as consultas do mês
- Chips coloridos por status: 🔵 Agendada, 🟢 Realizada, 🔴 Cancelada
- Visão diária detalhada com horários e informações completas de cada consulta
- Cadastro de nova consulta com validações de conflito de horário, data passada e valor negativo
- Edição e exclusão de consultas
- Exclusão automática programada: consultas canceladas são removidas após **1 ano** e consultas realizadas/agendadas após **1 ano e meio**

### 👥 Pacientes

- Lista completa de pacientes cadastrados com busca por nome ou CPF
- Cadastro de novo paciente com formatação automática de CPF e telefone, validação de CPF, limite de caracteres e validação de data de nascimento
- Edição e exclusão de pacientes
- Visualização da ficha de avaliação fisioterapêutica de cada paciente
- Atualização em **tempo real**

### 🔐 Autenticação

- Login seguro com email e senha
- Opção "Lembrar-me" que mantém o usuário logado mesmo após fechar o navegador
- Recuperação de senha via email com link seguro
- Identificação visual do tipo de usuário: **Fisioterapeuta** (profissional principal) ou **Desenvolvedor** (dev)

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia           | Finalidade                                                   |
| -------------------- | ------------------------------------------------------------ |
| **React**            | Framework principal do frontend                              |
| **Vite**             | Bundler e servidor de desenvolvimento                        |
| **Tailwind CSS**     | Estilização por classes utilitárias                          |
| **Supabase**         | Banco de dados PostgreSQL em nuvem + autenticação + realtime |
| **React Router DOM** | Navegação entre páginas                                      |
| **@dnd-kit**         | Drag and drop do Kanban                                      |
| **date-fns**         | Manipulação e formatação de datas                            |
| **Lucide React**     | Biblioteca de ícones                                         |
| **Vercel**           | Hospedagem e deploy                                          |

---

## ⚙️ Metodologia de Desenvolvimento

O projeto foi conduzido seguindo os princípios do **Extreme Programming (XP)** combinados com um quadro **Kanban** para organização das tarefas:

- **Simplicidade:** Foram implementadas apenas as funcionalidades reais identificadas junto ao parceiro, sem excessos.
- **Feedback constante:** A cada entrega de funcionalidade, o sistema era validado com o fisioterapeuta, gerando novos ajustes e melhorias.
- **Refatoração contínua:** O código foi revisado e aprimorado iterativamente ao longo do desenvolvimento.
- **Kanban:** As tarefas foram organizadas em colunas (A fazer → Em andamento → Concluído), permitindo acompanhar o progresso visualmente.

---

## 🏗️ Estrutura do Projeto

```
src/
├── components/
│   ├── KanbanCard.jsx        # Card arrastável do Kanban
│   ├── KanbanColuna.jsx      # Coluna do Kanban com área de drop
│   ├── Layout.jsx            # Sidebar, topbar e estrutura base
│   ├── ModalAvaliacao.jsx    # Modal de visualização de avaliação
│   ├── ModalConsulta.jsx     # Modal de nova/editar consulta
│   ├── ModalEsqueciSenha.jsx # Modal de recuperação de senha
│   └── ModalPaciente.jsx     # Modal de novo/editar paciente
├── contexts/
│   └── AuthContext.jsx       # Contexto global de autenticação
├── lib/
│   └── supabaseClient.js     # Configuração do cliente Supabase
├── pages/
│   ├── Agenda.jsx            # Página da agenda
│   ├── Home.jsx              # Página inicial com Kanban
│   ├── Login.jsx             # Tela de login
│   ├── Pacientes.jsx         # Página de gestão de pacientes
│   └── RedefinirSenha.jsx    # Página de redefinição de senha
└── App.jsx                   # Roteamento principal
```

---

## 🗄️ Banco de Dados

O sistema utiliza **Supabase** (PostgreSQL em nuvem) com duas tabelas principais:

**`pacientes`** — Armazena os dados dos pacientes cadastrados, incluindo nome, CPF, contato, endereço, status no tratamento e ficha de avaliação.

**`consultas`** — Armazena as consultas agendadas, com referência ao paciente, serviço, data, hora, status, valor cobrado e data de expiração automática.

Ambas as tabelas utilizam **Row Level Security (RLS)** do Supabase, garantindo que apenas usuários autenticados possam acessar os dados. O **Realtime** do Supabase está ativado nas duas tabelas, permitindo atualização instantânea entre dispositivos.

---

## 🌐 Ambientes

| Ambiente        | Descrição                                      | Acesso                   |
| --------------- | ---------------------------------------------- | ------------------------ |
| **Homologação** | Banco de dados com dados fictícios para testes | Credenciais acima        |
| **Produção**    | Banco de dados real do fisioterapeuta          | Restrito ao profissional |

---

## 📦 Relato das Interações com o Parceiro

A parceria foi estabelecida com a **Pousada Acalanto**, onde o fisioterapeuta residente necessitava de uma solução para organizar e controlar seus atendimentos de forma digital.

Durante o ciclo de desenvolvimento foram realizadas interações contínuas com o profissional:

- **Diagnóstico:** Identificamos que o maior problema era a falta de organização dos pacientes por etapa de tratamento e o controle manual das consultas agendadas.
- **Entregas incrementais:** Cada módulo (Kanban, Agenda, Pacientes) foi apresentado separadamente para validação antes de avançar para o próximo.
- **Ajustes baseados em feedback:** Com base nas interações, foram adicionadas funcionalidades como o controle de status via drag and drop, validação de conflito de horários e a ficha de avaliação por paciente.

---

## 📈 Percepções sobre o Impacto

A implantação do sistema trouxe impactos diretos na organização do trabalho do fisioterapeuta:

- **Organização visual:** O quadro Kanban permite ver de forma imediata em qual etapa do tratamento cada paciente se encontra.
- **Controle de agenda:** O calendário com visão mensal e diária elimina o risco de sobreposição de horários, com validação automática de conflitos.
- **Histórico digital:** As fichas de avaliação e o histórico de consultas ficam armazenados com segurança em nuvem, acessíveis de qualquer dispositivo.
- **Acesso multiplataforma:** O sistema é totalmente responsivo, funcionando em computador, tablet e celular.

---

## 👨‍💻 Autoria

| Campo                    | Informação                                            |
| ------------------------ | ----------------------------------------------------- |
| **Aluno**                | Felipe Oliveira Sant'ana                              |
| **Curso**                | Análise e Desenvolvimento de Sistemas                 |
| **Instituição**          | Pontifícia Universidade Católica de Goiás (PUC Goiás) |
| **Disciplina**           | Projeto Integrador III-B                              |
| **Professor Orientador** | Thalles Bruno G. N. dos Santos                        |
| **Ano**                  | 2026                                                  |
