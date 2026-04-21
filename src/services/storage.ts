// src/services/storage.ts
// LocalStorage へのすべてのデータアクセスをこのファイルに集約する。
// UI層が直接 localStorage を操作すると、キー名の変更やスキーマ変更の影響が
// 全コンポーネントに波及するため、ここで完全に隠蔽する。

import type { PracticeRecord, RecordInput, Settings, StorageData } from '../types';
import { STORAGE_KEYS } from '../types';
import { calculateRate } from './calculator';

/**
 * LocalStorage から生のレコードデータを読み込む内部関数。
 * 旧バージョンのデータ（versionフィールドなし）はここでマイグレーションする。
 * マイグレーション処理を読み込み側に集約することで、各関数が生データを気にしなくて済む。
 */
function loadStorageData(): StorageData {
  const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
  if (!raw) return { version: '1.0.0', records: [] };

  const parsed: unknown = JSON.parse(raw);

  // versionフィールドがない旧形式（配列直接保存）への対応。
  // 初回から version を含める設計だが、万が一古いデータが残っていた場合のフォールバック。
  if (Array.isArray(parsed)) {
    const migrated: StorageData = { version: '1.0.0', records: parsed as PracticeRecord[] };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(migrated));
    return migrated;
  }

  return parsed as StorageData;
}

// ========== PracticeRecord 操作（MVP） ==========

// 全記録をLocalStorageから取得する。
export function getAllRecords(): PracticeRecord[] {
  try {
    const data = loadStorageData();
    // 記録がなければ空の配列を返す
    return data.records ?? [];
  } catch (error) {
    console.error('Failed to get records:', error);
    return [];
  }
}

/**
 * 新しい記録を作成してLocalStorageに保存する。
 *
 * id に crypto.randomUUID() を使うのは、Date.now() ベースだと
 * 高速連続記録でミリ秒が衝突するリスクがあるため。
 *
 * 呼び出し側の注意: createRecord() の前に getLatestRecord() を呼ぶこと。
 * 保存後に getLatestRecord() を呼ぶと、追加したばかりの記録自身が返ってしまう。
 */
export function createRecord(input: RecordInput): PracticeRecord | null {
  try {
    // ここでid, rate, createdAt を計算する
    const rate = calculateRate(input.correct, input.total);

    const newRecord: PracticeRecord = {
      id: crypto.randomUUID(),
      date: input.date,
      total: input.total,
      correct: input.correct,
      rate,
      createdAt: new Date().toISOString(),
    };

    const records = getAllRecords();
    records.push(newRecord);

    // JSON形式で保存する。
    const data: StorageData = { version: '1.0.0', records };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data));

    return newRecord;
  } catch (e) {
    // QuotaExceededError（容量超過）も含めてここでキャッチする。
    console.error('Failed to create record:', e);
    return null;
  }
}

/**
 * 最新の記録を取得する。（日付が最も新しく、同日なら createdAt が最も新しい記録）
 *
 * ソートに [...records].sort() を使うのは、元の配列を破壊しないため。
 * 配列直接の .sort() は元配列を変更してしまい、getAllRecords() の返り値が
 * 副作用で並び変わる不具合を招く。
 */
export function getLatestRecord(): PracticeRecord | null {
  try {
    const records = getAllRecords();
    if (records.length === 0) return null;

    // 記録の配列を日付の新しい順に並び替える
    // sortはaとbを比較して順番を決める
    const sorted = [...records].sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      // 日付が違うならその結果を返す
      if (dateDiff !== 0) return dateDiff;
      // 日付が同じなら、時刻の差で返す
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // 配列の先頭が最新の記録
    return sorted[0];
  } catch (e) {
    console.error('Failed to get latest record:', e);
    return null;
  }
}

/**
 * 指定した ID の記録を削除する。
 *
 * filter で新配列を作るのは、splice で元配列を変更するより
 * バグが起きにくいため（イミュータブルな操作を優先する）。
 *
 * 削除件数が変わらなかった場合（IDが見つからなかった）は false を返し、
 * 呼び出し側がエラー処理できるようにする。
 */
export function deleteRecord(id: string): boolean {
  try {
    const records = getAllRecords();
    // id は、削除したい記録。
    // filter で削除したくない記録を複製しておく。
    const filtered = records.filter(record => record.id !== id);

    // 元の配列と、複製した削除したくない配列のlengthが同じ＝何も削除しない
    if (filtered.length === records.length) return false;

    // 現時点でのデータの型をVersion1.0.0とする（今後型を変えるなら2.0に変える？）
    const data: StorageData = { version: '1.0.0', records: filtered };
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data));

    return true;
  } catch (error) {
    console.error('Failed to delete record:', error);
    return false;
  }
}

/**
 * 全記録を日付降順に並べ替えて返す。（同日は createdAt 降順）
 *
 * 記録一覧画面と前回比計算で同じ並び順が必要なため、
 * ソートロジックをここに集約して重複実装を防ぐ。
 */
export function getSortedRecords(): PracticeRecord[] {
  const records = getAllRecords();
  return [...records].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

// ========== Settings 操作（MVP） ==========

/**
 * アプリ設定を取得する。
 * 未保存の場合は { examDate: null } を返す。
 * null をデフォルトにするのは、JSON.stringify/parse で undefined が消えてしまうため。
 */
export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { examDate: null };
    // storage.ts 82行目で保存したJSONをSettings型に変換
    // Home.tsx で getSettings().examDate を使用できる。
    return JSON.parse(raw) as Settings;
  } catch (error) {
    console.error('Failed to get settings:', error);
    return { examDate: null };
  }
}

/**
 * アプリ設定を更新する。
 * Partial<Settings> を受け取るのは、変更したいフィールドだけを渡せるようにするため。
 * 現在の設定とマージすることで、未指定フィールドが消えるのを防ぐ。
 */
export function updateSettings(newSettings: Partial<Settings>): Settings | null {
  try {
    // 今の設定を取得
    const current = getSettings();
    // 将来的に、「受験日」以外がSettingに含まれることを考慮して、入力した受験日を直接updatedに代入しない。
    const updated: Settings = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Failed to update settings:', error);
    return null;
  }
}

// ========== ユーティリティ ==========

/**
 * 全記録の平均正答率を計算する。
 * 0件の場合に 0 を返すのは、UI側で「件数がないのに割り算した値」を表示しないようにするため。
 * 小数第1位に丸めるのは、正答率と表示精度を揃えるため。
 */
export function getAverageRate(): number {
  const records = getAllRecords();
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, r) => acc + r.rate, 0);
  return Math.round((sum / records.length) * 10) / 10;
}

/**
 * 総演習回数を返す。
 * getAllRecords().length をそのまま返すだけだが、
 * UI層が storage の内部構造（配列）を知らなくて済むように関数化している。
 */
export function getTotalCount(): number {
  return getAllRecords().length;
}

/**
 * すべてのデータを削除する。
 * テストの beforeEach でデータをリセットするために使う。
 * プロダクションでは設定画面のリセット機能として使用する想定。
 */
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}
