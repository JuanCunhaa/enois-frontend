import { type FormEvent, useState } from "react";

import { ArrowRight, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { z } from "zod";

import { authApi } from "@/lib/api";
import { texts } from "@/texts";
import { mapValidationErrors } from "@/utils/forms";
import { clearSession, storeAuthenticatedSession } from "@/utils/session";

import { ErrorBanner } from "@/components/error-banner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type OAuthProvider = "GOOGLE" | "APPLE";

const signInSchema = z.object({
  email: z.string().trim().email(texts.auth.validation.invalidEmail).max(255),
  password: z.string().min(6, texts.auth.validation.loginPasswordMin).max(128),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, texts.auth.validation.signupNameMin).max(80),
  email: z.string().trim().email(texts.auth.validation.invalidEmail).max(255),
  password: z.string().min(8, texts.auth.validation.passwordMin).max(128),
});

const oauthProviders: Record<
  OAuthProvider,
  { name: string; label: string; Icon: React.ElementType }
> = {
  GOOGLE: { name: "Google", label: texts.auth.social.google, Icon: GoogleIcon },
  APPLE: { name: "Apple", label: texts.auth.social.apple, Icon: AppleIcon },
};

type SignUpFormProps = {
  onAuthenticated: () => void;
};

export function SignUpForm({ onAuthenticated }: SignUpFormProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = signUpSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));

    if (!parsed.success) {
      setValidationErrors(mapValidationErrors(parsed.error.issues));
      return;
    }

    setValidationErrors({});
    setFormError(null);
    setIsSubmitting(true);
    clearSession();

    try {
      const authResponse = await authApi.signUp(parsed.data);
      storeAuthenticatedSession(authResponse);
      onAuthenticated();
    } catch (error) {
      setFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{texts.auth.signup.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{texts.auth.signup.subtitle}</p>

      <div className="mt-6">
        <OAuthButtons />
        <AuthDivider />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField label={texts.auth.fields.fullName} error={validationErrors.name}>
          <Input
            name="name"
            placeholder={texts.auth.placeholders.name}
            autoComplete="name"
            required
            maxLength={80}
          />
        </AuthField>
        <AuthField label={texts.auth.fields.email} error={validationErrors.email}>
          <Input
            name="email"
            type="email"
            placeholder={texts.auth.placeholders.email}
            autoComplete="email"
            required
            maxLength={255}
          />
        </AuthField>
        <AuthField label={texts.auth.fields.password} error={validationErrors.password}>
          <div className="relative">
            <Input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder={texts.auth.placeholders.newPassword}
              autoComplete="new-password"
              required
              maxLength={128}
            />
            <PasswordVisibilityButton
              isVisible={isPasswordVisible}
              onToggle={() => setIsPasswordVisible((isVisible) => !isVisible)}
            />
          </div>
        </AuthField>

        {formError && <ErrorBanner error={formError} />}
        <Button type="submit" className="w-full rounded-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {texts.common.createAccount} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

type SignInFormProps = {
  onAuthenticated: () => void;
  onForgotPassword: () => void;
};

export function SignInForm({ onAuthenticated, onForgotPassword }: SignInFormProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = signInSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));

    if (!parsed.success) {
      setValidationErrors(mapValidationErrors(parsed.error.issues));
      return;
    }

    setValidationErrors({});
    setFormError(null);
    setIsSubmitting(true);
    clearSession();

    try {
      const authResponse = await authApi.signIn(parsed.data);
      storeAuthenticatedSession(authResponse);
      onAuthenticated();
    } catch (error) {
      setFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{texts.auth.login.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{texts.auth.login.subtitle}</p>

      <div className="mt-6">
        <OAuthButtons />
        <AuthDivider />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField label={texts.auth.fields.email} error={validationErrors.email}>
          <Input
            name="email"
            type="email"
            placeholder={texts.auth.placeholders.email}
            autoComplete="email"
            required
            maxLength={255}
          />
        </AuthField>
        <AuthField
          label={texts.auth.fields.password}
          error={validationErrors.password}
          right={
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-primary hover:underline"
            >
              {texts.auth.password.forgot}
            </button>
          }
        >
          <div className="relative">
            <Input
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              placeholder={texts.auth.placeholders.password}
              autoComplete="current-password"
              required
              maxLength={128}
            />
            <PasswordVisibilityButton
              isVisible={isPasswordVisible}
              onToggle={() => setIsPasswordVisible((isVisible) => !isVisible)}
            />
          </div>
        </AuthField>

        {formError && <ErrorBanner error={formError} />}
        <Button type="submit" className="w-full rounded-full gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {texts.common.enter} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

type ForgotPasswordDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function ForgotPasswordDialog({ isOpen, onOpenChange }: ForgotPasswordDialogProps) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<unknown>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();

    if (!z.string().email().safeParse(email).success) {
      setValidationErrors({ email: texts.auth.validation.invalidEmail });
      return;
    }

    setValidationErrors({});
    setFormError(null);
    setIsSubmitting(true);

    try {
      await authApi.requestPasswordReset(email);
      setIsResetEmailSent(true);
    } catch (error) {
      setFormError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsResetEmailSent(false);
    setValidationErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(nextIsOpen) => (nextIsOpen ? onOpenChange(true) : handleClose())}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-semibold tracking-tight">{texts.auth.forgot.title}</DialogTitle>
        </DialogHeader>
        {isResetEmailSent ? (
          <div className="space-y-4 pb-2 pt-2">
            <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-4">
              <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{texts.auth.forgot.checkEmail}</p>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {texts.auth.forgot.sentDescription}
                </p>
              </div>
            </div>
            <Button className="w-full rounded-full" onClick={handleClose}>
              {texts.auth.forgot.understood}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pb-2 pt-2" noValidate>
            <p className="text-sm text-muted-foreground">{texts.auth.forgot.description}</p>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{texts.auth.fields.email}</Label>
              <Input
                name="email"
                type="email"
                placeholder={texts.auth.placeholders.email}
                autoComplete="email"
                required
                maxLength={255}
              />
              {validationErrors.email && (
                <p className="text-xs text-destructive">{validationErrors.email}</p>
              )}
            </div>
            {formError && <ErrorBanner error={formError} />}
            <Button type="submit" className="w-full gap-2 rounded-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {texts.auth.forgot.sendLink} <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function OAuthButtons() {
  const [activeOAuthProvider, setActiveOAuthProvider] = useState<OAuthProvider | null>(null);
  const [oauthError, setOAuthError] = useState<string | null>(null);

  const handleOAuthStart = async (provider: OAuthProvider) => {
    setActiveOAuthProvider(provider);
    setOAuthError(null);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setOAuthError(texts.auth.social.unavailable(oauthProviders[provider].name));
    setActiveOAuthProvider(null);
  };

  return (
    <div className="grid gap-2">
      {(Object.entries(oauthProviders) as [OAuthProvider, (typeof oauthProviders)[OAuthProvider]][]).map(
        ([provider, config]) => {
          const { Icon } = config;
          return (
            <button
              key={provider}
              type="button"
              onClick={() => handleOAuthStart(provider)}
              disabled={activeOAuthProvider !== null}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
            >
              {activeOAuthProvider === provider ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon />
              )}
              {config.label}
            </button>
          );
        },
      )}
      {oauthError && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {oauthError}
        </p>
      )}
    </div>
  );
}

function AuthDivider() {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
      <div className="h-px flex-1 bg-border" />
      {texts.auth.social.divider}
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

type PasswordVisibilityButtonProps = {
  isVisible: boolean;
  onToggle: () => void;
};

function PasswordVisibilityButton({ isVisible, onToggle }: PasswordVisibilityButtonProps) {
  const Icon = isVisible ? EyeOff : Eye;
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
      aria-label={isVisible ? texts.auth.password.hide : texts.auth.password.show}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

type AuthFieldProps = {
  label: string;
  error?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

function AuthField({ label, error, right, children }: AuthFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {right}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.7 2.6 12 2.6 6.8 2.6 2.6 6.8 2.6 12s4.2 9.4 9.4 9.4c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-foreground" aria-hidden>
      <path d="M16.4 12.7c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2.9-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3.1 2.4 1.3-.1 1.7-.8 3.2-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.2-1.2 3-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.6-1-2.7-3.9zM14 5.4c.7-.8 1.2-1.9 1-3-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.2-.5 2.9-1.4z" />
    </svg>
  );
}
