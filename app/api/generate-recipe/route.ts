import { NextRequest, NextResponse } from "next/server";

// Rate limiting - simple in-memory store
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute

// Input validation constants
const MAX_INGREDIENTS = 50;
const MAX_INGREDIENT_LENGTH = 100;

function sanitizeIngredient(ingredient: string): string {
  // Remove any characters that could be used for prompt injection
  // Allow only letters, numbers, spaces, hyphens, and basic punctuation
  return ingredient
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s\-'.]/gi, '') // Remove special characters except hyphen, apostrophe, period
    .substring(0, MAX_INGREDIENT_LENGTH); // Enforce max length
}

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const userLimit = rateLimit.get(identifier);

  if (!userLimit || now > userLimit.resetTime) {
    // New window or expired window
    rateLimit.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return true;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const identifier = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again in a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { ingredients } = body;

    // Input validation
    if (!ingredients) {
      return NextResponse.json(
        { error: "No ingredients provided" },
        { status: 400 }
      );
    }

    if (!Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "Ingredients must be an array" },
        { status: 400 }
      );
    }

    if (ingredients.length === 0) {
      return NextResponse.json(
        { error: "No ingredients provided" },
        { status: 400 }
      );
    }

    if (ingredients.length > MAX_INGREDIENTS) {
      return NextResponse.json(
        { error: `Too many ingredients. Maximum is ${MAX_INGREDIENTS}` },
        { status: 400 }
      );
    }

    // Validate and sanitize each ingredient
    const sanitizedIngredients = ingredients
      .filter((item): item is string => typeof item === 'string') // Type guard
      .map(sanitizeIngredient)
      .filter(item => item.length > 0); // Remove empty strings after sanitization

    if (sanitizedIngredients.length === 0) {
      return NextResponse.json(
        { error: "No valid ingredients provided" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Create a prompt that emphasizes using ONLY the provided ingredients
    // Using sanitized ingredients to prevent prompt injection
    const prompt = `You are a creative and talented chef. Create an INCREDIBLY DELICIOUS recipe using ONLY the ingredients I have.

MY INGREDIENTS: ${sanitizedIngredients.join(", ")}

CRITICAL RULES:
- You MUST use AS MANY of my ingredients AS POSSIBLE
- You can ONLY use ingredients from my list above
- The ONLY exceptions are: salt, black pepper, water, and cooking oil (these are assumed to be in every kitchen)
- DO NOT add ANY other ingredients, even common ones like garlic, onion, herbs, spices, etc., unless I explicitly listed them
- Make the recipe AS TASTY AS POSSIBLE using only what I have
- Be creative with cooking techniques (grilling, sautéing, baking, etc.) to maximize flavor
- Include proper seasoning with salt and pepper to enhance taste

Recipe Requirements:
- Include prep time, cook time, and servings
- Provide clear, detailed step-by-step instructions
- Make it practical and achievable

Return the recipe in the following JSON format:
{
  "title": "Creative Recipe Name",
  "description": "Brief mouth-watering description",
  "ingredientsUsed": ["list", "of", "my", "ingredients", "you", "used"],
  "ingredients": ["full ingredient list with measurements"],
  "instructions": ["step 1", "step 2", "etc"],
  "prepTime": "X minutes",
  "cookTime": "X minutes",
  "servings": "X servings"
}

Return ONLY the JSON, no additional text.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      // Only log errors in development mode
      if (process.env.NODE_ENV === 'development') {
        const errorData = await response.json().catch(() => ({}));
        console.error("Groq API error:", errorData);
      }
      return NextResponse.json(
        { error: "Failed to generate recipe" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const recipeText = data.choices[0]?.message?.content;

    if (!recipeText) {
      return NextResponse.json(
        { error: "No recipe generated" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
      const recipe = JSON.parse(jsonMatch ? jsonMatch[0] : recipeText);

      return NextResponse.json({ recipe });
    } catch (parseError) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error("Error parsing recipe JSON:", parseError);
        console.error("Recipe text preview:", recipeText.substring(0, 200));
      }
      return NextResponse.json(
        { error: "Failed to parse recipe" },
        { status: 500 }
      );
    }
  } catch (error) {
    // Only log detailed errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error("Error generating recipe:", error);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
