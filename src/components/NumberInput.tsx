// src/components/NumberInput.tsx
// 数値入力フィールド。バリデーションエラーの表示をコンポーネント内に閉じ込めることで、
// 呼び出し側（RecordForm）がエラー表示の詳細を知らずに済む。
//
// なぜ type="number" ではなく type="text" + inputMode にするか:
// type="number" はブラウザによってスピナーUI が出たり、
// 先頭ゼロが入力されたりと挙動が不安定なため。
// inputMode="numeric" でモバイルでは数値キーパッドを表示し、
// 値の扱いはアプリ側で制御する。

import styled from 'styled-components';

interface NumberInputProps {
  label: string;
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  error?: string;
  min?: number;
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
        // type="text" + inputMode でモバイル数値キーパッドを出しつつ、
        // スピナーUIを避ける（詳細は上部コメント参照）
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
