import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Select from './Select';

describe('Select', () => {
  const baseProps = {
    list: ['서울', '부산', '제주'],
    setValue: () => {},
    noneValue: '지역 선택',
  };

  it('noneValue 플레이스홀더가 렌더링된다', () => {
    render(<Select {...baseProps} />);
    expect(screen.getByText('지역 선택')).toBeInTheDocument();
  });

  it('value prop이 있으면 트리거 버튼에 해당 값이 표시된다', () => {
    render(<Select {...baseProps} value="서울" />);
    // 트리거 버튼(combobox)의 텍스트로 확인 (옵션 목록과 중복 방지)
    expect(screen.getByRole('combobox')).toHaveTextContent('서울');
  });

  it('트리거 버튼 클릭 시 옵션 목록이 펼쳐진다', () => {
    render(<Select {...baseProps} />);
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    expect(screen.getByText('부산')).toBeInTheDocument();
  });

  // Phase 1.5: 접근성
  it('트리거 버튼에 role="combobox"가 있다', () => {
    render(<Select {...baseProps} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('닫힌 상태에서 aria-expanded="false"이다', () => {
    render(<Select {...baseProps} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
  });

  it('열린 상태에서 aria-expanded="true"이다', () => {
    render(<Select {...baseProps} />);
    fireEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
  });

  it('aria-haspopup="listbox"이다', () => {
    render(<Select {...baseProps} />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('옵션 목록에 role="listbox"가 있다', () => {
    render(<Select {...baseProps} />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('선택된 항목의 aria-selected="true"이다', () => {
    render(<Select {...baseProps} value="부산" />);
    const busan = screen.getByRole('option', { name: '부산' });
    expect(busan).toHaveAttribute('aria-selected', 'true');
  });

  it('선택되지 않은 항목의 aria-selected="false"이다', () => {
    render(<Select {...baseProps} value="부산" />);
    const seoul = screen.getByRole('option', { name: '서울' });
    expect(seoul).toHaveAttribute('aria-selected', 'false');
  });
});
