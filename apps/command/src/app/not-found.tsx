import { buttonClass, Logo } from "@ix/ui";
import Link from "next/link";
import { getI18n } from "@/lib/locale";

export default async function NotFound() {
  const { t } = await getI18n();
  const s = t.command.states;
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <Logo className="text-xl" />
        <p className="ix-gradient-text text-7xl font-extrabold" dir="ltr">
          404
        </p>
        <h1 className="text-2xl font-bold">{s.notFoundTitle}</h1>
        <p className="text-muted">{s.notFoundBody}</p>
        <Link href="/" className={buttonClass("primary")}>
          {s.backToCommand}
        </Link>
      </div>
    </main>
  );
}
