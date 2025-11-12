import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IngredientInput from '@/components/IngredientInput';

describe('IngredientInput', () => {
  const mockOnAddIngredient = jest.fn();
  const mockOnRemoveIngredient = jest.fn();
  const mockOnClearAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders input field with placeholder', () => {
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByPlaceholderText(/type.*ingredient/i)).toBeInTheDocument();
  });

  it('shows autocomplete suggestions when typing', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chi');

    await waitFor(() => {
      expect(screen.getByText('chicken breast')).toBeInTheDocument();
    });
  });

  it('adds ingredient when clicking on suggestion', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chi');

    await waitFor(() => {
      expect(screen.getByText('chicken breast')).toBeInTheDocument();
    });

    await user.click(screen.getByText('chicken breast'));

    expect(mockOnAddIngredient).toHaveBeenCalledWith('chicken breast');
  });

  it('adds ingredient when pressing Enter', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'custom ingredient{Enter}');

    await waitFor(() => {
      expect(mockOnAddIngredient).toHaveBeenCalledWith('custom ingredient');
    });
  });

  it('displays added ingredients as chips', () => {
    render(
      <IngredientInput
        ingredients={['chicken', 'tomato', 'onion']}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    expect(screen.getByText('chicken')).toBeInTheDocument();
    expect(screen.getByText('tomato')).toBeInTheDocument();
    expect(screen.getByText('onion')).toBeInTheDocument();
    expect(screen.getByText('Your Ingredients (3)')).toBeInTheDocument();
  });

  it('removes ingredient when clicking X button', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={['chicken', 'tomato']}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const removeButton = screen.getByLabelText('Remove chicken');
    await user.click(removeButton);

    expect(mockOnRemoveIngredient).toHaveBeenCalledWith('chicken');
  });

  it('clears all ingredients when clicking Clear All', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={['chicken', 'tomato', 'onion']}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const clearButton = screen.getByText('Clear All');
    await user.click(clearButton);

    expect(mockOnClearAll).toHaveBeenCalled();
  });

  it('filters out already added ingredients from suggestions', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={['chicken breast']}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chicken');

    await waitFor(() => {
      // The ingredient "chicken breast" should appear as a chip, but NOT in the suggestions list
      // Look for it in a button (which would be the suggestion dropdown)
      const suggestionButtons = screen.queryAllByRole('button').filter(
        button => button.textContent === 'chicken breast' && button.className.includes('px-4 py-2')
      );
      expect(suggestionButtons.length).toBe(0);
    });
  });

  it('clears input after adding ingredient', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type.*ingredient/i) as HTMLInputElement;
    await user.type(input, 'tomato{Enter}');

    expect(input.value).toBe('');
  });

  it('supports keyboard navigation through suggestions', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chi');

    await waitFor(() => {
      expect(screen.getByText('chicken breast')).toBeInTheDocument();
    });

    // Press arrow down to select first suggestion
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    // Press enter to add selected suggestion
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnAddIngredient).toHaveBeenCalled();
  });

  it('hides suggestions when pressing Escape', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type.*ingredient/i);
    await user.type(input, 'chi');

    await waitFor(() => {
      expect(screen.getByText('chicken breast')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText('chicken breast')).not.toBeInTheDocument();
    });
  });

  it('handles comma-delimited ingredients', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type ingredients/i);
    await user.type(input, 'chicken, tomato, onion, garlic{Enter}');

    await waitFor(() => {
      expect(mockOnAddIngredient).toHaveBeenCalledWith('chicken');
      expect(mockOnAddIngredient).toHaveBeenCalledWith('tomato');
      expect(mockOnAddIngredient).toHaveBeenCalledWith('onion');
      expect(mockOnAddIngredient).toHaveBeenCalledWith('garlic');
      expect(mockOnAddIngredient).toHaveBeenCalledTimes(4);
    });
  });

  it('handles comma-delimited ingredients with extra spaces', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type ingredients/i);
    await user.type(input, 'chicken ,  tomato  , onion{Enter}');

    await waitFor(() => {
      expect(mockOnAddIngredient).toHaveBeenCalledWith('chicken');
      expect(mockOnAddIngredient).toHaveBeenCalledWith('tomato');
      expect(mockOnAddIngredient).toHaveBeenCalledWith('onion');
      expect(mockOnAddIngredient).toHaveBeenCalledTimes(3);
    });
  });

  it('filters out empty items when splitting comma-delimited ingredients', async () => {
    const user = userEvent.setup();
    render(
      <IngredientInput
        ingredients={[]}
        onAddIngredient={mockOnAddIngredient}
        onRemoveIngredient={mockOnRemoveIngredient}
        onClearAll={mockOnClearAll}
      />
    );

    const input = screen.getByPlaceholderText(/type ingredients/i);
    await user.type(input, 'chicken,,tomato,{Enter}');

    await waitFor(() => {
      expect(mockOnAddIngredient).toHaveBeenCalledWith('chicken');
      expect(mockOnAddIngredient).toHaveBeenCalledWith('tomato');
      expect(mockOnAddIngredient).toHaveBeenCalledTimes(2);
    });
  });
});
