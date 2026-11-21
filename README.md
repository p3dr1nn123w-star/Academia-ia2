# Academia IA — estrutura inicial

Este repositório contém a primeira fundação visual e interativa da escola virtual.

## O que já existe nesta etapa

- Interface responsiva em português brasileiro.
- Navegação entre Visão geral, Meu Professor, Pesquisa Profunda, Escola de Redação, Disciplinas, Ferramentas e Progresso.
- Alternância entre tema claro e escuro.
- Personagem ilustrado em CSS inspirado na referência enviada.
- Área de conversa com estado de demonstração explicitamente identificado.
- Formulário de pesquisa que não inventa resultados nem fontes.
- Editor de redação com salvamento local no navegador.
- Estrutura inicial de trilhas, ferramentas e painel de progresso.

## O que ainda NÃO está conectado

- Provedor de IA e memória conversacional persistente.
- Busca externa, indexação, fontes e citações verificadas.
- Correção automatizada pelas cinco competências do ENEM.
- Autenticação, banco de dados e sincronização entre dispositivos.
- Voz, reconhecimento de fala, avatar 3D e sincronização labial.
- Painel administrativo, métricas e controles de custo.

A interface não afirma que esses serviços estão funcionando. Eles dependem de backend, provedores, credenciais e testes.

## Requisitos

- Node.js 20.9 ou superior
- npm

## Executar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abra http://localhost:3000.

## Verificar build

```bash
npm run build
```

## Arquitetura planejada

- Frontend: Next.js + React + TypeScript.
- Estilos: CSS modular global nesta primeira fundação; componentes podem ser extraídos conforme o produto crescer.
- Persistência inicial: localStorage apenas para rascunho local da redação.
- Próxima camada: backend seguro, PostgreSQL e autenticação com políticas por usuário.
- Integrações: adaptadores independentes para IA, pesquisa, voz e armazenamento.

## Segurança

Nunca coloque chaves privadas em variáveis `NEXT_PUBLIC_*` nem no código do navegador. As chaves devem permanecer no servidor. Conteúdos externos e arquivos enviados devem ser tratados como dados não confiáveis.

## Próximas entregas sugeridas

1. Revisar identidade visual e comportamento mobile.
2. Criar backend e autenticação.
3. Conectar o professor a um provedor de IA com limites, logs e proteção.
4. Implementar pesquisa com fontes rastreáveis.
5. Implementar avaliação pedagógica de redação com explicações e histórico.
6. Adicionar testes automatizados e monitoramento.


## Etapa 2 — Professor virtual

A sala do professor agora possui uma rota de backend (`POST /api/teacher`) que integra a API da OpenAI sem expor a chave no navegador.

### Configuração
1. Copie `.env.example` para `.env.local`.
2. Preencha `OPENAI_API_KEY` no servidor. Opcionalmente, defina `OPENAI_MODEL`.
3. Instale as dependências com `npm install`.
4. Execute `npm run dev`.

Sem a chave, a rota responde com HTTP 503 e uma mensagem de configuração; ela não simula respostas de IA. O histórico de conversa é armazenado apenas no `localStorage` do navegador nesta etapa. O ditado e a leitura em voz alta usam os recursos de voz disponíveis no navegador/dispositivo.

### Limitações desta etapa
- O avatar ainda é uma ilustração 2D estilizada; a máquina de expressões está preparada em CSS, mas não é um modelo 3D.
- A voz não é uma identidade vocal clonada ou exclusiva; usa os recursos do dispositivo.
- Ainda não há autenticação, sincronização em nuvem, memória pedagógica persistente no servidor nem avaliação diagnóstica.


## Registro de desenvolvimento

Consulte [`TEACHER_STATUS.md`](./TEACHER_STATUS.md) para ver o que foi implementado, dependências de ativação, limitações e critérios de conclusão do Pilar 1.


## Etapa 3 — Pesquisa profunda com busca na web

Foi criada a rota `POST /api/research`, usando a Responses API e a ferramenta oficial `web_search`. A pesquisa exige que a ferramenta de busca seja chamada, seleciona instruções conforme os modos Rápida, Aprofundada e Acadêmica, recolhe citações URL devolvidas pelo provedor e apresenta links de fontes no relatório.

### Configuração adicional
- `OPENAI_API_KEY`: chave privada no servidor.
- `OPENAI_RESEARCH_MODEL`: modelo habilitado na conta com suporte a Responses API e web search (padrão do projeto: `gpt-5.4`).

### Limites conhecidos
- A disponibilidade de modelos, ferramenta de busca, cotas e preços depende da conta/projeto do provedor.
- A lista de referências estruturadas depende das anotações devolvidas pela API; o texto do relatório também preserva citações inline.
- A pesquisa não garante cobertura de toda a internet nem validação acadêmica humana. Fontes e afirmações devem ser conferidas pelo estudante.
- Ainda não há armazenamento de relatórios em banco de dados, histórico de pesquisas na nuvem, filtros por domínio configuráveis ou execução assíncrona em background.


## Etapa 4 — Escola de redação e avaliação ENEM

Foi criada a rota `POST /api/essay/evaluate` com saída estruturada em JSON Schema. Ela avalia as cinco competências, exige notas em faixas de 0 a 200 (intervalos de 40), valida a soma de até 1.000 pontos e devolve evidências, problemas, orientações e exercícios específicos. A interface mostra o resultado por competência e preserva o modo de autonomia: não gera uma redação substituta.

### Configuração adicional
- `OPENAI_ESSAY_MODEL`: modelo habilitado com suporte a Structured Outputs (padrão: `gpt-4.1-mini`).

### Limites conhecidos
- A nota é uma estimativa pedagógica e não é nota oficial ou previsão garantida do ENEM.
- A análise depende da configuração e disponibilidade da API.
- O histórico de avaliações ainda não é sincronizado com conta ou banco de dados; o texto continua salvo localmente no navegador.

## Etapa 5 — Base de dados e privacidade (estrutura preparada)

Foi adicionada a migração `supabase/migrations/0001_learning_core.sql` com tabelas para perfis, conversas, mensagens, pesquisas, redações, avaliações e mapa de aprendizagem. A migração inclui chaves estrangeiras, restrições, índices, atualização automática de timestamps e Row Level Security (RLS) para separar os dados por usuário.

**Ainda não conectado:** nenhum projeto Supabase foi configurado nem a migração foi executada. A aplicação continua usando armazenamento local no navegador para rascunhos e histórico do professor. Antes de publicar, revisar e aplicar a migração em um projeto de desenvolvimento, configurar autenticação, variáveis privadas e testes de isolamento entre usuários. Escritas de mensagens do professor e avaliações devem ocorrer por backend confiável com chave de serviço nunca exposta ao cliente.
