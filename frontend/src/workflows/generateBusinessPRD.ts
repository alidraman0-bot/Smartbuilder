import { generateBusinessStrategy } from '../services/strategyGenerator';
import { generatePRD } from '../services/prdGenerator';

export async function generateBusinessPRD(idea: string) {
  try {
    // Step 1: Generate Business Strategy with AI
    const strategy = await generateBusinessStrategy(idea);
    
    // Step 2: Generate PRD with AI
    const prd = await generatePRD(idea, strategy);
    
    return {
      strategy,
      prd,
      success: true,
    };
  } catch (error: any) {
    console.error("Error in generateBusinessPRD workflow:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred during generation.",
    };
  }
}
