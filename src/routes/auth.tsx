import { createFileRoute, redirect } from "@tanstack/react-router";
import * as v from "valibot";
import { instanceQueryOptions, useInstanceQuery } from "@/entities/auth/api/auth.queries";
import { LoginForm } from "@/features/auth/ui/login-form";
import { RegisterForm } from "@/features/auth/ui/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/core/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/core/tabs";

const authSearchSchema = v.pipe(
  v.object({
    tab: v.optional(v.picklist(["login", "register"])),
    invite: v.optional(v.string()),
  }),
  v.transform((input) => ({
    invite: input.invite,
    tab: input.tab ?? (input.invite ? "register" : "login"),
  })),
);

export const Route = createFileRoute("/auth")({
  validateSearch: authSearchSchema,
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(instanceQueryOptions());
  },
  component: AuthPage,
});

function AuthPage() {
  const { tab, invite } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: instance } = useInstanceQuery();

  const handleTabChange = (nextTab: string | number | null) => {
    if (nextTab === "login" || nextTab === "register") {
      navigate({
        search: (prev) => ({
          ...prev,
          tab: nextTab,
        }),
      });
    }
  };

  return (
    <div className="flex h-full min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>{instance?.name ?? "Voxhold"}</CardTitle>
          <CardDescription>Connect and communicate in real-time</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
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
