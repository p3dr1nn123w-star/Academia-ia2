 "use client";

import { useEffect, useState } from "react";
import {
  BookOpen, Brain, Search, GraduationCap, LayoutDashboard, PenLine,
  Library, Trophy, Settings, Moon, Sun, Menu, X, Send, Mic, Sparkles,
  ChevronRight, Clock3, Target, Flame, FileText, Plus, ShieldCheck,
  CircleHelp, CheckCircle2, Lightbulb, MessageCircle, BarChart3
} from "lucide-react";

type Section = "home" | "teacher" | "research" | "writing" | "subjects" | "tools" | "progress";
type ChatMessage = { role: "student" | "assistant"; text: string };
type ResearchSource = { title: string; url: string };
type ResearchResult = { report: string; sources: ResearchSource[]; mode: string; searchedAt: string };
type EssayCompetency = { number: number; score: number; whatWasIdentified: string; excerpt: string; issue: string; whyImprove: string; howToImprove: string; exercise: string };
type EssayEvaluation = { estimatedTotal: number; overallComment: string; competencies: EssayCompetency[]; strengths: string[]; nextSteps: string[]; autonomyReminder: string };
type Mood = "happy" | "sad" | "surprised" | "angry" | "doubt" | "focused" | "excited" | "confident" | "shy" | "curious" | "confused" | "celebrating";

const nav = [
  { id: "home" as Section, label: "Visão geral", icon: LayoutDashboard },
  { id: "teacher" as Section, label: "Meu Professor", icon: Brain },
  { id: "research" as Section, label: "Pesquisa profunda", icon: Search },
  { id: "writing" as Section, label: "Escola de redação", icon: PenLine },
  { id: "subjects" as Section, label: "Disciplinas", icon: GraduationCap },
  { id: "tools" as Section, label: "Ferramentas", icon: Sparkles },
  { id: "progress" as Section, label: "Meu progresso", icon: BarChart3 },
];

const titles: Record<Section, string> = {
  home: "Seu espaço de aprendizagem",
  teacher: "Converse com seu professor",
  research: "Pesquisa profunda",
  writing: "Escola de redação",
  subjects: "Central de aprendizagem",
  tools: "Ferramentas inteligentes",
  progress: "Sua evolução",
};

const moodLabels: Record<Mood, string> = {
  happy: "Feliz", sad: "Triste", surprised: "Surpreso", angry: "Irritado",
  doubt: "Em dúvida", focused: "Concentrado", excited: "Empolgado",
  confident: "Confiante", shy: "Envergonhado", curious: "Curioso",
  confused: "Confuso", celebrating: "Comemorando",
};

function inferTeacherMood(prompt: string, reply: string): Mood {
  const p = prompt.toLocaleLowerCase("pt-BR");
  const r = reply.toLocaleLowerCase("pt-BR");
  if (/parabéns|conseguiu|excelente|ótimo trabalho|acertou/.test(r)) return "celebrating";
  if (/tenho vergonha|estou com vergonha|que vergonha/.test(p)) return "shy";
  if (/estou triste|desanimado|desanimada|fracassei/.test(p)) return "sad";
  if (/estou com raiva|que ódio|irritado|irritada/.test(p)) return "angry";
  if (/não entendi|estou confuso|estou confusa|não faz sentido/.test(p)) return "confused";
  if (/não sei|tenho dúvida|estou em dúvida/.test(p)) return "doubt";
  if (/surpreendente|uau|incrível|não esperava/.test(p + " " + r)) return "surprised";
  if (/vamos com calma|você consegue|não se preocupe/.test(r)) return "confident";
  if (/passo a passo|observe|analise|atenção a este detalhe/.test(r)) return "focused";
  if (/curioso|por que|como funciona|quero investigar/.test(p)) return "curious";
  if (/ótima pergunta|ideia interessante|vamos descobrir/.test(r)) return "excited";
  return "happy";
}

function Avatar({ mood = "happy" }: { mood?: Mood }) {
  return (
    <div className={`avatar avatar-${mood}`} aria-label="Professor virtual ilustrado">
      <div className="avatar-hair" />
      <div className="avatar-head">
        <div className="brow brow-left" /><div className="brow brow-right" />
        <div className="glasses"><i /><i /></div>
        <div className="eyes"><i /><i /></div>
        <div className="mouth" />
      </div>
      <div className="avatar-neck" />
      <div className="avatar-body">
        <div className="lapel lapel-left" /><div className="lapel lapel-right" />
        <div className="tie" />
      </div>
    </div>
  );
}

export default function Home() {
  const [section, setSection] = useState<Section>("home");
  const [dark, setDark] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [mood, setMood] = useState<Mood>("curious");
  const [sending, setSending] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [researchQuery, setResearchQuery] = useState("");
  const [researchMode, setResearchMode] = useState("Aprofundada");
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchResult, setResearchResult] = useState<ResearchResult | null>(null);
  const [essay, setEssay] = useState("");
  const [saved, setSaved] = useState(false);
  const [evaluatingEssay, setEvaluatingEssay] = useState(false);
  const [essayEvaluation, setEssayEvaluation] = useState<EssayEvaluation | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const savedChat = localStorage.getItem("academia-ia-chat");
      if (savedChat) setChat(JSON.parse(savedChat));
      setEssay(localStorage.getItem("academia-ia-essay") || "");
    } catch {}
  }, []);

  function go(id: Section) {
    setSection(id);
    setMobileOpen(false);
    setNotice("");
  }

  async function sendMessage() {
    const clean = message.trim();
    if (!clean || sending) return;
    const next = [...chat, { role: "student" as const, text: clean }];
    setChat(next);
    setMessage("");
    setSending(true);
    setMood("focused");
    try {
      const response = await fetch("/api/teacher", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-16) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível conversar com o professor.");
      const reply = String(data.reply || "").trim();
      const updated = [...next, { role: "assistant" as const, text: reply }];
      setChat(updated);
      localStorage.setItem("academia-ia-chat", JSON.stringify(updated));
      setMood(inferTeacherMood(clean, reply));
      if (speakReplies && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        utterance.lang = "pt-BR";
        utterance.rate = speechRate;
        utterance.volume = speechVolume;
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Erro inesperado.";
      const failed = [...next, { role: "assistant" as const, text: `Ainda não consegui responder: ${reason} Confira se a chave de IA foi configurada no servidor.` }];
      setChat(failed);
      try { localStorage.setItem("academia-ia-chat", JSON.stringify(failed)); } catch {}
      setMood("doubt");
    } finally { setSending(false); }
  }

  function startVoiceInput() {
    const browser = window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any };
    const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
    if (!Recognition) { setNotice("Reconhecimento de voz não disponível neste navegador. Você ainda pode digitar."); return; }
    const recognition = new Recognition();
    recognition.lang = "pt-BR";
    recognition.onresult = (event: any) => setMessage(event.results[0][0].transcript);
    recognition.onerror = () => setNotice("Não foi possível reconhecer a fala. Tente novamente.");
    recognition.start();
  }

  function saveEssay() {
    try {
      localStorage.setItem("academia-ia-essay", essay);
      setSaved(true);
      setNotice("Redação salva neste dispositivo. A sincronização em nuvem será adicionada com o banco de dados.");
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setNotice("Não foi possível salvar neste navegador.");
    }
  }

  async function evaluateEssay() {
    if (evaluatingEssay) return;
    setNotice("");
    setEvaluatingEssay(true);
    setEssayEvaluation(null);
    try {
      const response = await fetch("/api/essay/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ essay, theme: "Os desafios para garantir o acesso democrático à educação de qualidade no Brasil" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível corrigir a redação.");
      setEssayEvaluation(data.evaluation as EssayEvaluation);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Falha inesperada na correção.");
    } finally {
      setEvaluatingEssay(false);
    }
  }

  async function startResearch() {
    const query = researchQuery.trim();
    if (query.length < 4) {
      setNotice("Digite uma pergunta com pelo menos 4 caracteres.");
      return;
    }
    if (researchLoading) return;
    setNotice("");
    setResearchLoading(true);
    setResearchResult(null);
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, mode: researchMode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível concluir a pesquisa.");
      setResearchResult(data as ResearchResult);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Falha inesperada na pesquisa.");
    } finally {
      setResearchLoading(false);
    }
  }

  return (
    <main className={dark ? "app dark" : "app"}>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Brain size={21} /></div>
          <div><strong>Academia<span>IA</span></strong><small>ESCOLA INTELIGENTE</small></div>
          <button className="icon-btn close-mobile" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X /></button>
        </div>
        <div className="profile-mini">
          <div className="profile-avatar">E</div>
          <div><strong>Estudante</strong><small>Jornada de aprendizagem</small></div>
        </div>
        <p className="nav-caption">MENU PRINCIPAL</p>
        <nav>
          {nav.map(item => {
            const Icon = item.icon;
            return <button key={item.id} className={`nav-item ${section === item.id ? "active" : ""}`} onClick={() => go(item.id)}>
              <Icon size={18} /><span>{item.label}</span>{section === item.id && <i />}
            </button>;
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="support-card"><div className="support-icon"><Lightbulb size={17} /></div><strong>Continue evoluindo</strong><p>Pequenos passos todos os dias constroem grandes resultados.</p></div>
          <button className="nav-item" onClick={() => setNotice("As configurações completas serão habilitadas nas próximas fases.")}><Settings size={18} /><span>Configurações</span></button>
          <div className="sidebar-foot"><ShieldCheck size={14} /> Seus estudos, suas escolhas.</div>
        </div>
      </aside>

      {mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Fechar navegação" />}
      <section className="main-area">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu /></button>
            <div><div className="breadcrumb">Academia IA <ChevronRight size={13} /> <span>{titles[section]}</span></div><h1>{titles[section]}</h1></div>
          </div>
          <div className="top-actions">
            <span className="status-pill"><i /> Ambiente inicial</span>
            <button className="icon-btn theme-btn" onClick={() => setDark(!dark)} aria-label="Alternar tema">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="profile-avatar top-avatar">E</div>
          </div>
        </header>

        <div className="content">
          {notice && <div className="notice"><CircleHelp size={17} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Fechar aviso"><X size={16} /></button></div>}

          {section === "home" && <>
            <section className="welcome-card">
              <div className="welcome-copy"><div className="eyebrow"><Sparkles size={14} /> SUA JORNADA COMEÇA AQUI</div>
                <h2>Conhecimento abre caminhos.<br /><em>Vamos dar o próximo passo?</em></h2>
                <p>Aprenda no seu ritmo, investigue com profundidade e desenvolva sua própria maneira de pensar.</p>
                <button className="primary-btn" onClick={() => go("teacher")}>Começar a estudar <ChevronRight size={17} /></button>
              </div>
              <div className="welcome-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><Avatar /></div>
              <div className="welcome-spark spark-one">✦</div><div className="welcome-spark spark-two">✧</div>
            </section>
            <div className="section-heading"><div><span className="eyebrow">SEU AMBIENTE</span><h2>Três pilares para aprender melhor</h2></div></div>
            <div className="pillar-grid">
              <button className="pillar-card teacher-card" onClick={() => go("teacher")}><div className="pillar-icon purple"><Brain /></div><span className="card-kicker">TUTORIA PERSONALIZADA</span><h3>Meu Professor</h3><p>Converse, tire dúvidas e aprenda passo a passo com um tutor virtual.</p><b>Entrar na sala <ChevronRight size={16} /></b></button>
              <button className="pillar-card research-card" onClick={() => go("research")}><div className="pillar-icon blue"><Search /></div><span className="card-kicker">INVESTIGAÇÃO COM FONTES</span><h3>Pesquisa Profunda</h3><p>Investigue assuntos, compare evidências e organize referências verificáveis.</p><b>Investigar um tema <ChevronRight size={16} /></b></button>
              <button className="pillar-card writing-card" onClick={() => go("writing")}><div className="pillar-icon orange"><PenLine /></div><span className="card-kicker">ESCRITA E AUTONOMIA</span><h3>Escola de Redação</h3><p>Pratique a escrita, entenda seus erros e evolua com feedback pedagógico.</p><b>Praticar redação <ChevronRight size={16} /></b></button>
            </div>
            <div className="lower-grid">
              <section className="panel"><div className="panel-title"><div><span className="eyebrow">PRÓXIMOS PASSOS</span><h3>Explore sua escola</h3></div><BookOpen size={20} /></div>
                <div className="quick-links"><button onClick={() => go("subjects")}><span className="quick-icon"><GraduationCap /></span><span><strong>Disciplinas</strong><small>Matérias e trilhas de estudo</small></span><ChevronRight /></button><button onClick={() => go("tools")}><span className="quick-icon"><Sparkles /></span><span><strong>Ferramentas inteligentes</strong><small>Recursos para organizar seus estudos</small></span><ChevronRight /></button><button onClick={() => go("progress")}><span className="quick-icon"><BarChart3 /></span><span><strong>Meu progresso</strong><small>Acompanhe sua evolução</small></span><ChevronRight /></button></div>
              </section>
              <section className="panel progress-panel"><div className="panel-title"><div><span className="eyebrow">SUA ROTINA</span><h3>Constância vale mais</h3></div><Flame size={20} /></div><div className="empty-progress"><div className="empty-circle"><Target size={25} /></div><strong>Sua jornada está começando</strong><p>Quando suas atividades forem registradas, você verá aqui suas metas, revisões e conquistas.</p></div></section>
            </div>
          </>}

          {section === "teacher" && <div className="workspace">
            <div className="workspace-main panel">
              <div className="teacher-header"><Avatar mood={mood} /><div><span className="eyebrow">PROFESSOR VIRTUAL</span><h2>Olá! Vamos aprender juntos?</h2><p>Estou preparado para ajudar você a pensar, praticar e evoluir.</p></div></div>
              <div className="integration-alert"><span className="alert-dot" /><div><strong>Professor conectado ao backend</strong><p>As respostas usam a chave configurada no servidor. Sem credencial válida, o sistema informa o erro em vez de inventar uma resposta.</p></div></div>
              <div className="chat-area" aria-live="polite" aria-relevant="additions">
                {chat.length === 0 ? <div className="chat-empty"><div className="chat-bubble-icon"><MessageCircle /></div><h3>Por onde começamos?</h3><p>Escolha um assunto ou escreva sua dúvida abaixo.</p><div className="suggestions"><button onClick={() => setMessage("Explique frações usando exemplos do cotidiano.")}>Me explique frações</button><button onClick={() => setMessage("Quero entender como construir uma boa argumentação.")}>Como argumentar melhor?</button><button onClick={() => setMessage("Faça perguntas para descobrir meu nível em biologia.")}>Teste meu conhecimento</button></div></div> :
                  <div className="messages">{chat.map((m, i) => <div key={i} className={`message ${m.role}`}><span>{m.role === "student" ? "Você" : "Professor IA"}</span><p>{m.text}</p></div>)}</div>}
              </div>
              <div className="voice-controls"><label><input type="checkbox" checked={speakReplies} onChange={e => setSpeakReplies(e.target.checked)} /> Ler respostas em voz alta</label><span>Expressão: {moodLabels[mood]}</span><button className="clear-chat" onClick={() => { setChat([]); localStorage.removeItem("academia-ia-chat"); window.speechSynthesis?.cancel(); setMood("curious"); }}>Limpar conversa</button></div>
              {speakReplies && <div className="speech-settings"><label>Velocidade <strong>{speechRate.toFixed(1)}×</strong><input type="range" min="0.7" max="1.3" step="0.1" value={speechRate} onChange={e => setSpeechRate(Number(e.target.value))} /></label><label>Volume <strong>{Math.round(speechVolume*100)}%</strong><input type="range" min="0" max="1" step="0.1" value={speechVolume} onChange={e => setSpeechVolume(Number(e.target.value))} /></label><button onClick={() => window.speechSynthesis?.cancel()}>Parar áudio</button></div>}
              <div className="composer"><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Escreva sua dúvida ou o que deseja aprender..." /><button className="mic-btn" onClick={startVoiceInput} title="Ditado em português"><Mic size={18} /></button><button className="send-btn" onClick={sendMessage} disabled={sending} aria-label="Enviar mensagem">{sending ? "…" : <Send size={18} />}</button></div>
              <p className="micro-note">O histórico fica salvo neste navegador. A voz depende do suporte do navegador e da voz disponível no dispositivo.</p>
            </div>
            <aside className="workspace-side"><div className="panel"><span className="eyebrow">COMO POSSO ENSINAR?</span><h3>Aprender de verdade</h3><ul className="feature-list"><li><CheckCircle2 /> Explicações passo a passo</li><li><CheckCircle2 /> Exemplos do cotidiano</li><li><CheckCircle2 /> Perguntas para estimular o raciocínio</li><li><CheckCircle2 /> Dicas progressivas</li><li><CheckCircle2 /> Revisão dos seus erros</li></ul></div><div className="panel mini-tip"><Lightbulb /><strong>Uma boa estratégia</strong><p>Quando não entender, peça outra explicação. Mudar a abordagem pode abrir um caminho novo.</p></div></aside>
          </div>}

          {section === "research" && <div className="research-layout">
            <section className="panel research-hero"><div className="research-symbol"><Search size={26} /></div><span className="eyebrow">CENTRAL DE INVESTIGAÇÃO</span><h2>Uma pergunta pode abrir um universo.</h2><p>Organize uma investigação por subtópicos, compare evidências e acompanhe de onde vêm as informações.</p>
              <label className="field-label" htmlFor="research">O que você deseja investigar?</label><textarea id="research" value={researchQuery} onChange={e => setResearchQuery(e.target.value)} placeholder="Ex.: Como a inteligência artificial está transformando a educação no Brasil?" />
              <div className="research-controls"><div><label className="field-label" htmlFor="mode">Profundidade</label><select id="mode" value={researchMode} onChange={e => setResearchMode(e.target.value)}><option>Rápida</option><option>Aprofundada</option><option>Acadêmica</option></select></div><button className="primary-btn" onClick={startResearch} disabled={researchLoading}>{researchLoading ? <><span className="spinner" /> Investigando...</> : <><Search size={17} /> Iniciar pesquisa</>}</button></div>
              <div className="integration-alert"><span className="alert-dot" /><div><strong>Pesquisa com busca na web</strong><p>A investigação usa busca externa do provedor de IA. As fontes são exibidas quando a ferramenta retorna citações verificáveis; cobertura e disponibilidade variam conforme o tema.</p></div></div>
              {researchLoading && <div className="research-loading" role="status"><span className="spinner" /><div><strong>Investigando seu tema</strong><p>Buscando fontes, comparando evidências e preparando o relatório. Isso pode levar alguns instantes.</p></div></div>}
              {researchResult && <section className="panel research-report" aria-live="polite">
                <div className="report-heading"><div><span className="eyebrow">RELATÓRIO DE PESQUISA · {researchResult.mode.toUpperCase()}</span><h3>Resultado da investigação</h3></div><button className="secondary-btn" onClick={() => { navigator.clipboard?.writeText(researchResult.report); setNotice("Relatório copiado quando a permissão de área de transferência está disponível."); }}>Copiar relatório</button></div>
                <p className="report-date">Consultado em {new Date(researchResult.searchedAt).toLocaleString("pt-BR")}</p>
                <div className="report-body">{researchResult.report.split(/\r?\n/).map((line, index) => line.trim() ? <p key={index}>{line}</p> : <div key={index} className="report-gap" />)}</div>
                <div className="sources-block"><h4>Fontes identificadas ({researchResult.sources.length})</h4>
                  {researchResult.sources.length ? <ol>{researchResult.sources.map((source, index) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><small>{new URL(source.url).hostname}</small></li>)}</ol> : <p>O provedor não devolveu referências estruturadas nesta resposta. Confira as citações presentes no relatório e refaça a busca se necessário.</p>}
                </div>
              </section>}
            </section>
            <aside className="panel research-side"><span className="eyebrow">MÉTODO DE INVESTIGAÇÃO</span><h3>O que uma pesquisa completa deverá mostrar</h3><div className="research-steps">{["Pergunta e subtópicos","Fontes e datas de consulta","Afirmações e evidências","Contradições e limitações","Lacunas e próximos passos"].map((x,i)=><div key={x}><span>{String(i+1).padStart(2,"0")}</span>{x}</div>)}</div><div className="source-note"><ShieldCheck size={18} /><p>As referências deverão ser verificáveis e sustentar as afirmações às quais estiverem associadas.</p></div></aside>
          </div>}

          {section === "writing" && <div className="writing-layout">
            <section className="panel editor-panel"><div className="editor-top"><div><span className="eyebrow">MODO DE INDEPENDÊNCIA</span><h2>Escreva com suas próprias palavras.</h2><p>Pratique sem receber uma redação pronta. Seu texto fica salvo neste dispositivo.</p></div><div className="writing-badge"><PenLine /></div></div>
              <div className="prompt-box"><span>TEMA DE PRÁTICA</span><strong>Os desafios para garantir o acesso democrático à educação de qualidade no Brasil</strong><small>Proposta de treino — não é uma proposta oficial do ENEM.</small></div>
              <label className="field-label" htmlFor="essay">Sua redação</label><textarea id="essay" className="essay-input" value={essay} onChange={e => {setEssay(e.target.value); setSaved(false);}} placeholder="Comece pela introdução. Apresente o tema e construa sua tese com suas próprias palavras..." />
              <div className="editor-footer"><span>{essay.trim() ? essay.trim().split(/\s+/).length : 0} palavras</span><div className="essay-actions"><button className="secondary-btn" onClick={saveEssay}>{saved ? <CheckCircle2 size={15} /> : <FileText size={15} />}{saved ? "Salvo" : "Salvar redação"}</button><button className="primary-btn" onClick={evaluateEssay} disabled={evaluatingEssay}>{evaluatingEssay ? <><span className="spinner" /> Avaliando...</> : <><Sparkles size={16} /> Corrigir redação</>}</button></div></div>
              <div className="integration-alert"><span className="alert-dot" /><div><strong>Correção pedagógica por IA</strong><p>A nota é uma estimativa de treino baseada nas cinco competências; não substitui a avaliação oficial do ENEM.</p></div></div>
              {evaluatingEssay && <div className="research-loading" role="status"><span className="spinner" /><div><strong>Lendo sua redação</strong><p>Analisando cada competência e preparando orientações para sua próxima versão.</p></div></div>}
              {essayEvaluation && <section className="panel essay-result" aria-live="polite">
                <div className="essay-score"><span className="eyebrow">ESTIMATIVA PEDAGÓGICA</span><strong>{essayEvaluation.estimatedTotal}<small>/1000</small></strong><p>{essayEvaluation.overallComment}</p></div>
                <div className="competency-results"><h3>Resultado por competência</h3>{essayEvaluation.competencies.map(item=><article className="competency-card" key={item.number}>
                  <div className="competency-title"><strong>Competência {item.number}</strong><b>{item.score}<small>/200</small></b></div>
                  <p>{item.whatWasIdentified}</p>
                  {item.excerpt && <blockquote>“{item.excerpt}”</blockquote>}
                  <dl><dt>Ponto a melhorar</dt><dd>{item.issue}</dd><dt>Por que importa</dt><dd>{item.whyImprove}</dd><dt>Como melhorar</dt><dd>{item.howToImprove}</dd><dt>Exercício recomendado</dt><dd>{item.exercise}</dd></dl>
                </article>)}</div>
                {essayEvaluation.strengths.length>0 && <div className="essay-feedback-list"><h3>Seus pontos fortes</h3><ul>{essayEvaluation.strengths.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
                {essayEvaluation.nextSteps.length>0 && <div className="essay-feedback-list"><h3>Próximos passos</h3><ul>{essayEvaluation.nextSteps.map((x,i)=><li key={i}>{x}</li>)}</ul></div>}
                <p className="autonomy-reminder">{essayEvaluation.autonomyReminder}</p>
              </section>}
            </section>
            <aside className="panel rubric-panel"><span className="eyebrow">RUBRICA ENEM</span><h3>As cinco competências</h3>{["Domínio da modalidade escrita formal","Compreensão do tema e repertório","Organização das informações e argumentos","Coesão e mecanismos linguísticos","Proposta de intervenção"].map((s,i)=><div className="rubric-item" key={s}><span>{i+1}</span><p>{s}</p></div>)}<p className="rubric-foot">Cada competência vale até 200 pontos. A nota futura será uma estimativa pedagógica, não uma nota oficial.</p></aside>
          </div>}

          {section === "subjects" && <><div className="section-heading"><div><span className="eyebrow">TRILHAS DE CONHECIMENTO</span><h2>Escolha o que deseja aprender</h2><p>As disciplinas serão organizadas em níveis básico, intermediário e avançado.</p></div></div><div className="subject-grid">{[["Matemática","Números, álgebra e raciocínio","M"],["Português","Leitura, gramática e escrita","P"],["História","Sociedades e transformações","H"],["Geografia","Território, ambiente e sociedade","G"],["Biologia","Vida e sistemas naturais","B"],["Física","Matéria, energia e movimento","F"],["Química","Composição e transformação","Q"],["Filosofia","Pensamento e conhecimento","Φ"],["Sociologia","Indivíduo e sociedade","S"],["Inglês","Comunicação e vocabulário","EN"],["Literatura","Textos, escolas e autores","L"]].map(([name,desc,letter])=><div className="subject-card" key={name}><div>{letter}</div><h3>{name}</h3><p>{desc}</p><span>Conteúdo em planejamento</span></div>)}</div></>}

          {section === "tools" && <><div className="section-heading"><div><span className="eyebrow">CAIXA DE FERRAMENTAS</span><h2>Recursos para estudar melhor</h2><p>Os módulos serão conectados ao professor e à sua memória de aprendizagem.</p></div></div><div className="tools-grid">{[["Criador de resumos","Transforme materiais em sínteses organizadas",FileText],["Flashcards","Pratique a recuperação ativa",Brain],["Mapas mentais","Conecte conceitos visualmente",Lightbulb],["Gerador de exercícios","Treine por nível de dificuldade",Target],["Planejador de estudos","Organize metas e rotina",Clock3],["Revisão inteligente","Retome conteúdos no momento adequado",BookOpen],["Leitor de documentos","Estude PDFs e materiais enviados",Library],["Simulados","Prepare-se para avaliações",GraduationCap]].map(([name,desc,Icon]: any)=><div className="tool-card" key={name}><div><Icon size={20}/></div><h3>{name}</h3><p>{desc}</p><span>Planejado para próxima fase</span></div>)}</div></>}

          {section === "progress" && <div className="progress-page"><section className="panel progress-intro"><div className="progress-illustration"><Trophy size={34}/></div><span className="eyebrow">SUA EVOLUÇÃO</span><h2>Todo especialista já foi iniciante.</h2><p>Seu painel será preenchido conforme você estudar, praticar e demonstrar domínio dos conteúdos.</p></section><div className="progress-cards"><div className="panel"><Clock3/><strong>Tempo de estudo</strong><b>—</b><small>Aguardando atividades</small></div><div className="panel"><Target/><strong>Metas concluídas</strong><b>—</b><small>Aguardando metas</small></div><div className="panel"><Trophy/><strong>Conquistas</strong><b>—</b><small>Aguardando progresso</small></div></div><div className="panel"><h3>Mapa de aprendizagem</h3><p className="muted">Os conteúdos serão classificados como dominados, em desenvolvimento ou precisam ser aprendidos, com base em evidências de desempenho.</p></div></div>}
          <footer className="footer"><span>Academia IA © 2026</span><span>Aprendizagem com autonomia, evidências e responsabilidade.</span></footer>
        </div>
      </section>
    </main>
  );
}
