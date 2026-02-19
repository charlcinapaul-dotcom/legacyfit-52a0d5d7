import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type Msg = { role: "user" | "assistant"; content: string };

interface ChallengeContext {
  name: string;
  title: string;
  totalMiles: number;
  milestones: { name: string; miles: number }[];
  userMiles: number;
  days: number;
}

interface LegacyGuideProps {
  challengeContext: ChallengeContext;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legacy-guide`;
const DAILY_MSG_LIMIT = 15;
const STORAGE_KEY = "legacy_guide_daily_msgs";

function getDailyCount(): { date: string; count: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.date === new Date().toISOString().slice(0, 10)) {
        return parsed;
      }
    }
  } catch {}
  return { date: new Date().toISOString().slice(0, 10), count: 0 };
}

function incrementDailyCount(): number {
  const current = getDailyCount();
  const updated = { date: new Date().toISOString().slice(0, 10), count: current.count + 1 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated.count;
}

async function streamChat({
  messages,
  challengeContext,
  onDelta,
  onDone,
  signal,
}: {
  messages: Msg[];
  challengeContext: ChallengeContext;
  onDelta: (text: string) => void;
  onDone: () => void;
  signal?: AbortSignal;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, challengeContext }),
    signal,
  });

  if (!resp.ok || !resp.body) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed (${resp.status})`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { onDone(); return; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

export function LegacyGuide({ challengeContext }: LegacyGuideProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [dailyCount, setDailyCount] = useState(() => getDailyCount().count);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const isAtLimit = dailyCount >= DAILY_MSG_LIMIT;

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || isAtLimit) return;

    const userMsg: Msg = { role: "user", content: text };
    setInput("");
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const newCount = incrementDailyCount();
    setDailyCount(newCount);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantSoFar } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        challengeContext,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error("Legacy Guide error:", e);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I'm having trouble connecting right now. Please try again." },
      ]);
    }
  }, [input, isLoading, messages, challengeContext, isAtLimit]);

  const suggestions = [
    "How does this challenge work?",
    "What are the milestones?",
    "How do I earn stamps?",
  ];

  // Don't render anything if not authenticated
  if (!session) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-cyan text-background shadow-lg shadow-cyan/30 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open Legacy Guide"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Legacy Guide</h3>
            <p className="text-xs text-muted-foreground">Your challenge companion</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center py-2">
              I'm here to help you with your <span className="text-cyan font-medium">{challengeContext.name}</span> challenge. Ask me anything!
            </p>
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); }}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg border border-border hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isAtLimit}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap",
              msg.role === "user"
                ? "ml-auto bg-cyan text-background"
                : "bg-secondary text-foreground"
            )}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Thinking…</span>
          </div>
        )}
      </div>

      {/* Daily limit banner */}
      {isAtLimit && (
        <div className="px-4 py-2 bg-secondary/80 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Daily limit reached ({DAILY_MSG_LIMIT} messages). Resets tomorrow.</span>
          </div>
        </div>
      )}

      {/* Message count */}
      {!isAtLimit && dailyCount > 0 && (
        <div className="px-4 pt-1 text-xs text-muted-foreground text-right">
          {DAILY_MSG_LIMIT - dailyCount} messages remaining today
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-border">
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAtLimit ? "Daily limit reached" : "Ask Legacy Guide…"}
            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan"
            disabled={isLoading || isAtLimit}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading || isAtLimit}
            className="bg-cyan text-background hover:bg-cyan/90 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
