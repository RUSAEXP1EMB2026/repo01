//ライン連携のモジュール(機能3)

// LINE Webhookの受信エンドポイント
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("No data");
    }

    const body = JSON.parse(e.postData.contents);
    const events = body.events || [];

    events.forEach(function(event) {
      if (event.type === "message" && event.message.type === "text") {
        // テキストメッセージへの自動返信
        const replyToken = event.replyToken;
        const userMessage = event.message.text;

        if (userMessage === "起床時間を設定する") {
          replyMessage(replyToken, "記録したい曜日と時刻を先頭に朝をつけてスペース区切りで入力してください。\n（例：朝　月曜 15:30）");
          return; 
        }

        if (userMessage === "就寝時間を設定する") {
          replyMessage(replyToken, "記録したい曜日と時刻を先頭に夜をつけてスペース区切りで入力してください。\n（例：夜　月曜 15:30）");
          return; 
        }

        if (userMessage === "路線を設定する") {
          replyMessage(replyToken, "未実装");
          return; 
        }

        
      }
    });

    return ContentService.createTextOutput("OK");
  } catch (err) {
    Logger.log(err);
    return ContentService.createTextOutput("ERROR");
  }
}

// LINE返信API
function replyMessage(replyToken, text) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty("LINE_CHANNEL_ACCESS_TOKEN");

  const url = "https://api.line.me/v2/bot/message/reply";
  const payload = {
    replyToken: replyToken,
    messages: [{ type: "text", text: text }]
  };

  UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "Authorization": "Bearer " + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}