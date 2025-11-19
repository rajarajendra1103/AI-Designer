import { GoogleGenAI, Type } from "@google/genai";
import { Project, ProjectComponent } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const primitiveSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ["box", "cylinder", "sphere"], description: "The type of the primitive shape." },
        position: { 
            type: Type.ARRAY, 
            items: { type: Type.NUMBER }, 
            description: "The [x, y, z] coordinates for the center of the object in centimeters." 
        },
        dimensions: { 
            type: Type.ARRAY, 
            items: { type: Type.NUMBER },
            description: "Dimensions in cm. For 'box': [width, height, depth]. For 'cylinder': [radius, height]. For 'sphere': [radius]."
        },
        rotation: { 
            type: Type.ARRAY, 
            items: { type: Type.NUMBER },
            description: "The [x, y, z] rotation in degrees."
        },
        color: { type: Type.STRING, description: "A valid hex color string for the object, e.g., '#FF5733'." }
    },
    required: ["type", "position", "dimensions", "rotation", "color"]
};

const projectSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The name of the project." },
    category: { type: Type.STRING, description: "The category of the design (e.g., Product Design, Architecture)." },
    description: { type: Type.STRING, description: "A detailed description of the generated design." },
    materials: {
      type: Type.ARRAY,
      description: "A list of primary materials used in the design.",
      items: { type: Type.STRING },
    },
    components: {
      type: Type.ARRAY,
      description: "A list of key components or parts that make up the design.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the component." },
          description: { type: Type.STRING, description: "A brief description of the component." },
        },
        required: ["name", "description"],
      },
    },
    modelData: {
      type: Type.OBJECT,
      properties: {
        primitives: {
          type: Type.ARRAY,
          description: "An array of 3D primitive objects that compose the design.",
          items: primitiveSchema
        }
      },
      required: ["primitives"]
    }
  },
  required: ["name", "category", "description", "materials", "components", "modelData"],
};


export async function generateDesign(prompt: string, projectName: string, category: string, reusableComponents: ProjectComponent[]): Promise<Project> {
  const model = 'gemini-2.5-pro';

  const systemInstruction = `You are an expert CAD design assistant. Your task is to generate a detailed project specification in JSON format based on a user's prompt. The output must strictly adhere to the provided JSON schema.
- Instead of a single geometry, you will generate an array of 3D primitives (boxes, cylinders, spheres) that represent the design.
- Create a visually coherent and plausible model composed of at least 3-5 primitives.
- The origin [0,0,0] should be the center of the base of the object. Position primitives accordingly.

CRITICAL 'modelData.primitives' REQUIREMENTS:
- 'type': must be one of "box", "cylinder", or "sphere" (lowercase).
- 'position': [x, y, z] coordinates in centimeters for the center of the object.
- 'dimensions':
  * for "box": [width, height, depth] in cm.
  * for "cylinder": [radius, height] in cm.
  * for "sphere": [radius] in cm.
- 'rotation': [x, y, z] in degrees.
- 'color': A valid hex color string (e.g., "#9ca3af").
`;

  let userPrompt = `Generate a design for the following prompt: "${prompt}".
Project Name: ${projectName}
Category: ${category}`;

  if (reusableComponents.length > 0) {
    userPrompt += `\nIncorporate the following reusable components if they are relevant: ${JSON.stringify(reusableComponents)}`;
  }
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: projectSchema,
      },
    });

    const jsonString = response.text;
    const generatedData = JSON.parse(jsonString);

    const newProject: Project = {
      ...generatedData,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      status: 'generated',
      created_date: new Date().toISOString(),
    };

    return newProject;
  } catch (error) {
    console.error("Error generating design:", error);
    throw new Error("Failed to generate design from AI. Please try a more specific prompt.");
  }
}

export async function optimizeDesign(project: Project): Promise<Project> {
  const model = 'gemini-2.5-pro';
  
  const systemInstruction = `You are an expert CAD optimization assistant. Your task is to analyze the provided project JSON and return an optimized version. The optimizations should focus on improving structural integrity, reducing material costs, or enhancing functionality by adjusting the primitives in 'modelData'. The output must be a valid JSON object that adheres to the provided schema. Do not change the project 'id', 'name', or 'created_date'.`;

  const userPrompt = `Please optimize the following CAD project data: ${JSON.stringify(project, null, 2)}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: projectSchema,
      },
    });

    const jsonString = response.text;
    const optimizedData = JSON.parse(jsonString);

    const optimizedProject: Project = {
      ...optimizedData,
      id: project.id,
      name: project.name, 
      created_date: project.created_date,
      status: 'refined',
    };

    return optimizedProject;

  } catch (error) {
    console.error("Error optimizing design:", error);
    throw new Error("Failed to optimize design with AI. The model may have returned an invalid format.");
  }
}

export async function refineDesign(project: Project, prompt: string): Promise<Project> {
  const model = 'gemini-2.5-pro';

  const systemInstruction = `You are an expert CAD design assistant. Your task is to refine an existing project specification based on a user's request by modifying the 'modelData.primitives' array. Modify the provided JSON object according to the refinement prompt and return the updated JSON. The output must strictly adhere to the provided JSON schema. Do not change the project 'id', 'name', or 'created_date'.`;
  
  const userPrompt = `Here is the current project data:
${JSON.stringify(project, null, 2)}

Please apply the following refinement: "${prompt}"`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: projectSchema,
      },
    });

    const jsonString = response.text;
    const refinedData = JSON.parse(jsonString);

    const refinedProject: Project = {
      ...refinedData,
      id: project.id,
      name: project.name,
      created_date: project.created_date,
      status: 'refined',
    };
    
    return refinedProject;

  } catch (error) {
    console.error("Error refining design:", error);
    throw new Error("Failed to refine design with AI. Please check your refinement prompt or try again.");
  }
}