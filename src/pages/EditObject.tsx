import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Object as ObjectType, ObjectCategory } from '@/types/database';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, ArrowLeft } from 'lucide-react';

const EditObject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '' as ObjectCategory,
    condicao: '',
    status: 'disponivel' as 'disponivel' | 'em_negociacao' | 'trocado',
  });

  const [object, setObject] = useState<ObjectType | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  const categoryLabels: Record<ObjectCategory, string> = {
    livros: 'Livros',
    eletronicos: 'Eletrônicos',
    roupas: 'Roupas',
    acessorios: 'Acessórios',
    moveis: 'Móveis',
    outros: 'Outros',
  };

  const statusLabels = {
    disponivel: 'Disponível',
    em_negociacao: 'Em Negociação',
    trocado: 'Trocado',
  };

  useEffect(() => {
    if (id) {
      fetchObject();
    }
  }, [id]);

  const fetchObject = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('objects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Verificar se o usuário é o dono
      if (data.owner_id !== user?.id) {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão para editar este objeto.',
          variant: 'destructive',
        });
        navigate('/meus-objetos');
        return;
      }

      setObject(data);
      setFormData({
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        condicao: data.condicao,
        status: data.status,
      });
      setExistingImages(data.imagens || []);
    } catch (error: any) {
      console.error('Erro ao buscar objeto:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar o objeto.',
        variant: 'destructive',
      });
      navigate('/meus-objetos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 5) {
      toast({
        title: 'Limite de imagens',
        description: 'Você pode adicionar no máximo 5 imagens no total.',
        variant: 'destructive',
      });
      return;
    }

    setNewImages([...newImages, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews([...newImagePreviews, ...newPreviews]);
  };

  const removeExistingImage = (index: number) => {
    const newImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newImages);
  };

  const removeNewImage = (index: number) => {
    const newFiles = newImages.filter((_, i) => i !== index);
    const newPreviews = newImagePreviews.filter((_, i) => i !== index);
    setNewImages(newFiles);
    setNewImagePreviews(newPreviews);
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImages.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of newImages) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${user!.id}/${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('object-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('object-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error: any) {
      console.error('Erro ao fazer upload de imagens:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.descricao || !formData.categoria || !formData.condicao) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      // Upload de novas imagens
      const newImageUrls = await uploadNewImages();
      const allImages = [...existingImages, ...newImageUrls];

      // Atualizar objeto
      const { error } = await supabase
        .from('objects')
        .update({
          titulo: formData.titulo,
          descricao: formData.descricao,
          categoria: formData.categoria,
          condicao: formData.condicao,
          status: formData.status,
          imagens: allImages,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Objeto atualizado!',
        description: 'Suas alterações foram salvas com sucesso.',
      });

      navigate(`/objeto/${id}`);
    } catch (error: any) {
      console.error('Erro ao atualizar objeto:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Ocorreu um erro ao salvar suas alterações.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!object) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Editar Objeto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ex: Livro de Cálculo I"
                  required
                  disabled={isSaving}
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) => setFormData({ ...formData, categoria: value as ObjectCategory })}
                  disabled={isSaving}
                >
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condicao">Condição *</Label>
                <Input
                  id="condicao"
                  value={formData.condicao}
                  onChange={(e) => setFormData({ ...formData, condicao: e.target.value })}
                  placeholder="Ex: Novo, Usado, Bom estado..."
                  required
                  disabled={isSaving}
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                  disabled={isSaving}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione um status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o objeto em detalhes..."
                  required
                  disabled={isSaving}
                  rows={5}
                  maxLength={1000}
                />
              </div>

              <div className="space-y-4">
                <Label>Imagens (até 5)</Label>

                {/* Imagens existentes */}
                {existingImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Imagens atuais</p>
                    <div className="grid grid-cols-3 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                          <img src={image} alt={`Imagem ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Novas imagens */}
                {existingImages.length < 5 && (
                  <div className="space-y-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={isSaving || uploadingImages}
                      className="cursor-pointer"
                    />
                  </div>
                )}

                {newImagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Novas imagens</p>
                    <div className="grid grid-cols-3 gap-4">
                      {newImagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-md overflow-hidden border-2 border-primary">
                          <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/objeto/${id}`)}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSaving || uploadingImages}
                >
                  {isSaving || uploadingImages ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploadingImages ? 'Enviando imagens...' : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default EditObject;
