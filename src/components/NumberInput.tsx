// src/components/NumberInput.tsx
// 数字を入力するinputフォーム。これを「回答数」や「正答数」の入力に使う。
// バリデーションエラーの表示をコンポーネント内に閉じ込めることで、
// 呼び出し側（RecordForm）がエラー表示の詳細を知らずに済む。

import styled from 'styled-components';

// interfaceなので、実際の値や文字列は親側で決める
interface NumberInputProps {
  // フォームのラベル
  label: string;
  // 入力値
  value: number | '';
  // 入力値が変化したとき
  onChange: (value: number | '') => void;
  // 入力フォームのplaceholder
  placeholder?: string;
  // エラー発生時のメッセージ
  error?: string;
  // 入力可能な最小値
  min?: number;
  // 入力可能な最大値
  max?: number;
}

export function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  min,
  max,
}: NumberInputProps) {
  // label テキストから id を生成して <label htmlFor> と紐付ける
  const inputId = `number-input-${label.replace(/\s+/g, '-')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange('');
      return;
    }
    // 文字列を数字に変換
    const parsed = parseInt(raw, 10);
    // 数値に変換できない入力（例: 'abc'）は無視する
    if (!isNaN(parsed)) {
      onChange(parsed);
    }
  };

  return (
    <Wrapper>
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        $hasError={!!error}
        // type="number" にするとスピナーUI が出る場合がある。
        // （数字の横の▼とか▲とかをクリックして数字を入力・変更できるやつ）
        // // type="text" + inputMode で入力フォームの見た目を整える。
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        // aria-invalid でスクリーンリーダーにエラー状態を伝える
        aria-invalid={!!error}
        // aria-describedby でエラーメッセージ要素と紐付ける
        aria-describedby={`${inputId}-error`}
      />
      <ErrorMessage id={`${inputId}-error`} aria-live="polite">
        {/* error が存在すればそれを、なければ'' を返す */}
        {error ?? ''}
      </ErrorMessage>
    </Wrapper>
  );
}

// ─── Styled Components ───────────────────────────────────────────

// label・input・エラーメッセージを垂直に並べるラッパー。
// 呼び出し側でラップ要素を書かずに済む。
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #000000;
`;

// $hasError を transient props にすることで DOM に渡らないようにする
const Input = styled.input<{ $hasError: boolean }>`
  /* 04_screen-design.md セクション5.2: 入力フィールドのスタイル */
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ $hasError }) => ($hasError ? '#ff3b30' : '#d1d1d6')};
  background-color: #ffffff;
  font-size: 16px;
  color: #000000;
  width: 100%;
  box-sizing: border-box;

  /* フォーカスアウトラインをカスタムに置き換えるため非表示 */
  outline: none;
  transition: border-color 0.15s ease;

  &:focus {
    /* エラー中はフォーカスしても赤枠を維持する（エラー > フォーカス の優先度）*/
    border-color: ${({ $hasError }) => ($hasError ? '#ff3b30' : '#007aff')};
  }
`;

// aria-live="polite" でバリデーション結果をスクリーンリーダーに通知する
const ErrorMessage = styled.span`
  font-size: 13px;
  color: #ff3b30;
  min-height: 1em;
`;
