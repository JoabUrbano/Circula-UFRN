import { Link } from "react-router-dom";
import { Object as ObjectType } from "@/types/database";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Package, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ObjectCardProps {
  object: ObjectType;
  className?: string;
}

const ObjectCard = ({ object, className }: ObjectCardProps) => {
  const categoryLabels: Record<string, string> = {
    livros: "Livros",
    eletronicos: "Eletrônicos",
    roupas: "Roupas",
    acessorios: "Acessórios",
    moveis: "Móveis",
    outros: "Outros",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link to={`/objeto/${object.id}`} className={cn("block h-full", className)}>
      <Card className="group relative h-full flex flex-col overflow-hidden rounded-xl border-muted-foreground/10 bg-background/60 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md dark:bg-muted/20">
        <div className="relative aspect-square overflow-hidden bg-muted/50">
          {object.imagens && object.imagens.length > 0 ? (
            <img
              src={object.imagens[0]}
              alt={object.titulo}
              className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground/50">
              <Package strokeWidth={1.5} className="h-16 w-16" />
            </div>
          )}

          <Badge
            className="absolute right-3 top-3 bg-black/50 text-white backdrop-blur-md hover:bg-black/70 dark:bg-white/20 dark:text-white dark:hover:bg-white/30 border-none font-medium px-2.5 py-0.5"
            variant="secondary"
          >
            {categoryLabels[object.categoria]}
          </Badge>
        </div>

        <CardContent className="flex flex-col flex-grow gap-2 p-5 pt-4">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-lg leading-tight tracking-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {object.titulo}
            </h3>
            <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 text-primary shrink-0" />
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {object.descricao}
          </p>
        </CardContent>

        <CardFooter className="border-t border-border/50 p-4 bg-muted/30 dark:bg-transparent mt-auto">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-8 w-8 ring-2 ring-background ring-offset-2 ring-offset-primary/10 transition-shadow group-hover:ring-primary/30">
              <AvatarImage
                src={object.owner?.avatar_url || undefined}
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {object.owner?.nome_completo
                  ? getInitials(object.owner.nome_completo)
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col truncate">
              <span className="text-xs text-muted-foreground">
                Anunciado por
              </span>
              <span className="text-sm font-medium truncate text-foreground/90">
                {object.owner?.nome_completo || "Usuário"}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default ObjectCard;
