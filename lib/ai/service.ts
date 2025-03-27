import Replicate from 'replicate';

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('Missing REPLICATE_API_TOKEN environment variable');
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// We'll use Llama 2 for now, but can easily switch to other models
const MODEL = "meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3";

export async function generateResponse(prompt: string, context?: string) {
  try {
    const systemPrompt = `You are a helpful AI assistant for a family office. You help with:
- Family financial planning
- Document organization
- Task management
- Important date tracking
- Family information management

${context ? `Context: ${context}` : ''}

Please provide clear, concise, and helpful responses.`;

    const response = await replicate.run(
      MODEL,
      {
        input: {
          prompt: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`,
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          repetition_penalty: 1.1,
        }
      }
    ) as string[];

    // The response is an array of strings, we want the last one
    return response[response.length - 1].trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
} 