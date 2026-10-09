"use client";

import { Button, Card, EmptyState } from "@ix/ui";
import { RotateCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { useI18n } from "@/components/i18n-provider";

export default function ShellError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  const { t } = useI18n();
  const s = t.command.states;

  useEffect(() => {
    // Surface the failure; error monitoring hooks in here once observability lands.
    console.error(error);
  }, [error]);

  return (
    <Card role="alert" className="grid min-h-80 place-items-center border-danger/40">
      <EmptyState
        icon={<TriangleAlert className="size-5 text-danger" />}
        title={s.errorTitle}
        body={s.errorBody}
        action={
          <div className="flex flex-col items-center gap-3">
            <Button onClick={reset}>
              <RotateCw className="size-4" aria-hidden="true" />
              {s.retry}
            </Button>
            {error.digest ? (
              // Correlation reference only — never the raw error message or stack.
              <p className="text-xs text-muted">
                {s.errorReference}:{" "}
                <code dir="ltr" className="font-mono">
                  {error.digest}
                </code>
              </p>
            ) : null}
          </div>
        }
      />
    </Card>
  );
}
