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
        const userId = event.source.userId;

        if (userMessage === "起床時間を設定する") {
          replyMessage(replyToken, "記録したい曜日と時刻を先頭に朝をつけてスペース区切りで入力してください。\n（例：朝　月曜 15:30）");

        
          return; 
        }

        if (userMessage === "就寝時間を設定する") {
          replyMessage(replyToken, "記録したい曜日と時刻を先頭に夜をつけてスペース区切りで入力してください。\n（例：夜　月曜 15:30）");
          return; 
        }

        if (userMessage === "路線を設定する") {
          replyMessage(replyToken, "始発駅を先頭に始を入れて入力してください。正式名称で入力してください。　\n(例:始　〇〇駅)");
          return; 
        }

        if(userMessage.includes("始")&&userMessage.includes("駅")){
          const trainConfig = userMessage.split(/[\s　]+/);
          if(trainConfig.length === 2){

          const start = trainConfig[0];
          const startTrain = trainConfig[1];

          replyMessage(replyToken,"記録されました。" + startTrain + "を登録します。");

          


          return;
          }else{

            replyMessage(replyToken,"記録できませんでした。スペースが入っているかなどを確認してください。")

            return;

          }

          


        }

        if(userMessage.includes("朝")&&userMessage.includes("曜")){  //起床時間の設定
          const morningConfig = userMessage.split(/[\s　]+/);
          if(morningConfig.length === 3){

          const morning = morningConfig[0];  //朝
          const morningWeek = morningConfig[1];　　//曜日
          const morningTime = morningConfig[2];

          replyMessage(replyToken,"記録されました。" + morning + morningWeek +morningTime + "に起動します。");

          saveWakeTime(userId,morningWeek,morningTime);

          return;

          }

          else{replyMessage(replyToken,"記録できませんでした。スペースが入っているかなどを確認してください。")

          }

          return;



        }

        if(userMessage.includes("夜")&&userMessage.includes("曜")){//睡眠時間の設定

          const nightConfig = userMessage.split(/[\s　]+/);
          if(nightConfig.length === 3){

          const night = nightConfig[0];  //朝
          const nightWeek = nightConfig[1];　　//曜日
          const nightTime = nightConfig[2];

          saveSleepTime(userId,nightWeek,nightTime);

          replyMessage(replyToken,"記録されました。" + night + nightWeek + nightTime + "に起動します。");

          return;

          }

          else{replyMessage(replyToken,"記録できませんでした。スペースが入っているかなどを確認してください。")

          }

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