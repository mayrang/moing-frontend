'use client';
// 스토어 연결 어댑터: shared/ui/toast/ErrorToast (순수 컴포넌트)를 감싸
// FSD 원칙상 shared는 store를 알 수 없으므로, store 연결은 이 레이어에서 담당.
// ErrorCatcher 등 기존 사용처는 변경 없이 유지됨.
import ErrorToast from '@/shared/ui/toast/ErrorToast';
import { errorStore } from '@/store/client/errorStore';
import { errorToastUI } from '@/store/client/toastUI';

export default function ErrorToastAdapter() {
  const { errorToastShow, setErrorToastShow } = errorToastUI();
  const { error, setIsMutationError } = errorStore();

  return (
    <ErrorToast
      isShow={errorToastShow}
      message={error?.message}
      onHide={() => {
        setErrorToastShow(false);
        setIsMutationError(false);
      }}
    />
  );
}
