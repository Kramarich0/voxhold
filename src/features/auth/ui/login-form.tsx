import { valibotResolver } from "@hookform/resolvers/valibot";
import { LockKeyIcon, SignInIcon, UserIcon } from "@phosphor-icons/react";
import type { HTMLInputTypeAttribute, ReactNode } from "react";
import { type Path, useForm } from "react-hook-form";
import { type LoginFormData, loginSchema } from "@/features/auth/model/auth.schemas";
import { InputField } from "@/shared/ui/kit/input-field";
import { LoadingButton } from "@/shared/ui/kit/loading-button";
import { useLoginMutation } from "../api/auth.mutations";

type FormFieldConfig = {
  name: Path<LoginFormData>;
  label: string;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  isPassword?: boolean;
  icon: ReactNode;
};

const LOGIN_FIELDS = [
  {
    name: "username",
    label: "Username",
    placeholder: "Enter your username",
    autoComplete: "username",
    icon: <UserIcon />,
  },
  {
    name: "password",
    label: "Password",
    placeholder: "••••••••",
    type: "password",
    isPassword: true,
    autoComplete: "current-password",
    icon: <LockKeyIcon />,
  },
] satisfies readonly FormFieldConfig[];

export function LoginForm() {
  const login = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: valibotResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => login.mutate(data))} className="flex flex-col gap-4">
      {LOGIN_FIELDS.map((field) => (
        <InputField
          key={field.name}
          id={field.name}
          label={field.label}
          placeholder={field.placeholder}
          isPassword={field.isPassword}
          type={field.type}
          autoComplete={field.autoComplete}
          icon={field.icon}
          error={errors[field.name]?.message}
          {...register(field.name)}
        />
      ))}

      <LoadingButton type="submit" isLoading={login.isPending} loadingText="Signing in...">
        <SignInIcon /> Sign in
      </LoadingButton>
    </form>
  );
}
