import { ApiFlow, HttpMessage, TlsMessage } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

type Phase = "tcp" | "client-hello" | "server-hello" | "verify" | "key-exchange" | "encrypted" | "http";

interface Step extends StepBase {
  phase: Phase;
  activeSide: "client" | "server" | "both" | "none";
  direction: "right" | "left" | "both";
  showTls: boolean;
  showHttp: boolean;
  tlsLabel?: string;
  tlsDetail?: string;
  tlsDir?: "client" | "server";
  encrypted: boolean;
}

function build(): Step[] {
  return [
    {
      phase: "tcp",
      activeSide: "both",
      direction: "both",
      showTls: false,
      showHttp: false,
      encrypted: false,
      caption: "TCP connection established (from HTTP lifecycle). TLS runs on top of TCP.",
    },
    {
      phase: "client-hello",
      activeSide: "client",
      direction: "right",
      showTls: true,
      showHttp: false,
      tlsDir: "client",
      tlsLabel: "ClientHello",
      tlsDetail: "TLS 1.3 · cipher suites · SNI: api.example.com",
      encrypted: false,
      caption: "Client opens TLS: proposes version, ciphers, and the server name (SNI).",
    },
    {
      phase: "server-hello",
      activeSide: "server",
      direction: "left",
      showTls: true,
      showHttp: false,
      tlsDir: "server",
      tlsLabel: "ServerHello + Certificate",
      tlsDetail: "picked cipher · cert for *.example.com · CA-signed chain",
      encrypted: false,
      caption: "Server picks a cipher suite and sends its X.509 certificate chain.",
    },
    {
      phase: "verify",
      activeSide: "client",
      direction: "right",
      showTls: true,
      showHttp: false,
      tlsDir: "client",
      tlsLabel: "Verify certificate",
      tlsDetail: "check hostname · trust store · expiry · revocation",
      encrypted: false,
      caption: "Client verifies the cert matches the hostname and chains to a trusted CA.",
    },
    {
      phase: "key-exchange",
      activeSide: "both",
      direction: "both",
      showTls: true,
      showHttp: false,
      tlsDir: "client",
      tlsLabel: "Key exchange + Finished",
      tlsDetail: "ECDHE shared secret → session keys · both sides send Finished",
      encrypted: false,
      caption: "Ephemeral key exchange derives symmetric session keys. Handshake completes.",
    },
    {
      phase: "encrypted",
      activeSide: "both",
      direction: "both",
      showTls: false,
      showHttp: false,
      encrypted: true,
      caption: "Encrypted tunnel ready — all further bytes are ciphertext on the wire.",
    },
    {
      phase: "http",
      activeSide: "both",
      direction: "both",
      showTls: false,
      showHttp: true,
      encrypted: true,
      caption: "HTTP request/response flows inside the encrypted TLS channel (HTTPS).",
    },
  ];
}

const CODE = `// HTTPS = HTTP over TLS
// URL https://api.example.com/users
//      └─ TLS encrypts everything below the application layer

const res = await fetch("https://api.example.com/users");
// Node/browser:
//   1. TCP connect
//   2. TLS handshake (cert verify, key exchange)
//   3. Send encrypted HTTP request
//   4. Decrypt HTTP response

// Never send secrets over plain http:// — always https://`;

export const tlsHandshake: Topic = {
  id: "tls-handshake",
  title: "TLS Handshake",
  category: "API",
  blurb: "Certificate exchange, verification, and encrypted HTTPS.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "HTTPS is HTTP wrapped in TLS. Before any application data flows, client and server perform a handshake: negotiate ciphers, present a certificate, verify trust, and derive session keys.\n\nThe certificate proves the server identity (bound to a hostname via SAN). After the handshake, all HTTP traffic is encrypted and integrity-protected. This is why bearer tokens and cookies must only travel over HTTPS.",
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <ApiFlow
            phase={s.phase.toUpperCase()}
            activeSide={s.activeSide}
            direction={s.direction}
            clientLabel="Client"
            serverLabel="Server"
          />
          {s.encrypted && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 8,
                background: `${C.sorted}22`,
                border: `2px solid ${C.sortedBorder}`,
                fontFamily: FONT_SANS,
                fontSize: 14,
                fontWeight: 600,
                color: C.text,
              }}
            >
              <span style={{ fontSize: 18 }}>🔒</span> TLS encrypted channel
            </div>
          )}
          {s.showTls && s.tlsDir && (
            <TlsMessage
              direction={s.tlsDir}
              label={s.tlsLabel!}
              detail={s.tlsDetail!}
              highlight={s.phase !== "tcp"}
            />
          )}
          {s.showHttp && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
              <HttpMessage
                direction="request"
                method="GET"
                path="/users"
                headers={[{ name: "Host", value: "api.example.com" }]}
                highlight={["line"]}
              />
              <HttpMessage
                direction="response"
                status={200}
                statusLabel="OK"
                headers={[{ name: "Content-Type", value: "application/json" }]}
                body='{ "id": 1, "name": "Alice" }'
                highlight={["body"]}
              />
            </div>
          )}
          {s.phase === "tcp" && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.textMuted }}>
              SYN → SYN-ACK → ACK
            </div>
          )}
        </div>
      ),
    }),
};
