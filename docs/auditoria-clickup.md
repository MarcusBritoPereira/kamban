# Auditoria funcional, arquitetural e de segurança — evolução para plataforma estilo ClickUp

Data da auditoria: 2026-07-09.
Escopo analisado: backend NestJS/Prisma em `server/`, frontend Angular em `client/` e schema PostgreSQL em `server/prisma/schema.prisma`.

## Sumário executivo

O sistema já possui uma base real de gestão de tarefas com autenticação, espaços, pastas, listas, tarefas, responsáveis, tags, anexos, comentários/atividades, notificações, visões de lista/Kanban/calendário e dashboard inicial. Porém, ainda está mais próximo de um gerenciador operacional de tarefas do que de uma plataforma profissional multiempresa no nível ClickUp.

Os bloqueadores principais para evolução são:

1. **Segurança multiempresa e autorização**: há endpoints sem escopo por empresa/espaço e uma regra explícita no guard que concede acesso implícito a usuários autenticados quando não encontra associação ao espaço.
2. **Modelo de domínio incompleto**: faltam subtarefas, observadores, dependências, recorrência, checklists, campos personalizados, status customizados modelados, controle de tempo real, auditoria estruturada e entidades fortes para equipes/workspaces.
3. **Escalabilidade e desempenho**: faltam índices explícitos para consultas frequentes, filas, cache, WebSockets/eventos em tempo real e limites rigorosos de paginação/filtros.
4. **Experiência e produto**: as visões principais existem, mas filtros avançados, pesquisa global, Gantt/timeline, relatórios gerenciais, automações, IA, OKRs, documentos, formulários, integrações e API pública ainda não aparecem como módulos consolidados.

## 1. Estrutura funcional estilo ClickUp

| Recurso | Situação | Prioridade | Evidência/observação |
|---|---:|---:|---|
| Workspaces | Parcial | Alta | Existe `Company`, mas não há entidade `Workspace` separada; `Space` cumpre parte do papel operacional. |
| Equipes | Parcial | Média | Há página de equipe e associação `CompanyMember`, mas sem entidade de times/grupos reutilizáveis para permissão/roteamento de tarefas. |
| Projetos | Ausente/parcial | Alta | Não há `Project`; a hierarquia atual é `Space > Folder > List > Task`. |
| Espaços | Presente | Baixa | Modelo `Space` com dono, membros, pastas e tags. |
| Pastas | Presente | Baixa | Modelo `Folder` pertence a `Space` e contém listas. |
| Listas | Presente | Baixa | Modelo `List` pertence a `Folder` e contém tarefas. |
| Tarefas | Presente | Baixa | Modelo `Task` com título, descrição, status, prioridade, datas e horas estimadas. |
| Subtarefas | Ausente | Alta | `Task` não possui `parent_task_id` nem relação hierárquica. |
| Responsáveis | Presente | Baixa | `TaskAssignee` implementa N:N entre tarefa e usuário. |
| Observadores/watchers | Ausente | Média | Não há modelo `TaskWatcher`/watchers. |
| Prioridades | Parcial | Média | `priority` é string livre/default; falta catálogo/enum por workspace. |
| Status personalizados | Parcial | Alta | `status` é string livre; não há modelo de workflow/status por espaço/lista. |
| Datas de início e vencimento | Presente | Baixa | `start_date` e `deadline` existem. |
| Tarefas recorrentes | Ausente | Alta | Não há campos de recorrência nem scheduler. |
| Dependências | Ausente | Alta | Não há relação entre tarefas. |
| Checklists | Ausente | Média | Não há modelos de checklist/item. |
| Comentários | Presente/parcial | Média | `TaskActivity` guarda `type` e `content`, e o frontend expõe comentários. Falta thread, edição, anexos no comentário e menções estruturadas. |
| Menções com @ | Parcial/ausente | Média | `Notification.type` prevê `mention`, mas não há parser/entidade de menções. |
| Anexos | Presente/parcial | Alta | Upload existe, mas sem validação robusta de MIME/tamanho e sem autorização por espaço no controller. |
| Campos personalizados | Ausente | Alta | Não há modelo de definição/valor de campo customizado. |
| Tags | Presente | Baixa | `Tag` e `TaskTag` existem. |
| Histórico de alterações | Parcial | Média | `TaskActivity` registra algumas ações textuais, mas não guarda diffs estruturados/campos antigo/novo. |
| Registro de atividades | Parcial | Média | Atividades por tarefa existem; falta activity log global por workspace/projeto. |
| Controle de tempo | Ausente | Alta | Não há timesheets/time entries. |
| Estimativa de horas | Presente/parcial | Média | `estimated_hours` existe, mas sem fluxo de capacidade/relatórios por usuário. |
| Notificações | Presente/parcial | Média | Tabela e endpoint existem; falta push/WebSocket/preferências. |
| Filtros avançados | Parcial | Alta | Há filtros simples/paginação; falta query builder por campos, datas, tags, responsáveis e status. |
| Pesquisa global | Ausente | Alta | Não há endpoint/módulo de busca global. |
| Visualização em lista | Presente | Baixa | Há componente de tabela/lista de tarefas. |
| Kanban | Presente | Baixa | Há componente Kanban com drag and drop. |
| Calendário | Presente | Baixa | Há componente FullCalendar para tarefas. |
| Gantt/linha do tempo | Ausente | Média | Não há componente ou modelo de dependências/duração suficiente. |
| Dashboard | Parcial | Média | Há módulo de dashboard e métricas iniciais. |
| Relatórios | Parcial/ausente | Alta | Dashboard não substitui relatórios gerenciais exportáveis e configuráveis. |
| Automação de tarefas | Ausente | Alta | Não há engine de regras/eventos/ações. |

## 2. Arquitetura do sistema

### Pontos positivos

- Backend modular por domínio (`auth`, `spaces`, `folders`, `lists`, `tasks`, `attachments`, `notifications`, `dashboard`, etc.).
- Prisma centraliza o acesso ao banco e reduz risco de SQL injection quando usado via client tipado.
- Há DTOs e `ValidationPipe` global com whitelist.
- Frontend usa rotas por área e componentes separados para lista, Kanban e calendário.
- API já adota prefixo `v1` nas rotas principais.

### Lacunas e riscos arquiteturais

1. **Controllers ainda carregam autorização inconsistente**  
   Parte dos endpoints usa `RolesGuard`, parte usa `SpaceRoleGuard`, e alguns módulos sensíveis, como empresas, usam apenas `JwtAuthGuard`. Isso aumenta risco de bypass quando novos endpoints forem adicionados.

2. **Regras de negócio misturadas em services com efeitos colaterais**  
   `TasksService` cria tarefa, registra atividade e emite notificações no mesmo fluxo. Isso funciona no curto prazo, mas dificulta retries, auditoria transacional e evolução para eventos.

3. **Falta de transações em operações compostas**  
   Criação/atualização de tarefas com responsáveis, tags, atividades e notificações deveria ser transacional ou orientada a outbox/eventos para evitar inconsistência.

4. **Modelo do banco precisa de índices explícitos**  
   Consultas por `list_id`, `folder_id`, `space_id`, `user_id`, `deadline`, `status`, `created_at` e tabelas N:N serão frequentes. O schema não define `@@index` para a maioria dessas chaves/consultas.

5. **Sem filas, cache e eventos em tempo real**  
   Notificações, e-mail, upload pós-processamento, automações e atividades deveriam usar fila. Dashboards e contagens podem usar cache. Colaboração e notificações pedem WebSocket/SSE.

6. **Upload local e estático**  
   Arquivos são gravados em disco local e servidos estaticamente. Para produção multiempresa, recomenda-se storage externo privado com URLs assinadas, antivírus e políticas de retenção.

7. **Tratamento de erros e logs frágeis**  
   Há `console.error` e `console.log` em fluxos sensíveis. Falta logger estruturado, correlação por request e filtros globais de exceção.

## 3. Segurança

### Achados críticos

1. **Bypass multiempresa por associação implícita**  
   O `SpaceRoleGuard` concede papel `EDITOR` quando não encontra membership, com comentário de “All Users Rule”. Em ambiente multiempresa, isso é crítico: um usuário autenticado pode acessar ou editar recursos de espaços aos quais não pertence se conseguir referenciar IDs.

2. **Endpoint de tarefas pode listar todas as tarefas**  
   `GET /v1/tasks` sem `list_id` cai em fallback de “all tasks”. Isso é um risco direto de exposição de dados entre empresas/espaços.

3. **Credencial hardcoded/bypass de login**  
   Existe bypass para `admin@upeupmarketing.com.br` com senha `admin123`. Isso deve ser removido imediatamente.

4. **Upload inseguro**  
   Upload aceita arquivo via Multer sem limites explícitos de tamanho, allowlist de MIME/extensão, antivírus, isolamento por tenant ou autorização por espaço no endpoint.

5. **Reset de senha com token fraco/visível em log**  
   Token de reset usa UUID, link fixo localhost e o preview de e-mail é logado. Recomenda-se token criptograficamente aleatório, hash do token no banco, URL por ambiente e logs sem segredos.

6. **CORS aberto**  
   `app.enableCors()` sem origem restrita amplia superfície para abuso de API em navegadores.

7. **Sem rate limit**  
   Login, forgot-password, reset-password, uploads e listagens não exibem rate limiting.

### Outros riscos

- **IDOR**: vários endpoints aceitam IDs diretos e dependem do guard conseguir inferir o espaço. Quando não consegue, alguns fluxos permitem prosseguir.
- **XSS**: descrições/comentários são strings livres; a proteção depende do Angular sanitizar renderização. Se houver uso futuro de `innerHTML`, o risco aumenta.
- **CSRF**: JWT no header reduz risco de CSRF tradicional, mas é necessário confirmar armazenamento no cliente e política de cookies se for alterado.
- **Exposição de dados pessoais**: endpoints de usuários/diretório e membros devem limitar campos e escopo por tenant.
- **Tokens/JWT**: confirmar `JWT_SECRET` forte por ambiente e rotação; não usar default em produção.

## 4. Controle de usuários e permissões

### Situação atual

- Papéis globais no schema: `admin`, `gestor`, `editor`, `leitor`.
- Papéis por espaço em `SpaceMember.role` como string livre, com usos como `owner`, `admin`, `editor`, `viewer`.
- Empresas têm `CompanyMember.role` também como string livre.

### Problemas

- Papéis globais e papéis por espaço não estão normalizados nem consistentes em idioma/case.
- Falta matriz declarativa de permissões por recurso/ação.
- Falta permissão por projeto/lista/tarefa/equipe.
- Falta convidado e somente leitura de forma robusta por contexto.
- O owner do `Space` nem sempre é materializado como membro real, o que complica consultas e permissões.

### Recomendação

Criar uma camada RBAC/ABAC única com:

- `WorkspaceMember`, `Team`, `TeamMember` e `ResourcePermission`.
- Enum canônico para papéis (`OWNER`, `ADMIN`, `MANAGER`, `MEMBER`, `GUEST`, `READ_ONLY`).
- Função única de autorização no backend, obrigatória em todos os endpoints.
- Testes e2e cobrindo isolamento entre tenants.

## 5. Experiência do usuário

### Pontos positivos

- Existem rotas para espaços, tarefas pessoais, equipe, empresas e dashboard.
- Tarefas podem ser visualizadas em lista, quadro e calendário.
- Kanban usa drag and drop.
- Header possui notificações.
- Há estados de carregamento e alguns empty states nos componentes analisados.

### Lacunas

- Falta pesquisa global no header/sidebar.
- Filtros são limitados e distribuídos; falta painel unificado por status, responsável, tag, prioridade, vencimento, espaço e texto.
- Falta Gantt/timeline para planejamento com dependências.
- Falta atalhos de teclado e criação rápida universal.
- Falta experiência mobile auditada com navegação otimizada, gestos e densidade responsiva.
- Falta UX para permissões: visualização clara de quem pode ver/editar cada espaço/lista/tarefa.
- Mensagens de erro do backend podem chegar genéricas por causa do `exceptionFactory` customizado.

## 6. Diferenciais competitivos necessários

Para deixar de ser “cadastro de tarefas” e se aproximar de uma plataforma profissional:

1. **Automações**: gatilhos (`status_changed`, `due_date_near`, `assignee_added`) e ações (`notify`, `assign`, `move`, `create_subtask`, `webhook`).
2. **IA**: resumo de tarefas/comentários, sugestão de prioridade, decomposição em subtarefas, detecção de bloqueios e geração de relatórios.
3. **Relatórios gerenciais**: lead time, cycle time, throughput, aging WIP, carga por pessoa, SLA, previsibilidade e exportação CSV/PDF.
4. **Gestão de carga**: capacidade semanal por usuário, estimativa vs. tempo gasto, alertas de sobrecarga.
5. **Metas/OKRs**: objetivos, resultados-chave, progresso vinculado a tarefas/projetos.
6. **Documentos e wikis**: docs por workspace/projeto com links bidirecionais para tarefas.
7. **Formulários**: intake forms para criação padronizada de tarefas.
8. **Integrações**: Slack/Teams, Google Calendar, Drive, GitHub/GitLab, e-mail, Zapier/Make.
9. **Webhooks e API pública**: autenticação por token, escopos, rate limit, versionamento e documentação OpenAPI.

## Priorização final

### Crítico

- Remover acesso implícito no `SpaceRoleGuard`; negar acesso quando não houver membership/owner/admin válido.
- Remover bypass `admin@upeupmarketing.com.br`/`admin123`.
- Bloquear `GET /v1/tasks` sem escopo por espaço/lista/usuário autorizado.
- Aplicar autorização por tenant em anexos, tags, empresas, dashboard, atividades e usuários.
- Implementar rate limit em autenticação e uploads.
- Restringir CORS por ambiente.
- Validar upload com tamanho, MIME allowlist, antivírus e storage privado.

### Alta prioridade

- Normalizar RBAC/ABAC e papéis por workspace/espaço/projeto/lista/tarefa.
- Criar entidades ausentes: subtarefas, dependências, recorrência, checklists, watchers, campos customizados e status customizados.
- Adicionar índices no Prisma/migrations para consultas principais.
- Criar busca global e filtros avançados.
- Introduzir eventos/outbox/fila para notificações, e-mails e automações.
- Criar testes e2e de isolamento multiempresa.

### Média prioridade

- Estruturar histórico de alterações com campo antigo/novo.
- Adicionar WebSocket/SSE para notificações e colaboração em tempo real.
- Melhorar dashboard para relatórios reais e exportáveis.
- Implementar controle de tempo com apontamentos.
- Criar Gantt/timeline após dependências e datas robustas.
- Melhorar UX mobile, atalhos e criação rápida.

### Melhorias futuras

- IA para resumo, priorização e decomposição de tarefas.
- OKRs/metas/documentos/formulários.
- Integrações externas, webhooks e API pública.
- Marketplace de automações/templates.

## Matriz resumida

| Área | Situação | Prioridade |
|---|---|---:|
| Tarefas | Parcialmente completo | Média |
| Permissões | Incompleto e com risco crítico | Crítica |
| Multiempresa | Necessita revisão profunda | Crítica |
| Automação | Ausente | Alta |
| Dashboard | Parcial | Média |
| Segurança | Necessita correções imediatas | Crítica |
| Uploads | Presente, mas inseguro para produção | Alta |
| Notificações | Parcial | Média |
| Pesquisa/filtros | Incompleto | Alta |
| Relatórios | Parcial/ausente | Alta |
| UX | Boa base, faltam recursos profissionais | Média |
| Escalabilidade | Base simples, sem filas/cache/realtime | Alta |

## Roadmap sugerido em 4 fases

### Fase 1 — Blindagem multiempresa e autenticação

- Corrigir guards e remover permissões implícitas.
- Remover credenciais hardcoded.
- Fechar endpoints sem escopo.
- Adicionar testes de IDOR por recurso.
- Aplicar CORS, Helmet e rate limit.

### Fase 2 — Domínio profissional de tarefas

- Subtarefas, dependências, recorrência, checklists, watchers.
- Status customizados por lista/espaço.
- Campos customizados e filtros avançados.
- Índices e paginação com limites máximos.

### Fase 3 — Produtividade e colaboração

- Time tracking, workload, histórico estruturado.
- WebSocket/SSE para notificações.
- Busca global.
- Relatórios gerenciais exportáveis.

### Fase 4 — Diferenciais de plataforma

- Automações.
- IA.
- OKRs/metas, documentos e formulários.
- Integrações, webhooks e API pública documentada.
