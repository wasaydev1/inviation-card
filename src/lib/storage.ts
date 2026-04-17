export interface PlayerStats {
  username: string;
  xp: number;
  level: number;
  bestWpm: number;
  bestAccuracy: number;
  racesCompleted: number;
  racesWon: number;
  totalWpm: number; // for averaging
}

export interface LeaderboardEntry {
  username: string;
  wpm: number;
  accuracy: number;
  date: number;
}

const STATS_KEY = "typer:stats";
const LB_KEY = "typer:leaderboard";

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.5));
}

export function levelFromXp(xp: number): { level: number; progress: number; nextXp: number } {
  let level = 1;
  let remaining = xp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const nextXp = xpForLevel(level);
  return { level, progress: remaining, nextXp };
}

const DEFAULT_STATS: PlayerStats = {
  username: "Guest",
  xp: 0,
  level: 1,
  bestWpm: 0,
  bestAccuracy: 0,
  racesCompleted: 0,
  racesWon: 0,
  totalWpm: 0,
};

export function getStats(): PlayerStats {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveStats(stats: PlayerStats): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function setUsername(username: string): void {
  const s = getStats();
  saveStats({ ...s, username: username.trim().slice(0, 20) || "Guest" });
}

export function recordRace(opts: {
  wpm: number;
  accuracy: number;
  won: boolean;
}): PlayerStats {
  const s = getStats();
  const xpGain = Math.round(opts.wpm + opts.accuracy * 0.5 + (opts.won ? 50 : 10));
  const next: PlayerStats = {
    ...s,
    xp: s.xp + xpGain,
    bestWpm: Math.max(s.bestWpm, opts.wpm),
    bestAccuracy: Math.max(s.bestAccuracy, opts.accuracy),
    racesCompleted: s.racesCompleted + 1,
    racesWon: s.racesWon + (opts.won ? 1 : 0),
    totalWpm: s.totalWpm + opts.wpm,
  };
  next.level = levelFromXp(next.xp).level;
  saveStats(next);
  addLeaderboardEntry({
    username: next.username,
    wpm: opts.wpm,
    accuracy: opts.accuracy,
    date: Date.now(),
  });
  return next;
}

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return SEED_LEADERBOARD;
  try {
    const raw = localStorage.getItem(LB_KEY);
    const own: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    return [...SEED_LEADERBOARD, ...own]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, 50);
  } catch {
    return SEED_LEADERBOARD;
  }
}

export function addLeaderboardEntry(entry: LeaderboardEntry): void {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(LB_KEY);
  const own: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
  own.push(entry);
  localStorage.setItem(LB_KEY, JSON.stringify(own.slice(-100)));
}

const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { username: "NeonShark", wpm: 142, accuracy: 98.4, date: Date.now() },
  { username: "QuantumKey", wpm: 138, accuracy: 97.1, date: Date.now() },
  { username: "VoltageQueen", wpm: 131, accuracy: 99.0, date: Date.now() },
  { username: "ByteRunner", wpm: 127, accuracy: 96.5, date: Date.now() },
  { username: "GlitchPilot", wpm: 121, accuracy: 95.8, date: Date.now() },
  { username: "PulseDriver", wpm: 118, accuracy: 97.7, date: Date.now() },
  { username: "ChromeFury", wpm: 114, accuracy: 96.0, date: Date.now() },
  { username: "SynthRider", wpm: 109, accuracy: 94.2, date: Date.now() },
  { username: "HexBlaze", wpm: 104, accuracy: 95.1, date: Date.now() },
  { username: "EchoNova", wpm: 99, accuracy: 93.4, date: Date.now() },
];
