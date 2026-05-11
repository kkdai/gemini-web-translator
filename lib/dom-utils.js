const EXCLUDE_TAGS = new Set(['SCRIPT', 'STYLE', 'CODE', 'TEXTAREA', 'NOSCRIPT', 'IFRAME']);

export function getTranslatableElements(root = document.body) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode(node) {
        if (EXCLUDE_TAGS.has(node.tagName)) return NodeFilter.FILTER_REJECT;
        
        // We want elements that contain direct text nodes with content
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

/**
 * Serializes an element's content into a string with placeholders for inline elements.
 * Example: "Click <a href='...'>here</a>" -> "Click ⟦0⟧here⟦/0⟧"
 */
export function serializeElement(element) {
  const inlineMap = new Map();
  let html = '';
  let counter = 0;

  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      html += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const id = counter++;
      inlineMap.set(id, node.cloneNode(true));
      // For simplicity, we assume inline elements are short. 
      // In a real app, we might recursively serialize.
      html += `⟦${id}⟧${node.textContent}⟦/${id}⟧`;
    }
  }

  return { text: html, inlineMap };
}

/**
 * Deserializes a translated string back into DOM nodes.
 */
export function deserializeToElement(translatedText, inlineMap, targetElement) {
  // Simple regex to find ⟦N⟧...⟦/N⟧
  const regex = /⟦(\d+)⟧(.*?)⟦\/\1⟧/g;
  let lastIndex = 0;
  let match;
  
  // Clear target element
  targetElement.innerHTML = '';

  while ((match = regex.exec(translatedText)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      targetElement.appendChild(document.createTextNode(translatedText.slice(lastIndex, match.index)));
    }

    const id = parseInt(match[1]);
    const innerText = match[2];
    const originalNode = inlineMap.get(id);

    if (originalNode) {
      const newNode = originalNode.cloneNode(true);
      newNode.textContent = innerText; // Update with translated inner text
      targetElement.appendChild(newNode);
    }

    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < translatedText.length) {
    targetElement.appendChild(document.createTextNode(translatedText.slice(lastIndex)));
  }
}
