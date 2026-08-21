import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { type ComponentProps, useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { useDebounce } from "@/shared/lib/use-debounce";
import { Input } from "@/shared/ui/core/input";

type AppSearchProps = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  value?: string;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
};

export function AppSearch({
  value = "",
  onSearch,
  placeholder = "Search...",
  debounceMs = 300,
  className,
  ...props
}: AppSearchProps) {
  const [text, setText] = useState(value);

  const debouncedText = useDebounce(text, debounceMs);

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (debouncedText !== value) {
      onSearch?.(debouncedText.trim());
    }
  }, [debouncedText, value, onSearch]);

  return (
    <div className={cn("relative flex items-center shrink-0", className)}>
      <MagnifyingGlassIcon className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none select-none" />

      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-8 pl-8 pr-7 text-xs"
        {...props}
      />
    </div>
  );
}
