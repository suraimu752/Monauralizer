// バッジを更新する関数
async function updateBadge(tabId, isMonauralState) {
  // バッジテキストを設定
  await chrome.action.setBadgeText({
    text: isMonauralState ? 'M' : 'S',
    tabId: tabId
  });

  // バッジの背景色を設定
  await chrome.action.setBadgeBackgroundColor({
    color: '#FF5722',
    tabId: tabId
  });

  // バッジのテキストカラーを設定
  await chrome.action.setBadgeTextColor({
    color: '#FFFFFF',
    tabId: tabId
  });
}

// ログ出力用のプレフィックス
const LOG_PREFIX = '[Monauralizer]';

// アイコンクリック時の処理
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // content.jsが既に注入されているか確認
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'checkState' });
      if (response) {
        // すでに注入済みの場合は、トグル処理を実行
        const toggleResponse = await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
        if (toggleResponse) {
          await updateBadge(tab.id, toggleResponse.isMonaural);
        }
        return;
      }
    } catch (error) {
      // エラーは無視（content.jsがまだ注入されていない）
    }

    // content.jsを注入
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    // 初回は自動的にモノラルモードに切り替え
    const toggleResponse = await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    if (toggleResponse) {
      await updateBadge(tab.id, toggleResponse.isMonaural);
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error in click handler:`, error);
  }
}); 
