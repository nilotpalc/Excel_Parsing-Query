
import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function arrayToCsv(data: string[][]): string {
    return data.map(row => 
        row.map(cell => {
            const strCell = String(cell || '');
            // Quote the cell if it contains a comma, double quote, or newline
            if (/[",\n]/.test(strCell)) {
                return `"${strCell.replace(/"/g, '""')}"`;
            }
            return strCell;
        }).join(',')
    ).join('\n');
}

export async function analyzeData(query: string, data: string[][]): Promise<AnalysisResult> {
    const csvData = arrayToCsv(data);
    const header = data.length > 0 ? data[0].join(', ') : 'No header found.';

    const prompt = `
        You are an expert data analyst. Your task is to analyze the provided CSV data and answer the user's query.
        The CSV data has the following header row: ${header}

        Follow these instructions:
        1. Analyze the entire CSV data provided below.
        2. Provide a clear, concise, and accurate answer to the user's query based ONLY on the provided data.
        3. Identify the specific rows from the original data that are most relevant to your answer.
        4. Return your response in the specified JSON format, including the answer and the 0-based indices of the relevant rows. If a header is relevant, its index is 0.
        
        USER QUERY: "${query}"

        CSV DATA:
        ${csvData}
    `;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    answer: {
                        type: Type.STRING,
                        description: "A concise answer to the user's query based on the data."
                    },
                    relevant_row_indices: {
                        type: Type.ARRAY,
                        description: "An array of 0-based integer indices corresponding to the rows in the provided data that are most relevant to the answer. This should include the header row (index 0) if it was used to understand the context.",
                        items: {
                            type: Type.INTEGER
                        }
                    }
                },
                required: ["answer", "relevant_row_indices"]
            }
        }
    });
    
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    const relevantRows = result.relevant_row_indices
        .map((index: number) => data[index])
        .filter((row: string[] | undefined): row is string[] => row !== undefined);
        
    return {
        answer: result.answer,
        relevantRows: relevantRows
    };
}
