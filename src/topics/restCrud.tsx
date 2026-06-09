import { HttpMessage, ResourceCard } from "../components/ApiFlow";
import { defineViz, type StepBase, type Topic } from "../engine/types";

interface Step extends StepBase {
  method: string;
  path: string;
  status: number;
  statusLabel: string;
  resource: Record<string, unknown> | null;
  removed: boolean;
  reqBody?: string;
}

function build(): Step[] {
  const user1 = { id: 1, name: "Alice", email: "alice@example.com" };
  const user2 = { id: 2, name: "Bob", email: "bob@example.com" };

  return [
    {
      method: "GET",
      path: "/users/1",
      status: 200,
      statusLabel: "OK",
      resource: user1,
      removed: false,
      chapter: "GET — read",
      caption: "GET /users/1 → read the current resource (safe, idempotent).",
    },
    {
      method: "POST",
      path: "/users",
      status: 201,
      statusLabel: "Created",
      resource: user2,
      removed: false,
      reqBody: '{\n  "name": "Bob",\n  "email": "bob@example.com"\n}',
      chapter: "POST — create",
      caption: "POST /users → create a new resource. Server assigns id: 2.",
    },
    {
      method: "PUT",
      path: "/users/1",
      status: 200,
      statusLabel: "OK",
      resource: { id: 1, name: "Alice Smith", email: "alice@example.com" },
      removed: false,
      reqBody: '{\n  "name": "Alice Smith",\n  "email": "alice@example.com"\n}',
      chapter: "PUT — replace",
      caption: "PUT /users/1 → replace the entire resource (full update).",
    },
    {
      method: "PATCH",
      path: "/users/1",
      status: 200,
      statusLabel: "OK",
      resource: { id: 1, name: "Alice Smith", email: "alice.smith@example.com" },
      removed: false,
      reqBody: '{\n  "email": "alice.smith@example.com"\n}',
      chapter: "PATCH — partial update",
      caption: "PATCH /users/1 → update only the fields you send (partial).",
    },
    {
      method: "DELETE",
      path: "/users/1",
      status: 204,
      statusLabel: "No Content",
      resource: null,
      removed: true,
      chapter: "DELETE — remove",
      caption: "DELETE /users/1 → remove the resource. 204 = success, no body.",
    },
  ];
}

const CODE = `// REST maps CRUD to HTTP verbs
await fetch("/users/1");                    // GET  — read
await fetch("/users", { method: "POST", body });     // POST — create
await fetch("/users/1", { method: "PUT", body });    // PUT  — replace
await fetch("/users/1", { method: "PATCH", body }); // PATCH — partial
await fetch("/users/1", { method: "DELETE" });     // DELETE`;

export const restCrud: Topic = {
  id: "rest-crud",
  title: "REST & HTTP Verbs",
  category: "REST & Design",
  blurb: "GET, POST, PUT, PATCH, DELETE on a resource.",
  create: () =>
    defineViz<Step>({
      steps: build(),
      code: CODE,
      explanation:
        "REST uses HTTP verbs to express intent on resources (nouns in the URL). GET reads without side effects. POST creates. PUT replaces the whole object. PATCH updates specific fields. DELETE removes.\n\nStatus codes matter too: 200 for reads/updates, 201 for creates, 204 for deletes with no response body.",
      renderStep: (s) => (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-start" }}>
          <HttpMessage
            direction="request"
            method={s.method}
            path={s.path}
            body={s.reqBody}
            highlight={s.reqBody ? ["line", "body"] : ["line"]}
          />
          <HttpMessage
            direction="response"
            status={s.status}
            statusLabel={s.statusLabel}
            body={s.removed ? undefined : s.resource ? JSON.stringify(s.resource, null, 2) : undefined}
          />
          <ResourceCard
            label="Resource state"
            data={s.resource}
            removed={s.removed}
          />
        </div>
      ),
    }),
};
