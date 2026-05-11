const EXCLUDE_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'TEXTAREA', 'NOSCRIPT', 'IFRAME']);

function getTranslatableElements(root = document.body) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (EXCLUDE_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT;
        const hasText = Array.from(node.childNodes).some(
          child => child.nodeType === Node.TEXT_NODE && child.textContent.trim().length > 0
        );
        return hasText ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    }
  );

  const elements = [];
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    elements.push(currentNode);
  }
  return elements;
}

function serializeElement(element) {
  const inlineMap = new Map();
  let text = '';
  let counter = 0;

  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const id = counter++;
      inlineMap.set(id, node.cloneNode(true));
      text += `⟦${id}⟧${node.textContent}⟦/${id}⟧`;
    }
  }

  return { text, inlineMap };
}

function deserializeToElement(translatedText, inlineMap, targetElement) {
  const regex = /⟦(\d+)⟧(.*?)⟦\/\1⟧/g;
  let lastIndex = 0;
  let match;
  
  const fragment = document.createDocumentFragment();

  while ((match = regex.exec(translatedText)) !== null) {
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(translatedText.slice(lastIndex, match.index)));
    }

    const id = parseInt(match[1]);
    const innerText = match[2];
    const originalNode = inlineMap.get(id);

    if (originalNode) {
      const newNode = originalNode.cloneNode(true);
      newNode.textContent = innerText;
      fragment.appendChild(newNode);
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < translatedText.length) {
    fragment.appendChild(document.createTextNode(translatedText.slice(lastIndex)));
  }

  targetElement.innerHTML = '';
  targetElement.appendChild(fragment);
}

async function translatePage() {
  console.log('Gemini Translator: Starting page translation...');
  const elements = getTranslatableElements();
  console.log(`Gemini Translator: Found ${elements.length} elements to translate.`);

  const BATCH_SIZE = 5;
  for (let i = 0; i < elements.length; i += BATCH_SIZE) {
    const batch = elements.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (el) => {
      const { text, inlineMap } = serializeElement(el);
      if (!text.trim()) return;

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'TRANSLATE',
          text: text,
          targetLang: 'Traditional Chinese'
        });

        if (response && response.success) {
          deserializeToElement(response.translatedText, inlineMap, el);
        }
      } catch (err) {
        console.error('Batch translation error:', err);
      }
    }));
  }
  console.log('Gemini Translator: Translation complete.');
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'TRANSLATE_PAGE') {
    translatePage();
    sendResponse({ status: 'started' });
  }
});
