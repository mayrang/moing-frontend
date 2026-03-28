"use client";
import Button from "@/components/designSystem/Buttons/Button";
import { userStore } from "@/store/client/userStore";
import { useEffect } from "react";
import Spacing from "@/components/Spacing";
import ButtonContainer from "@/components/ButtonContainer";
import useViewTransition from "@/hooks/useViewTransition";
import { useRouter } from "next/navigation";
import ValidationInputField from "@/components/designSystem/input/ValidationInputField";
import RegisterFirstStepIcon from "@/components/icons/step/register/RegisterFirstStepIcon";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@/shared/lib/zodResolver";
import { sanitizeFormData } from "@/shared/lib/sanitize";
import { nameFormSchema, NameFormData } from "@/utils/schema";
import { useNfcField } from "@/shared/hooks/useNfcField";

const RegisterName = () => {
  const router = useRouter();
  const { name, addName, email, password, resetName, socialLogin, resetForm, setSocialLogin } = userStore();

  const isEmailRegister = socialLogin === null;

  useEffect(() => {
    if (!isEmailRegister) {
      resetName();
      resetForm();
      setSocialLogin(null, null);
      router.replace("/login");
    }
    if (!email || !password) {
      resetName();
      router.replace("/registerEmail");
    }
  }, [email, password, socialLogin]);

  const navigateWithTransition = useViewTransition();

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<NameFormData>({
    resolver: zodResolver(nameFormSchema),
    mode: 'onChange',
    defaultValues: { name: name || '' },
  });

  const { makeNfcOnChange } = useNfcField<NameFormData>(trigger);

  const onSubmit = (data: NameFormData) => {
    const sanitized = sanitizeFormData(data);
    addName(sanitized.name);
    document.documentElement.style.viewTransitionName = "forward";
    navigateWithTransition("/registerAge");
  };

  return (
    <div className="px-6 min-h-[calc(100svh-68px-30px)] mt-[30px]">
      <div className="mt-[30px]">
        <RegisterFirstStepIcon />
      </div>
      <div className="mt-[40px] w-[343px] h-[68px] px-[6px] text-2xl font-semibold leading-[33.6px] tracking-[-0.025em] text-left">
        환영합니다! <br />
        이름을 설정해주세요.
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginTop: "14px" }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <ValidationInputField
                type="text"
                name="userName"
                shake={!!errors.name && (field.value?.length ?? 0) > 0}
                success={(field.value?.length ?? 0) > 0 && !errors.name}
                hasError={!!errors.name && (field.value?.length ?? 0) > 0}
                placeholder="이름 입력(최대 10자)"
                value={field.value}
                onChange={makeNfcOnChange('name', field.onChange)}
                handleRemoveValue={() => setValue('name', '', { shouldValidate: true })}
                message={errors.name?.message ?? "최대 10자의 한글만 입력할 수 있습니다.(띄어쓰기 불가)"}
              />
            )}
          />
        </div>

        <ButtonContainer>
          <Button
            text="다음"
            type="submit"
            disabled={!isValid}
            addStyle={
              isValid
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
    </div>
  );
};

export default RegisterName;
