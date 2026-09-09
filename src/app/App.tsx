import { useState } from "react";
import {
  Home, Moon, BookOpen, Hash, User, Bell, ChevronRight,
  Flame, Check, RotateCcw, Settings, Award,
} from "lucide-react";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Prayer {
  id: string;
  name: string;
  arabic: string;
  time: string;
  done: boolean;
  emoji: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const INITIAL_PRAYERS: Prayer[] = [
  { id: "fajr",    name: "Fajr",    arabic: "الفجر",  time: "4:32 AM",  done: true,  emoji: "🌙" },
  { id: "dhuhr",   name: "Dhuhr",   arabic: "الظهر",  time: "12:15 PM", done: true,  emoji: "☀️" },
  { id: "asr",     name: "Asr",     arabic: "العصر",  time: "3:45 PM",  done: false, emoji: "🌤" },
  { id: "maghrib", name: "Maghrib", arabic: "المغرب", time: "7:28 PM",  done: false, emoji: "🌅" },
  { id: "isha",    name: "Isha",    arabic: "العشاء",  time: "9:05 PM",  done: false, emoji: "⭐" },
];

const DHIKR_OPTIONS = [
  { id: 0, arabic: "سُبْحَانَ اللَّهِ",          transliteration: "SubhanAllah",    translation: "Glory be to Allah",          goal: 33  },
  { id: 1, arabic: "الْحَمْدُ لِلَّهِ",          transliteration: "Alhamdulillah",  translation: "All praise to Allah",        goal: 33  },
  { id: 2, arabic: "اللَّهُ أَكْبَرُ",            transliteration: "Allahu Akbar",   translation: "Allah is the Greatest",      goal: 34  },
  { id: 3, arabic: "لَا إِلَٰهَ إِلَّا اللَّهُ", transliteration: "La ilaha illallah", translation: "No god but Allah",        goal: 100 },
];

const CALENDAR_COUNTS = [5,4,5,3,5,5,2,5,4,5,5,5,3,4,5,5,2,5,4,5,3,5,5,4,5,5,3,4,2,5];

const SESSIONS = [
  { date: "Today, 6:45 AM",     surah: "Al-Baqarah", pages: "43–45", dur: "18 min", n: 3  },
  { date: "Yesterday, 7:02 AM", surah: "Al-Baqarah", pages: "38–42", dur: "25 min", n: 5  },
  { date: "Jul 26, 6:55 AM",    surah: "Al-Baqarah", pages: "33–37", dur: "22 min", n: 5  },
  { date: "Jul 25, 7:15 AM",    surah: "Al-Baqarah", pages: "29–32", dur: "20 min", n: 4  },
];

const ACHIEVEMENTS = [
  { icon: "🔥", name: "Streak Master",  desc: "23 day streak" },
  { icon: "📖", name: "Quran Scholar",  desc: "45 pages read" },
  { icon: "🌙", name: "Night Prayer",   desc: "Tahajjud ×5"   },
  { icon: "⭐", name: "Gold Member",    desc: "Premium plan"  },
  { icon: "🏆", name: "First Khatm",    desc: "Completed once"},
];

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function ProgressRing({
  value, max, size = 80, strokeWidth = 7,
  color = "#10B981", trackColor = "rgba(255,255,255,0.05)",
}: {
  value: number; max: number; size?: number; strokeWidth?: number;
  color?: string; trackColor?: string;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, max) / max) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}

// ─── STATUS BAR ──────────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className="relative flex items-center justify-between px-7 h-12 flex-shrink-0">
      <span className="text-[13px] font-bold text-white/90 z-10">9:41</span>
      {/* Dynamic Island */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-0 bg-black z-20"
        style={{ width: 126, height: 37, borderRadius: "0 0 20px 20px" }}
      />
      <div className="flex items-center gap-1.5 z-10">
        {/* Signal bars */}
        <div className="flex items-end gap-[2.5px]">
          {[4, 6, 9, 11].map((h, i) => (
            <div key={i} className="w-[3px] rounded-full bg-white/90" style={{ height: `${h}px` }} />
          ))}
        </div>
        {/* Battery */}
        <div className="flex items-center ml-1">
          <div
            className="relative rounded-[3px] border border-white/60"
            style={{ width: 22, height: 11 }}
          >
            <div className="absolute inset-[2px] bg-white rounded-[1.5px]" style={{ right: "25%" }} />
          </div>
          <div className="w-[2px] h-[5px] bg-white/50 rounded-full ml-[1.5px]" />
        </div>
      </div>
    </div>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────

function HomeScreen({ prayers, onToggle }: { prayers: Prayer[]; onToggle: (id: string) => void }) {
  const doneCount = prayers.filter(p => p.done).length;
  const nextPrayer = prayers.find(p => !p.done);

  return (
    <div className="px-5 pb-6 space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-semibold tracking-widest uppercase">
            28 Muharram 1448 AH
          </p>
          <h1
            className="text-[22px] font-bold text-white mt-0.5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            As-salamu alaykum 👋
          </h1>
          <p className="text-sm text-muted-foreground">Ahmad Hassan</p>
        </div>
        <div className="relative mt-1">
          <button className="w-10 h-10 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center">
            <Bell size={17} className="text-muted-foreground" />
          </button>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary border-2 border-[#0B0F14]" />
        </div>
      </div>

      {/* Next Prayer Card */}
      {nextPrayer && (
        <div
          className="relative rounded-3xl overflow-hidden p-5"
          style={{ background: "linear-gradient(135deg, #0D2218 0%, #0C1E1A 50%, #091510 100%)" }}
        >
          {/* Decorative rings */}
          <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full border border-primary/10 pointer-events-none" />
          <div className="absolute -right-5 -top-5 w-28 h-28 rounded-full border border-primary/08 pointer-events-none" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-primary mb-1">Next Prayer</p>
              <p
                className="text-[26px] font-bold text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >{nextPrayer.name}</p>
              <p className="text-sm text-white/50 mt-0.5">{nextPrayer.arabic} · {nextPrayer.time}</p>
            </div>
            <div className="text-right">
              <p
                className="text-4xl font-bold text-primary"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >2:15</p>
              <p className="text-xs text-white/40 mt-0.5">remaining</p>
            </div>
          </div>

          {/* Progress strip */}
          <div className="flex gap-1.5 mt-5">
            {prayers.map((p) => (
              <div
                key={p.id}
                className="flex-1 h-1 rounded-full transition-colors"
                style={{
                  backgroundColor: p.done ? "#10B981" : p.id === nextPrayer.id ? "rgba(16,185,129,0.35)" : "rgba(255,255,255,0.08)",
                }}
              />
            ))}
          </div>
          <p className="text-[11px] text-white/35 mt-2">{doneCount} of 5 prayers completed today</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Streak",  value: "23",   unit: "days",  icon: "🔥", color: "#F97316" },
          { label: "Quran",   value: "45",   unit: "pages", icon: "📖", color: "#60A5FA" },
          { label: "Dhikr",   value: "1.4k", unit: "today", icon: "📿", color: "#A78BFA" },
        ].map(({ label, value, unit, icon, color }) => (
          <div key={label} className="bg-card border border-white/5 rounded-2xl p-4 text-center">
            <span className="text-xl">{icon}</span>
            <p
              className="text-[18px] font-bold mt-1.5"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color }}
            >{value}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{unit}</p>
          </div>
        ))}
      </div>

      {/* Today's Prayers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-[13px]">Today&apos;s Prayers</h3>
          <span className="text-xs text-primary font-semibold">{doneCount}/5</span>
        </div>
        <div className="space-y-2">
          {prayers.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl border transition-all ${
                p.done ? "bg-primary/10 border-primary/20" : "bg-card border-white/5"
              }`}
            >
              <span className="text-xl">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.arabic}</p>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{p.time}</p>
              </div>
              <button
                onClick={() => onToggle(p.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  p.done ? "bg-primary border-primary" : "border-white/20"
                }`}
              >
                {p.done && <Check size={12} strokeWidth={3} className="text-white" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Habits strip */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white text-[13px]">Daily Habits</h3>
          <span className="text-xs text-muted-foreground">5/7 done</span>
        </div>
        <div className="bg-card border border-white/5 rounded-2xl p-4">
          <div className="flex gap-2.5 mb-3.5">
            {["🌅","🌙","📖","💝","✅"].map((e, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-[18px]">{e}</div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            ))}
            {["🌿","🎓"].map((e, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-10 h-10 rounded-xl bg-secondary border border-white/5 flex items-center justify-center text-[18px]">{e}</div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
              </div>
            ))}
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: "71%" }} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">71% complete today</p>
        </div>
      </div>
    </div>
  );
}

// ─── PRAYER ──────────────────────────────────────────────────────────────────

function PrayerScreen({ prayers, onToggle }: { prayers: Prayer[]; onToggle: (id: string) => void }) {
  const doneCount = prayers.filter(p => p.done).length;
  return (
    <div className="px-5 pb-6 space-y-5">
      <div>
        <h2 className="text-[22px] font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Prayer Tracker</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Monday, July 28, 2026</p>
      </div>

      {/* Streak + Today */}
      <div className="flex gap-3">
        <div className="flex-1 bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-[22px] font-bold text-orange-400" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>23</p>
            <p className="text-[11px] text-muted-foreground">day streak</p>
          </div>
        </div>
        <div className="flex-1 bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-3">
          <ProgressRing value={doneCount} max={5} size={40} strokeWidth={5} color="#10B981" trackColor="rgba(16,185,129,0.12)" />
          <div>
            <p className="text-[22px] font-bold text-primary" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{doneCount}/5</p>
            <p className="text-[11px] text-muted-foreground">today</p>
          </div>
        </div>
      </div>

      {/* Prayers */}
      <div>
        <h3 className="font-semibold text-white text-[13px] mb-3">Today&apos;s Salah</h3>
        <div className="space-y-2.5">
          {prayers.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all ${
                p.done ? "bg-primary/10 border-primary/20" : "bg-card border-white/5"
              }`}
            >
              <span className="text-2xl">{p.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white text-[15px]">{p.name}</p>
                  {p.done && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/20 text-primary font-bold">Done</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{p.arabic} · {p.time}</p>
              </div>
              <button
                onClick={() => onToggle(p.id)}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  p.done ? "bg-primary border-primary" : "border-white/20"
                }`}
              >
                {p.done && <Check size={13} strokeWidth={3} className="text-white" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Calendar */}
      <div>
        <h3 className="font-semibold text-white text-[13px] mb-3">July 2026</h3>
        <div className="bg-card border border-white/5 rounded-2xl p-4">
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <p key={i} className="text-[9px] text-muted-foreground text-center font-bold uppercase pb-1.5">{d}</p>
            ))}
            {/* Offset: July 2026 starts on Wednesday (offset 3) */}
            {[0,1,2].map(i => <div key={i} />)}
            {CALENDAR_COUNTS.map((count, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold cursor-default"
                style={{
                  backgroundColor: count === 5 ? "#10B981" : count >= 3 ? "#10B98140" : count >= 1 ? "#10B98120" : "#1A2535",
                  color: count === 5 ? "#fff" : count >= 1 ? "#10B981" : "#6B7A90",
                }}
              >{i + 1}</div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 mt-1 border-t border-white/5">
            <span className="text-xs text-muted-foreground">Monthly completion</span>
            <span className="text-sm font-bold text-primary">85%</span>
          </div>
        </div>
      </div>

      {/* Monthly stats */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Week avg",     value: "32/35",  color: "text-blue-400"   },
          { label: "Month avg",    value: "128/150",color: "text-purple-400" },
          { label: "Best streak",  value: "34 days",color: "text-orange-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-white/5 rounded-2xl p-3 text-center">
            <p className={`text-[13px] font-bold ${color}`}>{value}</p>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QURAN ───────────────────────────────────────────────────────────────────

function QuranScreen() {
  const [page, setPage] = useState(45);
  const pct = Math.round((page / 604) * 100);

  return (
    <div className="px-5 pb-6 space-y-5">
      <div>
        <h2 className="text-[22px] font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Quran Tracker</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Surah Al-Baqarah</p>
      </div>

      {/* Progress Hero */}
      <div className="bg-card border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-4">
        <div className="relative">
          <ProgressRing value={page} max={604} size={168} strokeWidth={13} color="#60A5FA" trackColor="rgba(96,165,250,0.08)" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{pct}%</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">complete</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-white">Surah Al-Baqarah</p>
          <p className="text-[13px] text-muted-foreground mt-0.5">Page {page} of 604 · Verse 231</p>
        </div>
        <div className="flex gap-2.5 w-full">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex-1 py-3 rounded-2xl bg-secondary text-[13px] text-muted-foreground hover:text-white border border-white/5 transition-colors font-medium"
          >← Prev</button>
          <button
            onClick={() => setPage(p => Math.min(604, p + 1))}
            className="flex-1 py-3 rounded-2xl bg-primary text-white text-[13px] font-bold hover:bg-emerald-600 transition-colors"
          >Continue →</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: "Streak",    value: "23d",  color: "#F97316" },
          { label: "This week", value: "35pg", color: "#60A5FA" },
          { label: "Juz done",  value: "1/30", color: "#A78BFA" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-white/5 rounded-2xl p-3.5 text-center">
            <p className="text-[18px] font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color }}>{value}</p>
            <p className="text-[9px] text-muted-foreground mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* Bookmark CTA */}
      <div
        className="flex items-center gap-3 p-4 rounded-2xl border"
        style={{ background: "rgba(96,165,250,0.06)", borderColor: "rgba(96,165,250,0.2)" }}
      >
        <span className="text-2xl">🔖</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Bookmark: Page 45</p>
          <p className="text-xs text-muted-foreground mt-0.5">Al-Baqarah · Verse 231</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>

      {/* Recent Sessions */}
      <div>
        <h3 className="font-semibold text-white text-[13px] mb-3">Recent Sessions</h3>
        <div className="space-y-2.5">
          {SESSIONS.map(({ date, surah, pages, dur, n }) => (
            <div
              key={date}
              className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                <BookOpen size={16} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{surah} · pp {pages}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white">{n} pg</p>
                <p className="text-[10px] text-muted-foreground">{dur}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DHIKR ───────────────────────────────────────────────────────────────────

function DhikrScreen() {
  const [selected, setSelected] = useState(0);
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  const dhikr = DHIKR_OPTIONS[selected];
  const count = counts[selected];
  const achieved = count >= dhikr.goal;

  const increment = () =>
    setCounts(c => { const n = [...c]; n[selected] = Math.min(n[selected] + 1, 9999); return n; });
  const reset = () =>
    setCounts(c => { const n = [...c]; n[selected] = 0; return n; });

  return (
    <div className="px-5 pb-6 space-y-5">
      <div>
        <h2 className="text-[22px] font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Dhikr Counter</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Digital Tasbih</p>
      </div>

      {/* Selector chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {DHIKR_OPTIONS.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setSelected(i)}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-all"
            style={
              selected === i
                ? { backgroundColor: "#D4A843", color: "#0B0F14", borderColor: "#D4A843" }
                : { backgroundColor: "transparent", color: "#6B7A90", borderColor: "rgba(255,255,255,0.08)" }
            }
          >{d.transliteration}</button>
        ))}
      </div>

      {/* Counter card */}
      <div className="bg-card border border-white/5 rounded-3xl p-6 flex flex-col items-center gap-5">
        {/* Ring */}
        <div className="relative">
          <ProgressRing
            value={count} max={dhikr.goal} size={190} strokeWidth={15}
            color="#D4A843" trackColor="rgba(212,168,67,0.08)"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className="text-6xl font-bold text-white"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >{count}</p>
            <p className="text-sm text-muted-foreground mt-1">/ {dhikr.goal}</p>
          </div>
        </div>

        {/* Arabic text */}
        <div className="text-center">
          <p
            className="text-[26px] font-bold text-white mb-1.5"
            style={{ direction: "rtl", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >{dhikr.arabic}</p>
          <p className="text-sm font-bold text-primary">{dhikr.transliteration}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{dhikr.translation}</p>
        </div>

        {achieved && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl w-full justify-center"
            style={{ backgroundColor: "rgba(212,168,67,0.12)", border: "1px solid rgba(212,168,67,0.3)" }}
          >
            <span>✨</span>
            <span className="text-sm font-bold" style={{ color: "#D4A843" }}>Masha&apos;Allah! Goal achieved!</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={reset}
            className="w-14 h-14 rounded-2xl bg-secondary border border-white/5 flex items-center justify-center hover:bg-[#1f2e45] transition-colors"
          >
            <RotateCcw size={18} className="text-muted-foreground" />
          </button>
          <button
            onClick={increment}
            className="flex-1 h-14 rounded-2xl font-bold text-[17px] transition-transform active:scale-95"
            style={{ background: "linear-gradient(135deg, #D4A843 0%, #F59E0B 100%)", color: "#0B0F14" }}
          >+ Count</button>
        </div>
      </div>

      {/* All dhikr progress */}
      <div>
        <h3 className="font-semibold text-white text-[13px] mb-3">Today&apos;s Progress</h3>
        <div className="space-y-2.5">
          {DHIKR_OPTIONS.map((d, i) => (
            <div key={d.id} className="p-3.5 rounded-2xl bg-card border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-white">{d.transliteration}</span>
                <span
                  className="text-xs font-bold"
                  style={{ color: counts[i] >= d.goal ? "#D4A843" : "#6B7A90" }}
                >{counts[i]}/{d.goal}</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((counts[i] / d.goal) * 100, 100)}%`,
                    backgroundColor: counts[i] >= d.goal ? "#D4A843" : "#10B981",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

function ProfileScreen() {
  return (
    <div className="pb-6 space-y-5">
      {/* Hero */}
      <div className="px-5">
        <div
          className="relative rounded-3xl overflow-hidden px-6 pt-8 pb-6 text-center"
          style={{ background: "linear-gradient(180deg, #0D2218 0%, #091510 100%)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.12) 0%, transparent 60%)" }}
          />
          <div
            className="w-20 h-20 rounded-[22px] mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: "linear-gradient(135deg, #10B981, #059669)" }}
          >A</div>
          <h2
            className="text-[20px] font-bold text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >Ahmad Hassan</h2>
          <p className="text-sm text-primary font-semibold mt-0.5">Premium Member</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span
              className="text-[11px] px-3 py-1.5 rounded-full font-bold"
              style={{ backgroundColor: "rgba(212,168,67,0.15)", color: "#D4A843", border: "1px solid rgba(212,168,67,0.3)" }}
            >⭐ Gold Tier</span>
            <span
              className="text-[11px] px-3 py-1.5 rounded-full font-bold"
              style={{ backgroundColor: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)" }}
            >847 XP</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5">
        <h3 className="font-semibold text-white text-[13px] mb-3">My Stats</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Prayer Rate",  value: "91%",   color: "#10B981" },
            { label: "Habit Rate",   value: "78%",   color: "#60A5FA" },
            { label: "Quran Pages",  value: "45",    color: "#A78BFA" },
            { label: "Streak",       value: "23d",   color: "#F97316" },
            { label: "Dhikr Total",  value: "4.2k",  color: "#D4A843" },
            { label: "Active Days",  value: "89",    color: "#34D399" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-white/5 rounded-2xl p-3.5 text-center">
              <p className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color }}>{value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="px-5">
        <h3 className="font-semibold text-white text-[13px] mb-3">Achievements</h3>
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ACHIEVEMENTS.map(({ icon, name, desc }) => (
            <div
              key={name}
              className="flex-shrink-0 w-28 bg-card border border-white/5 rounded-2xl p-3.5 text-center hover:border-white/10 transition-colors"
            >
              <span className="text-3xl">{icon}</span>
              <p className="text-xs font-semibold text-white mt-2 leading-snug">{name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-5">
        <h3 className="font-semibold text-white text-[13px] mb-3">Settings</h3>
        <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
          {[
            { icon: "🔔", label: "Notifications",      sub: "Prayer reminders on" },
            { icon: "🕌", label: "Prayer Times Setup",  sub: "Makkah · Auto-detect" },
            { icon: "🌐", label: "Language",             sub: "English"              },
            { icon: "💎", label: "Premium Plan",         sub: "Active until Dec 2026" },
            { icon: "🔒", label: "Privacy & Security",  sub: "2FA enabled"          },
          ].map(({ icon, label, sub }, i, arr) => (
            <button
              key={label}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left ${
                i < arr.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <span className="text-[18px]">{icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <div className="px-5">
        <button className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 hover:bg-red-500/15 transition-colors">
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "home",    label: "Home",    icon: Home     },
  { id: "prayer",  label: "Prayer",  icon: Moon     },
  { id: "quran",   label: "Quran",   icon: BookOpen },
  { id: "dhikr",   label: "Dhikr",   icon: Hash     },
  { id: "profile", label: "Profile", icon: User     },
];

function TabBar({ active, onNav }: { active: string; onNav: (id: string) => void }) {
  return (
    <div
      className="flex items-center justify-around px-2 pt-2 pb-1 border-t border-white/5 flex-shrink-0"
      style={{ backgroundColor: "#0E1520" }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            onClick={() => onNav(id)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all"
          >
            <div className={`p-1.5 rounded-xl transition-all ${on ? "bg-primary/15" : ""}`}>
              <Icon
                size={21}
                className={on ? "text-primary" : "text-muted-foreground"}
                strokeWidth={on ? 2.5 : 1.75}
              />
            </div>
            <span
              className={`text-[9px] font-bold uppercase tracking-wide ${on ? "text-primary" : "text-muted-foreground"}`}
            >{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [prayers, setPrayers] = useState<Prayer[]>(INITIAL_PRAYERS);

  const togglePrayer = (id: string) =>
    setPrayers(ps => ps.map(p => p.id === id ? { ...p, done: !p.done } : p));

  const renderPage = () => {
    switch (activePage) {
      case "home":    return <HomeScreen    prayers={prayers} onToggle={togglePrayer} />;
      case "prayer":  return <PrayerScreen  prayers={prayers} onToggle={togglePrayer} />;
      case "quran":   return <QuranScreen />;
      case "dhikr":   return <DhikrScreen />;
      case "profile": return <ProfileScreen />;
      default:        return <HomeScreen    prayers={prayers} onToggle={togglePrayer} />;
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{
        background: [
          "radial-gradient(ellipse at 20% 20%, rgba(16,185,129,0.07) 0%, transparent 55%)",
          "radial-gradient(ellipse at 80% 80%, rgba(212,168,67,0.05) 0%, transparent 55%)",
          "radial-gradient(ellipse at 60% 10%, rgba(96,165,250,0.04) 0%, transparent 40%)",
          "#050709",
        ].join(", "),
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Phone Shell */}
      <div
        className="relative flex flex-col"
        style={{
          width: 390,
          height: 844,
          borderRadius: 52,
          border: "1.5px solid rgba(255,255,255,0.13)",
          backgroundColor: "#0B0F14",
          boxShadow: [
            "0 0 0 1px rgba(255,255,255,0.025) inset",
            "0 1px 0 rgba(255,255,255,0.18) inset",
            "0 -1px 0 rgba(0,0,0,0.5) inset",
            "0 40px 80px rgba(0,0,0,0.85)",
            "0 8px 32px rgba(0,0,0,0.6)",
            "0 0 120px rgba(16,185,129,0.04)",
          ].join(", "),
          flexShrink: 0,
        }}
      >
        {/* Screen gloss */}
        <div
          className="absolute inset-0 pointer-events-none z-30 rounded-[50px]"
          style={{
            background: "linear-gradient(150deg, rgba(255,255,255,0.04) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.01) 100%)",
          }}
        />

        {/* Status Bar */}
        <StatusBar />

        {/* Scrollable page content */}
        <div
          className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingTop: 4 }}
        >
          {renderPage()}
        </div>

        {/* Tab Bar */}
        <TabBar active={activePage} onNav={setActivePage} />

        {/* Home indicator */}
        <div className="flex justify-center pt-1 pb-2 flex-shrink-0">
          <div className="w-32 h-[5px] bg-white/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
