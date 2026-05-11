export async function getAICapabilities() {
  if (!chrome.ai || !chrome.ai.languageModel) {
    return { available: 'no' };
  }
  return await chrome.ai.languageModel.capabilities();
}

let session = null;

export async function translateText(text, targetLang = 'Traditional Chinese') {
  const capabilities = await getAICapabilities();
  if (capabilities.available === 'no') {
    throw new Error('Chrome Built-in AI is not available.');
  }

  if (!session) {
    session = await chrome.ai.languageModel.create({
      systemPrompt: `You are a professional web translator. 
Translate the following text into ${targetLang}. 
Maintain the same tone and format. 
Crucially, preserve any placeholders like ⟦N⟧ and ⟦/N⟧ or ⟦*N⟧ exactly as they are in the source, and place them correctly in the translated text.
Return ONLY the translated text.`
    });
  }

  try {
    const response = await session.prompt(text);
    return response.trim();
  } catch (error) {
    console.error('AI Translation Error:', error);
    // If session expired or crashed, reset it
    session = null;
    throw error;
  }
}
