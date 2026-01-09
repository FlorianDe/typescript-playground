import { createRouter, match } from "@repo/einblatt";
import { routes, createMatchHandlers } from "./routes";
import { Navigation } from "./components/Navigation";

const router = createRouter({
  routes,
  strategy: "hash",
  onNavigate: (to, from) => {
    console.log("Navigating from", from.path, "to", to.path);
  },
});

const matchHandlers = createMatchHandlers(router)

function App() {
  return (
    <div class="min-h-screen bg-gray-50">
      <Navigation router={router} />
      {match(router.current, matchHandlers)}
    </div>
  );
}

const root = document.getElementById("app");
if (root) {
  root.appendChild(<App />);
} else {
  console.error("Root element not found");
}
