import { createFileRoute, redirect } from "@tanstack/react-router";
import { useInstanceQuery } from "@/entities/auth/api/auth.queries";
import { useAuthStore } from "@/entities/auth/model/use-auth.store";
import { LoginForm } from "@/features/auth/ui/login-form";
import { RegisterForm } from "@/features/auth/ui/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/core/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/core/tabs";

type AuthSearch = {
  tab?: "login" | "register";
  invite?: string;
};

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    tab: search.tab === "register" || search.invite != null ? "register" : "login",
    invite: typeof search.invite === "string" ? search.invite : undefined,
  }),
  beforeLoad: () => {
    if (useAuthStore.getState().token != null) {
      throw redirect({ to: "/" });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { tab = "login", invite } = Route.useSearch();
  const { data: instance } = useInstanceQuery();

  return (
    <div className="flex h-full min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>{instance?.name ?? "Voxhold"}</CardTitle>
          <CardDescription>Connect and communicate in real-time</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue={tab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register">
              <RegisterForm initialInviteToken={invite} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
