import { useQuery } from "@tanstack/react-query";
import type { Recipe } from "@shared/schema";

export function useRecipes(limit?: number, offset?: number) {
  return useQuery<Recipe[]>({
    queryKey: ["/api/recipes", { limit, offset }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      
      const response = await fetch(`/api/recipes?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      return response.json();
    },
  });
}

export function useRecipe(id: string) {
  return useQuery<Recipe>({
    queryKey: ["/api/recipes", id],
    enabled: !!id,
  });
}

export function useRecipeStats() {
  return useQuery<{ total: number; fromInstagram: number; aiProcessed: number }>({
    queryKey: ["/api/recipes/stats"],
  });
}

export function useSearchRecipes(query: string) {
  return useQuery<Recipe[]>({
    queryKey: ["/api/recipes/search", { q: query }],
    enabled: !!query,
    queryFn: async () => {
      const response = await fetch(`/api/recipes/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search recipes');
      }
      return response.json();
    },
  });
}
