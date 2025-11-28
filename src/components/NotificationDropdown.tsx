import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  Package,
  Loader2,
  CheckCircle2,
  ArrowRightLeft,
} from "lucide-react";
import { useTradeNotifications } from "@/hooks/useTradeNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const NotificationDropdown = () => {
  const { notifications, unreadCount, loading } = useTradeNotifications();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getNotificationMessage = (trade: any) => {
    if (trade.status === "pendente") {
      return {
        title: "Nova proposta",
        description: `${trade.proponente?.nome_completo} quer trocar por ${trade.objeto_desejado?.titulo}`,
        icon: <ArrowRightLeft className="h-3 w-3" />,
        className: "text-blue-500 bg-blue-500/10",
      };
    } else if (trade.status === "aceita") {
      return {
        title: "Troca aceita!",
        description: `Sua oferta pelo objeto "${trade.objeto_desejado?.titulo}" foi aceita.`,
        icon: <CheckCircle2 className="h-3 w-3" />,
        className: "text-green-500 bg-green-500/10",
      };
    }
    return {
      title: "Atualização",
      description: "Você tem uma nova interação.",
      icon: <Bell className="h-3 w-3" />,
      className: "text-gray-500 bg-gray-500/10",
    };
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-in zoom-in duration-300"></span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 rounded-xl border-border/50 bg-background/95 backdrop-blur-xl shadow-lg"
      >
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <Badge
              variant="secondary"
              className="text-xs font-normal bg-primary/10 text-primary hover:bg-primary/20"
            >
              {unreadCount} nova{unreadCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center px-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground/80">
              Tudo limpo por aqui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nenhuma notificação recente
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-border/30">
              {notifications.map((trade) => {
                const notification = getNotificationMessage(trade);
                return (
                  <Link
                    key={trade.id}
                    to="/trocas"
                    className="flex gap-4 p-4 hover:bg-muted/50 transition-all duration-200 group relative"
                  >
                    {trade.status === "pendente" && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary rounded-r-full"></div>
                    )}

                    <Avatar className="h-10 w-10 flex-shrink-0 border border-border/50">
                      <AvatarImage
                        src={trade.proponente?.avatar_url || undefined}
                      />
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {trade.proponente?.nome_completo ? (
                          getInitials(trade.proponente.nome_completo)
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors">
                          {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground/70 tabular-nums">
                          {formatDistanceToNow(new Date(trade.created_at), {
                            addSuffix: false,
                            locale: ptBR,
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.description}
                      </p>

                      {trade.status === "pendente" && (
                        <div
                          className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium w-fit ${notification.className}`}
                        >
                          {notification.icon}
                          <span>Nova Interação</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/50 bg-muted/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-primary h-8"
              asChild
            >
              <Link to="/trocas">Ver histórico completo</Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
