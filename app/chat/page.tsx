"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type Source = {
  practice_id: number;
  practice_name: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  primary_location: string;
  other_location: string;
  similarity_score: number;
};

const getHostname = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch (error) {
    console.error(error);
    return url;
  }
};

const suggestions = [
  "Find a practice that treats anxiety and depression, I have Anthem Blue Cross Blue Shield. They must accept new patients and in person",
  "I have OCD and I would like to see a female psychiatrist. I have cigna insurance and I am only available after 5pm or on Saturday",
  "What's the cash cost for an ADHD evaluation for my 13-year-old?- Show me Providers in Chapel Hill only?",
  "I am running out of my medication - which practice can help me faster?",
];

export default function PublicChatPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = "rdu-chat-session:global";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      setSessionId(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !sessionId) {
      return;
    }
    window.localStorage.setItem(storageKey, sessionId);
  }, [sessionId, storageKey]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) {
      return;
    }
    const pendingMessage: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, pendingMessage]);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiBase}/api/v1/rag/public/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });
      if (!response.ok) {
        throw new Error("Unable to fetch response");
      }
      const payload = await response.json();
      setSessionId(payload.sessionId ?? sessionId);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            payload.response ?? "I didn't find anything, but I'm here to help.",
        },
      ]);
      setSources(payload.sources ?? []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleSourceClick = async (source: Source) => {
    if (!source.website) {
      return;
    }
    window.open(source.website, "_blank", "noopener,noreferrer");
    if (!apiBase) {
      return;
    }
    try {
      await fetch(`${apiBase}/api/v1/analytics/public/analytics/url-click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: source.website,
          practiceId: source.practice_id,
          sessionId,
        }),
      });
    } catch (err) {
      console.error("Error tracking click:", err);
    }
  };

  const handleMarkdownLinkClick = async (url: string) => {
    // Open the link in a new tab
    window.open(url, "_blank", "noopener,noreferrer");

    // Track the click if we have API access
    if (!apiBase) {
      return;
    }

    // Try to find matching practice ID from sources
    let practiceId: number | null = null;
    const matchingSource = sources.find((source) => {
      if (!source.website) return false;

      // Normalize URLs for comparison
      const sourceUrl = source.website
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");
      const clickedUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

      // Check if clicked URL contains the source URL or vice versa
      return clickedUrl.includes(sourceUrl) || sourceUrl.includes(clickedUrl);
    });
    if (matchingSource) {
      practiceId = matchingSource.practice_id;
      console.log(
        `Markdown link matched to practice: ${matchingSource.practice_name} (ID: ${practiceId})`
      );
    } else {
      console.log(`Markdown link not matched to any practice: ${url}`);
    }

    try {
      const response = await fetch(
        `${apiBase}/api/v1/analytics/public/analytics/url-click`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: url,
            practiceId: practiceId,
            sessionId,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          "Analytics request failed:",
          response.status,
          response.statusText
        );
      }
    } catch (err) {
      console.error("Error tracking markdown link click:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f7f8ff] via-white to-[#edf2ff] px-4 py-10 text-slate-900">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              RDU Mental Health
            </span>
            <h1 className="text-3xl font-semibold text-slate-900">
              Discover Mental Health Providers
            </h1>
            <p className="text-sm text-slate-500">
              Global search · Raleigh · Durham · Chapel Hill
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-blue-600 shadow">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> AI Powered
          </div>
        </header>

        {!apiBase && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow">
            Configure <code>NEXT_PUBLIC_API_BASE_URL</code> to connect this page
            to the live API.
          </p>
        )}

        {messages.length === 0 && (
          <section className="rounded-[32px] bg-white/80 p-8 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-semibold">
                  Looking for mental health services?
                </h2>
                <p className="text-sm text-slate-600">
                  I&apos;ll help you find the right mental health provider for
                  your unique needs (see examples below)
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleSuggestion(suggestion)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-6 rounded-[32px] border border-white/60 bg-white/90 p-8 shadow-xl backdrop-blur">
          <div className="flex max-h-[380px] flex-col gap-4 overflow-y-auto pr-2">
            {messages.length === 0 && !loading && (
              <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-500">
                Ask about services, insurance, or availability anywhere in the
                Triangle and we&apos;ll suggest matching practices.
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                  message.role === "user"
                    ? "self-end bg-blue-600 text-white"
                    : "self-start bg-white text-slate-800"
                }`}
              >
                {message.role === "user" ? (
                  <div className="whitespace-pre-line">{message.content}</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            if (href) {
                              handleMarkdownLinkClick(href);
                            }
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {children}
                        </a>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-lg font-semibold mb-2 text-slate-900">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-semibold mb-2 text-slate-900">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-semibold mb-1 text-slate-900">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="ml-2">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-slate-900">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-3 self-start rounded-2xl bg-white px-5 py-3 text-sm text-slate-500 shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />{" "}
                Thinking…
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          {sources.length > 0 && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Matching Healthcare Practices
                </h3>
                <p className="text-sm text-slate-600">
                  Tap a practice to learn more, visit their site, or schedule an
                  appointment.
                </p>
              </div>
              <ol className="space-y-4">
                {sources.map((source, index) => (
                  <li
                    key={source.practice_id}
                    className="rounded-2xl bg-white p-4 shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {index + 1}. {source.practice_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Match: {Math.round(source.similarity_score * 100)}%
                        </p>

                        {/* Address and Location Information */}
                        {(source.address ||
                          source.city ||
                          source.state ||
                          source.zip) && (
                          <div className="mt-2 text-xs text-slate-600">
                            <p className="font-medium text-slate-700">
                              Location:
                            </p>
                            {source.address && <p>{source.address}</p>}
                            {(source.city || source.state || source.zip) && (
                              <p>
                                {[source.city, source.state, source.zip]
                                  .filter(Boolean)
                                  .join(", ")}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Primary Location */}
                        {source.primary_location && (
                          <div className="mt-1 text-xs text-slate-600">
                            <span className="font-medium text-slate-700">
                              Primary Area:
                            </span>{" "}
                            {source.primary_location}
                          </div>
                        )}

                        {/* Other Locations */}
                        {source.other_location && (
                          <div className="mt-1 text-xs text-slate-600">
                            <span className="font-medium text-slate-700">
                              Other Locations:
                            </span>{" "}
                            {source.other_location}
                          </div>
                        )}
                      </div>

                      {source.website && (
                        <button
                          type="button"
                          onClick={() => handleSourceClick(source)}
                          className="text-xs font-semibold text-blue-600 hover:underline whitespace-nowrap"
                        >
                          Visit site
                        </button>
                      )}
                    </div>

                    {source.website && (
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                        <span>{getHostname(source.website)}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="In a few words, please describe your unique situation."
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                rows={1}
                style={{ minHeight: "48px", maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height =
                    Math.min(target.scrollHeight, 120) + "px";
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
