document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggleButton');
  
  // 現在の状態を取得して表示を更新
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      function: checkMonauralState
    }, (results) => {
      updateButtonText(results[0].result);
    });
  });

  // ボタンクリック時の処理
  toggleButton.addEventListener('click', () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.scripting.executeScript({
        target: {tabId: tabs[0].id},
        function: toggleMonaural
      }, (results) => {
        updateButtonText(results[0].result);
      });
    });
  });
});

// ボタンのテキストを更新する関数
function updateButtonText(isMonaural) {
  const toggleButton = document.getElementById('toggleButton');
  toggleButton.textContent = chrome.i18n.getMessage(
    isMonaural ? 'btnDisableMonaural' : 'btnMonauralize'
  );
}

// モノラル状態をチェックする関数（コンテンツスクリプトで実行）
function checkMonauralState() {
  const context = new AudioContext();
  return context.state === 'running' && context.destination.channelCount === 1;
}

// モノラル化を切り替える関数（コンテンツスクリプトで実行）
function toggleMonaural() {
  if (!window.audioContext) {
    window.audioContext = new AudioContext();
  }
  
  const isMonaural = window.audioContext.destination.channelCount === 1;
  window.audioContext.destination.channelCount = isMonaural ? 2 : 1;
  
  return !isMonaural;
} 
