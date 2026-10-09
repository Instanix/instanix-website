import { buttonClass, Logo } from "@ix/ui";
import Link from "next/link";

/**
 * not-found receives no route params, so it cannot know the locale on the
 * server. It shows both languages rather than guessing.
 */
export default function NotFound() {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-6">
      <div className="flex max-w-md flex-col items-center gap-5 text-center">
        <Logo className="text-xl" />
        <p className="ix-gradient-text text-7xl font-extrabold" dir="ltr">
          404
        </p>
        <div className="space-y-1">
          <h1 className="text-xl font-bold" lang="en" dir="ltr">
            Page not found
          </h1>
          <p className="text-lg font-semibold text-fg-soft" lang="ar" dir="rtl">
            الصفحة غير موجودة
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/en" lang="en" className={buttonClass("primary")}>
            Back to home
          </Link>
          <Link href="/ar" lang="ar" className={buttonClass("secondary")}>
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
