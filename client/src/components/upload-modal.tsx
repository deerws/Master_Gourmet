import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Instagram, Edit, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'select' | 'upload' | 'instagram'>('select');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/recipes/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/stats"] });
      toast({
        title: "Receita criada com sucesso!",
        description: "Sua receita foi processada e adicionada à coleção.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const instagramMutation = useMutation({
    mutationFn: (data: { url: string; title?: string; description?: string }) =>
      apiRequest("POST", "/api/recipes/instagram", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes/stats"] });
      toast({
        title: "Receita do Instagram criada com sucesso!",
        description: "O vídeo foi baixado e processado pela IA.",
      });
      handleClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao processar Instagram",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setMode('select');
    setInstagramUrl('');
    setUploadForm({ title: '', description: '' });
    setSelectedFile(null);
    setUploadProgress(0);
    onOpenChange(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('title', uploadForm.title);
    formData.append('description', uploadForm.description);

    uploadMutation.mutate(formData);
  };

  const handleInstagramSubmit = () => {
    if (!instagramUrl) return;

    instagramMutation.mutate({
      url: instagramUrl,
      title: uploadForm.title,
      description: uploadForm.description,
    });
  };

  const isLoading = uploadMutation.isPending || instagramMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-playfair font-semibold" data-testid="text-modal-title">
              Adicionar Receita
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="h-6 w-6"
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Modal Handle */}
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {mode === 'select' && (
            <div className="space-y-4">
              <Button
                onClick={() => setMode('upload')}
                className="w-full bg-gradient-to-r from-golden to-yellow-600 text-white p-4 h-auto rounded-2xl flex items-center justify-center space-x-3 hover:shadow-lg transition-all"
                data-testid="button-upload-video"
              >
                <Upload className="h-5 w-5" />
                <span className="font-semibold">Upload de Vídeo</span>
              </Button>
              
              <Button
                onClick={() => setMode('instagram')}
                className="w-full bg-gradient-to-r from-dark-red to-red-700 text-white p-4 h-auto rounded-2xl flex items-center justify-center space-x-3 hover:shadow-lg transition-all"
                data-testid="button-instagram-link"
              >
                <Instagram className="h-5 w-5" />
                <span className="font-semibold">Link do Instagram</span>
              </Button>
            </div>
          )}

          {mode === 'upload' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-upload" data-testid="label-video-upload">
                  Selecione o vídeo da receita
                </Label>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="mt-2"
                  data-testid="input-video-file"
                />
              </div>

              <div>
                <Label htmlFor="title" data-testid="label-title">
                  Título (opcional)
                </Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Nome da receita"
                  className="mt-2"
                  data-testid="input-title"
                />
              </div>

              <div>
                <Label htmlFor="description" data-testid="label-description">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Descrição da receita"
                  className="mt-2"
                  data-testid="textarea-description"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setMode('select')}
                  className="flex-1"
                  data-testid="button-back-to-select"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isLoading}
                  className="flex-1 bg-golden text-white hover:bg-golden/90"
                  data-testid="button-process-upload"
                >
                  {isLoading ? "Processando..." : "Processar"}
                </Button>
              </div>
            </div>
          )}

          {mode === 'instagram' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="instagram-url" data-testid="label-instagram-url">
                  Link do Instagram Reel
                </Label>
                <Input
                  id="instagram-url"
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  className="mt-2"
                  data-testid="input-instagram-url"
                />
              </div>

              <div>
                <Label htmlFor="title" data-testid="label-title-instagram">
                  Título (opcional)
                </Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Nome da receita"
                  className="mt-2"
                  data-testid="input-title-instagram"
                />
              </div>

              <div>
                <Label htmlFor="description" data-testid="label-description-instagram">
                  Descrição (opcional)
                </Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Descrição da receita"
                  className="mt-2"
                  data-testid="textarea-description-instagram"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setMode('select')}
                  className="flex-1"
                  data-testid="button-back-to-select-instagram"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleInstagramSubmit}
                  disabled={!instagramUrl || isLoading}
                  className="flex-1 bg-dark-red text-white hover:bg-dark-red/90"
                  data-testid="button-process-instagram"
                >
                  {isLoading ? "Processando..." : "Processar"}
                </Button>
              </div>
            </div>
          )}

          {/* Processing Status */}
          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4" data-testid="status-processing">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-blue-800 font-medium">Processando com IA...</span>
              </div>
              <p className="text-blue-600 text-sm mt-2">
                {mode === 'instagram' 
                  ? "Baixando vídeo e extraindo ingredientes..."
                  : "Analisando vídeo e extraindo receita..."
                }
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
