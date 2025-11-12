"use client";

import { useState, useRef, useEffect } from "react";
import { commonIngredients } from "@/lib/ingredients";

interface IngredientInputProps {
  ingredients: string[];
  onAddIngredient: (ingredient: string) => void;
  onRemoveIngredient: (ingredient: string) => void;
  onClearAll: () => void;
}

export default function IngredientInput({
  ingredients,
  onAddIngredient,
  onRemoveIngredient,
  onClearAll,
}: IngredientInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputValue.trim().length > 0) {
      const filtered = commonIngredients.filter(
        (ingredient) =>
          ingredient.toLowerCase().includes(inputValue.toLowerCase()) &&
          !ingredients.includes(ingredient)
      );
      setSuggestions(filtered.slice(0, 8));
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, ingredients]);

  const handleAddIngredient = (ingredient: string) => {
    // Check if input contains commas - if so, split and add each ingredient
    if (ingredient.includes(',')) {
      const multipleIngredients = ingredient
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter((item) => item.length > 0 && !ingredients.includes(item));

      multipleIngredients.forEach((item) => {
        onAddIngredient(item);
      });

      setInputValue("");
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    } else {
      // Single ingredient
      const trimmed = ingredient.trim().toLowerCase();
      if (trimmed && !ingredients.includes(trimmed)) {
        onAddIngredient(trimmed);
        setInputValue("");
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleAddIngredient(suggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        handleAddIngredient(inputValue);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Input Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder="Type ingredients (comma-separated)..."
          className="w-full px-4 py-3 text-base sm:text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none min-h-[48px]"
        />

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => handleAddIngredient(suggestion)}
                className={`w-full px-4 py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition-colors min-h-[44px] ${
                  index === selectedIndex ? "bg-blue-100" : ""
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Added Ingredients */}
      {ingredients.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Your Ingredients ({ingredients.length})
            </h3>
            <button
              onClick={onClearAll}
              className="text-sm text-red-600 hover:text-red-700 active:text-red-800 font-medium py-1 px-2 min-h-[32px]"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ingredient) => (
              <span
                key={ingredient}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {ingredient}
                <button
                  onClick={() => onRemoveIngredient(ingredient)}
                  className="hover:bg-blue-200 active:bg-blue-300 rounded-full p-1 min-w-[24px] min-h-[24px] flex items-center justify-center transition-colors"
                  aria-label={`Remove ${ingredient}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
