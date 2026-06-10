import { ParadigmCard } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  phase: "rest" | "graphql" | "compare";
  highlight: string[];
}

const REST_REQ = "GET /users/1\nGET /users/1/posts\nGET /posts/5/comments";
const GQL_REQ = 'POST /graphql\n{ user(id:1) { name posts { title comments { text } } } }';

const build = (): Step[] => [
  { phase: "rest", highlight: ["request"], chapter: "REST", caption: "REST: 3 round-trips to assemble user + posts + comments (chatty API / overfetch risk)." },
  { phase: "graphql", highlight: ["request", "response"], caption: "GraphQL: one request, client picks exact nested shape — no overfetch." },
  { phase: "compare", highlight: [], caption: "REST shines for simple CRUD + HTTP caching. GraphQL shines for flexible mobile clients. ✓" },
];

const CODE = `// REST — multiple endpoints
const user = await fetch('/users/1');
const posts = await fetch('/users/1/posts');

// GraphQL — one round-trip
const { data } = await gql(\`{ user(id:1) { name posts { title } } }\`);`;

export const graphqlVsRest: Topic = {
  id: "graphql-vs-rest",
  title: "GraphQL vs REST",
  category: "REST & Design",
  blurb: "Round-trips, overfetching, and when to pick each.",
  prerequisites: ["rest-crud", "api-types"],
  create: () => defineViz<Step>({
    steps: build(), code: CODE,
    explanation: "REST maps resources to URLs — simple but multiple endpoints for nested data. GraphQL uses one endpoint and a query language so clients fetch exactly the tree they need.\n\nGraphQL trades HTTP cache simplicity for flexibility.",
    renderStep: (s) => (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        {s.phase === "rest" && <ParadigmCard name="REST" tagline="3 requests" request={REST_REQ} response='{ user… } + [posts…] + [comments…]' active highlight={s.highlight} />}
        {s.phase === "graphql" && <ParadigmCard name="GraphQL" tagline="1 request" request={GQL_REQ} response='{ user: { name, posts: [{ title, comments }] } }' active highlight={s.highlight} />}
        {s.phase === "compare" && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            <ParadigmCard name="REST" tagline="Cache-friendly" request="GET /users/1" response="{ … }" />
            <ParadigmCard name="GraphQL" tagline="Flexible queries" request="POST /graphql" response="{ data: … }" />
          </div>
        )}
        {s.phase === "rest" && <div style={{ fontFamily: FONT_MONO, color: C.compare, fontSize: 13 }}>3 network round-trips</div>}
        {s.phase === "graphql" && <div style={{ fontFamily: FONT_MONO, color: C.sorted, fontSize: 13 }}>1 network round-trip</div>}
      </div>
    ),
  }),
};
