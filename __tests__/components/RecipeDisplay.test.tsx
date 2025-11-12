import { render, screen } from '@testing-library/react';
import RecipeDisplay from '@/components/RecipeDisplay';

const mockRecipe = {
  title: 'Delicious Chicken Salad',
  description: 'A fresh and tasty chicken salad',
  ingredientsUsed: ['chicken', 'lettuce', 'tomato'],
  ingredients: [
    '2 chicken breasts, grilled and sliced',
    '4 cups lettuce, chopped',
    '2 tomatoes, diced',
    'Salt and pepper to taste',
  ],
  instructions: [
    'Grill the chicken breasts until fully cooked',
    'Chop the lettuce and dice the tomatoes',
    'Slice the chicken and combine all ingredients',
    'Season with salt and pepper',
  ],
  prepTime: '10 minutes',
  cookTime: '15 minutes',
  servings: '2 servings',
};

describe('RecipeDisplay', () => {
  it('shows loading state when loading is true', () => {
    render(<RecipeDisplay recipe={null} loading={true} />);

    expect(screen.getByText(/generating your perfect recipe/i)).toBeInTheDocument();
  });

  it('renders nothing when not loading and no recipe', () => {
    const { container } = render(<RecipeDisplay recipe={null} loading={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('displays recipe title and description', () => {
    render(<RecipeDisplay recipe={mockRecipe} loading={false} />);

    expect(screen.getByText('Delicious Chicken Salad')).toBeInTheDocument();
    expect(screen.getByText('A fresh and tasty chicken salad')).toBeInTheDocument();
  });

  it('displays prep time, cook time, and servings', () => {
    render(<RecipeDisplay recipe={mockRecipe} loading={false} />);

    expect(screen.getByText(/Prep:/)).toBeInTheDocument();
    expect(screen.getByText(/10 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/Cook:/)).toBeInTheDocument();
    expect(screen.getByText(/15 minutes/)).toBeInTheDocument();
    expect(screen.getByText(/Servings:/)).toBeInTheDocument();
    expect(screen.getByText(/2 servings/)).toBeInTheDocument();
  });

  it('displays ingredients used section', () => {
    render(<RecipeDisplay recipe={mockRecipe} loading={false} />);

    expect(screen.getByText('Using Your Ingredients')).toBeInTheDocument();
    expect(screen.getByText('chicken')).toBeInTheDocument();
    expect(screen.getByText('lettuce')).toBeInTheDocument();
    expect(screen.getByText('tomato')).toBeInTheDocument();
  });

  it('displays full ingredients list', () => {
    render(<RecipeDisplay recipe={mockRecipe} loading={false} />);

    expect(screen.getByText('Ingredients')).toBeInTheDocument();
    expect(screen.getByText('2 chicken breasts, grilled and sliced')).toBeInTheDocument();
    expect(screen.getByText('4 cups lettuce, chopped')).toBeInTheDocument();
    expect(screen.getByText('2 tomatoes, diced')).toBeInTheDocument();
    expect(screen.getByText('Salt and pepper to taste')).toBeInTheDocument();
  });

  it('displays instructions with numbered steps', () => {
    render(<RecipeDisplay recipe={mockRecipe} loading={false} />);

    expect(screen.getByText('Instructions')).toBeInTheDocument();
    expect(screen.getByText('Grill the chicken breasts until fully cooked')).toBeInTheDocument();
    expect(screen.getByText('Chop the lettuce and dice the tomatoes')).toBeInTheDocument();
    expect(screen.getByText('Slice the chicken and combine all ingredients')).toBeInTheDocument();
    expect(screen.getByText('Season with salt and pepper')).toBeInTheDocument();
  });

  it('handles recipe without ingredientsUsed', () => {
    const recipeWithoutUsed = {
      ...mockRecipe,
      ingredientsUsed: [],
    };

    render(<RecipeDisplay recipe={recipeWithoutUsed} loading={false} />);

    expect(screen.queryByText('Using Your Ingredients')).not.toBeInTheDocument();
  });

  it('handles recipe without optional fields', () => {
    const minimalRecipe = {
      title: 'Simple Recipe',
      description: '',
      ingredientsUsed: ['chicken'],
      ingredients: ['1 chicken breast'],
      instructions: ['Cook the chicken'],
      prepTime: '',
      cookTime: '',
      servings: '',
    };

    render(<RecipeDisplay recipe={minimalRecipe} loading={false} />);

    expect(screen.getByText('Simple Recipe')).toBeInTheDocument();
    expect(screen.getByText('1 chicken breast')).toBeInTheDocument();
    expect(screen.getByText('Cook the chicken')).toBeInTheDocument();
  });

  it('displays loading spinner', () => {
    const { container } = render(<RecipeDisplay recipe={null} loading={true} />);

    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('numbers instructions correctly', () => {
    render(<RecipeDisplay recipe={mockRecipe} loading={false} />);

    // Check that all step numbers are present
    const stepNumbers = ['1', '2', '3', '4'];
    stepNumbers.forEach((num) => {
      const elements = screen.getAllByText(num);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
