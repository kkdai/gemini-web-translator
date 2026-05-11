# Gemini Web Translator

這是一個基於 Chrome 內建 AI (Gemini Nano) 打造的網頁翻譯擴充功能原型。本專案參考了 [Shinkansen](https://github.com/jimmysu0309/shinkansen) 的 DOM 處理邏輯，實現了隱私優先、完全在地端的網頁翻譯體驗。

## 🌟 特色

- **完全在地端**：翻譯過程完全在您的電腦上執行，不經過任何雲端伺服器，極具隱私性。
- **排版保留**：使用序列化佔位符技術，確保翻譯後能完整保留網頁中的連結、粗體等行內樣式。
- **免 API Key**：無需申請 Google Gemini 或 OpenAI 的 API Key，直接調用瀏覽器能力。

## 🛠️ 事前準備 (重要)

目前 Chrome 的內建 AI 功能仍處於實驗階段，請務必按照以下步驟設定：

### 1. 修改 Chrome Flags
請在 Chrome 網址列輸入並開啟以下設定：
- `chrome://flags/#prompt-api-for-gemini-nano` -> 設定為 **Enabled**
- `chrome://flags/#optimization-guide-on-device-model` -> 設定為 **Enabled BypassPerfRequirement**
- 設定完成後請重啟 Chrome。

### 2. 確保模型已下載
- 前往 `chrome://components`
- 尋找 **Optimization Guide On Device Model**
- 點擊「檢查更新 (Check for update)」，確保狀態為「組件已更新」或「正在下載」（模型大小約 1.5GB ~ 4GB）。

### 3. 硬體需求
- 建議 RAM 至少 16GB。
- 建議具有 4GB 以上 VRAM 的 GPU。

## 🚀 安裝與使用

1. 下載本專案原始碼。
2. 開啟 Chrome 擴充功能管理頁面 `chrome://extensions`。
3. 開啟右上角的「開發者模式」。
4. 點擊「載入未封裝項目」，選擇 `gemini-web-translator` 資料夾。
5. 前往任何英文網頁。
6. 點擊擴充功能圖示，按下 **「翻譯全頁」**。

## 🧪 技術細節

- **DOM Walker**: 使用 `TreeWalker` 精確遍歷含有文字內容的節點，避開程式碼與樣式區塊。
- **Serialization**: 實作了 `⟦N⟧` 格式的佔位符序列化邏輯，讓 AI 能在翻譯文字的同時正確處理 HTML 標籤位置。
- **Batching**: 實作分批處理機制，平衡翻譯速度與系統負擔。

## ⚠️ 已知限制

- **Context Window**: 目前 Gemini Nano 的輸入上限較短，若單一區塊文字過長可能會翻譯失敗。
- **效能**: 翻譯速度取決於您電腦的 GPU 算力。
- **實驗性**: API 名稱與功能隨 Chrome 版本更新可能會有變動。
