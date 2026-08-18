import { EyeClosedIcon, EyeIcon } from "@phosphor-icons/react";
import { type ComponentProps, type ReactNode, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { Button } from "../core/button";
import { Input } from "../core/input";
import { Label } from "../core/label";

type InputFieldProps = ComponentProps<typeof Input> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
  isPassword?: boolean;
};

export function InputField({
  id,
  label,
  error,
  icon,
  className,
  type,
  isPassword = false,
  ...props
}: InputFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const inputType = isPassword ? (passwordVisible ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1">
      {label != null && (
        <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
      )}
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          aria-invalid={error != null}
          className={cn(icon && "pl-8", isPassword && "pr-8", className)}
          {...props}
        />
        {icon != null && (
          <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute hover:bg-transparent top-1/2 right-1.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setPasswordVisible((prev) => !prev)}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? <EyeClosedIcon /> : <EyeIcon />}
          </Button>
        )}
      </div>
      {error != null && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
