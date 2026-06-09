import { RerenderTree } from "../components/FrontendView";
import { defineViz, type StepBase, type Topic } from "../engine/types";

type NState = "skip" | "render" | "changed" | "default";
interface Step extends StepBase {
  nodes: { id: string; label: string; state: NState }[];
  phase: string;
}

const build = (): Step[] => [
  { phase: "Initial", chapter: "Render pass", nodes: [{ id: "app", label: "<App>", state: "render" }, { id: "header", label: "<Header>", state: "render" }, { id: "list", label: "<List count=3>", state: "render" }], caption: "First render: React walks tree top-down, calls each component function." },
  { phase: "Props same", nodes: [{ id: "app", label: "<App>", state: "render" }, { id: "header", label: "<Header>", state: "skip" }, { id: "list", label: "<List count=3>", state: "skip" }], caption: "Parent re-renders but Header props unchanged → React.memo bails out, skips subtree." },
  { phase: "Props changed", nodes: [{ id: "app", label: "<App>", state: "render" }, { id: "header", label: "<Header>", state: "skip" }, { id: "list", label: "<List count=5>", state: "changed" }], chapter: "State update", caption: "setState in App → count 3→5. List props changed → must re-render." },
  { phase: "Children", nodes: [{ id: "app", label: "<App>", state: "render" }, { id: "header", label: "<Header>", state: "skip" }, { id: "list", label: "<List>", state: "render" }, { id: "items", label: "5× <Item>", state: "render" }], caption: "List re-renders → children re-render by default (unless memoized)." },
  { phase: "Memoized child", nodes: [{ id: "app", label: "<App>", state: "render" }, { id: "header", label: "<Header memo>", state: "skip" }, { id: "list", label: "<List>", state: "render" }, { id: "item1", label: "<Item key=1>", state: "skip" }], caption: "Item with same props+key → React.memo skips. Only changed rows render. ✓" },
];

const CODE = `const Header = React.memo(function Header({ title }) {
  return <h1>{title}</h1>; // skips if title unchanged
});

function App() {
  const [count, setCount] = useState(3);
  return (
    <>
      <Header title="Users" />
      <List count={count} />
    </>
  );
}`;

export const componentRerenders: Topic = {
  id: "component-rerenders",
  title: "Component Re-renders",
  category: "Rendering",
  blurb: "Which components re-render when state changes.",
  prerequisites: ["virtual-dom"],
  badges: ["React.memo"],
  quiz: [{ question: "What causes a child to skip re-render?", options: ["Parent rendered", "Same props (with memo)", "New key", "useEffect"], correctIndex: 1, explanation: "React.memo compares props; unchanged props bail out before reconciling children." }],
  create: () => defineViz<Step>({ steps: build(), code: CODE, explanation: "A parent re-render does not always mean every child re-renders. React.memo and PureComponent skip subtrees when props are shallow-equal. Keys and context changes can still force updates.\n\nProfile with React DevTools 'highlight updates' to spot unnecessary renders.", renderStep: (s) => <RerenderTree nodes={s.nodes} phase={s.phase} /> }),
};
