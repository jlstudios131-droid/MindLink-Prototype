import React, { useState, useEffect, useRef } from "react"; import { motion, AnimatePresence } from "framer-motion";

/** MindLink.jsx Single-file React prototype (Vite + Tailwind + Framer Motion) Project: MindLink — "A rede social que compreende e evolui contigo."

Notes:

Mobile-first responsive design (Tailwind classes)

Framer Motion used for subtle animations

Mock local API (in-memory) to simulate interactions

Insight Engine: lightweight simulated learner that adapts UI tone & suggests topics

Pseudocode included for anticipation-of-problems logic


How to use:

Drop this file in a React + Vite project where Tailwind and Framer Motion are configured

Filename: MindLink.jsx */


/* ----------------------------- Theme / Constants ---------------------------- */ const THEME = { colors: { mentalBlue: "bg-[#e8f0ff]", mentalAccent: "text-[#5b6bff]", softLilac: "bg-gradient-to-br from-[#f3f0ff] to-[#eef2ff]", card: "bg-white/80", }, };

/* ----------------------------- Mock Local API ------------------------------ */ const mockDB = (() => { let posts = [ { id: 1, author: "Ava", avatar: "A", content: "Experimenting with mindful coding — micro-breaks helped me focus.", tags: ["mindful", "productivity"], mood: "calm", likes: 4, createdAt: Date.now() - 1000 * 60 * 60 * 6, }, { id: 2, author: "Rui", avatar: "R", content: "Idea: decentralized knowledge nodes for local communities.", tags: ["ideas", "sustainability"], mood: "energetic", likes: 8, createdAt: Date.now() - 1000 * 60 * 60 * 24, }, ];

let users = [ { id: "u1", name: "You", avatar: "Y", interests: ["AI", "Sustainability"], moodScore: 0.6 }, { id: "u2", name: "Ava", avatar: "A", interests: ["Mindfulness", "Design"], moodScore: 0.8 }, { id: "u3", name: "Rui", avatar: "R", interests: ["Systems", "Energy"], moodScore: 0.3 }, ];

return { fetchPosts: () => Promise.resolve(posts.sort((a, b) => b.createdAt - a.createdAt)), createPost: (post) => { const newPost = { ...post, id: Date.now(), likes: 0, createdAt: Date.now() }; posts = [newPost, ...posts]; return Promise.resolve(newPost); }, likePost: (id) => { posts = posts.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)); return Promise.resolve(true); }, fetchUsers: () => Promise.resolve(users), sendMessage: (from, to, body) => Promise.resolve({ id: Date.now(), from, to, body, createdAt: Date.now() }), }; })();

/* ----------------------------- Utility Helpers ----------------------------- */ const timeAgo = (t) => { const s = Math.floor((Date.now() - t) / 1000); if (s < 60) return ${s}s; if (s < 3600) return ${Math.floor(s / 60)}m; if (s < 86400) return ${Math.floor(s / 3600)}h; return ${Math.floor(s / 86400)}d; };

/* ----------------------------- Insight Engine ------------------------------ / /*

Simple Insight Engine that learns from user actions.

It stores light-weight signals in localStorage and suggests:

topics based on tags used frequently


behavioural tone (calm vs energetic) to adapt UI */ const InsightEngine = (() => { const KEY = "mindlink_insights_v1";



const load = () => { try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : { tagCounts: {}, moodSignals: [] }; } catch (e) { return { tagCounts: {}, moodSignals: [] }; } };

const save = (s) => localStorage.setItem(KEY, JSON.stringify(s));

const state = load();

return { recordPostTags: (tags = []) => { tags.forEach((t) => { state.tagCounts[t] = (state.tagCounts[t] || 0) + 1; }); save(state); }, recordMoodSignal: (val) => { state.moodSignals.push({ v: val, t: Date.now() }); // prune if (state.moodSignals.length > 50) state.moodSignals.shift(); save(state); }, suggestTopics: (limit = 5) => { const pairs = Object.entries(state.tagCounts).sort((a, b) => b[1] - a[1]); return pairs.slice(0, limit).map((p) => p[0]); }, inferMood: () => { if (!state.moodSignals.length) return 0.5; const avg = state.moodSignals.reduce((s, x) => s + x.v, 0) / state.moodSignals.length; return avg; // 0..1 where 0 calm/sad, 1 energetic/hyped }, _internal: state, }; })();

/* ----------------------------- Anticipation Pseudocode --------------------- / / PSEUDOCODE: Anticipation and problem detection

function detectIssue(post): if post.content.trim() === "": return { type: 'empty', message: 'O post está vazio. Sugira adicionar texto ou áudio.' } if containsTooManyLinks(post.content): return { type: 'spam', message: 'Possível spam: muitos links.' } if user.moodScore < 0.2 and content.isAggressive: return { type: 'flow_block', message: 'Conteúdo agressivo detectado. Sugerir desconexão ou rephrase.' } return null

Usage: run detectIssue before submitting post, show suggestion modal, optionally auto-summarize or block. */

/* ----------------------------- UI Components ------------------------------- */

const Icon = ({ children }) => (

  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-white/30">
    {children}
  </div>
);function Header({ mood, onToggle }) { return ( <header className={flex items-center justify-between p-3 sticky top-0 z-20 ${THEME.colors.mentalBlue} backdrop-blur-sm}> <div className="flex items-center gap-3"> <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-[#dfe7ff] to-[#eef6ff]">ML</div> <div> <div className="text-sm font-semibold">MindLink</div> <div className="text-xs text-slate-600">A rede social que compreende e evolui contigo.</div> </div> </div>

<div className="flex items-center gap-3">
    <button
      onClick={onToggle}
      className="px-3 py-1 rounded-lg border border-transparent text-xs font-medium bg-white/90 shadow-sm"
    >
      Mood: {mood > 0.6 ? "Energetic" : mood < 0.4 ? "Calm" : "Balanced"}
    </button>
    <Icon>⚙️</Icon>
  </div>
</header>

); }

function Profile({ user, suggestions }) { return ( <aside className="p-4 w-full md:w-72"> <motion.div layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className={p-4 rounded-2xl ${THEME.colors.card} shadow-sm} > <div className="flex items-center gap-3"> <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold bg-gradient-to-br from-[#eef6ff] to-[#f7f3ff]">{user.avatar}</div> <div> <div className="font-semibold">{user.name}</div> <div className="text-xs text-slate-500">{user.interests.join(" • ")}</div> </div> </div>

<div className="mt-4 grid grid-cols-3 gap-2 text-center">
      <div>
        <div className="text-sm font-bold">{Math.round(user.moodScore * 100)}</div>
        <div className="text-xs text-slate-500">Mood</div>
      </div>
      <div>
        <div className="text-sm font-bold">{Math.max(0, 12)}</div>
        <div className="text-xs text-slate-500">Connections</div>
      </div>
      <div>
        <div className="text-sm font-bold">{Math.max(0, 42)}</div>
        <div className="text-xs text-slate-500">Ideas</div>
      </div>
    </div>

    <div className="mt-4">
      <div className="text-xs text-slate-600">Suggested topics</div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {suggestions.length ? (
          suggestions.map((s) => (
            <span key={s} className="px-2 py-1 text-xs rounded-full border">
              {s}
            </span>
          ))
        ) : (
          <div className="text-xs text-slate-400">No suggestions yet — share something!</div>
        )}
      </div>
    </div>
  </motion.div>
</aside>

); }

function Composer({ onCreate, suggestedTopics }) { const [content, setContent] = useState(""); const [tags, setTags] = useState(""); const [mood, setMood] = useState(0.6);

const detectIssue = (post) => { // PSEUDOCODE implemented lightly: if (!post.content || !post.content.trim()) return { type: "empty", message: "O post está vazio." }; const linkCount = (post.content.match(/https?:///g) || []).length; if (linkCount > 3) return { type: "spam", message: "Muitos links detectados (spam)." }; if (post.content.length > 2000) return { type: "length", message: "Post muito longo — sugerir resumir." }; // placeholder for aggression detection if (/\b(hate|idiot|stupid)\b/i.test(post.content) && mood < 0.3) return { type: "flow_block", message: "Tom agressivo detectado. Recomendamos rephrase." }; return null; };

const submit = async () => { const post = { author: "You", avatar: "Y", content, tags: tags.split(",").map((t) => t.trim()).filter(Boolean), mood: mood > 0.6 ? "energetic" : mood < 0.4 ? "calm" : "balanced" }; const issue = detectIssue(post); if (issue) { // show suggestion modal — for prototype use confirm() if (!confirm(${issue.message} Deseja continuar a publicar?)) return; } const created = await mockDB.createPost(post); onCreate(created); // record signals for insight engine InsightEngine.recordPostTags(post.tags); InsightEngine.recordMoodSignal(mood); setContent(""); setTags(""); setMood(0.6); };

return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={p-3 rounded-2xl ${THEME.colors.card} shadow-sm}> <div className="flex items-start gap-3"> <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#eef6ff] to-[#f7f3ff] text-sm font-bold">Y</div> <div className="flex-1"> <textarea placeholder="Compartilhe uma ideia, pensamento ou áudio (simulado)..." className="w-full resize-none min-h-[72px] bg-transparent outline-none text-sm" value={content} onChange={(e) => setContent(e.target.value)} />

<div className="mt-2 flex items-center gap-2">
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, separadas, por, vírgula" className="text-xs px-2 py-1 rounded-md border w-full md:w-2/3" />
        <div className="text-xs">Mood</div>
        <input type="range" min={0} max={1} step={0.1} value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-24" />
        <button onClick={submit} className="px-3 py-1 rounded-md bg-gradient-to-br from-[#5b6bff] to-[#7b8dff] text-white text-xs font-semibold">Publicar</button>
      </div>

      <div className="mt-3 text-xs text-slate-500">
        Sugestões: {suggestedTopics.map((t) => <span key={t} className="mr-2">#{t}</span>)}
      </div>
    </div>
  </div>
</motion.div>

); }

function PostCard({ p, onLike }) { return ( <motion.article layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className={p-4 rounded-2xl ${THEME.colors.card} shadow-sm}> <div className="flex items-start gap-3"> <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#f3f6ff] font-bold">{p.avatar}</div> <div className="flex-1"> <div className="flex items-center justify-between"> <div> <div className="font-semibold text-sm">{p.author}</div> <div className="text-xs text-slate-500">{timeAgo(p.createdAt)} • {p.mood}</div> </div> <div className="text-xs text-slate-400">{p.likes} ♥</div> </div>

<div className="mt-3 text-sm leading-relaxed">{p.content}</div>

      <div className="mt-3 flex items-center gap-2 text-xs">
        {p.tags.map((t) => (
          <span key={t} className="px-2 py-1 rounded-full border">#{t}</span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => onLike(p.id)} className="text-xs px-2 py-1 rounded-md border">Curtir</button>
        <button className="text-xs px-2 py-1 rounded-md border">Compartilhar</button>
        <button className="text-xs px-2 py-1 rounded-md border">Salvar</button>
      </div>
    </div>
  </div>
</motion.article>

); }

function Feed({ posts, onLike }) { return ( <div className="space-y-3"> <AnimatePresence> {posts.map((p) => ( <PostCard key={p.id} p={p} onLike={onLike} /> ))} </AnimatePresence> </div> ); }

function MindChat({ messages = [], onSend }) { const [text, setText] = useState(""); const sub = async () => { if (!text.trim()) return; await onSend(text); setText(""); }; return ( <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={p-3 rounded-2xl ${THEME.colors.card} shadow-sm}> <div className="text-xs text-slate-600 mb-2">Chat contextual</div> <div className="max-h-36 overflow-y-auto space-y-2 mb-2"> {messages.map((m) => ( <div key={m.id} className="text-sm"> <span className="font-semibold">{m.from}</span>: {m.body} </div> ))} </div> <div className="flex gap-2"> <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enviar mensagem..." className="flex-1 px-2 py-1 rounded-md border text-sm" /> <button onClick={sub} className="px-3 py-1 rounded-md bg-white/90">Enviar</button> </div> </motion.div> ); }

/* ----------------------------- Main App ----------------------------------- */ export default function MindLink() { const [posts, setPosts] = useState([]); const [user, setUser] = useState({ id: "u1", name: "You", avatar: "Y", interests: ["AI", "Sustainability"], moodScore: 0.6 }); const [suggestions, setSuggestions] = useState([]); const [messages, setMessages] = useState([]); const [mood, setMood] = useState(InsightEngine.inferMood());

// fetch initial data useEffect(() => { let mounted = true; (async () => { const ps = await mockDB.fetchPosts(); const us = await mockDB.fetchUsers(); if (mounted) setPosts(ps); // suggestions from insight engine setSuggestions(InsightEngine.suggestTopics(6)); })(); return () => (mounted = false); }, []);

useEffect(() => { // whenever mood changes, update visual subtlety InsightEngine.recordMoodSignal(mood); }, [mood]);

const handleCreate = (p) => setPosts((s) => [p, ...s]); const handleLike = async (id) => { await mockDB.likePost(id); setPosts((s) => s.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))); };

const handleSend = async (text) => { const m = await mockDB.sendMessage(user.name, "Ava", text); setMessages((s) => [...s, m]); };

const toggleMood = () => setMood((m) => (m > 0.6 ? 0.3 : 0.8));

// Autoadaptation: compute small visual adjustments based on average mood const uiTone = mood > 0.65 ? "energetic" : mood < 0.4 ? "calm" : "balanced"; const containerMotion = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.45, ease: "easeOut" }, };

return ( <motion.div {...containerMotion} className="min-h-screen p-3 md:p-6 bg-gradient-to-br from-[#fbfdff] to-[#f8f7ff] text-slate-800"> <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4"> <div className="md:col-span-4"> <Header mood={mood} onToggle={toggleMood} /> </div>

<div className="md:col-span-1 order-2 md:order-1">
      <Profile user={user} suggestions={suggestions} />
    </div>

    <main className="md:col-span-2 order-1 md:order-2">
      <div className="space-y-3">
        <Composer onCreate={handleCreate} suggestedTopics={suggestions} />

        {/* Insight summary */}
        <motion.div className={`p-3 rounded-2xl ${THEME.colors.card} shadow-sm`} layout>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Insight Engine</div>
              <div className="text-xs text-slate-500">Aprende com as tuas ações e sugere aproximações.</div>
            </div>
            <div className="text-xs">Tone: {uiTone}</div>
          </div>

          <div className="mt-2 text-xs text-slate-600">
            Tópicos populares: {InsightEngine.suggestTopics(4).map((t) => <span key={t} className="mr-2">#{t}</span>)}
          </div>

          <div className="mt-3 text-xs text-slate-500">
            <div>Privacy-first local signals. Efficiency: reuso de componentes, cache local, render otimizado.</div>
          </div>
        </motion.div>

        <Feed posts={posts} onLike={handleLike} />
      </div>
    </main>

    <aside className="md:col-span-1 order-3 md:order-3">
      <div className="space-y-3">
        <MindChat messages={messages} onSend={handleSend} />

        <motion.div className={`p-3 rounded-2xl ${THEME.colors.card} shadow-sm`}>
          <div className="text-sm font-semibold">Connections</div>
          <div className="mt-2 text-xs text-slate-600">Ava • Rui • plus 10</div>

          <div className="mt-3 text-xs">
            Autoadaptação: o layout muda conforme o teu estado — quando energético, cartões têm sombras mais fortes e micro-animations mais rápidas.
          </div>
        </motion.div>
      </div>
    </aside>
  </div>

  {/* subtle UI adaptation styles (inline small tweaks) */}
  <style>{`\n        /* Autoadaptation CSS tweaks based on inferred mood */\n        body { --ml-elevation: ${uiTone === "energetic" ? "12" : uiTone === "calm" ? "2" : "6"}; }\n      `}</style>
</motion.div>

); }

/* ----------------------------- End of File -------------------------------- */

