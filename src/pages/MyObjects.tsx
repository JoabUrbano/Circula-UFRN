import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Object as ObjectType } from "@/types/database";
import Navbar from "@/components/Navbar";
import ObjectCard from "@/components/ObjectCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, Package, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MyObjects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [objects, setObjects] = useState<ObjectType[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<ObjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  useEffect(() => {
    if (user) {
      fetchMyObjects();
    }
  }, [user]);

  useEffect(() => {
    filterObjects();
  }, [objects, statusFilter]);

  const fetchMyObjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("objects")
        .select(`*, owner:profiles(*)`)
        .eq("owner_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setObjects(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar objetos:", error);
      toast({
        title: "Erro ao carregar objetos",
        description: "Ocorreu um erro ao buscar seus objetos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterObjects = () => {
    if (statusFilter === "todos") {
      setFilteredObjects(objects);
    } else {
      setFilteredObjects(objects.filter((obj) => obj.status === statusFilter));
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      disponivel: "Disponível",
      trocado: "Trocado",
      indisponivel: "Indisponível",
    };
    return labels[status] || status;
  };

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
              Meus Objetos
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed mx-auto">
              Gerencie todos os objetos que você anunciou na plataforma. Adicione
              novos itens, edite ou acompanhe o status das suas trocas.
            </p>
          </div>

          <Button
            onClick={() => navigate("/cadastrar-objeto")}
            size="lg"
            className="gap-2"
          >
            <Plus className="h-5 w-5" />
            Novo Objeto
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
              <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              Carregando seus objetos...
            </p>
          </div>
        ) : objects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-muted/50 p-6 rounded-full mb-4 ring-1 ring-border">
              <Package className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Você ainda não tem objetos anunciados
            </h3>
            <p className="text-muted-foreground max-w-sm mt-2">
              Comece a compartilhar seus itens! Cadastre seus primeiros objetos
              para começar a fazer trocas.
            </p>
            <Button
              onClick={() => navigate("/cadastrar-objeto")}
              className="mt-6"
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Cadastrar Primeiro Objeto
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-muted-foreground">
                  {filteredObjects.length} objeto{filteredObjects.length !== 1 ? "s" : ""} encontrado{filteredObjects.length !== 1 ? "s" : ""}
                </p>
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="trocado">Trocado</SelectItem>
                  <SelectItem value="indisponivel">Indisponível</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-h-[400px]">
              {filteredObjects.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Nenhum objeto com este status
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Tente selecionar outro status para ver seus objetos.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setStatusFilter("todos")}
                    >
                      Ver todos os objetos
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-10">
                  {filteredObjects.map((object, index) => (
                    <div
                      key={object.id}
                      className="relative animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <ObjectCard object={object} />
                      <div className="absolute top-2 left-2 z-10">
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                          object.status === "disponivel"
                            ? "bg-green-500/20 text-green-700 border-green-200 dark:text-green-400 dark:border-green-800"
                            : object.status === "trocado"
                            ? "bg-blue-500/20 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800"
                            : "bg-gray-500/20 text-gray-700 border-gray-200 dark:text-gray-400 dark:border-gray-800"
                        }`}>
                          {getStatusLabel(object.status)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        onClick={() => navigate(`/editar-objeto/${object.id}`)}
                        title="Editar objeto"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyObjects;
