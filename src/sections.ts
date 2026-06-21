import type { Category, Topic } from "./engine/types";
import { TOPICS } from "./topics";

export type SectionId = "ds" | "algo" | "backend" | "database" | "frontend";

export interface Section {
  id: SectionId;
  label: string;
  shortLabel: string;
  path: `/${SectionId}`;
  categories: readonly Category[];
}

/** Display order and grouping for sidebar navigation. */
export const SECTIONS: Section[] = [
  {
    id: "ds",
    label: "Data Structures",
    shortLabel: "DS",
    path: "/ds",
    categories: ["Linear", "Hashing", "Trees", "Advanced"],
  },
  {
    id: "algo",
    label: "Algorithms",
    shortLabel: "Algo",
    path: "/algo",
    categories: [
      "Sorting",
      "Searching",
      "Tree Algorithms",
      "Graph Algorithms",
      "Dynamic Programming",
      "Backtracking",
      "Techniques",
      "Greedy",
      "Strings",
    ],
  },
  {
    id: "backend",
    label: "Backend",
    shortLabel: "BE",
    path: "/backend",
    categories: ["Protocol", "REST & Design", "Auth & Security", "Operations"],
  },
  {
    id: "database",
    label: "Database",
    shortLabel: "DB",
    path: "/database",
    categories: ["Database"],
  },
  {
    id: "frontend",
    label: "Frontend",
    shortLabel: "FE",
    path: "/frontend",
    categories: ["Runtime", "Rendering", "Navigation", "Layout & CSS", "Performance"],
  },
];

const CATEGORY_SECTION = new Map<Category, SectionId>(
  SECTIONS.flatMap((s) => s.categories.map((c) => [c, s.id] as const)),
);

export function sectionForCategory(category: Category): SectionId {
  return CATEGORY_SECTION.get(category) ?? "algo";
}

export function sectionById(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function topicsForSection(section: Section): Topic[] {
  const order = new Map(section.categories.map((c, i) => [c, i]));
  return TOPICS.filter((t) => order.has(t.category)).sort(
    (a, b) => (order.get(a.category) ?? 0) - (order.get(b.category) ?? 0),
  );
}

export function topicsByCategoryForSection(section: Section) {
  return section.categories
    .map((cat) => ({
      category: cat,
      topics: TOPICS.filter((t) => t.category === cat),
    }))
    .filter((g) => g.topics.length > 0);
}

export function defaultTopicId(section: Section): string {
  if (typeof sessionStorage !== "undefined") {
    const stored = sessionStorage.getItem(`devviz:${section.id}`);
    const topics = topicsForSection(section);
    if (stored && topics.some((t) => t.id === stored)) return stored;
  }
  return topicsForSection(section)[0]?.id ?? TOPICS[0].id;
}

export function rememberTopic(sectionId: SectionId, topicId: string) {
  sessionStorage.setItem(`devviz:${sectionId}`, topicId);
  sessionStorage.setItem("devviz:last-section", sectionId);
}

export function lastSectionId(): SectionId {
  const stored = sessionStorage.getItem("devviz:last-section");
  if (stored === "api") return "backend";
  if (
    stored === "ds" ||
    stored === "algo" ||
    stored === "backend" ||
    stored === "database" ||
    stored === "frontend"
  )
    return stored;
  return "ds";
}

/** Resolve which section owns a topic (for cross-section prereq links). */
export function sectionForTopic(topicId: string): Section | undefined {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return undefined;
  return SECTIONS.find((s) => s.categories.includes(topic.category));
}
