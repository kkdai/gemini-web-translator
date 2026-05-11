import { translateText, getAICapabilities } from './lib/ai.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRANSLATE') {
    translateText(request.text, request.targetLang)
      .then(translatedText => sendResponse({ success: true, translatedText }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (request.type === 'CHECK_AI') {
    getAICapabilities().then(cap => sendResponse(cap));
    return true;
  }
});
