import type { Category, Topic } from "./engine/types";
import { TOPICS } from "./topics";

export type SectionId = "ds" | "algo" | "api";

export interface Section {
  id: SectionId;
  label: string;
  shortLabel: string;
  path: `/${SectionId}`;
  categories: readonly Category[];
}

export const SECTIONS: Section[] = [
  {
    id: "ds",
    label: "Data Structures",
    shortLabel: "DS",
    path: "/ds",
    categories: ["Data Structures"],
  },
  {
    id: "algo",
    label: "Algorithms",
    shortLabel: "Algo",
    path: "/algo",
    categories: [
      "Sorting",
      "Searching",
      "Trees & Graphs",
      "Dynamic Programming",
      "Backtracking",
      "Techniques",
      "Strings",
    ],
  },
  {
    id: "api",
    label: "API",
    shortLabel: "API",
    path: "/api",
    categories: ["API"],
  },
];

export function sectionById(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function topicsForSection(section: Section): Topic[] {
  return TOPICS.filter((t) => (section.categories as readonly string[]).includes(t.category));
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
}
