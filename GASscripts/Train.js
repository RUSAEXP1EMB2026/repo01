/**
 * 登録された路線の遅延状況を確認し、遅延があれば1、なければ0を返す
 * @param {string} userId - チェック対象のユーザーID
 * @return {number} 1:遅延あり, 0:平常または路線未登録
 */

function checkTargetRouteDelay(userId) {
  const sheet = getSheet();
  const row = getUserRow(userId);
  
  if (!row) {
    console.error(`ユーザーID: ${userId} が見つかりません。`);
    return 0;
  }
  
  const userRoute = String(sheet.getRange(row, COL.ROUTE).getValue()).trim();
  
  const userLines = userRoute.split('線');
  

  if (!userRoute) {
    console.log("路線が登録されていません。");
    return 0;
  }

  // Yahoo!路線情報（関西エリア）のURL
  // 関西以外の場合はここのURLを変えます（例: 関東なら area/4）
  const url = "https://transit.yahoo.co.jp/diainfo/area/6";
  
  try {
    const response = UrlFetchApp.fetch(url);
    const html = response.getContentText("UTF-8"); // ページのHTMLをすべてテキストとして取得
    
    // HTMLの中から、登録された「路線名」が書かれている場所（文字の位置）を探す
    for(let i = 0;i < 3;i ++ ){

      if(userLines[i] === ""){
        break;
      }
    const routeIndex = html.indexOf(userLines[i]);
    
    if (routeIndex === -1) {
      console.log(`❌ Yahooに「${userRoute}」が見つかりませんでした。スプレッドシートの路線名が正しいか確認してください（例：「大阪環状線」など）。`);
      return 0;
    }

    // 路線名が見つかった場所から、後ろ300文字分くらいを切り出す
    // （Yahooのサイトは路線名のすぐ後ろに「平常運転」や「遅延」という文字が表示されるため）
    const statusArea = html.substring(routeIndex, routeIndex + 100);

    // 切り出した文字の中に、トラブルを示すキーワードが含まれているかチェック
    if (statusArea.includes("列車遅延") || statusArea.includes("運転見合わせ") || statusArea.includes("運休")|| statusArea.includes("その他")) {
      console.log(`🚨 【遅延検知】${userLines[i]} で遅延または運休が発生しています。`);
      return 1;
    }

    console.log(`✅ ${userLines[i]} は平常運転です。`);
    }

    return 0;

  } catch (e) {
    console.error("Yahoo路線情報の取得に失敗しました: " + e.toString());
    return 0; 
  }

}

function test(){

  checkTargetRouteDelay('U409b0ad911081a5d6ab373ef028ce5ee');


}