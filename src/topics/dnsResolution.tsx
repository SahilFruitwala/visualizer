import { ApiFlow, TlsMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { withCodeLines } from "../engine/codeLines";
import { C, FONT_MONO, FONT_SANS, mixProp } from "../theme";

type Phase = "cache-miss" | "to-resolver" | "to-root" | "to-tld" | "tld-reply" | "to-auth" | "auth-reply" | "resolver-reply" | "cached";

interface Step extends StepBase {
  phase: Phase;
  activeSide: "client" | "server" | "both" | "none";
  direction: "right" | "left" | "both";
  clientLabel: string;
  serverLabel: string;
  query?: string;
  answer?: string;
}

function build(): Step[] {
  return [
    {
      phase: "cache-miss",
      activeSide: "client",
      direction: "right",
      clientLabel: "Browser",
      serverLabel: "Browser Cache",
      query: "api.example.com?",
      chapter: "Cache miss",
      caption: "Browser needs api.example.com — not in browser DNS cache.",
    },
    {
      phase: "to-resolver",
      activeSide: "client",
      direction: "right",
      clientLabel: "Browser",
      serverLabel: "Recursive Resolver",
      query: "A api.example.com",
      chapter: "Recursive resolver",
      caption: "Browser asks the ISP/OS recursive resolver (e.g. 8.8.8.8).",
    },
    {
      phase: "to-root",
      activeSide: "client",
      direction: "right",
      clientLabel: "Resolver",
      serverLabel: "Root Server",
      query: "NS .com",
      chapter: "Root server",
      caption: "Resolver asks a root server where to find the .com TLD nameservers.",
    },
    {
      phase: "to-tld",
      activeSide: "client",
      direction: "right",
      clientLabel: "Resolver",
      serverLabel: "TLD (.com)",
      query: "NS example.com",
      chapter: "TLD server",
      caption: "Resolver doesn't know the IP → queries .com TLD for authoritative NS.",
    },
    {
      phase: "tld-reply",
      activeSide: "server",
      direction: "left",
      clientLabel: "Resolver",
      serverLabel: "TLD (.com)",
      answer: "NS example.com → authoritative NS",
      chapter: "TLD reply",
      caption: "TLD returns the authoritative nameserver for example.com.",
    },
    {
      phase: "to-auth",
      activeSide: "client",
      direction: "right",
      clientLabel: "Resolver",
      serverLabel: "Authoritative NS",
      query: "A api.example.com",
      chapter: "Authoritative",
      caption: "Resolver asks the authoritative server for the A record.",
    },
    {
      phase: "auth-reply",
      activeSide: "server",
      direction: "left",
      clientLabel: "Resolver",
      serverLabel: "Authoritative NS",
      answer: "A api.example.com → 93.184.216.34",
      chapter: "A record",
      caption: "Authoritative server returns A record: 93.184.216.34.",
    },
    {
      phase: "resolver-reply",
      activeSide: "server",
      direction: "left",
      clientLabel: "Browser",
      serverLabel: "Recursive Resolver",
      answer: "93.184.216.34 (cached at resolver)",
      chapter: "IP returned",
      caption: "Resolver caches the answer (TTL) and returns IP to browser. ✓",
    },
    {
      phase: "cached",
      activeSide: "both",
      direction: "both",
      clientLabel: "Browser",
      serverLabel: "Browser Cache",
      answer: "93.184.216.34 (TTL remaining)",
      chapter: "Cached",
      caption: "Next lookup hits browser cache until TTL expires.",
    },
  ];
}

const CODE = `// DNS resolution (simplified)
// 1. Browser cache miss → ask recursive resolver
// 2. Resolver → root → TLD (.com) → authoritative NS
// 3. Authoritative returns A record (IP)
// 4. Answer cached at resolver + browser (TTL)

// dig shows the chain:
// dig +trace api.example.com

// Then TCP connect to the IP (see TCP handshake)`;

const DNS_STEPS = withCodeLines(build(), (s) => {
  if (s.phase === "cache-miss") return [0, 1];
  if (s.phase === "to-resolver" || s.phase === "to-root" || s.phase === "to-tld" || s.phase === "to-auth") return [2, 3, 4];
  if (s.phase === "auth-reply" || s.phase === "tld-reply" || s.phase === "resolver-reply") return [5, 6];
  return [7, 8];
});

export const dnsResolution: Topic = {
  id: "dns-resolution",
  title: "DNS Resolution",
  category: "Protocol",
  blurb: "From hostname to IP — cache, resolver, TLD, authoritative.",
  prerequisites: ["http-lifecycle"],
  create: () =>
    defineViz<Step>({
      steps: DNS_STEPS,
      code: CODE,
      explanation:
        "DNS translates human-readable hostnames into IP addresses. The browser checks its cache first, then delegates to a recursive resolver. The resolver walks the DNS hierarchy: root hints → TLD (.com) → authoritative nameserver for the domain.\n\nAnswers are cached at each layer with a TTL. Only after DNS succeeds can the client perform the TCP three-way handshake to the resolved IP.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <ApiFlow
            phase={s.phase.replace(/-/g, " ").toUpperCase()}
            activeSide={s.activeSide}
            direction={s.direction}
            clientLabel={s.clientLabel}
            serverLabel={s.serverLabel}
          />
          {s.query && (
            <TlsMessage direction="client" label="DNS Query" detail={s.query} highlight />
          )}
          {s.answer && (
            <TlsMessage direction="server" label="DNS Answer" detail={s.answer} highlight />
          )}
          {s.phase === "cached" && (
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                background: mixProp("sorted", 13),
                border: `2px solid ${C.sortedBorder}`,
                fontFamily: FONT_SANS,
                fontSize: 13,
                fontWeight: 600,
                color: C.text,
              }}
            >
              <span style={{ fontFamily: FONT_MONO, color: C.sorted }}>93.184.216.34</span> ready for TCP connect
            </div>
          )}
        </div>
      ),
    }),
};
