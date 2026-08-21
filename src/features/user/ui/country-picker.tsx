import { CaretUpDownIcon, CheckIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import { COUNTRIES } from "@/shared/lib/countries";
import { Button } from "@/shared/ui/core/button";
import { Input } from "@/shared/ui/core/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/core/popover";
import { ScrollArea } from "@/shared/ui/core/scroll-area";
import { EmptyState } from "@/shared/ui/kit/empty-state";

type Props = {
  value?: string | null;
  onChange: (countryCode: string) => void;
  disabled?: boolean;
  className?: string;
};

export function CountryPicker({ value, onChange, disabled = false, className }: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedCountry = COUNTRIES.find((c) => c.code === value?.toUpperCase());

  const query = searchQuery.trim().toLowerCase();
  const filteredCountries = query
    ? COUNTRIES.filter(
        (c) => c.label.toLowerCase().includes(query) || c.code.toLowerCase().startsWith(query),
      )
    : COUNTRIES;

  const handleSelect = (code: string) => {
    onChange(code);
    setOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "h-8 w-full justify-between px-2.5 font-normal text-xs",
              !selectedCountry && "text-muted-foreground",
              className,
            )}
          >
            {selectedCountry ? (
              <span className="flex items-center gap-2 min-w-0">
                <img
                  src={selectedCountry.flagUrl}
                  alt=""
                  className="h-3 w-4 shrink-0 rounded-xs object-cover"
                  loading="lazy"
                />
                <span className="truncate font-medium">{selectedCountry.label}</span>
                <span className="text-2xs text-muted-foreground font-mono">
                  ({selectedCountry.code})
                </span>
              </span>
            ) : (
              <span>Select country (optional)...</span>
            )}
            <CaretUpDownIcon className="size-3.5 text-muted-foreground shrink-0 ml-auto" />
          </Button>
        }
      />

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={4}
        className="w-72 p-0 gap-0 overflow-hidden border bg-popover"
      >
        <div className="relative flex items-center border-b p-2">
          <MagnifyingGlassIcon className="absolute left-3 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country or code (e.g. US, Germany)..."
            className="h-7 pl-6 pr-7 text-xs bg-transparent border-none focus-visible:ring-0"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 size-4 text-muted-foreground"
              aria-label="Clear search query"
            >
              <XIcon className="size-3" />
            </Button>
          )}
        </div>

        <ScrollArea className="h-60 px-1 py-1">
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className={cn(
                "w-full justify-between px-2 text-xs font-normal text-muted-foreground",
                !value && "bg-accent text-accent-foreground font-medium",
              )}
            >
              <span>None (Not specified)</span>
              {!value && <CheckIcon className="size-3.5 text-primary shrink-0" />}
            </Button>

            {filteredCountries.length === 0 ? (
              <EmptyState
                size="sm"
                title="No country found"
                description={`No country matching "${searchQuery}"`}
                className="min-h-36 p-4"
              />
            ) : (
              filteredCountries.map((country) => {
                const isSelected = country.code === value?.toUpperCase();
                return (
                  <Button
                    key={country.code}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelect(country.code)}
                    className={cn(
                      "w-full justify-start gap-2 px-2 text-xs font-normal text-foreground",
                      isSelected && "bg-accent text-accent-foreground font-medium",
                    )}
                  >
                    <img
                      src={country.flagUrl}
                      alt=""
                      className="h-3 w-4 shrink-0 rounded-xs object-cover"
                      loading="lazy"
                    />
                    <span className="truncate flex-1 text-left">{country.label}</span>
                    {isSelected && <CheckIcon className="size-3.5 text-primary shrink-0 ml-1" />}
                    <span className="text-2xs text-muted-foreground font-mono shrink-0">
                      {country.code}
                    </span>
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
