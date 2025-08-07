import { Heart, Clock, Users, Share2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: (isFavorite: boolean) =>
      apiRequest("PATCH", `/api/recipes/${recipe.id}/favorite`, { isFavorite }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: recipe.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
      });
    },
  });

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    favoriteMutation.mutate(!recipe.isFavorite);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description || undefined,
        url: window.location.href + `recipe/${recipe.id}`,
      });
    } else {
      navigator.clipboard.writeText(window.location.href + `recipe/${recipe.id}`);
      toast({
        title: "Link copiado para a área de transferência!",
      });
    }
  };

  const handleClick = () => {
    setLocation(`/recipe/${recipe.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      data-testid={`card-recipe-${recipe.id}`}
    >
      <div className="relative">
        {recipe.thumbnailPath ? (
          <img
            src={`/uploads/${recipe.thumbnailPath.split('/').pop()}`}
            alt={recipe.title}
            className="w-full h-32 object-cover"
            data-testid={`img-recipe-${recipe.id}`}
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-golden to-dark-red flex items-center justify-center">
            <i className="fas fa-utensils text-white text-3xl opacity-50"></i>
          </div>
        )}
        
        {/* Source badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {recipe.source === 'instagram' && (
            <Badge className="bg-dark-red text-white text-xs" data-testid={`badge-instagram-${recipe.id}`}>
              <i className="fab fa-instagram mr-1"></i>
              Reel
            </Badge>
          )}
          {recipe.source === 'upload' && (
            <Badge className="bg-olive text-white text-xs" data-testid={`badge-upload-${recipe.id}`}>
              <i className="fas fa-user mr-1"></i>
              Original
            </Badge>
          )}
        </div>
        
        {recipe.aiProcessed && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-golden text-white text-xs" data-testid={`badge-ai-${recipe.id}`}>
              <i className="fas fa-robot mr-1"></i>
              IA
            </Badge>
          </div>
        )}

        {/* Video play button if it's a video */}
        {recipe.videoPath && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 bg-white bg-opacity-90 rounded-full text-dark-red hover:bg-white"
              data-testid={`button-play-${recipe.id}`}
            >
              <i className="fas fa-play ml-1"></i>
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2" data-testid={`text-title-${recipe.id}`}>
          {recipe.title}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2" data-testid={`text-description-${recipe.id}`}>
          {recipe.description || "Sem descrição disponível"}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            {recipe.cookingTime && (
              <span data-testid={`text-time-${recipe.id}`}>
                <Clock className="inline h-3 w-3 mr-1" />
                {recipe.cookingTime} min
              </span>
            )}
            {recipe.servings && (
              <span data-testid={`text-servings-${recipe.id}`}>
                <Users className="inline h-3 w-3 mr-1" />
                {recipe.servings} porções
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavorite}
              disabled={favoriteMutation.isPending}
              className="h-8 w-8 text-golden hover:bg-golden hover:bg-opacity-10"
              data-testid={`button-favorite-${recipe.id}`}
            >
              <Heart className={`h-4 w-4 ${recipe.isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShare}
              className="h-8 w-8 text-slate-dark hover:bg-slate-dark hover:bg-opacity-10"
              data-testid={`button-share-${recipe.id}`}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
