document.getElementById('translateBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  document.getElementById('status').textContent = '正在檢查 AI 狀態...';
  
  // Check if AI is available via background script
  const capabilities = await chrome.runtime.sendMessage({ type: 'CHECK_AI' });
  
  if (capabilities.available === 'no') {
    document.getElementById('status').textContent = '錯誤: 瀏覽器不支援內建 AI 或尚未開啟。';
    return;
  }
  
  if (capabilities.available === 'after-download') {
    document.getElementById('status').textContent = '模型正在下載中，請稍候再試。';
    return;
  }

  document.getElementById('status').textContent = '翻譯中...';
  
  chrome.tabs.sendMessage(tab.id, { action: 'TRANSLATE_PAGE' }, (response) => {
    if (chrome.runtime.lastError) {
      document.getElementById('status').textContent = '錯誤: 無法與頁面連線。';
    } else {
      document.getElementById('status').textContent = '翻譯請求已送出。';
    }
  });
});
