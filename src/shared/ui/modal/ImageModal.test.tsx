import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImageModal from './ImageModal';

describe('ImageModal', () => {
  const baseProps = {
    setModalOpen: vi.fn(),
    image: 'https://example.com/photo.jpg',
    count: 1,
    allCount: 5,
  };

  it('이미지를 렌더링한다', () => {
    render(<ImageModal {...baseProps} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('사진 카운트를 렌더링한다', () => {
    render(<ImageModal {...baseProps} />);
    expect(screen.getByText('1/5')).toBeInTheDocument();
  });

  it('컨테이너 클릭 시 setModalOpen(false)를 호출한다', () => {
    const setModalOpen = vi.fn();
    const { container } = render(<ImageModal {...baseProps} setModalOpen={setModalOpen} />);
    fireEvent.click(container.firstChild as Element);
    expect(setModalOpen).toHaveBeenCalledWith(false);
  });
});
