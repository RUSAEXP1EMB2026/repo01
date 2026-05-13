/**
 * 登録された路線の遅延状況を確認し、遅延があれば1、なければ0を返す
 * @param {string} userId - チェック対象のユーザーID
 * @return {number} 1:遅延あり, 0:平常または路線未登録
 */
function checkTargetRouteDelay(userId) {
  const sheet = getSheet();
  const row = getUserRow(userId);
  
  // シートが存在しない、またはユーザーが見つからない場合のガード
  if (!row) {
    console.error(`ユーザーID: ${userId} が見つかりません。`);
    return 0;
  }
  
  const userRoute = sheet.getRange(row, COL.ROUTE).getValue();

  if (!userRoute) {
    console.log("路線が登録されていません。");
    return 0;
  }

  const url = "https://www.train-info.westjr.co.jp/data/sum_kinki.json";
  
  try {
    const response = UrlFetchApp.fetch(url);
    const result = JSON.parse(response.getContentText());
    
    // itemsが存在しない、または空の場合のハンドリング
    const trainItems = result.items || [];

    const isDelayed = trainItems.some(item => {
      // 1. 名前の不一致を防ぐための正規化（全角/半角、空白の削除など）
      const normalizedApiName = item.lineName.trim();
      const normalizedUserName = userRoute.trim();
      
      const matchName = normalizedApiName.includes(normalizedUserName) || 
                        normalizedUserName.includes(normalizedApiName);
      
      // 2. 【重要】markの比較
      // JR西日本のJSONでは mark は文字列 "1" で返ってくることが多いため、
      // 厳密等価 (!==) を使う場合は String() に変換するか、抽象比較 (!=) を推奨します。
      const notNormal = String(item.mark) !== "1";
      
      return matchName && notNormal;
    });

    if (isDelayed) {
      console.log(`【遅延検知】${userRoute} で遅延または規制が発生しています。`);
      return 1;
    }

    console.log(`${userRoute} は平常運転です。`);
    return 0;

  } catch (e) {
    console.error("JR西日本APIの取得に失敗しました: " + e.toString());
    return 0; 
  }
}