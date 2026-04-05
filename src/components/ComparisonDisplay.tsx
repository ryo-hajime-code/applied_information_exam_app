// src/components/ComparisonDisplay.tsx
// 記録追加後に表示する「前回比」コンポーネント。
// このコンポーネントは値が存在する場合のみ表示する設計で、
// null チェックは親（Home）が担うことで責務を分離している。
// 色だけでなくアイコン(⬆⬇→)も表示するのは、色覚特性のあるユーザーへの対応（04_screen-design.md §8.2）。

import styled, { keyframes } from 'styled-components';
import type { ComparisonDisplayProps } from '../types';
import { getComparisonStatus } from '../types';

// ステータスに対応する色・アイコン・符号プレフィックスのマップ。
// コンポーネント内に分岐を散らさず、ここに集約することで変更箇所を最小化する。
const STATUS_CONFIG = {
  improved: {
    color: '#34c759',
    icon: '⬆',
    // 正の場合は「+」を明示的に付けて方向を伝える
    prefix: '+',
  },
  declined: {
    color: '#ff3b30',
    icon: '⬇',
    // 負の場合は comparison 自体がマイナス値なので prefix は不要
    prefix: '',
  },
  unchanged: {
    color: '#8e8e93',
    icon: '→',
    prefix: '±',
  },
} as const;

export function ComparisonDisplay({ comparison }: ComparisonDisplayProps) {
  const status = getComparisonStatus(comparison);
  const { color, icon, prefix } = STATUS_CONFIG[status];

  // 小数第1位まで固定表示（正答率と精度を揃える）
  const formatted = Math.abs(comparison).toFixed(1);

  return (
    <Wrapper>
      <Text $color={color}>
        前回比: {prefix}{formatted}% {icon}
      </Text>
    </Wrapper>
  );
}

// ─── Styled Components ───────────────────────────────────────────

// フェードインアニメーション（0.3秒）: 04_screen-design.md §7 に準拠
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const Wrapper = styled.div`
  animation: ${fadeIn} 0.3s ease-in-out;
`;

const Text = styled.p<{ $color: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ $color }) => $color};
`;
