//スプレッドシートを管理するモジュール(機能1)
//入力されたスケジュールを管理するモジュール(機能6)
const SHEET_NAME = "スケジュール管理";
//カラム定義
const COL = {
  USER_ID: 1,
  MON_WAKE: 2,
  MON_SLEEP: 3,
  TUE_WAKE: 4,
  TUE_SLEEP: 5,
  WED_WAKE: 6,
  WED_SLEEP: 7,
  THU_WAKE: 8,
  THU_SLEEP: 9,
  FRI_WAKE: 10,
  FRI_SLEEP: 11,
  SAT_WAKE: 12,
  SAT_SLEEP: 13,
  SUN_WAKE: 14,
  SUN_SLEEP: 15,
  ROUTE: 16
};

// シート取得
function getSheet() {
  const ss = SpreadsheetApp.openById('1GIqCIMaca8Zuw2QWM3TxBLPVtGEm7B2nS4lEXdKKEs4');
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "userId","月起床","月就寝","火起床","火就寝",
      "水起床","水就寝","木起床","木就寝",
      "金起床","金就寝","土起床","土就寝",
      "日起床","日就寝","路線"
    ]);
  }

  return sheet;
}

// ユーザー行取得 or 作成
function getUserRow(userId) {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return i + 1;
    }
  }

  const newRow = sheet.getLastRow() + 1;
  sheet.getRange(newRow, 1).setValue(userId);
  return newRow;
}

// 曜日 → カラム変換
function getColumnByDay(day, type) {
  const map = {
    "月曜": { wake: COL.MON_WAKE, sleep: COL.MON_SLEEP },
    "火曜": { wake: COL.TUE_WAKE, sleep: COL.TUE_SLEEP },
    "水曜": { wake: COL.WED_WAKE, sleep: COL.WED_SLEEP },
    "木曜": { wake: COL.THU_WAKE, sleep: COL.THU_SLEEP },
    "金曜": { wake: COL.FRI_WAKE, sleep: COL.FRI_SLEEP },
    "土曜": { wake: COL.SAT_WAKE, sleep: COL.SAT_SLEEP },
    "日曜": { wake: COL.SUN_WAKE, sleep: COL.SUN_SLEEP }
  };

  return map[day] ? map[day][type] : null;
}

// データ保存
function saveWakeTime(userId, day, time) {
  const sheet = getSheet();
  const row = getUserRow(userId);
  const col = getColumnByDay(day, "wake");
  if (!col) return false;

  sheet.getRange(row, col).setValue(time);
  return true;
}

function saveSleepTime(userId, day, time) {
  const sheet = getSheet();
  const row = getUserRow(userId);
  const col = getColumnByDay(day, "sleep");
  if (!col) return false;

  sheet.getRange(row, col).setValue(time);
  return true;
}

function saveRoute(userId, route) {
  const sheet = getSheet();
  const row = getUserRow(userId);
  sheet.getRange(row, COL.ROUTE).setValue(route);
}

