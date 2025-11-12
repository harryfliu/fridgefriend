# Fridge Friend

A Next.js web app that helps you create delicious recipes from the ingredients you have on hand. Just input your ingredients, and let AI generate a recipe that uses as many of them as possible!

## Features

- **Text Input with Autocomplete**: Quickly add ingredients with smart autocomplete suggestions
- **Voice Input**: Use your voice to add ingredients hands-free (using Web Speech API)
- **AI-Powered Recipe Generation**: Uses Groq's free API with Llama models to create custom recipes
- **Smart Recipe Suggestions**: Prioritizes using maximum ingredients from your list
- **Clean, Responsive UI**: Built with Tailwind CSS for a beautiful mobile and desktop experience
- **Single-Session Design**: No accounts or databases needed - simple and fast

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A free Groq API key (sign up at [console.groq.com](https://console.groq.com))

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables:
```bash
cp .env.example .env.local
```

3. Get your free Groq API key:
   - Go to [https://console.groq.com/keys](https://console.groq.com/keys)
   - Sign up for a free account
   - Create a new API key
   - Copy the key

4. Add your API key to `.env.local`:
```
GROQ_API_KEY=your_actual_api_key_here
```

### Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. **Add Ingredients**:
   - Type ingredients in the text box (autocomplete will help)
   - Or click the "Voice Input" button and speak your ingredients
   - Remove ingredients by clicking the X on each chip

2. **Generate Recipe**:
   - Click "Generate Recipe" when you have at least one ingredient
   - Wait a few seconds for AI to create your custom recipe

3. **Enjoy Your Recipe**:
   - View the complete recipe with ingredients, instructions, and cooking times
   - The recipe will highlight which of your ingredients are being used

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Groq API (Llama 3.3 70B)
- **Voice**: Web Speech API

## Project Structure

```
fridge_friend/
├── app/
│   ├── api/
│   │   └── generate-recipe/
│   │       └── route.ts          # API endpoint for recipe generation
│   ├── page.tsx                   # Main page component
│   └── layout.tsx                 # Root layout
├── components/
│   ├── IngredientInput.tsx       # Text input with autocomplete
│   ├── VoiceInput.tsx            # Voice recognition component
│   └── RecipeDisplay.tsx         # Recipe display component
├── lib/
│   └── ingredients.ts            # Common ingredients list
└── .env.example                  # Environment variables template
```

## Notes

- Voice input works best in Chrome, Edge, and Safari (requires browser support for Web Speech API)
- The Groq free tier is generous but has rate limits
- Recipes are generated fresh each time - no storage between sessions
- All processing happens on-demand - no background tasks or databases

## Future Enhancements

Ideas for future development:
- Save favorite recipes to local storage
- Dietary preferences and restrictions
- Photo recognition to identify ingredients
- Recipe ratings and feedback
- Share recipes with friends

## License

MIT
