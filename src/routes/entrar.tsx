import { useState } from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { z } from "zod";

import { texts } from "@/texts";

import { AuthPageLayout, type AuthTab } from "@/components/auth/auth-page-layout";
import { ForgotPasswordDialog } from "@/components/auth/forgot-password-dialog";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";

const authSearchSchema = z.object({
  tab: z.enum(["login", "signup"]).optional().default("signup"),
});

export const Route = createFileRoute("/entrar")({
  validateSearch: authSearchSchema,
  head: () => ({
    meta: [
      { title: texts.auth.seo.authTitle },
      { name: "description", content: texts.auth.seo.authDescription },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const initialTab = Route.useSearch().tab as AuthTab;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false);

  const handleAuthenticated = () => navigate({ to: "/feed" });
  const formByTab: Record<AuthTab, React.ReactNode> = {
    signup: <SignUpForm onAuthenticated={handleAuthenticated} />,
    login: (
      <SignInForm
        onAuthenticated={handleAuthenticated}
        onForgotPassword={() => setIsForgotPasswordDialogOpen(true)}
      />
    ),
  };

  return (
    <AuthPageLayout tab={activeTab} onTabChange={setActiveTab}>
      {formByTab[activeTab]}
      <ForgotPasswordDialog
        isOpen={isForgotPasswordDialogOpen}
        onOpenChange={setIsForgotPasswordDialogOpen}
      />
    </AuthPageLayout>
  );
}
