import { SmileySadIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Button } from "../core/button";
import { EmptyState } from "./empty-state";

type ErrorStateProps = {
  title?: string;
  description?: string;
  reset: () => void;
  extraAction?: ReactNode;
};

export const ErrorState = ({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
  reset,
  extraAction,
}: ErrorStateProps) => {
  return (
    <EmptyState
      icon={<SmileySadIcon />}
      title={title}
      description={description}
      action={
        <div className="flex gap-2">
          <Button onClick={() => reset()}>Try again</Button>
          {extraAction}
        </div>
      }
    />
  );
};
