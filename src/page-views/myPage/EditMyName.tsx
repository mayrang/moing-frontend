"use client";
import Button from "@/components/designSystem/Buttons/Button";
import ButtonContainer from "@/components/ButtonContainer";
import useMyPage from "@/hooks/myPage/useMyPage";
import { myPageStore } from "@/store/client/myPageStore";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ValidationInputField from "@/components/designSystem/input/ValidationInputField";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/shared/lib/zodResolver";
import { sanitizeFormData } from "@/shared/lib/sanitize";
import { nameFormSchema, NameFormData } from "@/utils/schema";
import { useNfcField } from "@/shared/hooks/useNfcField";

export default function EditMyName() {
  const router = useRouter();
  const { name, addName, addIsNameUpdated } = myPageStore();
  const { updateMyPageMutation, isUpdatedSuccess } = useMyPage();

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameFormSchema),
    mode: 'onChange',
    defaultValues: { name: name || '' },
  });

  const { makeNfcOnChange } = useNfcField<NameFormData>(trigger);
  const currentName = watch('name');

  useEffect(() => {
    if (isUpdatedSuccess) {
      addIsNameUpdated(true);
      router.back();
    }
  }, [isUpdatedSuccess]);

  const onSubmit = (data: NameFormData) => {
    const sanitized = sanitizeFormData(data);
    addName(sanitized.name);
    updateMyPageMutation();
  };

  const isUnchanged = currentName === name;

  return (
    <form className="px-6 mt-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="text-base font-semibold leading-4 tracking-[-0.025em] text-left text-[var(--color-text-base)]">
        새로운 이름을 입력해주세요
      </div>
      <div style={{ marginTop: "14px" }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <ValidationInputField
              type="text"
              name="newUserName"
              shake={!!errors.name && (field.value?.length ?? 0) > 0}
              success={(field.value?.length ?? 0) > 0 && !errors.name}
              hasError={!!errors.name && (field.value?.length ?? 0) > 0}
              placeholder="이름 입력(최대 10자)"
              value={field.value}
              onChange={makeNfcOnChange('name', field.onChange)}
              handleRemoveValue={() => setValue('name', '', { shouldValidate: true })}
              message={errors.name?.message ?? " 최대 10자의 한글만 입력할 수 있습니다.(띄어쓰기 불가)"}
            />
          )}
        />
      </div>

      <ButtonContainer>
        <Button
          text="변경 완료"
          type="submit"
          disabled={!isValid || isUnchanged}
          addStyle={
            isValid && !isUnchanged
              ? {
                  backgroundColor: "rgba(62, 141, 0, 1)",
                  color: "rgba(240, 240, 240, 1)",
                  boxShadow: "rgba(170, 170, 170, 0.1)",
                }
              : {
                  backgroundColor: "rgba(220, 220, 220, 1)",
                  color: "rgba(132, 132, 132, 1)",
                }
          }
        />
      </ButtonContainer>
    </form>
  );
}
