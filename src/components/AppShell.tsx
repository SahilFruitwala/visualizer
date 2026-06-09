import { useEffect, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalSearch } from "./GlobalSearch";
import { Sidebar } from "./Sidebar";
import {
  defaultTopicId,
  lastSectionId,
  rememberTopic,
  sectionById,
  sectionForTopic,
  type SectionId,
} from "../sections";
import { ThemeProvider, ThemeToggle } from "./ThemeToggle";

export type AppView = "topics" | "paths";

export function useAppNav() {
  const navigate = useNavigate();

  const selectTopic = (id: string) => {
    const owner = sectionForTopic(id);
    if (!owner) return;
    rememberTopic(owner.id, id);
    navigate(`${owner.path}/${id}`);
  };

  const selectSection = (id: SectionId) => {
    const section = sectionById(id)!;
    navigate(`${section.path}/${defaultTopicId(section)}`);
  };

  return { selectTopic, selectSection, navigate };
}

export function AppShell({
  children,
  sectionId,
  activeTopicId,
  view,
  mobileToolbar,
}: {
  children: ReactNode;
  sectionId: SectionId;
  activeTopicId?: string;
  view: AppView;
  mobileToolbar?: ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { selectTopic, selectSection, navigate } = useAppNav();
  const location = useLocation();
  const section = sectionById(sectionId)!;

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const openDrawer = () => setDrawerOpen(true);
    const openSearch = () => setSearchOpen(true);
    document.addEventListener("devviz:open-drawer", openDrawer);
    document.addEventListener("devviz:open-search", openSearch);
    return () => {
      document.removeEventListener("devviz:open-drawer", openDrawer);
      document.removeEventListener("devviz:open-search", openSearch);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleSelectTopic = (id: string) => {
    setDrawerOpen(false);
    selectTopic(id);
  };

  const sidebar = (
    <Sidebar
      section={section}
      activeId={activeTopicId ?? ""}
      view={view}
      onSelect={handleSelectTopic}
      onSectionChange={selectSection}
      onNavigate={(path) => {
        setDrawerOpen(false);
        navigate(path);
      }}
      onOpenSearch={() => setSearchOpen(true)}
    />
  );

  return (
    <ThemeProvider>
      <div className="app">
        {sidebar}

        {drawerOpen && (
          <div
            className="nav-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Browse topics"
            onClick={() => setDrawerOpen(false)}
          >
            <aside className="nav-drawer" onClick={(e) => e.stopPropagation()}>
              {sidebar}
            </aside>
          </div>
        )}

        <div className="main-column">
          <div className="mobile-toolbar mobile-toolbar-shell">
            {mobileToolbar ?? (
              <>
                <button
                  type="button"
                  className="mobile-menu-btn"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Browse topics"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  <span>Menu</span>
                </button>
                <button
                  type="button"
                  className="mobile-search-btn"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search topics"
                >
                  ⌕
                </button>
              </>
            )}
            <ThemeToggle />
          </div>
          {children}
        </div>

        <GlobalSearch
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelect={handleSelectTopic}
        />
      </div>
    </ThemeProvider>
  );
}

export function resolveSectionId(pathname: string): SectionId {
  if (pathname.startsWith("/frontend")) return "frontend";
  if (pathname.startsWith("/algo")) return "algo";
  if (pathname.startsWith("/backend") || pathname.startsWith("/api")) return "backend";
  if (pathname.startsWith("/ds")) return "ds";
  return lastSectionId();
}

export function resolveView(pathname: string): AppView {
  if (pathname === "/paths") return "paths";
  return "topics";
}
