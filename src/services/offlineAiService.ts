/**
 * Offline AI Service for IDEAI STUDIOS
 * Provides fallback AI capabilities when internet is unavailable.
 */

export interface OfflineAiResponse {
  type: 'code' | 'text';
  content: string;
}

export const queryOfflineAi = async (prompt: string): Promise<OfflineAiResponse> => {
  try {
    const response = await fetch('/api/ai/offline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error('Offline AI service unavailable');
    }

    return await response.json();
  } catch (error) {
    console.error('Offline AI Error:', error);
    return {
      type: 'text',
      content: "Offline AI is currently unavailable. Please check your local server status."
    };
  }
};
