import { Card, EmptyState } from "@ix/ui";
import { Inbox } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/locale";
import { isSectionKey } from "@/lib/sections";

interface Props {
  readonly params: Promise<{ section: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  if (!isSectionKey(section)) return {};
  const { t } = await getI18n();
  return { title: t.command.sections[section].title };
}

/** Navigation destinations with no data to show yet: a plain empty state, never mock data. */
export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  if (!isSectionKey(section)) notFound();
  const { t } = await getI18n();
  const copy = t.command.sections[section];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{copy.title}</h1>
      </header>
      <Card className="grid min-h-80 place-items-center">
        <EmptyState icon={<Inbox className="size-5" />} title={t.command.home.noData} body={copy.body} />
      </Card>
    </div>
  );
}
