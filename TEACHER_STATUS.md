# Academia IA — status do Pilar 1

## Implementado nesta etapa
- Rota `POST /api/teacher` executada no servidor e integrada à API configurada por `OPENAI_API_KEY`.
- Prompt pedagógico em português brasileiro, com foco em explicações graduais, pistas e autonomia do estudante.
- Validação básica de formato, quantidade e tamanho das mensagens; erros do provedor não são apresentados como respostas bem-sucedidas.
- Histórico local de conversas no navegador, com opção de limpar.
- Ditado de voz via Web Speech API quando o navegador oferece suporte.
- Leitura das respostas via SpeechSynthesis, com controles de velocidade e volume.
- Doze estados emocionais nomeados, seleção contextual por regras e animações CSS leves; suporte a `prefers-reduced-motion`.

## Dependências para ativação
- Instalar as dependências do projeto.
- Configurar `OPENAI_API_KEY` no ambiente privado do servidor; opcionalmente `OPENAI_MODEL`.
- Fazer teste integrado com uma chave válida em ambiente de desenvolvimento.

## Limitações conhecidas
- Não há modelo 3D nem sincronização labial; o personagem atual é uma ilustração CSS 2D.
- A voz usa recursos do navegador/dispositivo; não há voz proprietária nem clonagem.
- A escolha das expressões é heurística local, não análise emocional confiável. É uma camada visual ilustrativa e não deve ser usada para inferir estado psicológico.
- O histórico permanece no dispositivo e não sincroniza entre aparelhos.
- Não há autenticação, limites robustos por usuário, banco de dados ou memória educacional persistente.
- Não foi possível concluir `npm install` nesta execução; por isso a compilação e o typecheck completos ainda não foram validados.

## Critério de conclusão
O Pilar 1 só será considerado funcional após instalação, configuração segura da chave, build sem erros e testes reais de conversa, voz, retomada de histórico, acessibilidade e dispositivos móveis.

## Atualização 2026-11-21 — Pesquisa e redação

- Pesquisa: rota `POST /api/research` com Responses API + `web_search`, modos Rápida/Aprofundada/Acadêmica, instruções de rastreabilidade, coleta de URL citations, relatório e fontes na interface.
- Redação: rota `POST /api/essay/evaluate` com JSON Schema, avaliação das cinco competências e validação da soma das notas; feedback inclui evidências, trecho, problema, motivo, orientação e exercício.
- Limites: chaves e cotas reais não foram fornecidas; nenhuma chamada de API externa foi executada nesta validação. Instalação de dependências excedeu o tempo limite, portanto build e typecheck completo seguem pendentes.
- Segurança: texto enviado à IA é tratado como dado não confiável; endpoints validam tamanho e formato e não expõem a chave no cliente.

## Atualização — Fundação de dados

- Criada migração PostgreSQL/Supabase para perfis, conversas, mensagens, pesquisas, redações, avaliações e progresso por tópico.
- Incluídos índices, constraints, triggers de `updated_at`, chaves compostas de propriedade e políticas RLS por usuário.
- A migração ainda não foi aplicada: não há projeto Supabase, credenciais nem testes de isolamento disponíveis nesta sessão.
