import { HttpMessage, ResourceCard } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";
import { C, FONT_MONO, FONT_SANS } from "../theme";

type Mode = "url-v1" | "url-v2" | "header" | "default" | "deprecated";

interface Step extends StepBase {
  mode: Mode;
  path: string;
  reqHeaders: { name: string; value: string }[];
  resHeaders: { name: string; value: string }[];
  resource: Record<string, unknown>;
  highlight: string[];
}

const V1 = { id: 1, name: "Alice" };
const V2 = { id: 1, fullName: "Alice Smith", email: "alice@example.com" };

function build(): Step[] {
  return [
    {
      mode: "url-v1",
      path: "/v1/users/1",
      reqHeaders: [],
      resHeaders: [{ name: "Content-Type", value: "application/json" }],
      resource: V1,
      highlight: ["line"],
      chapter: "URL path v1",
      caption: "URL path versioning: /v1/... returns the original schema { id, name }.",
    },
    {
      mode: "url-v2",
      path: "/v2/users/1",
      reqHeaders: [],
      resHeaders: [{ name: "Content-Type", value: "application/json" }],
      resource: V2,
      highlight: ["line"],
      chapter: "URL path v2",
      caption: "/v2/... is a breaking change — renamed name → fullName, added email.",
    },
    {
      mode: "header",
      path: "/users/1",
      reqHeaders: [{ name: "Accept-Version", value: "2" }],
      resHeaders: [
        { name: "Content-Type", value: "application/json" },
        { name: "API-Version", value: "2" },
      ],
      resource: V2,
      highlight: ["Accept-Version", "API-Version"],
      chapter: "Header versioning",
      caption: "Header versioning: same URL, client requests version via Accept-Version.",
    },
    {
      mode: "default",
      path: "/users/1",
      reqHeaders: [],
      resHeaders: [
        { name: "Content-Type", value: "application/json" },
        { name: "API-Version", value: "2" },
      ],
      resource: V2,
      highlight: ["API-Version"],
      chapter: "Default version",
      caption: "No version specified → server uses the current default (v2).",
    },
    {
      mode: "deprecated",
      path: "/v1/users/1",
      reqHeaders: [],
      resHeaders: [
        { name: "Content-Type", value: "application/json" },
        { name: "Deprecation", value: 'true' },
        { name: "Sunset", value: "Sat, 01 Jan 2027 00:00:00 GMT" },
        { name: "Link", value: '</v2/users/1>; rel="successor-version"' },
      ],
      resource: V1,
      highlight: ["Deprecation", "Sunset", "Link"],
      chapter: "Deprecated version",
      caption: "Deprecated v1 still works but returns Sunset + Link to the successor version.",
    },
  ];
}

const CODE = `// URL path versioning — explicit, cacheable, easy to route
GET /v1/users/1
GET /v2/users/1

// Header versioning — stable URLs
GET /users/1
Accept-Version: 2

// Tell clients a version is going away (RFC 8594)
Deprecation: true
Sunset: Sat, 01 Jan 2027 00:00:00 GMT
Link: </v2/users/1>; rel="successor-version"`;

export const apiVersioning: Topic = {
  id: "api-versioning",
  title: "API Versioning",
  category: "REST & Design",
  blurb: "URL paths, version headers, defaults, and deprecation.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "APIs evolve. Versioning lets you ship breaking changes without breaking existing clients. URL path versioning (/v1/, /v2/) is the most visible and easiest to route at the edge. Header versioning keeps URLs stable — useful when paths are part of a public contract.\n\nAlways communicate deprecation: Deprecation and Sunset headers tell clients when to migrate. Maintain old versions for a defined sunset period.",
      renderStep: (s) => {
        const labels: Record<Mode, string> = {
          "url-v1": "URL path · v1",
          "url-v2": "URL path · v2",
          header: "Header versioning",
          default: "Default version",
          deprecated: "Deprecated version",
        };
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 12,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: s.mode === "deprecated" ? C.active : C.pointer,
                fontWeight: 700,
              }}
            >
              {labels[s.mode]}
            </div>
            <HttpMessage
              direction="request"
              method="GET"
              path={s.path}
              headers={s.reqHeaders}
              highlight={s.highlight}
            />
            <HttpMessage
              direction="response"
              status={200}
              statusLabel="OK"
              headers={s.resHeaders}
              highlight={s.highlight}
            />
            <ResourceCard label="Response body" data={s.resource} />
            {s.mode === "deprecated" && (
              <div style={{ fontFamily: FONT_MONO, fontSize: 13, color: C.active }}>
                Clients should migrate before the Sunset date
              </div>
            )}
          </div>
        );
      },
    }),
};
