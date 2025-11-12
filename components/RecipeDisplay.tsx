"use client";

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

interface RecipeDisplayProps {
  recipe: Recipe | null;
  loading: boolean;
}

export default function RecipeDisplay({ recipe, loading }: RecipeDisplayProps) {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-600">Generating your perfect recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Recipe Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h2>
        {recipe.description && (
          <p className="text-gray-600 italic text-sm sm:text-base">{recipe.description}</p>
        )}
      </div>

      {/* Recipe Info */}
      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
        {recipe.prepTime && (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>
              <strong>Prep:</strong> {recipe.prepTime}
            </span>
          </div>
        )}
        {recipe.cookTime && (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path>
            </svg>
            <span>
              <strong>Cook:</strong> {recipe.cookTime}
            </span>
          </div>
        )}
        {recipe.servings && (
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>
              <strong>Servings:</strong> {recipe.servings}
            </span>
          </div>
        )}
      </div>

      {/* Ingredients Used */}
      {recipe.ingredientsUsed && recipe.ingredientsUsed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Using Your Ingredients
          </h3>
          <div className="flex flex-wrap gap-2">
            {recipe.ingredientsUsed.map((ingredient, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {ingredient}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full Ingredients List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Ingredients
        </h3>
        <ul className="space-y-2">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span className="text-gray-700">{ingredient}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Instructions
        </h3>
        <ol className="space-y-3">
          {recipe.instructions.map((instruction, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-gray-700 pt-0.5">{instruction}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
