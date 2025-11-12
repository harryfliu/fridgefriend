"use client";

import { useState } from "react";
import IngredientInput from "@/components/IngredientInput";
import VoiceInput from "@/components/VoiceInput";
import RecipeDisplay from "@/components/RecipeDisplay";

interface Recipe {
  title: string;
  description: string;
  ingredientsUsed: string[];
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: string;
}

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddIngredient = (ingredient: string) => {
    setIngredients((prev) => {
      // Use functional form to get latest state
      if (!prev.includes(ingredient)) {
        return [...prev, ingredient];
      }
      return prev;
    });
    setError(null);
  };

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleClearAll = () => {
    setIngredients([]);
    setRecipe(null);
    setError(null);
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      setError("Please add at least one ingredient");
      return;
    }

    setLoading(true);
    setError(null);
    setRecipe(null);

    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate recipe");
      }

      setRecipe(data.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate recipe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4 sm:py-8 sm:px-6">
      <main className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            Fridge Friend
          </h1>
          <p className="text-base sm:text-lg text-gray-600 px-2">
            Turn your ingredients into delicious recipes
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            What ingredients do you have?
          </h2>

          <IngredientInput
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            onClearAll={handleClearAll}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
            <VoiceInput onIngredientDetected={handleAddIngredient} />

            {ingredients.length > 0 && (
              <button
                onClick={handleGenerateRecipe}
                disabled={loading}
                className="w-full sm:flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors min-h-[48px]"
              >
                {loading ? "Generating..." : "Generate Recipe"}
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Recipe Display */}
        {(loading || recipe) && <RecipeDisplay recipe={recipe} loading={loading} />}
      </main>
    </div>
  );
}
