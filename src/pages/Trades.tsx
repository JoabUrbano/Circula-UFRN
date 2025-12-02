import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Trade } from "@/types/database";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Trades = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("enviadas");

  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select(
          `id, created_at, updated_at, status, mensagem, 
          proponente_id, receptor_id, objeto_oferecido_id, objeto_desejado_id, location_id,
          proponente:profiles!proponente_id(id, nome_completo, avatar_url, email),
          receptor:profiles!receptor_id(id, nome_completo, avatar_url, email),
          objeto_oferecido:objects!objeto_oferecido_id(id, titulo, categoria, imagens),
          objeto_desejado:objects!objeto_desejado_id(id, titulo, categoria, imagens)`
        )
        .or(`proponente_id.eq.${user?.id},receptor_id.eq.${user?.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTrades(data as Trade[] || []);
    } catch (error: any) {
      console.error("Erro ao buscar trocas:", error);
      toast({
        title: "Erro ao carregar trocas",
        description: "Ocorreu um erro ao buscar suas trocas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4" />;
      case "aceita":
        return <CheckCircle2 className="h-4 w-4" />;
      case "recusada":
      case "cancelada":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: "Pendente",
      aceita: "Aceita",
      recusada: "Recusada",
      cancelada: "Cancelada",
      concluida: "Concluída",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800";
      case "aceita":
        return "bg-green-500/20 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800";
      case "recusada":
      case "cancelada":
        return "bg-red-500/20 text-red-700 border-red-200 dark:text-red-400 dark:border-red-800";
      case "concluida":
        return "bg-blue-500/20 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800";
      default:
        return "";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sentTrades = trades.filter((t) => t.proponente_id === user?.id);
  const receivedTrades = trades.filter((t) => t.receptor_id === user?.id);

  const TradeCard = ({ trade }: { trade: Trade }) => (
    <Card className="hover:border-primary/50 transition-all duration-300 overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Status e Data */}
        <div className="flex items-center justify-between">
          <Badge className={`gap-2 border ${getStatusColor(trade.status)}`}>
            {getStatusIcon(trade.status)}
            {getStatusLabel(trade.status)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(trade.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>
        </div>

        {/* Usuário envolvido */}
        <div className="flex items-center gap-3 py-3 px-3 bg-muted/50 rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={
                activeTab === "enviadas"
                  ? trade.receptor?.avatar_url || undefined
                  : trade.proponente?.avatar_url || undefined
              }
            />
            <AvatarFallback className="bg-primary/10">
              {activeTab === "enviadas"
                ? getInitials(trade.receptor?.nome_completo || "U")
                : getInitials(trade.proponente?.nome_completo || "U")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {activeTab === "enviadas"
                ? trade.receptor?.nome_completo
                : trade.proponente?.nome_completo}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {activeTab === "enviadas"
                ? trade.receptor?.email
                : trade.proponente?.email}
            </p>
          </div>
        </div>

        {/* Objetos da troca */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 bg-background rounded-lg p-3">
            {/* Objeto oferecido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {trade.objeto_oferecido?.imagens?.[0] ? (
                  <img
                    src={trade.objeto_oferecido.imagens[0]}
                    alt={trade.objeto_oferecido?.titulo}
                    className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {trade.objeto_oferecido?.titulo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeTab === "enviadas" ? "Você oferece" : "Oferecido"}
                  </p>
                </div>
              </div>
            </div>

            {/* Seta */}
            <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

            {/* Objeto desejado */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-end gap-2">
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-sm font-medium truncate">
                    {trade.objeto_desejado?.titulo}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeTab === "enviadas" ? "Recebe" : "Você recebe"}
                  </p>
                </div>
                {trade.objeto_desejado?.imagens?.[0] ? (
                  <img
                    src={trade.objeto_desejado.imagens[0]}
                    alt={trade.objeto_desejado?.titulo}
                    className="h-12 w-12 rounded-md object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem */}
        {trade.mensagem && (
          <div className="bg-muted/50 p-3 rounded-lg border-l-2 border-primary">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Mensagem:
            </p>
            <p className="text-sm text-foreground line-clamp-2">
              {trade.mensagem}
            </p>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/objeto/${
              activeTab === "enviadas"
                ? trade.objeto_desejado?.id
                : trade.objeto_oferecido?.id
            }`)}
          >
            Ver Objeto
          </Button>
          {trade.status === "aceita" && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/trade/${trade.id}`)}
            >
              Conversar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/20 backdrop-blur-md transition-all duration-300">
        <Navbar />
      </header>

      <div className="fixed inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 dark:opacity-10"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      <main className="container px-4 md:px-6 pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="relative mb-12 flex flex-col items-center justify-center text-center gap-6">
          <div className="w-full">
            <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6 mx-auto">
              Minhas Trocas
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed mx-auto">
              Acompanhe o status de todas as suas propostas de troca e gerencie
              as trocas aceitas.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Carregando suas trocas...
            </p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="enviadas" className="gap-2">
                Enviadas ({sentTrades.length})
              </TabsTrigger>
              <TabsTrigger value="recebidas" className="gap-2">
                Recebidas ({receivedTrades.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enviadas" className="space-y-6">
              {sentTrades.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Nenhuma proposta enviada
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Você ainda não enviou nenhuma proposta de troca. Explore
                      os objetos disponíveis e faça sua primeira proposta!
                    </p>
                    <Button onClick={() => navigate("/")} variant="outline">
                      Explorar Objetos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sentTrades.map((trade) => (
                    <TradeCard key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recebidas" className="space-y-6">
              {receivedTrades.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Nenhuma proposta recebida
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Ninguém ainda propôs trocar seus objetos. Confira seus
                      anúncios para garantir que estão bem descritos!
                    </p>
                    <Button
                      onClick={() => navigate("/meus-objetos")}
                      variant="outline"
                    >
                      Meus Objetos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {receivedTrades.map((trade) => (
                    <TradeCard key={trade.id} trade={trade} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Trades;
