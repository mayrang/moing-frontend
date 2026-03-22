"use client";
import { useEffect, useState } from "react";
import { userStore } from "@/store/client/userStore";
import { useRegisterAge } from "./RegisterAge";
import { useRouter } from "next/navigation";

const RegisterGender = () => {
  const { setGenderCheck } = useRegisterAge();
  const {
    sex,
    addSex,
    name,
    email,
    agegroup,
    resetAge,
    resetName,
    resetForm,
    socialLogin,
    setSocialLogin,
  } = userStore();
  const [maleClicked, setMaleClicked] = useState(sex == "M" ? true : false);
  const [femaleClicked, setFemaleClicked] = useState(sex == "F" ? true : false);
  const router = useRouter();
  const isSocialLoginKakao = socialLogin === "kakao";
  const isSocialLoginNaver = socialLogin === "naver";
  const isSocialLoginGoogle = socialLogin === "google";

  const clickedMale = () => {
    if (!maleClicked) {
      setMaleClicked(true);
      setFemaleClicked(false);
      setGenderCheck(true);
      addSex("M");
    }
  };
  const clickedFemale = () => {
    if (!femaleClicked) {
      setFemaleClicked(true);
      setMaleClicked(false);
      setGenderCheck(true);
      addSex("F");
    }
  };

  useEffect(() => {
    if (isSocialLoginGoogle) {
      if (!agegroup) {
        resetAge();
        setSocialLogin(null, null);
        resetName();
        router.replace("/login");
      }
    } else if (isSocialLoginKakao) {
      if (!email || !agegroup) {
        resetName();
        resetForm();
        resetAge();
        router.replace("/registerEmail");
      }
    } else if (isSocialLoginNaver) {
      resetName();
      resetForm();
      resetAge();
      setSocialLogin(null, null);
      router.replace("/login");
    } else {
      if (!email || !name || !agegroup) {
        resetName();
        resetForm();
        resetAge();
        router.replace("/registerEmail");
      }
    }
  }, [email, name, agegroup, socialLogin]);

  // 이전 화면으로 돌아왔을 때, 이미 체크 했다면, true값을 할당해주기.
  useEffect(() => {
    if (!maleClicked && !femaleClicked) setGenderCheck(false);
    else setGenderCheck(true);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div className="h-[249px] mt-[54px] animate-[fadeIn_0.5s]">
        <p className="text-2xl font-semibold text-left">성별을 선택해주세요.</p>
        <div className="mt-8 flex justify-center">
          <div className="mr-[54px] flex flex-col items-center font-medium cursor-pointer" onClick={clickedMale}>
            <img
              className="w-24 h-24"
              src={
                maleClicked
                  ? "/images/activeMale.png"
                  : "/images/defaultMale.png"
              }
              alt=""
            />
            <p
              className="mt-2 text-lg"
              style={
                maleClicked
                  ? { color: "black", fontWeight: 700 }
                  : { color: "rgba(171, 171, 171, 1)" }
              }
            >
              남자
            </p>
          </div>
          <div className="flex flex-col items-center font-medium cursor-pointer" onClick={clickedFemale}>
            <img
              className="w-24 h-24"
              src={
                femaleClicked
                  ? "/images/activeFemale.png"
                  : "/images/defaultFemale.png"
              }
              alt=""
            />
            <p
              className="mt-2 text-lg"
              style={
                femaleClicked
                  ? { color: "black", fontWeight: 700 }
                  : { color: "rgba(171, 171, 171, 1)" }
              }
            >
              여자
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterGender;
