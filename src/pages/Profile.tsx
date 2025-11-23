import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Object } from '@/types/database';
import Navbar from '@/components/Navbar';
import ObjectCard from '@/components/ObjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Mail, Phone, BookOpen, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [objects, setObjects] = useState<Object[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchUserObjects();
      fetchUserRating();
    }
  }, [user]);

  const fetchUserObjects = async () => {
    try {
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('owner_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setObjects(data || []);
    } catch (error) {
      console.error('Erro ao buscar objetos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRating = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_rating', { user_id: user?.id });

      if (error) throw error;
      setRating(data || 0);
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {profile?.nome_completo?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{profile?.nome_completo}</h2>
                  <div className="flex items-center gap-1 text-muted-foreground mt-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{profile?.email}</span>
                  </div>
                  
                  {profile?.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{profile.telefone}</span>
                    </div>
                  )}
                  
                  {profile?.curso && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{profile.curso}</span>
                    </div>
                  )}
                </div>

                {profile?.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}

                <Button onClick={() => navigate('/editar-perfil')} variant="outline">
                  Editar Perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Meus Objetos</h3>
          {objects.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>Você ainda não cadastrou nenhum objeto.</p>
                <Button 
                  onClick={() => navigate('/cadastrar-objeto')} 
                  className="mt-4"
                >
                  Cadastrar Primeiro Objeto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {objects.map((object) => (
                <ObjectCard key={object.id} object={object} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
