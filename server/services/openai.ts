import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface RecipeAnalysis {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  cuisine?: string;
}

export async function analyzeRecipeVideo(base64Image: string): Promise<RecipeAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a master chef and recipe analysis expert. Analyze cooking videos and extract detailed recipe information. 
          Focus on identifying ingredients, cooking techniques, and step-by-step instructions. 
          Provide accurate timing estimates and serving sizes when visible.
          Respond with JSON in this exact format: {
            "title": "Recipe name",
            "description": "Brief appetizing description",
            "ingredients": ["ingredient 1", "ingredient 2"],
            "instructions": "Detailed step-by-step instructions",
            "cookingTime": number_in_minutes,
            "servings": number_of_servings,
            "difficulty": "Easy/Medium/Hard",
            "cuisine": "Cuisine type"
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this cooking video frame and extract the complete recipe information including all visible ingredients, cooking techniques, and preparation steps."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Recipe sem título",
      description: result.description || "",
      ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
      instructions: result.instructions || "",
      cookingTime: result.cookingTime || null,
      servings: result.servings || null,
      difficulty: result.difficulty || "Medium",
      cuisine: result.cuisine || "Geral"
    };
  } catch (error) {
    throw new Error("Failed to analyze recipe video: " + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function transcribeVideo(audioFilePath: string): Promise<{ text: string; duration: number }> {
  try {
    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: "pt", // Portuguese for Brazilian users
    });

    return {
      text: transcription.text,
      duration: 0,
    };
  } catch (error) {
    throw new Error("Failed to transcribe audio: " + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

export async function enhanceRecipeWithTranscription(
  visualAnalysis: RecipeAnalysis, 
  transcription: string
): Promise<RecipeAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a master chef combining visual recipe analysis with audio transcription. 
          Merge the visual analysis with the spoken instructions to create the most complete and accurate recipe.
          The transcription may contain additional details, tips, or corrections not visible in the image.
          Respond with JSON in this exact format: {
            "title": "Enhanced recipe name",
            "description": "Enhanced description",
            "ingredients": ["complete ingredient list"],
            "instructions": "Complete step-by-step instructions combining visual and audio",
            "cookingTime": number_in_minutes,
            "servings": number_of_servings,
            "difficulty": "Easy/Medium/Hard",
            "cuisine": "Cuisine type"
          }`
        },
        {
          role: "user",
          content: `Visual analysis: ${JSON.stringify(visualAnalysis)}
          
          Audio transcription: ${transcription}
          
          Please combine both sources to create the most complete and accurate recipe possible.`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1200,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || visualAnalysis.title,
      description: result.description || visualAnalysis.description,
      ingredients: Array.isArray(result.ingredients) ? result.ingredients : visualAnalysis.ingredients,
      instructions: result.instructions || visualAnalysis.instructions,
      cookingTime: result.cookingTime || visualAnalysis.cookingTime,
      servings: result.servings || visualAnalysis.servings,
      difficulty: result.difficulty || visualAnalysis.difficulty,
      cuisine: result.cuisine || visualAnalysis.cuisine
    };
  } catch (error) {
    throw new Error("Failed to enhance recipe: " + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
