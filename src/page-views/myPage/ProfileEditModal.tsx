"use client";
import BottomModal from "@/components/BottomModal";
import Button from "@/components/designSystem/Buttons/Button";
import ButtonContainer from "@/components/ButtonContainer";
import CameraIconForUploadMypage from "@/components/icons/CameraIconForUploadMypage";
import PictureIcon from "@/components/icons/PictureIcon";
import ProfileRemoveIcon from "@/components/icons/ProfileRemoveIcon";
import Spacing from "@/components/Spacing";
import useMyPage from "@/hooks/myPage/useMyPage";
import { authStore } from "@/store/client/authStore";
import { myPageStore } from "@/store/client/myPageStore";
import { isDefaultProfile } from "@/utils/profileUrl";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ModalProps {
  showModal: boolean;

  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FileData {
  lastModified: number;
  name: string;
  size: number;
  type: string;
}

export default function ProfileEditModal({ showModal, setShowModal }: ModalProps) {
  const {
    updateDefaultProfileImgMutation,
    isUpdateDefaultProfileImgSuccess,
    deleteTempProfileImgMutation,
    deleteMyProfileImgMutation,
    isDeleteSuccessProfileImg,
    tempProfileImageMutation,
    updateRealProfileImgMutation,

    firstProfileImageMutation, // 삭제 후 등록 .
    isFirstProfileImagePostSuccess,
  } = useMyPage();
  const router = useRouter();
  const { profileUrl, addIsProfileImgUpdated, addProfileUrl } = myPageStore();

  const { accessToken } = authStore();

  const [clickedSave, setClickedSave] = useState(false);

  // 일단 업로드를 하면, 저장할 용도 (추후에 미리보기 api 추가 되면 수정 예정.)
  const [fileImg, setFileImg] = useState<FormData>(new FormData());

  const [showImage, setShowImage] = useState(profileUrl);
  const [showImageCamera, setShowImageCamera] = useState("");

  const ret = isDefaultProfile(profileUrl);
  const [active, setActive] = useState(
    ret.length === 0 ? "custom" : ret[0][ret[0].length - 5] === "e" ? 1 : +ret[0][ret[0].length - 5]
  );

  const isCustomImg = isDefaultProfile(showImage).length === 0; // 커스텀 이미지 라면 true

  const isCameraCustomImg = isDefaultProfile(showImageCamera).length === 0; // 커스텀 이미지 라면 true
  // 갤러리 이미지를 띄어야하는 경우. 여부를 표시.
  const [isCustomImgUpload, setIsCustomImgUpload] = useState(ret.length === 0 ? true : false);

  const [changed, setChanged] = useState(false);
  const handleCloseModal = () => {
    setShowModal(false);
  };
  const profileSaveHandler = () => {
    // 프로필 저장. 실제 update api 요청.
    if (active !== "custom" && active !== "camera") {
      updateDefaultProfileImgMutation(active as number)
        .then((res) => {
          addIsProfileImgUpdated(true);
        })
        .catch((e) => {
          // 디폴트 프로필 정식 등록 요청 에러
        });
    } else {
      // 갤러리 이미지로 선택.
      if (active === "custom") {
        updateRealProfileImgMutation(showImage)
          .then((res: any) => {
            setShowImage(res.url);

            setChanged(true);
            addIsProfileImgUpdated(true);
          })
          .catch((e) => {
            // 커스텀 프로필 정식 등록 요청 에러
          });
      } // 카메라 이미지로 선택
      else {
        updateRealProfileImgMutation(showImageCamera)
          .then((res: any) => {
            setShowImage(res.url);
            setChanged(true);
            addIsProfileImgUpdated(true);
          })
          .catch((e) => {
            // 카메라 프로필 정식 등록 요청 에러
          });
      }
    }

    setShowModal(false);
    setClickedSave(true);
  };
  // 임시 등록 요청(카메라)
  const addImageFileCamera = (event: ChangeEvent<HTMLInputElement>) => {
    setActive("camera");
    if (event.target.files !== null) {
      // post 요청 보내기.
      const formData = new FormData(); // 폼데이터 생성
      formData.append("file", event.target.files[0]);
      // post 요청 후 받은 url로 보여주기

      //이 아래 부분은 미리보기 추가 되면 지울고 미리보기 api로 교체 예정.
      tempProfileImageMutation(formData)
        .then((res: any) => {
          setShowImageCamera(res.tempUrl);

          setChanged(true);
          setActive("camera");
          setIsCustomImgUpload(true);
        })
        .catch((e) => {
          // 카메라 프로필 임시 등록 요청 에러
        });
    }
  };
  // 임시 등록 요청. (갤러리)
  const addImageFileGalary = (event: ChangeEvent<HTMLInputElement>) => {
    setActive("custom");
    if (event.target.files !== null) {
      // post 요청 보내기.
      const formData = new FormData(); // 폼데이터 생성
      formData.append("file", event.target.files[0]);
      // post 요청 후 받은 url로 보여주기

      tempProfileImageMutation(formData)
        .then((res: any) => {
          setShowImage(res.tempUrl);

          setChanged(true);
          setActive("custom");
          setIsCustomImgUpload(true);
        })
        .catch((e) => {
          // 갤러리 프로필 임시 등록 요청 에러
        });
    }
  };

  const handleDefaultProfileUpload = async (defaultNumber: number) => {
    try {
      // axios로 서버에 전송
      updateDefaultProfileImgMutation(defaultNumber);
      addIsProfileImgUpdated(true);
    } catch (error) {
      // 기본 프로필 업로드 오류
    }
  };

  // 임시 등록된 카메라 프로필 삭제
  const deleteProfileCameraImgHandler = async (event: React.MouseEvent) => {
    event.stopPropagation();

    deleteTempProfileImgMutation(showImageCamera)
      .then(() => {
        setActive(1);
        setChanged(true);
        setShowImageCamera("");
      })
      .catch((e) => {
        // 카메라 임시 등록 이미지 삭제 실패
      });
  };
  // 프로필 삭제.
  const deleteProfileImgHandler = async (event: React.MouseEvent) => {
    event.stopPropagation();

    setShowImage("");
    if (showImage === profileUrl) {
      // 현재 보여지는 이미지가 지금의 프로필 사진과 같은 거라면 프로필 삭제.
      deleteMyProfileImgMutation()
        .then(() => {
          firstProfileImageMutation(accessToken!).then(() => {
            setActive(1);
            setChanged(true);
            // addProfileUrl('')
          });
        })
        .catch(() => {
          // 실제 프로필 삭제 실패 & 기본 이미지 등록
        });
    } else {
      // 아니라면. 임시 저장된 것 삭제.
      deleteTempProfileImgMutation(showImage)
        .then(() => {
          setActive(1);
          setChanged(true);
        })
        .catch(() => {
          // 갤러리 임시 등록 이미지 삭제 실패
        });
    }
  };
  useEffect(() => {
    return () => {
      if (clickedSave === false && (showImage !== "" || showImageCamera !== "")) {
        const deleteTempImage = async () => {
          if (showImage !== "" && isCustomImg && showImage !== profileUrl) {
            try {
              await deleteTempProfileImgMutation(showImage);
            } catch (e) {
              // 갤러리 임시 등록 이미지 삭제 실패
            }
          } else if (showImageCamera !== "" && isCameraCustomImg && showImage !== profileUrl) {
            try {
              await deleteTempProfileImgMutation(showImageCamera);
            } catch (e) {
              // 카메라 임시 등록 이미지 삭제 실패
            }
          }
        };

        deleteTempImage();
      }
    };
  }, []); //컴포넌트 언마운트 시에만 실행

  // 갤러리 부분에 사진을 보여줘야하는 경우.
  const isShowingGallery = showImage !== "" && isCustomImg && (active === "custom" || isCustomImgUpload); // 이미지가 존재하고, 커스텀이며, 클릭되어있거나 or 클릭안해도 업로드는 해둔상태.
  if (typeof window === "undefined") {
    return null;
  }
  return (
    <BottomModal
      initialHeight={window?.innerHeight <= 700 ? 60 : 50} // height 비율이 짧아 진다면 58%로 맞추기.
      closeModal={handleCloseModal}
    >
      <div style={{ marginTop: "6px" }}>
        <div style={{ padding: "0px 24px" }}>
          <div className="text-lg font-semibold leading-[25.2px] text-left text-[var(--color-text-base)] h-[25px] px-[6px] gap-2">프로필 이미지를 선택해 주세요</div>
          <Spacing size={32} />
          <div className="flex gap-4 justify-center">
            <div
              onClick={
                (e: any) => {
                  e.stopPropagation();
                  if (showImage !== "" && isCustomImg) setActive("custom");
                }
                // 이미지가 존재하고, 현재 보여진 이미지가 커스텀일 때만 active 보더 표시.
              }
              className="relative flex justify-center items-center cursor-pointer max-h-[72px] aspect-square w-full h-full bg-[var(--color-muted4)] rounded-full"
              style={{ border: active === "custom" ? "2px solid var(--color-keycolor)" : "none" }}
            >
              {(showImage === "" || !isCustomImg) && (
                <>
                  <label className="flex justify-center items-center cursor-pointer max-h-[72px] aspect-square w-full h-full bg-[var(--color-muted4)] rounded-full" onClick={(e: any) => e.stopPropagation()} htmlFor="imageInput"></label>
                  <input
                    onChange={(event) => addImageFileGalary(event)}
                    type="file"
                    id="imageInput"
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </>
              )}
              {/* 직접 올린 이미지만 show 함. */}
              {isShowingGallery && (
                <img
                  src={showImage}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    position: "absolute",
                  }}
                />
              )}
              <div style={{ position: "absolute", pointerEvents: "none" }}>
                {isShowingGallery === false && <PictureIcon />}
              </div>

              {active === "custom" && (
                <div onClick={deleteProfileImgHandler} style={{ position: "absolute", right: "0px", top: "0px" }}>
                  <ProfileRemoveIcon />
                </div>
              )}
            </div>
            <div
              className="relative rounded-full w-full h-full"
              style={{ border: active === 1 ? "2px solid var(--color-keycolor)" : "none" }}
            >
              <img
                onClick={() => {
                  setActive(1);
                  setChanged(true);
                }}
                src="/images/defaultProfile.png"
                alt=""
                className="block object-cover cursor-pointer w-full h-full"
              />
            </div>
            <div
              className="relative rounded-full w-full h-full"
              style={{ border: active === 3 ? "2px solid var(--color-keycolor)" : "none" }}
            >
              <img
                onClick={() => {
                  setActive(3);
                  setChanged(true);
                }}
                src="/images/defaultProfile3.png"
                alt=""
                className="block object-cover cursor-pointer w-full h-full"
              />
            </div>
            <div
              className="relative rounded-full w-full h-full"
              style={{ border: active === 5 ? "2px solid var(--color-keycolor)" : "none" }}
            >
              <img
                onClick={() => {
                  setActive(5);
                  setChanged(true);
                }}
                src="/images/defaultProfile5.png"
                alt=""
                className="block object-cover cursor-pointer w-full h-full"
              />
            </div>
          </div>
          <div className="flex gap-4 justify-center" style={{ marginTop: "16px" }}>
            <div
              onClick={(e: any) => {
                e.stopPropagation();
                // 이미지가 존재하고, 현재 보여진 이미지가 커스텀일 때만 active 보더 표시.
                if (showImageCamera !== "" && isCustomImg) setActive("camera");
              }}
              className="relative flex justify-center items-center cursor-pointer max-h-[72px] aspect-square w-full h-full bg-[var(--color-muted4)] rounded-full"
              style={{ border: active === "camera" ? "2px solid var(--color-keycolor)" : "none" }}
            >
              {(showImageCamera === "" || !isCustomImg) && (
                <>
                  <label className="flex justify-center items-center cursor-pointer max-h-[72px] aspect-square w-full h-full bg-[var(--color-muted4)] rounded-full" onClick={(e: any) => e.stopPropagation()} htmlFor="cameraInput"></label>
                  <input
                    onChange={(event) => addImageFileCamera(event)}
                    type="file"
                    id="cameraInput"
                    capture="environment"
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </>
              )}
              {/* 커스텀 이미지만 show 함. */}

              {showImageCamera !== "" && (
                <img
                  src={showImageCamera}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    position: "absolute",
                  }}
                />
              )}
              <div style={{ position: "absolute", pointerEvents: "none" }}>
                {showImageCamera === "" && <CameraIconForUploadMypage />}
              </div>

              {active === "camera" && (
                <div onClick={deleteProfileCameraImgHandler} style={{ position: "absolute", right: "0px", top: "0px" }}>
                  <ProfileRemoveIcon />
                </div>
              )}
            </div>
            <div
              className="relative rounded-full w-full h-full"
              style={{ border: active === 2 ? "2px solid var(--color-keycolor)" : "none" }}
            >
              <img
                onClick={() => {
                  setActive(2);
                  setChanged(true);
                }}
                src="/images/defaultProfile2.png"
                alt=""
                className="block object-cover cursor-pointer w-full h-full"
              />
            </div>
            <div
              className="relative rounded-full w-full h-full"
              style={{ border: active === 4 ? "2px solid var(--color-keycolor)" : "none" }}
            >
              <img
                onClick={() => {
                  setActive(4);
                  setChanged(true);
                }}
                src="/images/defaultProfile4.png"
                alt=""
                className="block object-cover cursor-pointer w-full h-full"
              />
            </div>
            <div
              className="relative rounded-full w-full h-full"
              style={{ border: active === 6 ? "2px solid var(--color-keycolor)" : "none" }}
            >
              <img
                onClick={() => {
                  setActive(6);
                  setChanged(true);
                }}
                src="/images/defaultProfile6.png"
                alt=""
                className="block object-cover cursor-pointer w-full h-full"
              />
            </div>
          </div>
          <div style={{ marginTop: "16px" }}></div>
        </div>
      </div>
      <ButtonContainer>
        <Button
          disabled={!changed}
          text="저장"
          onClick={profileSaveHandler}
          addStyle={{
            backgroundColor: "rgba(62, 141, 0, 1)",
            color: "rgba(240, 240, 240, 1)",
            boxShadow: "rgba(170, 170, 170, 0.1)",
          }}
        />
      </ButtonContainer>
    </BottomModal>
  );
}
