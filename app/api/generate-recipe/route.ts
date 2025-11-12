import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: "No ingredients provided" },
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
    const prompt = `You are a creative and talented chef. Create an INCREDIBLY DELICIOUS recipe using ONLY the ingredients I have.

MY INGREDIENTS: ${ingredients.join(", ")}

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
      const errorData = await response.json();
      console.error("Groq API error:", errorData);
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
      console.error("Error parsing recipe JSON:", parseError);
      console.error("Recipe text:", recipeText);
      return NextResponse.json(
        { error: "Failed to parse recipe" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating recipe:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
