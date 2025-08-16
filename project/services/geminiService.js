import { GoogleGenAI, Type } from "@google/genai";
// Safely access the API key to prevent crashing in a browser-only environment.
const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined;
let ai = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey
    });
  } catch (e) {
    console.error("Failed to initialize GoogleGenAI. This might be due to an invalid API key or network issues.", e);
  }
} else {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}
const checkAi = () => {
  if (!ai) {
    throw new Error("AI service is not configured. Please ensure the API key is set correctly.");
  }
  return ai;
};
export const generateSummaryFromImage = async base64ImageData => {
  const aiClient = checkAi();
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData
    }
  };
  const textPart = {
    text: "Summarize the key points from the text in this image. If it's not a document, describe the image."
  };
  const response = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [imagePart, textPart]
    }
  });
  return response.text;
};
export const solveMathProblem = async problem => {
  const aiClient = checkAi();
  const prompt = `Solve the following math problem and provide a detailed step-by-step solution. Format the solution clearly.\n\nProblem: ${problem}`;
  const response = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt
  });
  return response.text;
};
export const solveMathProblemFromImage = async base64ImageData => {
  const aiClient = checkAi();
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData
    }
  };
  const textPart = {
    text: "Extract the math problem from this image and provide a detailed step-by-step solution. Format the solution clearly."
  };
  const response = await aiClient.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [imagePart, textPart]
    }
  });
  return response.text;
};
export const generateStudyPlan = async (course, assignments, targetGrade) => {
  const aiClient = checkAi();
  const gradedAssignments = assignments.filter(a => a.grade.score !== null && a.grade.total !== null && a.weight > 0);
  const ungradedAssignments = assignments.filter(a => a.grade.score === null && a.grade.total !== null && a.weight > 0);
  const currentScore = gradedAssignments.reduce((acc, a) => acc + a.grade.score / a.grade.total * a.weight, 0);
  const completedWeight = gradedAssignments.reduce((acc, a) => acc + a.weight, 0);
  const remainingWeight = ungradedAssignments.reduce((acc, a) => acc + a.weight, 0);
  const prompt = `
    A student needs a study plan for their "${course.name}" course.
    
    Current situation:
    - Target final grade: ${targetGrade}%
    - Current weighted score from completed assignments: ${currentScore.toFixed(2)} out of a possible ${completedWeight}.
    - The total weight of completed assignments is ${completedWeight}%.
    - The total weight of remaining assignments is ${remainingWeight}%.
    
    Remaining assignments:
    ${ungradedAssignments.map(a => `- ${a.name} (worth ${a.weight}%)`).join('\n') || 'None'}
    
    Based on this data, first calculate the average percentage score the student needs on all remaining assignments to achieve their target grade.
    
    Then, create a concise, actionable study plan with 2-3 specific recommendations. The plan should be encouraging and focus on tangible actions. Finally, provide a short, motivational message.
    
    Return the result in the specified JSON format.
  `;
  const response = await aiClient.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          targetGrade: {
            type: Type.NUMBER
          },
          requiredAverage: {
            type: Type.NUMBER
          },
          plan: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                topic: {
                  type: Type.STRING
                },
                action: {
                  type: Type.STRING
                }
              },
              propertyOrdering: ["topic", "action"]
            }
          },
          motivationalMessage: {
            type: Type.STRING
          }
        },
        propertyOrdering: ["targetGrade", "requiredAverage", "plan", "motivationalMessage"]
      }
    }
  });
  const jsonText = response.text.trim();
  try {
    const parsedResponse = JSON.parse(jsonText);
    return parsedResponse;
  } catch (e) {
    console.error("Failed to parse Gemini response:", jsonText);
    throw new Error("Received an invalid format from the AI.");
  }
};