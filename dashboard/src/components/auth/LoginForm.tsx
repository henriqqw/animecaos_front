"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface LoginFormProps {
  configured: boolean;
  configurationError: string | null;
}

export function LoginForm({ configured, configurationError }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const disabled = isLoading || !configured;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password }),
        cache: "no-store"
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error ?? "Falha no login.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Falha de rede ao autenticar.");
    } finally {
      setIsLoading(false);
      setPassword("");
    }
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      {!configured ? (
        <p className="auth-error">
          Dashboard desabilitado: {configurationError ?? "faltam variaveis de ambiente de auth."}
        </p>
      ) : null}

      <label className="auth-label" htmlFor="auth-username">
        Usuario
      </label>
      <input
        id="auth-username"
        name="username"
        type="text"
        autoComplete="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
        minLength={3}
        maxLength={64}
        disabled={disabled}
        className="auth-input"
      />

      <label className="auth-label" htmlFor="auth-password">
        Senha
      </label>
      <input
        id="auth-password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        minLength={8}
        maxLength={256}
        disabled={disabled}
        className="auth-input"
      />

      {error ? <p className="auth-error">{error}</p> : null}

      <button type="submit" className="auth-submit" disabled={disabled}>
        {isLoading ? "Entrando..." : "Entrar no dashboard"}
      </button>
    </form>
  );
}
