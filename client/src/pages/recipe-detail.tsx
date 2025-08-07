import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Heart, Share2, Edit, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MobileLayout from "@/components/mobile-layout";
import type { Recipe } from "@shared/schema";

export default function RecipeDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    instructions: "",
    cookingTime: "",
    servings: "",
  });

  const { data: recipe, isLoading } = useQuery<Recipe>({
    queryKey: ["/api/recipes", id],
    enabled: !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: (isFavorite: boolean) =>
      apiRequest("PATCH", `/api/recipes/${id}/favorite`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: recipe?.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest("PATCH", `/api/recipes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      setIsEditing(false);
      toast({
        title: "Receita atualizada com sucesso!",
      });
    },
  });

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-6 space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </MobileLayout>
    );
  }

  if (!recipe) {
    return (
      <MobileLayout>
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Receita não encontrada</div>
          <Button onClick={() => setLocation("/")} data-testid="button-go-home">
            Voltar ao início
          </Button>
        </div>
      </MobileLayout>
    );
  }

  const handleEdit = () => {
    setEditForm({
      title: recipe.title,
      description: recipe.description || "",
      instructions: recipe.instructions || "",
      cookingTime: recipe.cookingTime?.toString() || "",
      servings: recipe.servings?.toString() || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate({
      title: editForm.title,
      description: editForm.description,
      instructions: editForm.instructions,
      cookingTime: editForm.cookingTime ? parseInt(editForm.cookingTime) : null,
      servings: editForm.servings ? parseInt(editForm.servings) : null,
    });
  };

  const handleFavorite = () => {
    favoriteMutation.mutate(!recipe.isFavorite);
  };

  return (
    <MobileLayout>
      {/* Header */}
      <div className="relative">
        {recipe.thumbnailPath ? (
          <img
            src={`/uploads/${recipe.thumbnailPath.split('/').pop()}`}
            alt={recipe.title}
            className="w-full h-64 object-cover"
            data-testid="img-recipe-thumbnail"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-golden to-dark-red flex items-center justify-center">
            <i className="fas fa-utensils text-white text-6xl opacity-50"></i>
          </div>
        )}
        
        {/* Overlay with navigation */}
        <div className="absolute inset-0 bg-black bg-opacity-30">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavorite}
                disabled={favoriteMutation.isPending}
                className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                data-testid="button-favorite"
              >
                <Heart className={`h-5 w-5 ${recipe.isFavorite ? 'fill-current text-red-500' : ''}`} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70"
                data-testid="button-share"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Source badges */}
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          {recipe.source === 'instagram' && (
            <Badge className="bg-dark-red text-white" data-testid="badge-instagram">
              <i className="fab fa-instagram mr-1"></i>
              Reel
            </Badge>
          )}
          {recipe.aiProcessed && (
            <Badge className="bg-golden text-white" data-testid="badge-ai-processed">
              <i className="fas fa-robot mr-1"></i>
              IA
            </Badge>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Title and actions */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="text-2xl font-playfair font-bold border-none p-0 focus-visible:ring-0"
                data-testid="input-edit-title"
              />
            ) : (
              <h1 className="text-2xl font-playfair font-bold text-gray-800" data-testid="text-recipe-title">
                {recipe.title}
              </h1>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={isEditing ? handleSave : handleEdit}
            disabled={updateMutation.isPending}
            className="text-golden hover:bg-golden hover:bg-opacity-10"
            data-testid="button-edit"
          >
            <Edit className="h-5 w-5" />
          </Button>
        </div>

        {/* Description */}
        {isEditing ? (
          <Textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            placeholder="Descrição da receita..."
            className="border-gray-200"
            data-testid="textarea-edit-description"
          />
        ) : (
          <p className="text-gray-600" data-testid="text-recipe-description">
            {recipe.description}
          </p>
        )}

        {/* Recipe info */}
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            {isEditing ? (
              <Input
                type="number"
                value={editForm.cookingTime}
                onChange={(e) => setEditForm({ ...editForm, cookingTime: e.target.value })}
                placeholder="30"
                className="w-16 h-6 text-xs"
                data-testid="input-edit-time"
              />
            ) : (
              <span data-testid="text-cooking-time">
                {recipe.cookingTime ? `${recipe.cookingTime} min` : 'Tempo não informado'}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            {isEditing ? (
              <Input
                type="number"
                value={editForm.servings}
                onChange={(e) => setEditForm({ ...editForm, servings: e.target.value })}
                placeholder="4"
                className="w-16 h-6 text-xs"
                data-testid="input-edit-servings"
              />
            ) : (
              <span data-testid="text-servings">
                {recipe.servings ? `${recipe.servings} porções` : 'Porções não informadas'}
              </span>
            )}
          </div>
        </div>

        {/* Ingredients */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3" data-testid="text-ingredients-header">
                Ingredientes
              </h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start space-x-2" data-testid={`text-ingredient-${index}`}>
                    <span className="text-golden mt-2">•</span>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3" data-testid="text-instructions-header">
              Modo de Preparo
            </h3>
            {isEditing ? (
              <Textarea
                value={editForm.instructions}
                onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                placeholder="Instruções detalhadas de preparo..."
                className="min-h-32"
                data-testid="textarea-edit-instructions"
              />
            ) : (
              <div className="text-gray-700 whitespace-pre-wrap" data-testid="text-instructions">
                {recipe.instructions || 'Instruções não disponíveis'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcription if available */}
        {recipe.transcription && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3" data-testid="text-transcription-header">
                Transcrição do Vídeo
              </h3>
              <div className="text-gray-600 text-sm italic" data-testid="text-transcription">
                "{recipe.transcription}"
              </div>
            </CardContent>
          </Card>
        )}

        {/* Source info */}
        {recipe.sourceUrl && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2" data-testid="text-source-header">
                Fonte Original
              </h3>
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-golden hover:underline text-sm"
                data-testid="link-source"
              >
                {recipe.sourceUrl}
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
}
