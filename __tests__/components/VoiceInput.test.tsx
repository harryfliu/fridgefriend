import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoiceInput from '@/components/VoiceInput';

describe('VoiceInput', () => {
  const mockOnIngredientDetected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders voice input button', () => {
    render(<VoiceInput onIngredientDetected={mockOnIngredientDetected} />);

    expect(screen.getByText('Voice Input')).toBeInTheDocument();
  });

  it('shows not supported message when Web Speech API is unavailable', () => {
    // Temporarily remove the mock
    const originalSpeechRecognition = global.webkitSpeechRecognition;
    // @ts-ignore
    delete global.webkitSpeechRecognition;
    // @ts-ignore
    delete global.SpeechRecognition;

    render(<VoiceInput onIngredientDetected={mockOnIngredientDetected} />);

    expect(screen.getByText(/Voice input not supported/i)).toBeInTheDocument();

    // Restore the mock
    global.webkitSpeechRecognition = originalSpeechRecognition;
  });

  it('renders with proper accessibility attributes', () => {
    render(<VoiceInput onIngredientDetected={mockOnIngredientDetected} />);

    const button = screen.getByText('Voice Input');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  it('has correct initial state', () => {
    render(<VoiceInput onIngredientDetected={mockOnIngredientDetected} />);

    expect(screen.getByText('Voice Input')).toBeInTheDocument();
    expect(screen.queryByText('Listening...')).not.toBeInTheDocument();
    expect(screen.queryByText(/Heard:/)).not.toBeInTheDocument();
  });

  it('button has correct styling classes', () => {
    render(<VoiceInput onIngredientDetected={mockOnIngredientDetected} />);

    const button = screen.getByText('Voice Input');
    expect(button.className).toContain('bg-blue-500');
    expect(button.className).toContain('hover:bg-blue-600');
  });

  it('renders microphone icon', () => {
    const { container } = render(<VoiceInput onIngredientDetected={mockOnIngredientDetected} />);

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
