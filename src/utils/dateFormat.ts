// src/utils/dateFormat.ts
// 日付の表示フォーマットと残日数計算をここに集約する。
// UI層の各コンポーネントが独自に日付処理を書くと実装が分散してバグを招くため、
// ここを唯一の変換ポイントにする。
// date-fns を使う理由: タイムゾーン処理や差分計算をネイティブ Date より
// 安全かつ簡潔に記述できるため。

import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * YYYY-MM-DD 形式の日付文字列を日本語表示に変換する。
 *
 * parseISO を使う理由:
 * new Date("2026-02-15") は UTC として解釈されるため、環境によって
 * 日本時間では前日になることがある。parseISO はローカルタイムで解釈するため
 * ズレが生じない。
 *
 * 例: "2026-02-15" → "2026年2月15日"
 */
export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'yyyy年M月d日', { locale: ja });
}

/**
 * YYYY-MM-DD 形式の受験予定日から、今日までの残り日数を計算する。
 *
 * differenceInCalendarDays を使う理由:
 * ミリ秒差分を自前で計算すると夏時間・うるう秒の影響を受けるため。
 * また、「今日が試験日」なら 0 を返すことで当日まで表示できる。
 *
 * 戻り値: 正数 = 残り日数、0 = 当日、負数 = 過去
 */
export function calcDaysUntil(dateString: string): number {
  const targetDate = parseISO(dateString);
  const today = new Date();
  // 時刻の差異を排除して日付単位で比較するため、
  // differenceInCalendarDays を使用する（時刻を0:00に切り捨てて計算される）。
  return differenceInCalendarDays(targetDate, today);
}

/**
 * 今日の日付を YYYY-MM-DD 形式で返す。
 *
 * new Date() を直接フォーマットする実装は各コンポーネントに散らばりやすいため
 * ここに集約する。テストで差し替えやすくする意図もある。
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
