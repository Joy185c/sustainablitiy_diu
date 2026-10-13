import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';

// ─── AI Knowledge Base ────────────────────────────────────────
const KB: { patterns: RegExp[]; response: string; responseBn?: string }[] = [
  {
    patterns: [/salinity|lavan|লবণ|লবণাক্ততা/i],
    response: `🌊 **Soil Salinity in Coastal Bangladesh**

Soil salinity (measured in dS/m) is the main challenge for coastal farmers in Satkhira, Khulna, and Bagerhat.

**Tolerance thresholds:**
- Rice (Aman): up to 8 dS/m — BRRI dhan 47
- Mustard: up to 4 dS/m — BARI Sarisha-14
- Sunflower: up to 5 dS/m — BARI Surjamukhi-2
- Sweet potato: up to 4.5 dS/m

**Key causes:** Tidal intrusion, cyclone flooding, shrimp farming residue, and reduced monsoon rainfall.

💡 Tip: Conduct soil EC test before each planting season. Test at 0–15 cm depth.`,
  },
  {
    patterns: [/brri|ধান|rice|paddy|kharif|খরিফ/i],
    response: `🌾 **BRRI Salinity-Tolerant Rice Varieties**

For coastal Bangladesh:

**BRRI dhan 47** (Kharif/Aman):
- Max EC: 8 dS/m at seedling stage
- Yield: 3.5–4.5 t/ha (irrigated)
- Best planted after first heavy monsoon rain

**BRRI dhan 40** (Rabi/Boro):
- Max EC: 6 dS/m
- Requires fresh-water irrigation
- Higher input cost

**Planting advice:** Delay transplanting until monsoon rains flush surface salts. Prepare raised seedbeds if waterlogging is also present.

Source: Bangladesh Rice Research Institute (BRRI), 2022`,
  },
  {
    patterns: [/mustard|soriṣa|সরিষা|sunflower|সূর্যমুখী|rabi|রবি/i],
    response: `🌻 **Rabi Season Crop Recommendations**

**Mustard — BARI Sarisha-14:**
- Salt tolerance: up to 4 dS/m
- Water need: Low
- Yield: 1.2–1.8 t/ha
- Ideal for fields with residual moisture

**Sunflower — BARI Surjamukhi-2:**
- Salt tolerance: up to 5 dS/m
- Growing period: ~90 days
- Yield: 1.8–2.5 t/ha
- Good market value for cooking oil

**Rule:** If EC < 4 → mustard. If EC 4–5 → sunflower. If EC > 5 → consider salt-tolerant rice or mangrove aquaculture.`,
  },
  {
    patterns: [/ec|electrical conductivity|conductivity|measure|test|পরীক্ষা/i],
    response: `🧪 **Soil EC Testing Guide**

EC (Electrical Conductivity) measures soil salinity in dS/m (or mS/cm, same unit).

**How to test:**
1. Collect soil from 0–15 cm depth (5 spots per field)
2. Mix and air dry
3. Take to nearest DAE office or BRRI laboratory
4. Results available within 1–3 days

**When to test:**
- Before each planting season
- After any tidal flooding or cyclone event
- Annually if no flooding occurred

**Cost:** BDT 50–150 per sample at DAE labs.

⚠️ SalinO-Crop currently shows illustrative demo data. Field EC must be verified by actual soil testing.`,
  },
  {
    patterns: [/satkhira|সাতক্ষীরা|khulna|খুলনা|bagerhat|বাগেরহাট|coastal|উপকূল/i],
    response: `📍 **Coastal Bangladesh — Salinity Profile**

**Satkhira District (Pilot region):**
- 7 upazilas with varying salinity levels
- Shyamnagar & Kaliganj: highest risk (tidal intrusion)
- Tala & Kalaroa: lower risk zones
- Major crops: Aman rice, mustard, sunflower, shrimp

**Seasonal pattern:**
- Mar–May (Pre-Kharif): Rising salinity — dry season peaks
- Jun–Oct (Kharif): Monsoon flushes salts
- Nov–Feb (Rabi): Moderate salinity — best for oilseeds

**Future expansion:** SalinO-Crop pilot will extend to Khulna and Bagerhat districts.`,
  },
  {
    patterns: [/weather|climate|rain|rainfall|flood|cyclone|আবহাওয়া|বন্যা|ঘূর্ণিঝড়|বৃষ্টি/i],
    response: `⛅ **Climate Impact on Salinity — Satkhira**

Seasonal rainfall directly affects salinity concentration:

**High rainfall (Jun–Aug):** Flushes salts → lower EC → good for transplanting
**Declining rainfall (Mar–May):** Concentrates salts → EC rises → delay planting

**Cyclone events:**
After any cyclone or tidal surge, conduct emergency soil EC tests. Salinity can spike by 3–5 dS/m temporarily.

**7-day rainfall trend** (Demo): 89 mm — declining. This may increase salinity concentration over the next 2–3 weeks.

💡 Monitor local weather via Bangladesh Meteorological Department (BMD) for advance planning.`,
  },
  {
    patterns: [/shrimp|gher|মাছ|চিংড়ি|aquaculture|jlochash/i],
    response: `🦐 **Shrimp-to-Crop Conversion**

Many coastal fields in Satkhira were shrimp ghers (ponds). Converting back to crop production requires:

**Steps:**
1. **Soil washing:** Irrigate with fresh water 2–3 times to leach surface salts
2. **EC test:** Target below 4 dS/m before planting
3. **First crop:** Start with salt-tolerant varieties (BRRI dhan 47)
4. **Recovery time:** Usually 2–4 seasons

**Integrated option:** Mangrove-associated aquaculture can sustain livelihoods where EC > 10 dS/m and crop conversion is not yet feasible.

Source: WorldFish Center, CGIAR 2022`,
  },
  {
    patterns: [/sdg|sustainability|sustainable|climate|টেকসই|জলবায়ু/i],
    response: `🌱 **SalinO-Crop & Sustainability Goals**

This platform addresses multiple UN Sustainable Development Goals:

**SDG 2** — Zero Hunger: Improving crop yields in salinity-affected coastal zones
**SDG 13** — Climate Action: Climate-resilient agriculture planning
**SDG 15** — Life on Land: Protecting coastal agricultural ecosystems
**SDG 1** — No Poverty: Supporting smallholder farmer livelihoods

**Competition context:** Built for **SUSTAINABLE PROJECT COMPETITION - 2026** under Environmental Sustainability & Climate Resilience track.

**Pilot:** Satkhira District, Bangladesh — planned expansion to Khulna and Bagerhat.`,
  },
  {
    patterns: [/dag|jl|khatian|mouza|land record|দাগ|খতিয়ান|মৌজা/i],
    response: `📋 **Bangladesh Land Records Explained**

Key terms for land identification:

**Mouza:** Village-level administrative unit for land records
**JL Number:** Jurisdiction List number identifying the mouza
**Dag Number:** Plot/parcel number within a mouza
**Khatian:** Record-of-rights document (RS, BS, etc.) listing owner and plot details

**Survey types:**
- **CS (1920s):** Cadastral Survey — oldest
- **SA (1956):** State Acquisition Survey
- **RS (1960–80s):** Revisional Survey — most common reference
- **BS/BRS:** Bangladesh Survey — most recent

💡 In SalinO-Crop's My Farms section, you can save these details for reference. They are stored locally and not legally verified.`,
  },
  {
    patterns: [/hello|hi|help|সালাম|নমস্কার|assalamualaikum|হেল্প|সাহায্য/i],
    response: `👋 **Welcome to SalinO-Crop AI Assistant!**

I'm here to help you with:

🌊 **Salinity** — EC levels, risk assessment, tolerances
🌾 **Crops** — BRRI varieties, BARI oilseeds, suitability guidance
🗺️ **Farm Location** — My Farms, boundary drawing, land records
⛅ **Climate** — Rainfall, seasonal patterns, cyclone impacts
📱 **SMS Advisories** — Auto-generated alerts and voice scripts
🇧🇩 **Local context** — Satkhira, Khulna, Bagerhat farming

**Try asking:**
- "Which rice variety for high salinity?"
- "How to test soil EC?"
- "What crops for Rabi season?"
- "Tell me about Satkhira"`,
  },
  {
    patterns: [/farm|খামার|boundary|boundary|আমার জমি|my farm/i],
    response: `🌾 **My Farms Feature — SalinO-Crop**

The **My Farms** section (in the sidebar) lets you:

1. **Draw farm boundary** on a satellite map by clicking points
2. **Fill a form** with village/upazila details → system auto-detects location
3. **Save multiple farms** with area, crop, and soil EC info
4. **Land records storage** — Dag, JL, Khatian numbers (local only)

**Area calculation:** Geodesic polygon area — accurate for small parcels.
**Units:** Bigha (BD), Decimal/Shatak, Acre, Hectare

**Data storage:** All farm data is saved in your browser (localStorage). Clearing browser data will remove it. No data is sent to any server.

→ Go to **My Farms** in the sidebar to get started!`,
  },
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const kb of KB) {
    if (kb.patterns.some(p => p.test(lower))) {
      return kb.response;
    }
  }
  return `🤔 I'm not sure about that specific question, but I can help with:

- **Salinity & EC levels** — rice tolerance thresholds
- **Crop recommendations** — BRRI dhan 47, mustard, sunflower
- **Soil testing** — when and how to test EC
- **Land records** — Dag, JL, Khatian numbers
- **My Farms** — how to register and manage farm locations
- **Climate impacts** — rainfall and seasonal patterns

Try asking something like: *"Which crops grow in salty soil?"* or *"How do I test soil EC?"*

⚠️ This assistant uses a built-in knowledge base. For field-specific guidance, please consult your local DAE extension officer.`;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: string;
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👋 **Hello! I'm SalinO-Crop AI Assistant.**

I can help you with salinity risk, crop recommendations, soil testing, farm location setup, and more for coastal Bangladesh farming.

**Try asking:**
- "Which crop for high salinity fields?"
- "How to draw a farm boundary?"
- "Tell me about Satkhira"

আমি বাংলায়ও সাহায্য করতে পারি! (I can also help in Bangla!)`,
      ts: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [open, messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', text, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI "thinking" delay
    const delay = 600 + Math.random() * 800;
    setTimeout(() => {
      const response = getAIResponse(text);
      const aiMsg: ChatMessage = { id: `a_${Date.now()}`, role: 'assistant', text: response, ts: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
    }, delay);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => setMessages(msgs => [msgs[0]]);

  const QuickQuestions = [
    'Which crop for salty soil?',
    'How to test soil EC?',
    'BRRI dhan 47 details',
    'What is Dag number?',
  ];

  return (
    <>
      {/* ── Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 9100,
            width: 60, height: 60, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0f3b24 0%, #0d9488 100%)',
            border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(13,148,136,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'chatPulse 2.5s infinite',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageCircle size={26} color="#fff" />
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 18, height: 18, borderRadius: '50%', background: '#fbbf24',
            border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#78350f',
          }}>AI</span>
        </button>
      )}

      {/* ── Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9100,
          width: 400, height: 580,
          background: '#fff', borderRadius: 20,
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUpChat 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0f3b24 0%, #1a5c38 60%, #0d9488 100%)',
            padding: '16px 18px', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 11,
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Bot size={20} color="#6ee7b7" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                SalinO-Crop AI
                <span style={{ background: '#fbbf24', color: '#78350f', fontSize: 9, fontWeight: 800, borderRadius: 4, padding: '1px 5px' }}>BETA</span>
              </div>
              <div style={{ color: '#6ee7b7', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Agricultural AI · Salinity & Crops
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={clearChat} title="Clear chat"
                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                <RefreshCw size={14} />
              </button>
              <button onClick={() => setOpen(false)} title="Close"
                style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, padding: '6px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  background: msg.role === 'assistant' ? 'linear-gradient(135deg, #0f3b24, #0d9488)' : 'linear-gradient(135deg, #1e40af, #6366f1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {msg.role === 'assistant' ? <Bot size={14} color="#fff" /> : <User size={14} color="#fff" />}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: '78%',
                  background: msg.role === 'assistant' ? '#f8fafc' : 'linear-gradient(135deg, #1a5c38, #0d9488)',
                  color: msg.role === 'assistant' ? '#111827' : '#fff',
                  borderRadius: msg.role === 'assistant' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                  padding: '10px 13px',
                  fontSize: 13, lineHeight: 1.7,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  border: msg.role === 'assistant' ? '1px solid #f0f0f0' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  <MarkdownText text={msg.text} />
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #0f3b24, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #f0f0f0', borderRadius: '4px 14px 14px 14px', padding: '12px 16px', display: 'flex', gap: 5 }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#0d9488', display: 'inline-block', animation: `typingDot 1.2s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && (
            <div style={{ padding: '0 12px 8px', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {QuickQuestions.map(q => (
                <button key={q} onClick={() => {
                  const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: 'user', text: q, ts: new Date().toISOString() };
                  setMessages(prev => [...prev, userMsg]);
                  setTyping(true);
                  setTimeout(() => {
                    const response = getAIResponse(q);
                    const aiMsg: ChatMessage = { id: `a_${Date.now()}`, role: 'assistant', text: response, ts: new Date().toISOString() };
                    setMessages(prev => [...prev, aiMsg]);
                    setTyping(false);
                  }, 600 + Math.random() * 600);
                }}
                  style={{ fontSize: 11.5, padding: '5px 10px', borderRadius: 20, border: '1px solid #d1fae5', background: '#f0fdf4', color: '#1a5c38', cursor: 'pointer', fontWeight: 500 }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, alignItems: 'center', background: '#fafafa', flexShrink: 0 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '8px 12px', transition: 'border-color 0.15s' }}
              onFocus={() => {}}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about salinity, crops, farms…"
                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: 13.5, fontFamily: 'inherit', color: '#111827' }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              style={{
                width: 38, height: 38, borderRadius: 11, border: 'none', cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                background: input.trim() && !typing ? 'linear-gradient(135deg, #1a5c38, #0d9488)' : '#e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', flexShrink: 0,
                boxShadow: input.trim() && !typing ? '0 4px 12px rgba(13,148,136,0.35)' : 'none',
              }}>
              <Send size={15} color={input.trim() && !typing ? '#fff' : '#9ca3af'} />
            </button>
          </div>

          {/* Footer disclaimer */}
          <div style={{ padding: '6px 14px 10px', textAlign: 'center', fontSize: 10, color: '#9ca3af' }}>
            <Sparkles size={9} style={{ display: 'inline', marginRight: 3 }} />
            AI knowledge base · Demo mode · Not field-specific advice
          </div>
        </div>
      )}

      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 8px 28px rgba(13,148,136,0.45); }
          50% { box-shadow: 0 8px 36px rgba(13,148,136,0.7), 0 0 0 8px rgba(13,148,136,0.1); }
        }
        @keyframes slideUpChat {
          from { opacity: 0; transform: scale(0.85) translateY(30px); transform-origin: bottom right; }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
}

// Simple markdown bold/newline renderer
function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
