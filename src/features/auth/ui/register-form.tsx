import { valibotResolver } from "@hookform/resolvers/valibot";
import { KeyIcon, LockKeyIcon, UserIcon, UserPlusIcon } from "@phosphor-icons/react";
import type { HTMLInputTypeAttribute, ReactNode } from "react";
import { type Path, useForm } from "react-hook-form";
import { InputField } from "@/shared/ui/kit/input-field";
import { LoadingButton } from "@/shared/ui/kit/loading-button";
import { useRegisterMutation } from "../api/auth.mutations";
import { type RegisterFormData, registerSchema } from "../model/auth.schemas";

type RegisterFormProps = {
  initialInviteToken?: string;
};

type FormFieldConfig = {
  name: Path<RegisterFormData>;
  label: string;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  icon: ReactNode;
  isPassword?: boolean;
};

const REGISTER_FIELDS = [
  {
    name: "invite_token",
    label: "Invite Token",
    placeholder: "Invitation token",
    icon: <KeyIcon />,
  },
  {
    name: "username",
    label: "Username",
    placeholder: "3-32 characters",
    autoComplete: "username",
    icon: <UserIcon />,
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Min. 8 characters",
    type: "password",
    autoComplete: "new-password",
    isPassword: true,
    icon: <LockKeyIcon />,
  },
  {
    name: "password_confirm",
    label: "Confirm Password",
    placeholder: "Repeat password",
    type: "password",
    isPassword: true,
    autoComplete: "new-password",
    icon: <LockKeyIcon />,
  },
] satisfies readonly FormFieldConfig[];

export function RegisterForm({ initialInviteToken = "" }: RegisterFormProps) {
  const registerAction = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: valibotResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      password_confirm: "",
      invite_token: initialInviteToken,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => registerAction.mutate(data))}
      className="flex flex-col gap-4"
    >
      {REGISTER_FIELDS.map((field) => (
        <InputField
          key={field.name}
          id={field.name}
          label={field.label}
          placeholder={field.placeholder}
          type={field.type}
          autoComplete={field.autoComplete}
          icon={field.icon}
          isPassword={field.isPassword}
          error={errors[field.name]?.message}
          {...register(field.name)}
        />
      ))}

      <LoadingButton type="submit" isLoading={registerAction.isPending}>
        <UserPlusIcon /> Create account
      </LoadingButton>
    </form>
  );
}
