import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { videoProcessor } from "./services/video-processor";
import { analyzeRecipeVideo, transcribeVideo, enhanceRecipeWithTranscription } from "./services/openai";
import { insertRecipeSchema, updateRecipeSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get user recipes
  app.get("/api/recipes", async (req, res) => {
    try {
      // TODO: Add proper authentication
      const userId = "default-user"; // Hardcoded for now
      
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const recipes = await storage.getRecipes(userId, limit, offset);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get single recipe
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const userId = "default-user";
      const recipe = await storage.getRecipe(req.params.id, userId);
      
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get recipe stats
  app.get("/api/recipes/stats", async (req, res) => {
    try {
      const userId = "default-user";
      const stats = await storage.getRecipeStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Search recipes
  app.get("/api/recipes/search", async (req, res) => {
    try {
      const userId = "default-user";
      const query = req.query.q as string;
      
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      
      const recipes = await storage.searchRecipes(userId, query);
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Upload video recipe
  app.post("/api/recipes/upload", upload.single('video'), async (req, res) => {
    try {
      const userId = "default-user";
      
      if (!req.file) {
        return res.status(400).json({ error: "No video file uploaded" });
      }

      const { title, description } = req.body;

      // Process the video
      const processedVideo = await videoProcessor.processVideo(req.file.path);
      
      // Extract frame for visual analysis
      const base64Frame = await videoProcessor.extractVideoFrame(processedVideo.videoPath);
      
      // Analyze with OpenAI Vision
      const visualAnalysis = await analyzeRecipeVideo(base64Frame);
      
      // Transcribe audio
      const transcription = await transcribeVideo(processedVideo.audioPath);
      
      // Enhance with transcription
      const finalAnalysis = await enhanceRecipeWithTranscription(visualAnalysis, transcription.text);

      // Create recipe record
      const recipeData = {
        userId,
        title: title || finalAnalysis.title,
        description: description || finalAnalysis.description,
        ingredients: finalAnalysis.ingredients,
        instructions: finalAnalysis.instructions,
        cookingTime: finalAnalysis.cookingTime,
        servings: finalAnalysis.servings,
        source: 'upload' as const,
        videoPath: processedVideo.videoPath,
        thumbnailPath: processedVideo.thumbnailPath,
        aiProcessed: true,
        aiAnalysis: finalAnalysis,
        transcription: transcription.text,
      };

      const recipe = await storage.createRecipe(recipeData);
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Process Instagram URL
  app.post("/api/recipes/instagram", async (req, res) => {
    try {
      const userId = "default-user";
      const { url, title, description } = req.body;

      if (!url) {
        return res.status(400).json({ error: "Instagram URL is required" });
      }

      // Download Instagram video
      const videoPath = await videoProcessor.downloadInstagramVideo(url);
      
      // Process the video
      const processedVideo = await videoProcessor.processVideo(videoPath);
      
      // Extract frame for visual analysis
      const base64Frame = await videoProcessor.extractVideoFrame(processedVideo.videoPath);
      
      // Analyze with OpenAI Vision
      const visualAnalysis = await analyzeRecipeVideo(base64Frame);
      
      // Transcribe audio
      const transcription = await transcribeVideo(processedVideo.audioPath);
      
      // Enhance with transcription
      const finalAnalysis = await enhanceRecipeWithTranscription(visualAnalysis, transcription.text);

      // Create recipe record
      const recipeData = {
        userId,
        title: title || finalAnalysis.title,
        description: description || finalAnalysis.description,
        ingredients: finalAnalysis.ingredients,
        instructions: finalAnalysis.instructions,
        cookingTime: finalAnalysis.cookingTime,
        servings: finalAnalysis.servings,
        source: 'instagram' as const,
        sourceUrl: url,
        videoPath: processedVideo.videoPath,
        thumbnailPath: processedVideo.thumbnailPath,
        aiProcessed: true,
        aiAnalysis: finalAnalysis,
        transcription: transcription.text,
      };

      const recipe = await storage.createRecipe(recipeData);
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Update recipe
  app.patch("/api/recipes/:id", async (req, res) => {
    try {
      const userId = "default-user";
      const updates = updateRecipeSchema.parse(req.body);
      
      const recipe = await storage.updateRecipe(req.params.id, userId, updates);
      
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Delete recipe
  app.delete("/api/recipes/:id", async (req, res) => {
    try {
      const userId = "default-user";
      const success = await storage.deleteRecipe(req.params.id, userId);
      
      if (!success) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Toggle favorite
  app.patch("/api/recipes/:id/favorite", async (req, res) => {
    try {
      const userId = "default-user";
      const { isFavorite } = req.body;
      
      const recipe = await storage.updateRecipe(req.params.id, userId, { isFavorite });
      
      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Serve uploaded files
  app.use("/uploads", express.static("uploads"));

  const httpServer = createServer(app);
  return httpServer;
}
