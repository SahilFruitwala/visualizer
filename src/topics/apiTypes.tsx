import { ParadigmCard } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_SANS } from "../theme";

type Paradigm = "rest" | "graphql" | "grpc" | "soap" | "jsonrpc" | "trpc" | "compare";

interface Step extends StepBase {
  paradigm: Paradigm;
  highlight: string[];
}

const PARADIGMS = {
  rest: {
    name: "REST",
    tagline: "Resource URLs + HTTP verbs",
    request: "GET /users/1\nAccept: application/json",
    response: '{\n  "id": 1,\n  "name": "Alice"\n}',
  },
  graphql: {
    name: "GraphQL",
    tagline: "One endpoint, client picks fields",
    request: 'POST /graphql\nContent-Type: application/json\n\n{\n  "query": "{ user(id: 1) { name email } }"\n}',
    response: '{\n  "data": {\n    "user": {\n      "name": "Alice",\n      "email": "alice@example.com"\n    }\n  }\n}',
  },
  grpc: {
    name: "gRPC",
    tagline: "Typed RPC · Protobuf · HTTP/2",
    request: "RPC user.UserService/GetUser\nContent-Type: application/grpc\n\n[protobuf: { id: 1 }]",
    response: "[protobuf: { id: 1, name: \"Alice\" }]",
  },
  soap: {
    name: "SOAP",
    tagline: "XML envelopes + WSDL contracts",
    request:
      'POST /UserService\nContent-Type: text/xml\nSOAPAction: "GetUser"\n\n<soap:Envelope>\n  <soap:Body>\n    <GetUser><id>1</id></GetUser>\n  </soap:Body>\n</soap:Envelope>',
    response:
      "<soap:Envelope>\n  <soap:Body>\n    <GetUserResponse>\n      <user><id>1</id><name>Alice</name></user>\n    </GetUserResponse>\n  </soap:Body>\n</soap:Envelope>",
  },
  jsonrpc: {
    name: "JSON-RPC",
    tagline: "Named methods over HTTP or WebSocket",
    request: 'POST /\n\n{\n  "jsonrpc": "2.0",\n  "method": "getUser",\n  "params": { "id": 1 },\n  "id": 1\n}',
    response: '{\n  "jsonrpc": "2.0",\n  "result": { "id": 1, "name": "Alice" },\n  "id": 1\n}',
  },
  trpc: {
    name: "tRPC",
    tagline: "End-to-end TypeScript RPC (no codegen)",
    request: 'POST /trpc/user.getById\n\n{ "id": 1 }',
    response: '{\n  "result": {\n    "data": { "id": 1, "name": "Alice" }\n  }\n}',
  },
} as const;

function build(): Step[] {
  return [
    {
      paradigm: "rest",
      chapter: "REST",
      highlight: ["request", "response"],
      caption: "REST: nouns in the URL (/users/1), verbs from HTTP (GET, POST, PUT, DELETE).",
    },
    {
      paradigm: "graphql",
      chapter: "GraphQL",
      highlight: ["request", "response"],
      caption: "GraphQL: always POST /graphql. Query language selects nested fields in one trip.",
    },
    {
      paradigm: "grpc",
      chapter: "gRPC",
      highlight: ["request", "response"],
      caption: "gRPC: call remote procedures by name. Binary Protobuf on HTTP/2 — fast inside datacenters.",
    },
    {
      paradigm: "soap",
      chapter: "SOAP",
      highlight: ["request", "response"],
      caption: "SOAP: XML payloads in envelopes, WSDL describes operations — common in legacy enterprise systems.",
    },
    {
      paradigm: "jsonrpc",
      chapter: "JSON-RPC",
      highlight: ["request", "response"],
      caption: "JSON-RPC: thin RPC wrapper — method + params + id. Used by Ethereum nodes, VS Code extensions, etc.",
    },
    {
      paradigm: "trpc",
      chapter: "tRPC",
      highlight: ["request", "response"],
      caption: "tRPC: TypeScript procedures shared between client and server — types flow without OpenAPI or .proto files.",
    },
    {
      paradigm: "compare",
      chapter: "Compare paradigms",
      highlight: [],
      caption: "No single winner — public APIs often use REST or GraphQL; microservices use gRPC; TS full-stack apps use tRPC.",
    },
  ];
}

const CODE = `// REST — resources on URLs
GET /users/1

// GraphQL — one endpoint, shaped queries
POST /graphql  { query: "{ user(id:1) { name } }" }

// gRPC — .proto contract, generated stubs
user.UserService/GetUser({ id: 1 })

// SOAP — XML envelope (legacy enterprise)
<soap:Body><GetUser><id>1</id></GetUser></soap:Body>

// JSON-RPC — method dispatch
{ "method": "getUser", "params": { "id": 1 }, "id": 1 }

// tRPC — shared TypeScript router
trpc.user.getById.query({ id: 1 })`;

type CompareRow = {
  axis: string;
  rest: string;
  graphql: string;
  grpc: string;
  soap: string;
  jsonrpc: string;
  trpc: string;
};

const COMPARE: CompareRow[] = [
  { axis: "Model", rest: "Resources", graphql: "Queries", grpc: "RPC", soap: "RPC", jsonrpc: "RPC", trpc: "RPC" },
  { axis: "Payload", rest: "JSON", graphql: "JSON", grpc: "Protobuf", soap: "XML", jsonrpc: "JSON", trpc: "JSON" },
  { axis: "Contract", rest: "OpenAPI (opt)", graphql: "Schema", grpc: ".proto", soap: "WSDL", jsonrpc: "Informal", trpc: "TS types" },
  { axis: "Transport", rest: "HTTP/1.1", graphql: "HTTP", grpc: "HTTP/2", soap: "HTTP/SMTP", jsonrpc: "HTTP/WS", trpc: "HTTP" },
  { axis: "Best for", rest: "Public APIs", graphql: "Flexible UIs", grpc: "Microservices", soap: "Legacy/enterprise", jsonrpc: "Nodes/tools", trpc: "TS monorepos" },
];

const COLUMNS = ["REST", "GraphQL", "gRPC", "SOAP", "JSON-RPC", "tRPC"] as const;
const COLUMN_KEYS = ["rest", "graphql", "grpc", "soap", "jsonrpc", "trpc"] as const;

export const apiTypes: Topic = {
  id: "api-types",
  title: "API Types",
  category: "REST & Design",
  blurb: "REST, GraphQL, gRPC, SOAP, JSON-RPC, and tRPC.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "API type describes how clients and servers agree to exchange data — not the same as HTTP methods or auth.\n\nREST is the default for public HTTP APIs: resources at URLs, standard verbs, easy to cache. GraphQL trades multiple endpoints for one query language so clients fetch exactly the shape they need. gRPC prioritizes speed and strict contracts with Protobuf — ideal service-to-service. SOAP is the older XML + WSDL standard still found in banks and government systems. JSON-RPC is a minimal RPC envelope for tools and blockchain nodes. tRPC shares TypeScript types end-to-end in full-stack TS apps.\n\nReal products mix styles: GraphQL or REST outward, gRPC inward.",
      renderStep: (s) => {
        if (s.paradigm === "compare") {
          return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: 12,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: C.highlight,
                  fontWeight: 700,
                }}
              >
                REST · GraphQL · gRPC · others
              </div>
              <div style={{ overflowX: "auto", maxWidth: "100%" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    fontFamily: FONT_SANS,
                    fontSize: 12,
                    color: C.text,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          padding: "8px 10px",
                          borderBottom: `2px solid ${C.surfaceBorder}`,
                          textAlign: "left",
                          color: C.textMuted,
                          fontWeight: 700,
                        }}
                      />
                      {COLUMNS.map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 10px",
                            borderBottom: `2px solid ${C.surfaceBorder}`,
                            textAlign: "left",
                            color: C.textMuted,
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map((row) => (
                      <tr key={row.axis}>
                        <td
                          style={{
                            padding: "8px 10px",
                            borderBottom: `1px solid ${C.surfaceBorder}`,
                            fontWeight: 600,
                            color: C.textMuted,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.axis}
                        </td>
                        {COLUMN_KEYS.map((key) => (
                          <td
                            key={key}
                            style={{
                              padding: "8px 10px",
                              borderBottom: `1px solid ${C.surfaceBorder}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row[key]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        const p = PARADIGMS[s.paradigm];
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <ParadigmCard
              name={p.name}
              tagline={p.tagline}
              request={p.request}
              response={p.response}
              active
              highlight={s.highlight}
            />
          </div>
        );
      },
    }),
};
