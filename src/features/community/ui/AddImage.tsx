'use client';
import React, { useEffect, useRef } from 'react';
import CameraIcon from '@/components/icons/CameraIcon';
import { useEditStore, useUploadStore } from '@/store/client/imageStore';
import useCommunity from '@/hooks/useCommunity';
import { uploadImage } from '@/api/community';
import ImageRemoveIcon from '@/components/icons/ImageRemoveIcon';
import { authStore } from '@/store/client/authStore';
import { useParams } from 'next/navigation';

interface AddImageProps {
  isEdit: boolean;
}

const AddImage = ({ isEdit }: AddImageProps) => {
  const params = useParams();
  const communityNumber = params?.communityNumber as string;
  const imageRef = useRef<HTMLInputElement>(null);
  const { images, addImage, removeImage } = useUploadStore();
  const { images: editImages, initializeImages, updateImageStatus, updateImage } = useEditStore();
  const { images: detailImages } = useCommunity(Number(communityNumber));
  const { accessToken } = authStore();

  const onUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    if (!accessToken) return;
    uploadImage(e.target.files[0], accessToken).then((newImage) => {
      if (isEdit) updateImage(newImage as Parameters<typeof updateImage>[0]);
      else addImage(newImage as Parameters<typeof addImage>[0]);
    });
  };

  const onUploadImageButtonClick = (e: React.MouseEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!imageRef.current) return;
    imageRef.current.click();
  };

  const onRemoveImage = (imageNumber: number) => {
    if (isEdit) updateImageStatus(imageNumber, 'd');
    else removeImage(imageNumber);
  };

  useEffect(() => {
    if (isEdit && detailImages.data) {
      initializeImages(detailImages.data);
    }
  }, [isEdit, initializeImages, detailImages.data]);

  const canUploadImage = isEdit
    ? editImages.filter((img) => img.status !== 'd').length < 3
    : images.filter((img) => img.isSelected).length < 3;

  return (
    <div className="flex items-center gap-[7px]">
      <input
        ref={imageRef}
        onChange={onUploadImage}
        onClick={onUploadImageButtonClick}
        type="file"
        id="imageInput"
        accept="image/*"
        className="hidden"
      />
      {canUploadImage && (
        <label
          htmlFor="imageInput"
          className="cursor-pointer flex items-center justify-center w-20 h-20 border border-[var(--color-muted3)] rounded-[15px] flex-col gap-[5px] text-sm font-semibold leading-[16.71px] text-[var(--color-text-muted)]"
        >
          <CameraIcon />
          <div>
            {isEdit
              ? `${editImages.filter((img) => img.status !== 'd').length}/3`
              : `${images.filter((img) => img.isSelected).length}/3`}
          </div>
        </label>
      )}
      {(isEdit
        ? editImages.filter((img) => img.status !== 'd')
        : images.filter((img) => img.isSelected)
      ).map((image) => (
        <div
          key={image.imageNumber}
          className="w-20 h-20 rounded-[15px] relative bg-cover"
          style={{ backgroundImage: `url("${image.url}")` }}
        >
          <button
            type="button"
            className="block absolute top-[-4px] cursor-pointer w-4 h-4 right-[-4px]"
            onClick={() => onRemoveImage(image.imageNumber)}
            aria-label="이미지 삭제"
          >
            <ImageRemoveIcon />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AddImage;
