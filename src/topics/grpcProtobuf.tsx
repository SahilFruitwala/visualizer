import { ProtobufFrame } from "../components/BackendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

interface Step extends StepBase {
  phase: string;
  fields: { name: string; value: string; highlight?: boolean }[];
  transport: string;
}

const build = (): Step[] => [
  { phase: "Define schema", fields: [{ name: "message User", value: "", highlight: true }, { name: "int32 id", value: "1" }, { name: "string name", value: '"Alice"' }], transport: "user.proto", chapter: "Protobuf", caption: ".proto file defines typed messages — codegen for many languages." },
  { phase: "Serialize", fields: [{ name: "field 1 (id)", value: "0x08 0x01", highlight: true }, { name: "field 2 (name)", value: '0x12 0x05 "Alice"' }], transport: "binary frame (~15 bytes)", caption: "Protobuf encodes compact binary — smaller than JSON, faster to parse." },
  { phase: "gRPC call", fields: [{ name: "RPC", value: "UserService/GetUser", highlight: true }, { name: "body", value: "[protobuf bytes]" }], transport: "HTTP/2 · application/grpc", chapter: "gRPC", caption: "gRPC sends RPC over HTTP/2 — multiplexed streams, low latency." },
  { phase: "Response", fields: [{ name: "id", value: "1" }, { name: "name", value: '"Alice"', highlight: true }], transport: "HTTP/2 DATA frame", caption: "Server streams protobuf response — strongly typed end-to-end. ✓" },
];

const CODE = `// user.proto
message User { int32 id = 1; string name = 2; }

// gRPC (generated stub)
const user = await client.getUser({ id: 1 });
// Binary on wire — not human-readable like JSON`;

export const grpcProtobuf: Topic = {
  id: "grpc-protobuf",
  title: "gRPC & Protobuf",
  category: "REST & Design",
  blurb: "Binary RPC over HTTP/2 with typed contracts.",
  prerequisites: ["api-types", "http-lifecycle"],
  badges: ["HTTP/2 · binary"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "Protocol Buffers define compact binary messages from .proto schemas. gRPC uses them for typed RPC calls over HTTP/2 — ideal for service-to-service communication inside datacenters.\n\nBrowsers typically use gRPC-Web or stick to REST/GraphQL.",
    renderStep: (s) => <ProtobufFrame fields={s.fields} transport={s.transport} phase={s.phase} />,
  }),
};
