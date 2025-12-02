import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password, nome);
        await signIn(email, password);
      }
      navigate("/");
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-zinc-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-zinc-900">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/40 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary/40 rounded-full blur-[100px] animate-pulse delay-700" />

          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <div className="h-8 w-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">Circula UFRN</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Economia circular <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              dentro do campus.
            </span>
          </h1>
          <p className="text-lg text-zinc-400">
            Troque livros, materiais e experiências com outros estudantes da
            UFRN de forma segura e prática.
          </p>

          <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-4 mb-3">
              <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold border border-secondary/20">
                P
              </div>
              <div>
                <p className="text-sm font-semibold">Pedrinho</p>
                <p className="text-xs text-zinc-400">Educação fisica</p>
              </div>
            </div>
            <p className="text-sm text-zinc-300 italic">
              "Consegui todos os halteres trocando materiais que eu não usava
              mais. A plataforma é incrível!"
            </p>
          </div>
        </div>

        <div className="relative z-10 text-sm text-zinc-500">
          &copy; 2025 Projeto UFRN
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl lg:hidden" />

        <div className="w-full max-w-[400px] space-y-8 z-10">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">
              {activeTab === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {activeTab === "login"
                ? "Digite seu email institucional para entrar."
                : "Preencha os dados abaixo para começar."}
            </p>
          </div>

          <div className="grid grid-cols-2 p-1 bg-muted rounded-xl relative">
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-background rounded-lg shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                activeTab === "login" ? "left-1" : "left-[calc(50%)]"
              )}
            />
            <button
              onClick={() => setActiveTab("login")}
              className={cn(
                "relative z-10 text-sm font-medium py-2.5 transition-colors duration-200",
                activeTab === "login"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              Entrar
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={cn(
                "relative z-10 text-sm font-medium py-2.5 transition-colors duration-200",
                activeTab === "signup"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground/70"
              )}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className={cn(
                "space-y-2 overflow-hidden transition-all duration-300 ease-in-out",
                activeTab === "signup"
                  ? "max-h-24 opacity-100"
                  : "max-h-0 opacity-0"
              )}
            >
              <Label htmlFor="nome">Nome completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="pl-10 h-11 bg-muted/30 border-input/60 hover:border-primary/50 focus:bg-background transition-all"
                  required={activeTab === "signup"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email institucional</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ufrn.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-muted/30 border-input/60 hover:border-primary/50 focus:bg-background transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                {activeTab === "login" && (
                  <a
                    href="#"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Esqueceu?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-muted/30 border-input/60 hover:border-primary/50 focus:bg-background transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center">
                  {activeTab === "login"
                    ? "Acessar Plataforma"
                    : "Criar Conta Grátis"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Circula UFRN
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
