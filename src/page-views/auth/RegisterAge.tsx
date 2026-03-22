"use client";
import Button from "@/components/designSystem/Buttons/Button";
import { userStore } from "@/store/client/userStore";
import { createContext, useContext, useEffect, useState } from "react";
import SearchFilterTag from "@/components/designSystem/tag/SearchFilterTag";
import ButtonContainer from "@/components/ButtonContainer";
import useViewTransition from "@/hooks/useViewTransition";
import { useRouter } from "next/navigation";
import RegisterSecondStepIcon from "@/components/icons/step/register/RegisterSecondStepIcon";

type RegisterAgeContextType = {
  genderCheck: boolean;
  setGenderCheck: (value: boolean) => void;
};

export const RegisterAgeContext = createContext<
  RegisterAgeContextType | undefined
>(undefined);

export const useRegisterAge = () => {
  const context = useContext(RegisterAgeContext);
  if (context === undefined) {
    throw new Error("useRegisterAge must be used within a RegisterAgeProvider");
  }
  return context;
};

const AGE_LIST = ["10대", "20대", "30대", "40대", "50대 이상"];

const RegisterAge = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const {
    agegroup,
    addAgegroup,
    email,
    name,
    resetForm,
    resetName,
    socialLogin,
    setSocialLogin,
  } = userStore();
  const [genderCheck, setGenderCheck] = useState(false);
  const isEmailRegister = socialLogin === null;
  const isSocialLoginKakao = socialLogin === "kakao";
  const isSocialLoginNaver = socialLogin === "naver";
  const navigateWithTransition = useViewTransition();
  const nextStepClickHandler = () => {
    if (agegroup) {
      if (location.pathname == "/registerAge") {
        router.push("/registerAge/registerGender");
      } else if (
        genderCheck &&
        location.pathname == "/registerAge/registerGender"
      ) {
        document.documentElement.style.viewTransitionName = "forward";
        navigateWithTransition("/registerTripStyle");
      }
    }
  };

  useEffect(() => {
    if (isSocialLoginNaver) {
      resetName();
      resetForm();
      setSocialLogin(null, null);
      router.replace("/login");
    } else if (isSocialLoginKakao || isEmailRegister) {
      if (!email && !name) {
        resetName();
        resetForm();
        router.push("/registerEmail");
      }
    }
  }, [email, name]);

  const handleClickage = (age: string) => {
    addAgegroup(age);
  };

  return (
    <RegisterAgeContext.Provider value={{ genderCheck, setGenderCheck }}>
      <div className="px-6 min-h-[calc(100svh-68px-30px)] pb-[89px]">
        <div className="mt-[30px]">
          <RegisterSecondStepIcon />
        </div>

        <div className="mt-[40px]">
          <div className="text-2xl font-semibold px-[6px] pb-4">
            나이가 어떻게 되세요?
          </div>
          <div className="flex-wrap flex gap-4 w-[77%]">
            {AGE_LIST.map((age, idx) => (
              <SearchFilterTag
                addStyle={{
                  backgroundColor:
                    agegroup === age
                      ? "rgba(227, 239, 217, 1)"
                      : " rgba(240, 240, 240, 1)",
                  color:
                    agegroup === age
                      ? `var(--color-keycolor)`
                      : "rgba(52, 52, 52, 1)",
                  borderRadius: "30px",
                  fontSize: "16",
                  lineHeight: "22px",
                  padding: "10px 20px",
                  border:
                    agegroup === age
                      ? `1px solid var(--color-keycolor)`
                      : "none",
                }}
                style={{ cursor: "pointer" }}
                idx={idx}
                onClick={() => handleClickage(age)}
                text={age}
                key={age}
              />
            ))}
          </div>
        </div>
        {children}
        <ButtonContainer>
          <Button
            text="다음"
            onClick={nextStepClickHandler}
            disabled={!Boolean(agegroup)}
            addStyle={
              true
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
    </RegisterAgeContext.Provider>
  );
};

export default RegisterAge;
