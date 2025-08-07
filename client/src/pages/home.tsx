import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MobileLayout from "@/components/mobile-layout";
import RecipeCard from "@/components/recipe-card";
import UploadModal from "@/components/upload-modal";
import { useRecipes, useRecipeStats } from "@/hooks/use-recipes";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const { data: recipes = [], isLoading } = useRecipes();
  const { data: stats } = useRecipeStats();

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MobileLayout>
      {/* Header */}
      <header className="bg-gradient-to-r from-golden to-dark-red px-6 py-4 text-white" data-testid="header-main">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <i className="fas fa-utensils text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-playfair font-bold" data-testid="text-app-title">Master Gourmet</h1>
              <p className="text-sm opacity-90" data-testid="text-app-subtitle">Sua coleção de receitas</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white bg-opacity-20 rounded-full text-white hover:bg-white hover:bg-opacity-30"
            data-testid="button-profile"
          >
            <i className="fas fa-user"></i>
          </Button>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="px-6 py-6 bg-white">
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-br from-golden to-yellow-600 text-white p-4 h-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            data-testid="button-upload-recipe"
          >
            <div className="flex flex-col items-center space-y-2">
              <Plus className="h-6 w-6" />
              <span className="font-semibold">Nova Receita</span>
              <span className="text-xs opacity-90">Upload manual</span>
            </div>
          </Button>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-br from-dark-red to-red-700 text-white p-4 h-auto rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            data-testid="button-instagram-reel"
          >
            <div className="flex flex-col items-center space-y-2">
              <i className="fab fa-instagram text-2xl"></i>
              <span className="font-semibold">Instagram Reel</span>
              <span className="text-xs opacity-90">Importar vídeo</span>
            </div>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar por ingredientes, nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-golden focus:border-transparent"
            data-testid="input-search"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6"
            data-testid="button-filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-olive bg-opacity-10 rounded-xl p-3 text-center" data-testid="card-stats-total">
            <div className="text-olive font-bold text-lg" data-testid="text-total-recipes">
              {stats?.total || 0}
            </div>
            <div className="text-olive text-xs font-medium">Receitas</div>
          </div>
          <div className="bg-golden bg-opacity-10 rounded-xl p-3 text-center" data-testid="card-stats-instagram">
            <div className="text-golden font-bold text-lg" data-testid="text-instagram-recipes">
              {stats?.fromInstagram || 0}
            </div>
            <div className="text-golden text-xs font-medium">Instagram</div>
          </div>
          <div className="bg-slate-dark bg-opacity-10 rounded-xl p-3 text-center" data-testid="card-stats-ai">
            <div className="text-slate-dark font-bold text-lg" data-testid="text-ai-processed">
              {stats?.aiProcessed || 0}
            </div>
            <div className="text-slate-dark text-xs font-medium">IA Processadas</div>
          </div>
        </div>
      </div>

      {/* Recipe List */}
      <div className="px-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800" data-testid="text-recipes-header">
            Suas Receitas
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-lg bg-gray-100"
              data-testid="button-toggle-view"
            >
              <i className="fas fa-th-large text-gray-600"></i>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-lg bg-gray-100"
              data-testid="button-sort-recipes"
            >
              <i className="fas fa-sort text-gray-600"></i>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md h-48 animate-pulse" />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">Nenhuma receita encontrada</div>
            <div className="text-gray-500 text-sm">
              {searchQuery ? "Tente buscar por outros termos" : "Adicione sua primeira receita!"}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-r from-golden to-dark-red text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
        data-testid="button-floating-add"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Upload Modal */}
      <UploadModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
      />
    </MobileLayout>
  );
}
