// JR西日本の運行情報を取得する関数
async function getJRWestStatus() {
    const url = "https://www.train-guide.westjr.co.jp/api/v3/area_kinki_trafficinfo.json";
  
    console.log("JR西日本の運行情報を確認中...");
  
    try {
      // 1. データを取ってくる
      const response = await fetch(url);
      
      // 2. JSON形式として読み込む
      const data = await response.json();
  
      // 3. 表示する
      const lines = data.lines;
      const lineKeys = Object.keys(lines);
  
      if (lineKeys.length === 0) {
        console.log("現在、遅延などの情報はありません。平常通り運転しています。");
      } else {
        console.log("==== 運行情報一覧 ====");
        lineKeys.forEach(key => {
          const info = lines[key];
          console.log(`【${info.name}】 ${info.status}`);
          if (info.message) console.log(`   理由: ${info.message}`);
        });
        console.log("======================");
      }
    } catch (error) {
      console.error("データの取得に失敗しました:", error.message);
    }
  }
  
  // 実行
  getJRWestStatus();