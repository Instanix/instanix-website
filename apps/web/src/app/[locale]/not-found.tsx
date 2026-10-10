import { NotFoundView } from "@/components/not-found-view";

/** not-found receives no route params, so the view reads the language from the address. */
export default function NotFound() {
  return <NotFoundView />;
}
