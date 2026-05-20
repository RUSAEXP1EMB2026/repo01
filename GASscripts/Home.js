/*//家電を操作するためのモジュール(機能5)

//家電のID対応
const DEVICE = {
  LIGHT_ON: "ID",
  LIGHT_OFF: "ID",
  SPEAKER_POWER: "ID",
  PLAY: "ID",
  TV_POWER: "ID"
};

//Remo3でシグナルを送信する
function sendSignal(signalId) {
  const token = "ory_at_jklEGkUwStGQL7dBT4-ok6TUvXZXAnYHfoXcUR_16is._JKnRhSQQdQZXr4VD3c7ON-MYfO7HJL04qyEZAiuZ90";

  const url = "https://api.nature.global/1/signals/" + signalId + "/send";

  const options = {
    method: "post",
    headers: {
      "Authorization": "Bearer " + token
    }
  };

  UrlFetchApp.fetch(url, options);
}


// 朝の起動処理
function startMorning() {
  sendSignal(DEVICE.LIGHT_ON);

  sendSignal(DEVICE.SPEAKER_POWER);
  Utilities.sleep(3000);
  sendSignal(DEVICE.PLAY);
}

//夜の停止処理
function stopNight() {
  sendSignal(DEVICE.LIGHT_OFF);
  sendSignal(DEVICE.TV_POWER);
}


//スケジュールを実行(1分毎に設定)
function checkSchedule() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  const now = new Date();
  const nowTime = Utilities.formatDate(now, "Asia/Tokyo", "HH:mm");

  const days = ["日曜","月曜","火曜","水曜","木曜","金曜","土曜"];
  const today = days[now.getDay()];

  for (let i = 1; i < data.length; i++) {
    const wakeCol = getColumnByDay(today, "wake");
    const sleepCol = getColumnByDay(today, "sleep");

    const wakeTime = formatTime(data[i][wakeCol - 1]);
    const sleepTime = formatTime(data[i][sleepCol - 1]);

    if (nowTime === wakeTime) {
      startMorning();
      console.log("朝です");
    }

    if (nowTime === sleepTime) {
      stopNight();
    }
  }
}

//時刻フォーマット
function formatTime(value) {
  if (!value) return "";
  return Utilities.formatDate(new Date(value), "Asia/Tokyo", "HH:mm");
}


*/// ① トークンを使って「家電名」と「ボタン名」から自動でIDを探し出す関数
function getSignalIdByName(token, applianceName, signalName) {
    const url = "https://api.nature.global/1/appliances";
    const options = {
      method: "get",
      headers: { "Authorization": "Bearer " + token }
    };
  
    try {
      const response = UrlFetchApp.fetch(url, options);
      const appliances = JSON.parse(response.getContentText());
  
      // 一覧の中から指定した名前と一致するものを探す
      for (let app of appliances) {
        if (app.nickname === applianceName && app.signals) {
          for (let signal of app.signals) {
            if (signal.name === signalName) {
              return signal.id; // 見つかったらIDを返す
            }
          }
        }
      }
    } catch (e) {
      console.error("デバイス情報の取得に失敗: " + e.message);
    }
    return null; // 見つからなかった場合
  }
  
  // ② Remoでシグナルを送信する（引数にtokenを追加）
  function sendSignal(token, signalId) {
    if (!signalId) {
      console.log("シグナルIDが見つからないため送信をスキップしました");
      return;
    }
  
    const url = "https://api.nature.global/1/signals/" + signalId + "/send";
    const options = {
      method: "post",
      headers: { "Authorization": "Bearer " + token }
    };
  
    UrlFetchApp.fetch(url, options);
  }
  
  // ③ 朝の起動処理 (引数でuserIdを受け取るように変更)
  function startMorning(userId) {
    const token = getApi(userId); // スプレッドシートからトークンを取得
    if (!token) return;
  
    // 家電名とボタン名を指定して、そのユーザー用のIDを取得
    // ※文字列はNature Remoアプリで登録している名前と完全に一致させる必要があります
    const lightOnId = getSignalIdByName(token, "照明", "オン");
    
    const speakerPowerId = getSignalIdByName(token, "オーディオ", "オン");
  
    const speakerBluetooth = getSignalIdByName(token, "オーディオ", "接続");
  
    const playId = getSignalIdByName(token, "オーディオ", "再生");
  
    sendSignal(token, lightOnId);
    sendSignal(token, lightOnId);
    sendSignal(token, speakerPowerId);
    Utilities.sleep(3000);
    sendSignal(token, speakerBluetooth);
    Utilities.sleep(3000);
    sendSignal(token, playId);
  }
  
  // ④ 夜の停止処理 (引数でuserIdを受け取るように変更)
  function stopNight(userId) {
    const token = getApi(userId);
    if (!token) return;
  
    const lightOffId = getSignalIdByName(token, "照明", "オフ");
    const tvPowerId = getSignalIdByName(token, "テレビ", "電源");
    sendSignal(token, lightOffId);
    sendSignal(token, tvPowerId);
  }
  
  
  
  //スケジュールを実行(1分毎に設定)
  function checkSchedule() {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
  
    const now = new Date();
    const nowTime = Utilities.formatDate(now, "Asia/Tokyo", "HH:mm");
  
    const days = ["日曜","月曜","火曜","水曜","木曜","金曜","土曜"];
    const today = days[now.getDay()];
  
    for (let i = 1; i < data.length; i++) {
      // ユーザーIDを取得する行を追加
      const userId = data[i][COL.USER_ID - 1]; 
      
      const wakeCol = getColumnByDay(today, "wake");
      const sleepCol = getColumnByDay(today, "sleep");
  
      const wakeTime = formatTime(data[i][wakeCol - 1]);
      const sleepTime = formatTime(data[i][sleepCol - 1]);
      
      // エラー防止：wakeTimeが空の場合はスキップ
      if (!wakeTime) continue; 
  
      const wake = wakeTime.split(":");
  
      
      const intTime30 = Number(wake[0])*60 + Number(wake[1]) - 30;
      const intHour30 = Math.floor(intTime30 /60);
      const intMinute30 = intTime30 % 60;
      const Time30 = String(intHour30).padStart(2, '0') + ":" + String(intMinute30).padStart(2, '0');
  
      const intTime25 = Number(wake[0])*60 + Number(wake[1]) - 25;
      const intHour25 = Math.floor(intTime25 /60);
      const intMinute25 = intTime25 % 60;
      const Time25 = String(intHour25).padStart(2, '0') + ":" + String(intMinute25).padStart(2, '0');
  
      const intTime20 = Number(wake[0])*60 + Number(wake[1]) - 20;
      const intHour20 = Math.floor(intTime20 /60);
      const intMinute20 = intTime20 % 60;
      const Time20 = String(intHour20).padStart(2, '0') + ":" + String(intMinute20).padStart(2, '0');
  
      const intTime15 = Number(wake[0])*60 + Number(wake[1]) - 15;
      const intHour15 = Math.floor(intTime15 /60);
      const intMinute15 = intTime15 % 60;
      const Time15 = String(intHour15).padStart(2, '0') + ":" + String(intMinute15).padStart(2, '0');
  
      const intTime10 = Number(wake[0])*60 + Number(wake[1]) - 10;
      const intHour10 = Math.floor(intTime10 /60);
      const intMinute10 = intTime10 % 60;
      const Time10 = String(intHour10).padStart(2, '0') + ":" + String(intMinute10).padStart(2, '0');
  
      const intTime5 = Number(wake[0])*60 + Number(wake[1]) - 5;
      const intHour5 = Math.floor(intTime5 /60);
      const intMinute5 = intTime5 % 60;
      const Time5 = String(intHour5).padStart(2, '0') + ":" + String(intMinute5).padStart(2, '0');
  
      if(nowTime === Time30 ||nowTime === Time25 || nowTime === Time20||nowTime === Time15||nowTime === Time10|| nowTime === Time5){
        if(checkTargetRouteDelay(userId)){
          startMorning(userId);
          console.log("遅延が発生したお");
        }
      }
       
      if (nowTime === wakeTime) {
        startMorning(userId); // 誰の朝処理かを渡す
        console.log("朝");
      }
  
      if (nowTime === sleepTime) {
        stopNight(userId); // 誰の夜処理かを渡す
      }
    }
  }
  
  //時刻フォーマット
  function formatTime(value) {
    if (!value) return "";
    return Utilities.formatDate(new Date(value), "Asia/Tokyo", "HH:mm");
  }
  
  
  // ⑤ スピーカーの動作のみをテスト・チェックする関数
  function testSpeaker() {
    // === テスト準備 ======================================
    // テストしたいユーザーのIDをここに入力してください。
    // スプレッドシートに入力しているものと同じIDです。
    const testUserId = "U409b0ad911081a5d6ab373ef028ce5ee"; 
    // =====================================================
  
    console.log("スピーカーのテストを開始します...");
  
    const token = getApi(testUserId); 
    if (!token) {
      console.error("エラー: トークンが取得できませんでした。ユーザーIDやgetApi関数を確認してください。");
      return;
    }
  
    // 1. 各ボタンのIDを取得してログに出力（ここで取得できていないと動かない）
    console.log("Nature RemoからスピーカーのボタンIDを検索中...");
    const speakerPowerId = getSignalIdByName(token, "オーディオ", "オン");
    const speakerBluetooth = getSignalIdByName(token, "オーディオ", "接続");
    const playId = getSignalIdByName(token, "オーディオ", "再生");
  
    console.log("--- 取得結果 ---");
    console.log("電源（オン）のID: " + (speakerPowerId ? speakerPowerId : "❌ 見つかりません"));
    console.log("接続のID: " + (speakerBluetooth ? speakerBluetooth : "❌ 見つかりません"));
    console.log("再生のID: " + (playId ? playId : "❌ 見つかりません"));
    console.log("----------------");
  
    // 2. 実際にシグナルを送信する処理
    if (speakerPowerId) {
      console.log("1/3: スピーカーの電源をオンにします");
      sendSignal(token, speakerPowerId);
    } else {
      console.log("スキップ: 電源のIDがないため送信しません");
    }
    
    // 電源が入るまで待機
    Utilities.sleep(3000); 
  
    if (speakerBluetooth) {
      console.log("2/3: Bluetoothに接続します");
      sendSignal(token, speakerBluetooth);
    } else {
      console.log("スキップ: 接続のIDがないため送信しません");
    }
  
    // Bluetooth接続が完了するまで待機
    // ※機器によっては3秒(3000ms)では足りない場合があります。その場合はここを5000などに増やしてください。
    Utilities.sleep(3000); 
  
    if (playId) {
      console.log("3/3: 音楽を再生します");
      sendSignal(token, playId);
    } else {
      console.log("スキップ: 再生のIDがないため送信しません");
    }
  
    console.log("スピーカーのテストが完了しました！");
  }
  
  // ⑥ 睡眠（夜の停止処理）をテスト・チェックする関数
  function testSleep() {
    // === テスト準備 ======================================
    // テストしたいユーザーのIDをここに入力してください。
    // スプレッドシートに入力しているものと同じIDです。
    const testUserId = "U409b0ad911081a5d6ab373ef028ce5ee"; 
    // =====================================================
  
    console.log("睡眠（夜の停止処理）のテストを開始します...");
  
    const token = getApi(testUserId); 
    if (!token) {
      console.error("エラー: トークンが取得できませんでした。ユーザーIDやgetApi関数を確認してください。");
      return;
    }
  
    // 1. 各ボタンのIDを取得してログに出力（ここで取得できていないと動かない）
    console.log("Nature Remoから睡眠用家電のボタンIDを検索中...");
    const lightOffId = getSignalIdByName(token, "照明", "オフ");
    const tvPowerId = getSignalIdByName(token, "テレビ", "電源");
  
    console.log("--- 取得結果 ---");
    console.log("照明（オフ）のID: " + (lightOffId ? lightOffId : "❌ 見つかりません"));
    console.log("テレビ（電源）のID: " + (tvPowerId ? tvPowerId : "❌ 見つかりません"));
    console.log("----------------");
  
    // 2. 実際にシグナルを送信する処理
    if (lightOffId) {
      console.log("1/2: 照明をオフにします");
      sendSignal(token, lightOffId);
    } else {
      console.log("スキップ: 照明（オフ）のIDがないため送信しません");
    }
    
    // APIの連続呼び出しによるエラーを防ぐため少し待機
    Utilities.sleep(1000); 
  
    if (tvPowerId) {
      console.log("2/2: テレビの電源を操作します");
      sendSignal(token, tvPowerId);
    } else {
      console.log("スキップ: テレビ（電源）のIDがないため送信しません");
    }
  
    console.log("睡眠（夜の停止処理）のテストが完了しました！");
  }
  
  