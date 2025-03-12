// メディアコンテキストを管理するマップ
const mediaContextsMap = new Map();
let showErrorAlert = true;

// モノラル状態をチェックする関数
function checkMonauralState() {
  return mediaContextsMap.size > 0 && 
    Array.from(mediaContextsMap.values()).every(({ context }) => 
      context.destination.channelCount === 1
    );
}

// モノラル化を切り替える関数
function toggleMonaural() {
  try {
    // すべてのビデオとオーディオ要素を取得
    const mediaElements = Array.from(document.querySelectorAll('video, audio'));
    
    if (mediaElements.length === 0) {
      return false;
    }

    const isCurrentlyMonaural = checkMonauralState();

    mediaElements.forEach((media) => {
      if (!mediaContextsMap.has(media)) {
        try {
          // オーディオコンテキストとノードを作成
          const context = new (window.AudioContext || window.webkitAudioContext)();
          const source = context.createMediaElementSource(media);
          
          // コンテキストの出力を直接接続
          source.connect(context.destination);
          
          // マップにメディアコンテキストを保存
          mediaContextsMap.set(media, { context, source });
        } catch (e) {
          console.error('Error creating audio context:', e);
          if (showErrorAlert) {
            alert('他の拡張機能と競合している可能性があります。');
            showErrorAlert = false;
          }
          return false;
        }
      }
    });

    // すべてのコンテキストのチャンネル数を切り替え
    mediaContextsMap.forEach(({ context }) => {
      context.destination.channelCount = isCurrentlyMonaural ? 2 : 1;
    });

    return !isCurrentlyMonaural;
  } catch (e) {
    console.error('Error toggling monaural:', e);
    return false;
  }
}

// メッセージリスナーを設定
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkState') {
    sendResponse({ isMonaural: checkMonauralState() });
  } else if (request.action === 'toggle') {
    const result = toggleMonaural();
    sendResponse({ isMonaural: result });
  }
  return true; // 非同期レスポンスのために必要
}); 
