import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'jest-axe';
import InfoText from './InfoText';

describe('InfoText', () => {
  it('children을 렌더링한다', () => {
    render(<InfoText>안내 메시지</InfoText>);
    expect(screen.getByText('안내 메시지')).toBeInTheDocument();
  });

  it('hasError=true 일 때 에러 색상으로 렌더링된다', () => {
    render(<InfoText hasError>에러 메시지</InfoText>);
    const container = screen.getByText('에러 메시지').closest('div');
    expect(container).toHaveStyle({ color: '#ED1E1E' });
  });

  it('success=true 일 때 성공 색상으로 렌더링된다', () => {
    render(<InfoText success>성공 메시지</InfoText>);
    const container = screen.getByText('성공 메시지').closest('div');
    expect(container).toHaveStyle({ color: '#5DB21B' });
  });

  it('기본 상태는 중립 색상으로 렌더링된다', () => {
    render(<InfoText>중립 메시지</InfoText>);
    const container = screen.getByText('중립 메시지').closest('div');
    expect(container).toHaveStyle({ color: '#ABABAB' });
  });

  it('접근성 위반이 없어야 한다', async () => {
    const { container } = render(<InfoText>안내 메시지</InfoText>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
