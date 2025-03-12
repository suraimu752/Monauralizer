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

// タブが更新された時のイベントリスナー
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    try {
      const response = await chrome.tabs.sendMessage(tabId, { action: 'checkState' });
      if (response) {
        await updateBadge(tabId, response.isMonaural);
      }
    } catch (error) {
      // タブがメッセージングに対応していない場合は無視
      console.log(`${LOG_PREFIX} Tab ${tabId} not ready for messaging`);
    }
  }
});

// アイコンクリック時の処理
chrome.action.onClicked.addListener(async (tab) => {
  try {
    // content.jsにメッセージを送信
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
    if (response) {
      // バッジを更新
      await updateBadge(tab.id, response.isMonaural);
    }
  } catch (error) {
    console.error(`${LOG_PREFIX} Error in click handler:`, error);
  }
}); 
