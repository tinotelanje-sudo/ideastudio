/**
 * AI Code Completion Service
 */

export interface CompletionItem {
  label: string;
  detail: string;
  insertText: string;
}

export const getAiCompletions = async (prefix: string): Promise<CompletionItem[]> => {
  try {
    const response = await fetch('/api/ai/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prefix }),
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Completion error:', error);
    return [];
  }
};
