import { route, type Router } from "@repo/einblatt";
import { HomePage } from "./pages/HomePage";
import { CounterPage } from "./pages/CounterPage";
import { AsyncDataPage } from "./pages/AsyncDataPage";
import { Projection3DPage } from "./pages/Projection3DPage";
import { AboutPage } from "./pages/AboutPage";
import { NotFoundPage } from "./pages/NotFoundPage";

export interface RouteConfig {
  path: string;
  label: string;
  showInNav: boolean;
}

// Navigation items (what shows in the nav bar)
export const navItems: RouteConfig[] = [
  { path: "/", label: "Home", showInNav: true },
  { path: "/counter", label: "Counter", showInNav: true },
  { path: "/async", label: "Async Data", showInNav: true },
  { path: "/projection-3d", label: "3D Projection", showInNav: true },
  { path: "/about", label: "About", showInNav: true },
];

// Route definitions for the router
export const routes = {
  home: route("/"),
  counter: route("/counter"),
  async: route("/async"),
  asyncWithId: route("/async/:userId"),
  projection3d: route("/projection-3d"),
  about: route("/about"),
  notFound: route("*"),
} as const;

// Create match handlers - maps paths to components
export function createMatchHandlers(router: Router) {
  return {
    "/": () => <HomePage />,
    "/counter": () => <CounterPage />,
    "/async": () => <AsyncDataPage router={router} />,
    "/async/:userId": ({ params }: { params?: Record<string, string> }) => (
      <AsyncDataPage userId={params?.userId} router={router} />
    ),
    "/projection-3d": () => <Projection3DPage />,
    "/about": () => <AboutPage />,
    "*": () => <NotFoundPage router={router} />,
  };
}
