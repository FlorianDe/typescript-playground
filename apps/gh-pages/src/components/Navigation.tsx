import { computed, type Router } from "@repo/einblatt";
import { navItems } from "../routes";

export function Navigation({ router }: { router: Router }) {
  const NavLink = ({ href, children }: { href: string; children: string }) => {
    const className = computed(() =>
      router.current.value.path === href ||
      router.current.value.path.startsWith(href + "/")
        ? "text-blue-600 font-bold"
        : "text-gray-600 hover:text-blue-500"
    );

    return (
      <a
        href={href}
        class={className}
        onClick={(e) => {
          e.preventDefault();
          router.navigate(href);
        }}
      >
        {children}
      </a>
    );
  };

  return (
    <nav class="bg-gray-800 text-white p-4 mb-8">
      <div class="container mx-auto flex gap-6">
        {navItems
          .filter((item) => item.showInNav)
          .map((item) => (
            <NavLink href={item.path}>{item.label}</NavLink>
          ))}
      </div>
    </nav>
  );
}
