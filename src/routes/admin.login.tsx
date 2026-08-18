import { createFileRoute, useNavigate } from '@tanstack/react-router'
import * as Icons from 'lucide-react'
import { useState } from 'react'
import { requestAdminOtp, validateAdminCredentials, verifyAdminOtp } from '@/lib/admin-credentials'

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginPage,
  head: () => ({ meta: [{ title: 'Login Administrativo — Alma e Essência.' }] }),
})

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [erro, setErro] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setIsLoading(true);

    const valid = await validateAdminCredentials(email, senha);
    if (!valid) {
      setIsLoading(false);
      setErro('E-mail ou senha incorretos ou você não tem permissão administrativa.');
      return;
    }

    const codeSent = await requestAdminOtp(email);
    setIsLoading(false);

    if (!codeSent) {
      setErro('Não foi possível enviar o código para o e-mail informado. Tente novamente.');
      return;
    }

    setPendingEmail(email);
    setStep('otp');
    setOtp('');
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setIsLoading(true);

    const valid = await verifyAdminOtp(pendingEmail, otp);
    setIsLoading(false);

    if (valid) {
      navigate({ to: '/admin' });
      return;
    }

    setErro('Código inválido ou expirado. Solicite um novo código e tente novamente.');
  }

  const handleResendCode = async () => {
    setErro('');
    setIsLoading(true);

    const codeSent = await requestAdminOtp(pendingEmail || email);
    setIsLoading(false);

    if (!codeSent) {
      setErro('Não foi possível reenviar o código. Verifique o e-mail e tente novamente.');
      return;
    }

    setOtp('');
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background px-4 py-8">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-full w-[120vw] -translate-x-1/2 rounded-full bg-caramel/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-xl rounded-[2rem] border border-border bg-card/95 p-10 shadow-soft backdrop-blur-xl">
        <div className="mb-8 space-y-4 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Acesso administrativo</p>
          <h1 className="text-4xl font-serif font-bold text-foreground">
            {step === 'credentials' ? 'Login do painel' : 'Verificação por e-mail'}
          </h1>
          <p className="mx-auto max-w-lg text-sm leading-6 text-muted-foreground">
            {step === 'credentials'
              ? 'Use seu e-mail de administrador para acessar o painel principal e gerenciar produtos, vendas e métricas.'
              : 'Enviamos um código de 6 dígitos para o e-mail informado. Digite o código para concluir o acesso.'}
          </p>
        </div>

        {step === 'credentials' ? (
          <form className="space-y-5" onSubmit={handleCredentialsSubmit}>
            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">E-mail</span>
              <div className="relative">
                <Icons.Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@almaeessencia.com"
                  className="w-full rounded-[1.5rem] border border-border bg-background px-12 py-4 text-sm text-foreground outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/20"
                  required
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Senha</span>
              <div className="relative">
                <Icons.Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[1.5rem] border border-border bg-background px-12 py-4 text-sm text-foreground outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((state) => !state)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                >
                  {showPassword ? <Icons.EyeOff className="h-4 w-4" /> : <Icons.Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {erro && <p className="rounded-2xl bg-rose/10 border border-rose/20 px-4 py-3 text-sm text-rose">{erro}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-[1.5rem] bg-caramel px-6 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-caramel/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Verificando...' : 'Continuar'}
              </button>
              <button
                type="button"
                onClick={() => navigate({ to: '/' })}
                className="inline-flex items-center justify-center rounded-[1.5rem] border border-border bg-background px-6 py-4 text-sm font-semibold text-foreground transition hover:bg-secondary"
              >
                Voltar ao site
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-5" onSubmit={handleOtpSubmit}>
            <div className="rounded-[1.5rem] border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              Código enviado para <span className="font-semibold text-foreground">{pendingEmail}</span>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Código de verificação</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="w-full rounded-[1.5rem] border border-border bg-background px-4 py-4 text-center text-lg font-semibold tracking-[0.5em] text-foreground outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/20"
                required
              />
            </label>

            {erro && <p className="rounded-2xl bg-rose/10 border border-rose/20 px-4 py-3 text-sm text-rose">{erro}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={isLoading || otp.length < 6}
                className="inline-flex items-center justify-center rounded-[1.5rem] bg-caramel px-6 py-4 text-sm font-semibold text-primary-foreground transition hover:bg-caramel/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Validando...' : 'Confirmar código'}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-[1.5rem] border border-border bg-background px-6 py-4 text-sm font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Enviando...' : 'Reenviar'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setStep('credentials');
                setOtp('');
                setErro('');
              }}
              className="w-full text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Voltar para login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
