import { type FormEvent, useState } from "react";

import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";

import { ArrowRight, CheckCircle2, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { z } from "zod";

import { ApiError, authApi } from "@/lib/api";
import { texts } from "@/texts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resetPasswordSearchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/auth/reset")({
  validateSearch: resetPasswordSearchSchema,
  head: () => ({
    meta: [
      { title: texts.auth.seo.resetTitle },
      { name: "description", content: texts.auth.seo.resetDescription },
    ],
  }),
  component: ResetPasswordPage,
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, texts.auth.validation.passwordMin).max(128),
});

function ResetPasswordPage() {
  const { token = "" } = Route.useSearch();
  const navigate = useNavigate();
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isResetComplete, setIsResetComplete] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      const nextValidationErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        nextValidationErrors[issue.path[0] as string] = issue.message;
      }
      setValidationErrors(nextValidationErrors);
      return;
    }
    if (!token) {
      setValidationErrors({ form: texts.auth.reset.invalidLink });
      return;
    }
    setValidationErrors({});
    setIsSubmitting(true);
    try {
      await authApi.resetPassword(token, parsed.data.password);
      setIsResetComplete(true);
    } catch (error) {
      if (error instanceof ApiError) setValidationErrors({ form: error.message });
      else setValidationErrors({ form: texts.errors.unexpected });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-10 text-primary-foreground lg:flex"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div
          aria-hidden
          className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <Link to="/" className="relative flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary-foreground/20 backdrop-blur">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            {texts.brand.prefix}
            <span className="gradient-text">{texts.brand.accent}</span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
            {texts.auth.hero.eyebrow}
          </p>
          <h2 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
            {texts.auth.hero.quote}
          </h2>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-foreground/25" />
            <div>
              <p className="font-medium">{texts.auth.hero.person}</p>
              <p className="text-sm text-primary-foreground/75">{texts.auth.hero.role}</p>
            </div>
          </div>
        </div>

        <div className="relative grid grid-cols-3 gap-4 text-sm">
          {texts.auth.hero.stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl font-semibold">{stat.value}</p>
              <p className="text-primary-foreground/75">{stat.label}</p>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex flex-col px-6 py-10 sm:px-12">
        <div className="flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight">
              {texts.brand.prefix}
              <span className="gradient-text">{texts.brand.accent}</span>
            </span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          {isResetComplete ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                {texts.auth.reset.successTitle}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {texts.auth.reset.successDescription}
              </p>
              <Button
                className="mt-6 w-full gap-2 rounded-full"
                onClick={() => navigate({ to: "/entrar", search: { tab: "login" } })}
              >
                {texts.auth.reset.enterNow} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{texts.auth.reset.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{texts.auth.reset.description}</p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">{texts.auth.fields.newPassword}</Label>
                  <div className="relative">
                    <Input
                      name="password"
                      type={isPasswordVisible ? "text" : "password"}
                      placeholder={texts.auth.placeholders.newPassword}
                      autoComplete="new-password"
                      required
                      maxLength={128}
                    />
                    <button
                      type="button"
                      onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                      aria-label={
                        isPasswordVisible ? texts.auth.password.hide : texts.auth.password.show
                      }
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="text-xs text-destructive">{validationErrors.password}</p>
                  )}
                </div>

                {validationErrors.form && (
                  <p className="rounded-xl bg-destructive/10 px-4 py-2 text-sm text-destructive">
                    {validationErrors.form}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full gap-2 rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {texts.auth.reset.action} <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                {texts.auth.reset.remembered}{" "}
                <Link
                  to="/entrar"
                  search={{ tab: "login" }}
                  className="text-primary hover:underline"
                >
                  {texts.common.enter}
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
