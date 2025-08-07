import { 
  users, 
  recipes, 
  type User, 
  type InsertUser, 
  type Recipe, 
  type InsertRecipe, 
  type UpdateRecipe 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, ilike, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getRecipes(userId: string, limit?: number, offset?: number): Promise<Recipe[]>;
  getRecipe(id: string, userId: string): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, userId: string, updates: UpdateRecipe): Promise<Recipe | undefined>;
  deleteRecipe(id: string, userId: string): Promise<boolean>;
  searchRecipes(userId: string, query: string): Promise<Recipe[]>;
  getRecipeStats(userId: string): Promise<{
    total: number;
    fromInstagram: number;
    aiProcessed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getRecipes(userId: string, limit: number = 20, offset: number = 0): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getRecipe(id: string, userId: string): Promise<Recipe | undefined> {
    const [recipe] = await db
      .select()
      .from(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));
    return recipe || undefined;
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values({
        ...recipe,
        updatedAt: new Date(),
      })
      .returning();
    return newRecipe;
  }

  async updateRecipe(id: string, userId: string, updates: UpdateRecipe): Promise<Recipe | undefined> {
    const [updatedRecipe] = await db
      .update(recipes)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)))
      .returning();
    return updatedRecipe || undefined;
  }

  async deleteRecipe(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(recipes)
      .where(and(eq(recipes.id, id), eq(recipes.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async searchRecipes(userId: string, query: string): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(
        and(
          eq(recipes.userId, userId),
          or(
            ilike(recipes.title, `%${query}%`),
            ilike(recipes.description, `%${query}%`),
            ilike(recipes.instructions, `%${query}%`)
          )
        )
      )
      .orderBy(desc(recipes.createdAt));
  }

  async getRecipeStats(userId: string): Promise<{
    total: number;
    fromInstagram: number;
    aiProcessed: number;
  }> {
    const allRecipes = await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId));

    return {
      total: allRecipes.length,
      fromInstagram: allRecipes.filter(r => r.source === 'instagram').length,
      aiProcessed: allRecipes.filter(r => r.aiProcessed).length,
    };
  }
}

export const storage = new DatabaseStorage();
