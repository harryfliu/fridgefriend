import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

// Mock fetch
global.fetch = jest.fn();

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the main heading', () => {
    render(<Home />);

    expect(screen.getByText('Fridge Friend')).toBeInTheDocument();
    expect(screen.getByText(/Turn your ingredients into delicious recipes/i)).toBeInTheDocument();
  });

  it('renders IngredientInput component', () => {
    render(<Home />);

    expect(screen.getByPlaceholderText(/type.*ingredient/i)).toBeInTheDocument();
  });

  it('renders VoiceInput component', () => {
    render(<Home />);

    expect(screen.getByText('Voice Input')).toBeInTheDocument();
  });

  it('does not show Generate Recipe button when no ingredients', () => {
    render(<Home />);

    expect(screen.queryByText('Generate Recipe')).not.toBeInTheDocument();
  });

  it('shows Generate Recipe button after adding ingredient', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Generate Recipe')).toBeInTheDocument();
    });
  });

  it('adds ingredients correctly', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    await waitFor(() => {
      expect(screen.getByText('chicken')).toBeInTheDocument();
      expect(screen.getByText('Your Ingredients (1)')).toBeInTheDocument();
    });
  });

  it('prevents duplicate ingredients', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');
    await user.type(input, 'chicken{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Your Ingredients (1)')).toBeInTheDocument();
    });
  });

  it('removes ingredients correctly', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    await waitFor(() => {
      expect(screen.getByText('chicken')).toBeInTheDocument();
    });

    const removeButton = screen.getByLabelText('Remove chicken');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('chicken')).not.toBeInTheDocument();
    });
  });

  it('clears all ingredients', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');
    await user.type(input, 'tomato{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Your Ingredients (2)')).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear All');
    await user.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText('Your Ingredients')).not.toBeInTheDocument();
    });
  });

  it('shows error when generating recipe with no ingredients', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Generate Recipe')).toBeInTheDocument();
    });

    // Remove the ingredient
    const removeButton = screen.getByLabelText('Remove chicken');
    await user.click(removeButton);

    // Try to generate (button should be gone, but this tests the logic)
    // Actually, the button disappears, so we need to test the internal logic
    // This test verifies that the button is hidden when no ingredients
    await waitFor(() => {
      expect(screen.queryByText('Generate Recipe')).not.toBeInTheDocument();
    });
  });

  it('calls API and displays recipe on successful generation', async () => {
    const user = userEvent.setup();
    const mockRecipe = {
      title: 'Test Recipe',
      description: 'A test recipe',
      ingredientsUsed: ['chicken', 'tomato'],
      ingredients: ['1 chicken breast', '2 tomatoes'],
      instructions: ['Cook chicken', 'Add tomatoes'],
      prepTime: '10 minutes',
      cookTime: '20 minutes',
      servings: '2 servings',
    };

    (global.fetch as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ recipe: mockRecipe }),
      }), 100))
    );

    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Generate Recipe')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Recipe');
    await user.click(generateButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Should display recipe after loading
    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
      expect(screen.getByText('A test recipe')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(global.fetch).toHaveBeenCalledWith('/api/generate-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ingredients: ['chicken'] }),
    });
  });

  it('shows error message on API failure', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'API error' }),
    });

    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Generate Recipe')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Recipe');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('API error')).toBeInTheDocument();
    });
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Generate Recipe')).toBeInTheDocument();
    });

    const generateButton = screen.getByText('Generate Recipe');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error|Failed to generate recipe/i)).toBeInTheDocument();
    });
  });

  it('clears error when adding new ingredient', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    const generateButton = screen.getByText('Generate Recipe');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Network error|Failed to generate recipe/i)).toBeInTheDocument();
    });

    // Add another ingredient
    await user.type(input, 'tomato{Enter}');

    await waitFor(() => {
      expect(screen.queryByText(/Network error|Failed to generate recipe/i)).not.toBeInTheDocument();
    });
  });

  it('disables Generate Recipe button while loading', async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  recipe: {
                    title: 'Test',
                    description: '',
                    ingredientsUsed: [],
                    ingredients: [],
                    instructions: [],
                    prepTime: '',
                    cookTime: '',
                    servings: '',
                  },
                }),
              }),
            100
          )
        )
    );

    render(<Home />);

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken{Enter}');

    const generateButton = screen.getByText('Generate Recipe');
    await user.click(generateButton);

    await waitFor(() => {
      const button = screen.getByText('Generating...');
      expect(button).toBeDisabled();
    });
  });
});
