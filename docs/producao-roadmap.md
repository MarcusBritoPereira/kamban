# Roadmap de produção

Este documento transforma a auditoria funcional em um plano de execução para evoluir o sistema com segurança em produção.

## Fase 1 — Blindagem e estabilidade

- Manter autorização por escopo em todos os endpoints que acessam recursos de espaços, empresas, tarefas, anexos, usuários e relatórios.
- Criar testes e2e de IDOR para garantir que um usuário de um espaço/empresa não acesse dados de outro tenant.
- Usar limites por classe de endpoint: login, recuperação de senha, uploads, busca e tráfego geral.
- Manter CORS restrito por `CORS_ORIGINS` e revisar as origens antes de cada deploy.
- Armazenar uploads em storage privado com URLs assinadas quando a aplicação tiver múltiplas instâncias.

## Fase 2 — Domínio profissional de tarefas

- Finalizar a experiência de subtarefas, dependências, checklists, watchers, recorrência, campos customizados, status customizados e apontamento de tempo.
- Criar filtros avançados por status, responsável, tag, prioridade, vencimento, campos customizados, espaço, pasta e lista.
- Adicionar regras de bloqueio para dependências e automações simples para tarefas atrasadas ou reatribuídas.

## Fase 3 — Gestão e colaboração

- Evoluir o dashboard para relatórios exportáveis de atraso, carga por pessoa, tempo estimado versus realizado, lead time, cycle time e aging WIP.
- Adicionar WebSocket ou SSE para notificações e colaboração em tempo real.
- Criar histórico estruturado com campo alterado, valor anterior, novo valor, autor e data.

## Fase 4 — Plataforma

- Introduzir fila/outbox para notificações, e-mails, automações, webhooks e pós-processamento de arquivos.
- Expor API pública com escopos, rate limit, versionamento e documentação OpenAPI.
- Adicionar integrações externas, templates, OKRs, docs, formulários e recursos de IA.

## Critérios de aceite por release

- Todos os endpoints novos devem ter teste de autorização por tenant.
- Toda listagem deve ter paginação com limite máximo.
- Toda alteração de recurso crítico deve gerar atividade estruturada.
- Todo arquivo enviado deve ter limite, validação de tipo e rastreabilidade do usuário.
- Todo recurso novo deve incluir documentação operacional mínima.
