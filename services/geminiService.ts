
import { GoogleGenAI, Type } from "@google/genai";
import { Project, ProjectComponent, MachineProfile, CNCData, Primitive, SimulationType, SimulationResult, PCBData, BOMItem, AssemblyData, PCBTrace } from '../types';

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

export async function generateCNCToolpath(project: Project, machineProfile: MachineProfile): Promise<CNCData> {
  const model = 'gemini-2.5-pro';

  const schema = {
      type: Type.OBJECT,
      properties: {
          toolpath: {
              type: Type.ARRAY,
              items: {
                  type: Type.OBJECT,
                  properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      z: { type: Type.NUMBER }
                  },
                  required: ["x", "y", "z"]
              },
              description: "An ordered array of 3D coordinates representing the tool tip path."
          },
          gcode: { type: Type.STRING, description: "A sample G-code block for the operation." },
          stats: {
              type: Type.OBJECT,
              properties: {
                  estimatedTime: { type: Type.STRING },
                  materialRemovalRate: { type: Type.STRING },
                  toolLifeScore: { type: Type.STRING }
              },
              required: ["estimatedTime", "materialRemovalRate", "toolLifeScore"]
          }
      },
      required: ["toolpath", "gcode", "stats"]
  };

  const systemInstruction = `You are an expert CAM (Computer Aided Manufacturing) engineer.
  Analyze the provided 3D model (primitives) and the selected CNC Machine configuration.
  Generate a logical toolpath that would machine this shape from a stock block.
  
  Machine Specs: ${JSON.stringify(machineProfile)}
  
  Task:
  1. Generate a 'toolpath': A series of [x,y,z] points that hover above and trace the contours of the primitives. It should look like a machining operation.
  2. Generate valid 'gcode' snippets corresponding to the path.
  3. Calculate estimated manufacturing stats based on the machine's feed rate.
  `;

  const userPrompt = `Project Geometry: ${JSON.stringify(project.modelData.primitives, null, 2)}`;

  try {
      const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: schema,
          }
      });
      
      const result = JSON.parse(response.text);
      
      return {
          selectedMachineId: machineProfile.id,
          fixtures: project.cncData?.fixtures || [], // Keep existing fixtures
          ...result
      };
  } catch (error) {
      console.error("Error generating toolpath:", error);
      throw new Error("Failed to generate CNC toolpath.");
  }
}


export async function generateFixtureDesign(project: Project): Promise<Primitive[]> {
  const model = 'gemini-2.5-pro';
  
  const schema = {
      type: Type.OBJECT,
      properties: {
          fixtures: {
              type: Type.ARRAY,
              items: primitiveSchema,
              description: "Array of fixture primitives (clamps, vices, baseplates)."
          }
      },
      required: ["fixtures"]
  };

  const systemInstruction = `You are a Manufacturing Engineer specializing in Jig & Fixture design.
  Analyze the part geometry and design a simple fixture setup (clamps, vice jaws, or a baseplate) to hold the part securely during machining.
  The fixtures should be positioned to support the part without intersecting the main geometry too much.
  Use a distinct color (e.g., '#ef4444' red or '#f59e0b' amber) for the fixtures.
  `;

  const userPrompt = `Part Geometry: ${JSON.stringify(project.modelData.primitives, null, 2)}`;

  try {
      const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: schema,
          }
      });

      const result = JSON.parse(response.text);
      return result.fixtures;

  } catch (error) {
      console.error("Error generating fixtures:", error);
      throw new Error("Failed to generate fixture design.");
  }
}

export async function runSimulation(project: Project, type: SimulationType, params: string): Promise<SimulationResult> {
    const model = 'gemini-2.5-pro';

    const schema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "Engineering summary of the simulation results." },
            stats: { 
                type: Type.ARRAY, 
                items: { 
                    type: Type.OBJECT,
                    properties: {
                        label: { type: Type.STRING },
                        value: { type: Type.STRING },
                        unit: { type: Type.STRING }
                    },
                    required: ["label", "value"]
                }
            },
            hotspots: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        intensity: { type: Type.NUMBER, description: "Intensity from 0 to 1" },
                        description: { type: Type.STRING }
                    },
                    required: ["position", "intensity", "description"]
                }
            },
            criticalPrimitiveIndices: {
                type: Type.ARRAY,
                items: { type: Type.INTEGER },
                description: "Indices of primitives in the original modelData array that are most affected."
            }
        },
        required: ["summary", "stats", "hotspots", "criticalPrimitiveIndices"]
    };

    const systemInstruction = `You are an expert CAE (Computer Aided Engineering) Simulation Analyst.
    Your task is to estimate physical simulation results based on geometry and material properties.
    Simulation Type: ${type}
    Parameters: ${params}
    
    Analyze the structure and materials. Predict failure points (structural), heat concentration (thermal), or flow separation (CFD).
    
    Output Requirements:
    - 'hotspots': 3D coordinates [x,y,z] where the effect is strongest (e.g., high stress, max temp).
    - 'criticalPrimitiveIndices': Identify which parts of the model are at risk (0-indexed based on input list).
    - 'stats': Provide quantitative estimates (e.g., "Safety Factor", "Max Deflection", "Drag Coefficient", "Max Temp").
    `;

    const userPrompt = `Project Geometry: ${JSON.stringify(project.modelData.primitives, null, 2)}
    Materials: ${project.materials.join(', ')}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const result = JSON.parse(response.text);

        return {
            id: `sim-${Date.now()}`,
            type,
            timestamp: new Date().toISOString(),
            params,
            ...result
        };
    } catch (error) {
        console.error("Error running simulation:", error);
        throw new Error("Failed to run simulation analysis.");
    }
}

// --- Electronics / PCB Functions ---

export async function generatePCBLayout(project: Project): Promise<PCBData> {
    const model = 'gemini-2.5-pro';

    const schema = {
        type: Type.OBJECT,
        properties: {
            boardDimensions: { type: Type.ARRAY, items: { type: Type.NUMBER }, description: "[width, thickness, depth]" },
            mountingHoles: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.NUMBER } } },
            layerCount: { type: Type.INTEGER },
            components: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['ic', 'connector', 'capacitor', 'resistor', 'inductor', 'transistor', 'diode', 'switch', 'sensor', 'led', 'battery', 'display', 'motor', 'relay', 'other'] },
                        position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        dimensions: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        rotation: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                        designator: { type: Type.STRING }
                    },
                    required: ["id", "type", "position", "dimensions", "rotation", "designator"]
                }
            },
            bom: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        partNumber: { type: Type.STRING },
                        description: { type: Type.STRING },
                        manufacturer: { type: Type.STRING },
                        quantity: { type: Type.INTEGER },
                        unitCost: { type: Type.NUMBER }
                    },
                    required: ["partNumber", "description", "manufacturer", "quantity", "unitCost"]
                }
            }
        },
        required: ["boardDimensions", "mountingHoles", "layerCount", "components", "bom"]
    };

    const systemInstruction = `You are a PCB Design Engineer.
    Analyze the provided 3D mechanical enclosure and design a PCB that fits INSIDE it.
    - Determine appropriate board dimensions (allow 2-5mm clearance).
    - Place key components (ICs, Connectors, Caps, Sensors, Relays, etc) logically on the board.
    - Generate a BOM for these components.
    - Position mounting holes near corners.
    `;

    const userPrompt = `Enclosure Geometry: ${JSON.stringify(project.modelData.primitives, null, 2)}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });
        
        return JSON.parse(response.text) as PCBData;
    } catch (error) {
        console.error("Error generating PCB:", error);
        throw new Error("Failed to generate PCB layout.");
    }
}

export async function generateSchematic(project: Project): Promise<string> {
    const model = 'gemini-2.5-pro';
    
    const systemInstruction = `You are an Electronics Engineer.
    Generate a simple SVG diagram of a schematic circuit based on the PCB components provided.
    The SVG should be clean, use standard symbols (rectangles for ICs, zig-zag for resistors, circles for transistors/LEDs), and fit within a 600x400 viewBox.
    Return ONLY the raw SVG string.
    `;
    
    const userPrompt = `PCB Components: ${JSON.stringify(project.pcbData?.components, null, 2)}`;

    try {
         const response = await ai.models.generateContent({
             model,
             contents: userPrompt,
             config: {
                 systemInstruction,
                 responseMimeType: "text/plain", // Raw text (SVG)
             }
         });
         
         let svg = response.text;
         // Cleanup markdown code blocks if present
         if (svg.startsWith('```')) {
             svg = svg.replace(/```xml|```svg|```/g, '');
         }
         return svg.trim();
    } catch (error) {
        console.error("Error generating schematic:", error);
        return `<svg viewBox="0 0 200 100"><text x="10" y="50" fill="red">Error generating schematic</text></svg>`;
    }
}

export async function runSpiceSimulation(project: Project): Promise<string> {
    const model = 'gemini-2.5-pro';
    
    const systemInstruction = `You are a SPICE Simulation Engine.
    Analyze the provided circuit/components.
    Simulate a basic Transient Analysis or DC Operating Point.
    Return a concise text summary of the simulation results, including voltage nodes and currents.
    Format the output as a clean engineering report.
    `;
    
    const userPrompt = `Circuit Components: ${JSON.stringify(project.pcbData?.components, null, 2)}`;

    try {
         const response = await ai.models.generateContent({
             model,
             contents: userPrompt,
             config: {
                 systemInstruction,
             }
         });
         
         return response.text;
    } catch (error) {
        console.error("Error running SPICE:", error);
        return "Simulation failed.";
    }
}

export async function autoRoutePCB(project: Project): Promise<PCBData> {
    if (!project.pcbData || !project.pcbData.components) return project.pcbData!;

    const components = project.pcbData.components;
    const traces: PCBTrace[] = [];
    
    // Simple mock routing logic: connect random pairs with L-shaped paths
    for (let i = 0; i < components.length - 1; i += 2) {
        const c1 = components[i];
        const c2 = components[i+1];
        
        const startX = c1.position[0];
        const startZ = c1.position[2];
        const endX = c2.position[0];
        const endZ = c2.position[2];
        
        // Simple Manhatten path: Start -> Mid -> End
        // Mid point aligns with X of start and Z of end
        const midX = startX;
        const midZ = endZ;
        
        traces.push({
            path: [
                [startX, 0, startZ],
                [midX, 0, midZ],
                [endX, 0, endZ]
            ],
            width: 0.05,
            layer: 'top'
        });
    }

    return {
        ...project.pcbData,
        traces: traces
    };
}

export async function performSignalAnalysis(pcbData: PCBData): Promise<PCBData> {
     const model = 'gemini-2.5-pro';
     
     const schema = {
         type: Type.OBJECT,
         properties: {
             summary: { type: Type.STRING },
             maxFrequency: { type: Type.STRING },
             hotspots: {
                 type: Type.ARRAY,
                 items: {
                     type: Type.OBJECT,
                     properties: {
                         position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                         radius: { type: Type.NUMBER },
                         intensity: { type: Type.NUMBER },
                         type: { type: Type.STRING, enum: ['EMI', 'CROSSTALK', 'IMPEDANCE'] }
                     },
                     required: ["position", "radius", "intensity", "type"]
                 }
             }
         },
         required: ["summary", "maxFrequency", "hotspots"]
     };
     
     const systemInstruction = `You are a Signal Integrity Engineer.
     Analyze the provided PCB component placement.
     Identify areas of likely Electromagnetic Interference (EMI) or Crosstalk based on component types (e.g., ICs generate more noise than resistors).
     Generate 'hotspots' (spheres) in 3D space relative to the components.
     `;
     
     const userPrompt = `PCB Components: ${JSON.stringify(pcbData.components, null, 2)}`;

     try {
         const response = await ai.models.generateContent({
             model,
             contents: userPrompt,
             config: {
                 systemInstruction,
                 responseMimeType: "application/json",
                 responseSchema: schema
             }
         });
         
         const analysis = JSON.parse(response.text);
         
         return {
             ...pcbData,
             signalAnalysis: analysis
         };
     } catch (error) {
         console.error("Error analyzing signals:", error);
         throw new Error("Signal integrity analysis failed.");
     }
}

// --- Assembly & Advanced CAD Functions ---

export async function generateAssemblyAnalysis(project: Project): Promise<AssemblyData> {
    const model = 'gemini-2.5-pro';

    const schema = {
        type: Type.OBJECT,
        properties: {
            joints: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        name: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['REVOLUTE', 'PRISMATIC', 'FIXED'] },
                        partIndex: { type: Type.INTEGER },
                        axis: { type: Type.ARRAY, items: { type: Type.NUMBER } }, // [x,y,z]
                        limits: { type: Type.ARRAY, items: { type: Type.NUMBER } }, // [min, max]
                        currentValue: { type: Type.NUMBER },
                        speed: { type: Type.NUMBER }
                    },
                    required: ["id", "name", "type", "partIndex", "axis", "limits", "currentValue", "speed"]
                }
            },
            parameters: {
                 type: Type.ARRAY,
                 items: {
                     type: Type.OBJECT,
                     properties: {
                         id: { type: Type.STRING },
                         name: { type: Type.STRING },
                         value: { type: Type.NUMBER },
                         unit: { type: Type.STRING },
                         affectedPrimitives: { type: Type.ARRAY, items: { type: Type.INTEGER } }
                     },
                     required: ["id", "name", "value", "unit", "affectedPrimitives"]
                 }
            }
        },
        required: ["joints", "parameters"]
    };

    const systemInstruction = `You are a Mechanical Design Engineer.
    Analyze the provided 3D geometry and identify logical kinematic joints and parametric design variables.
    
    1. JOINTS: Look for cylinders that could be wheels/hinges (Revolute) or boxes that could slide (Prismatic). 
       Assign a 'partIndex' to the primitive in the input array.
       Define rotation axis [x,y,z].

       CRITICAL CONSTRAINT REQUIREMENTS:
       - For REVOLUTE joints: Define 'limits' in degrees (e.g., [-90, 90] for hinges or [0, 360] for wheels). Set 'currentValue' to 0 or a neutral angle. Set 'speed' to a float between 0.5 and 2.0.
       - For PRISMATIC joints: Define 'limits' in centimeters (e.g., [0, 10] or [-5, 5]). Set 'currentValue' to 0 or a starting position. Set 'speed' to a float between 0.5 and 2.0.
    
    2. PARAMETERS: Identify dimensions that could vary (e.g., 'Table Width', 'Leg Height'). 
       Assign 'affectedPrimitives' indices that should scale when this parameter changes.
    `;

    const userPrompt = `Model Geometry: ${JSON.stringify(project.modelData.primitives, null, 2)}`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: userPrompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        const result = JSON.parse(response.text);
        
        return {
            joints: result.joints,
            parameters: result.parameters,
            configurations: [
                { id: 'cfg-default', name: 'Default', parameters: {} }
            ]
        };
    } catch (error) {
        console.error("Error analyzing assembly:", error);
        throw new Error("Failed to generate assembly analysis.");
    }
}

export async function reverseEngineerMesh(description: string): Promise<Primitive[]> {
    const model = 'gemini-2.5-pro';
    
    const systemInstruction = `You are a Reverse Engineering Specialist.
    The user has 'scanned' an object described as: "${description}".
    Reconstruct this object using 3D CAD primitives (boxes, cylinders, spheres).
    Return an array of primitives that approximate this shape.
    `;

    try {
         const response = await ai.models.generateContent({
            model,
            contents: description,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                     type: Type.OBJECT,
                     properties: {
                         primitives: {
                             type: Type.ARRAY,
                             items: primitiveSchema
                         }
                     },
                     required: ["primitives"]
                }
            }
        });
        
        const result = JSON.parse(response.text);
        return result.primitives;
    } catch (error) {
         console.error("Error reverse engineering:", error);
         throw new Error("Failed to reconstruct mesh.");
    }
}