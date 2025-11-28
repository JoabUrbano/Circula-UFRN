import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Object as ObjectType } from "@/types/database";
import Navbar from "@/components/Navbar";
import ObjectCard from "@/components/ObjectCard";
import SearchFilters from "@/components/SearchFilters";
import { Loader2, PackageOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [objects, setObjects] = useState<ObjectType[]>([]);
  const [filteredObjects, setFilteredObjects] = useState<ObjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchObjects();
  }, []);

  const fetchObjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("objects")
        .select(`*, owner:profiles(*)`)
        .eq("status", "disponivel")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setObjects(data || []);
      setFilteredObjects(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar objetos:", error);
      toast({
        title: "Erro ao carregar objetos",
        description: "Ocorreu um erro ao buscar os objetos disponíveis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        <div className="relative mb-12 flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mb-6">
            Renove seus itens, <br className="hidden sm:block" />
            <span className="bg-[image:var(--gradient-hero)] bg-clip-text text-transparent">
              conecte-se no campus.
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed">
            A plataforma oficial de trocas da UFRN. Descubra tesouros escondidos
            e dê nova vida aos seus objetos parados.
          </p>
        </div>

        <div className="sticky top-20 z-40 mb-10 -mx-4 px-4 md:mx-0 md:px-0">
          <SearchFilters objects={objects} onFilter={setFilteredObjects} />
        </div>

        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse">
                Carregando oportunidades...
              </p>
            </div>
          ) : filteredObjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-muted/50 p-6 rounded-full mb-4 ring-1 ring-border">
                <PackageOpen className="h-12 w-12 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Nenhum objeto encontrado
              </h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Não encontramos itens com esses filtros. Tente limpar a busca
                para ver tudo o que está disponível.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 pb-10">
              {filteredObjects.map((object, index) => (
                <div
                  key={object.id}
                  className="animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ObjectCard object={object} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
