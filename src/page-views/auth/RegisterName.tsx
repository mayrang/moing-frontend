"use client";
import Button from "@/components/designSystem/Buttons/Button";
import { userStore } from "@/store/client/userStore";
import { useEffect, useState } from "react";

import { z } from "zod";
import Spacing from "@/components/Spacing";
import ButtonContainer from "@/components/ButtonContainer";
import useViewTransition from "@/hooks/useViewTransition";
import { usePathname, useRouter } from "next/navigation";
import ValidationInputField from "@/components/designSystem/input/ValidationInputField";
import RegisterFirstStepIcon from "@/components/icons/step/register/RegisterFirstStepIcon";
// 한글만 허용하고 최대 10자로 제한.
const koreanOnly = z
  .string()
  .regex(/^[ㄱ-ㅎ|가-힣]+$/, { message: "한글만 입력 가능합니다." })
  .max(10, { message: "최대 10자까지 입력 가능합니다." });

const RegisterName = () => {
  const pathname = usePathname();
  const router = useRouter();

  const { name, addName, email, password, resetName, socialLogin, resetForm, setSocialLogin } = userStore();
  const [userName, setUserName] = useState(name);

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
  const handleRemoveValue = () => setUserName("");
  const nextStepClickHandler = () => {
    if (userName.length > 0) {
      document.documentElement.style.viewTransitionName = "forward";
      navigateWithTransition("/registerAge");
    }
  };

  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    if (koreanOnly.safeParse(e.target.value).success) {
      addName(e.target.value);
      setNameValidError(false);
    } else {
      setNameValidError(true);
    }
  };
  const [nameValidError, setNameValidError] = useState(false);
  return (
    <div className="px-6 min-h-[calc(100svh-68px-30px)] mt-[30px]">
      <div className="mt-[30px]">
        <RegisterFirstStepIcon />
      </div>
      <div className="mt-[40px] w-[343px] h-[68px] px-[6px] text-2xl font-semibold leading-[33.6px] tracking-[-0.025em] text-left">
        환영합니다! <br />
        이름을 설정해주세요.
      </div>
      <div style={{ marginTop: "14px" }}>
        <ValidationInputField
          type="text"
          name={"userName"}
          shake={nameValidError && userName.length > 0}
          success={userName.length > 0 && !nameValidError}
          hasError={nameValidError && userName.length > 0}
          placeholder="이름 입력(최대 10자)"
          value={userName}
          onChange={(e) => inputChangeHandler(e)}
          handleRemoveValue={handleRemoveValue}
          message="최대 10자의 한글만 입력할 수 있습니다.(띄어쓰기 불가)"
        />
      </div>

      <ButtonContainer>
        <Button
          text="다음"
          onClick={nextStepClickHandler}
          disabled={!(userName.length > 0 && !nameValidError)}
          addStyle={
            pathname == "/registerName"
              ? userName.length > 0 && !nameValidError
                ? {
                    backgroundColor: "rgba(62, 141, 0, 1)",
                    color: "rgba(240, 240, 240, 1)",
                    boxShadow: "rgba(170, 170, 170, 0.1)",
                  }
                : {
                    backgroundColor: "rgba(220, 220, 220, 1)",
                    color: "rgba(132, 132, 132, 1)",
                  }
              : userName.length > 0 && !nameValidError
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
    </div>
  );
};

export default RegisterName;
