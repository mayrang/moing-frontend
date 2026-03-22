'use client';
import useKeyboardResizeEffect from '@/shared/hooks/useKeyboardResizeEffect';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { commentStore } from '@/store/client/commentStore';
import useComment from '@/features/comment/hooks/useComment';
import ResultToast from '@/shared/ui/toast/ResultToast';
import { isGuestUser } from '@/utils/user';
import { usePathname, useRouter } from 'next/navigation';
import CommentInput from '@/shared/ui/input/CommentInput';
import { useBackPathStore } from '@/store/client/backPathStore';

interface CommentFormProps {
  paddingBottom?: number;
  paddingTop?: number;
  relatedType: 'travel' | 'community';
  relatedNumber: number;
}

const CommentForm = ({
  paddingBottom = 40,
  paddingTop = 16,
  relatedType,
  relatedNumber,
}: CommentFormProps) => {
  const { isEdit, edit, parentNumber, commentNumber, setReset, isReply } = commentStore();
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [isToastShow, setIsToastShow] = useState(false);
  const [value, setValue] = useState('');
  const { post, postMutation, updateMutation, update } = useComment(relatedType, relatedNumber);
  const pathname = usePathname();

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (inputRef.current) {
      inputRef.current.style.height = '32px';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 84)}px`;
    }
    setValue(e.target.value);
  };

  useKeyboardResizeEffect();

  useEffect(() => {
    if (inputRef?.current) {
      if (isEdit && edit !== '') {
        setValue(edit);
        inputRef.current.focus();
      }
      if (isReply) {
        inputRef.current.focus();
      }
    }
  }, [isEdit, isReply]);

  useEffect(() => {
    if (!focused) {
      if (value === '') {
        setReset();
      }
    }
  }, [focused, value]);

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === '') return;

    if (isEdit) {
      if (!commentNumber) return;
      update({ content: value, commentNumber });
      if (updateMutation.isSuccess) setIsToastShow(true);
    } else {
      post({ content: value, parentNumber });
    }
    setValue('');
    setReset();
  };

  const containerStyle = {
    paddingTop: `${Math.abs(paddingTop / 844) * 100}svh`,
    paddingBottom: `${Math.abs(paddingBottom / 844) * 100}svh`,
    backgroundColor: relatedType === 'community' ? '#f5f5f5' : 'white',
  };

  if (isGuestUser()) {
    return (
      <div
        className="flex items-center fixed bottom-0 left-0 w-svw min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 px-6"
        style={containerStyle}
        onClick={() => {
          localStorage.setItem('loginPath', pathname);
          router.push('/login');
        }}
      >
        <CommentInput setReset={setReset} placeholder="로그인 후 댓글을 달아보세요." readOnly />
      </div>
    );
  }

  return (
    <form
      className="flex items-center fixed bottom-0 left-0 w-svw min-[440px]:w-[390px] min-[440px]:left-1/2 min-[440px]:-translate-x-1/2 px-6"
      style={containerStyle}
      onSubmit={submitComment}
    >
      <CommentInput
        setReset={setReset}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        ref={inputRef}
        placeholder="댓글을 입력해주세요."
        onChange={handleInput}
        value={value}
      />
      <ResultToast
        bottom="80px"
        isShow={isToastShow}
        setIsShow={setIsToastShow}
        text="댓글이 수정되었어요."
      />
    </form>
  );
};

export default CommentForm;
