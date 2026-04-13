'use client';
import { useEffect, useState } from 'react';
import ButtonContainer from '@/shared/ui/layout/ButtonContainer';
import Button from '@/shared/ui/button/Button';
import Spacing from '@/shared/ui/layout/Spacing';
import AddImage from './AddImage';
import TextareaField from '@/shared/ui/input/TextareaField';
import InputField from '@/shared/ui/input/InputField';
import Select from '@/shared/ui/select/Select';
import useCommunity from '@/hooks/useCommunity';
import { EditFinalImages, useEditStore, useUploadStore } from '@/store/client/imageStore';
import { editStore } from '@/store/client/editStore';
import useViewTransition from '@/shared/hooks/useViewTransition';
import { useParams } from 'next/navigation';

const LIST = ['잡담', '여행팁', '후기'];

interface CommunityFormProps {
  isEdit?: boolean;
}

const CommunityForm = ({ isEdit = false }: CommunityFormProps) => {
  const params = useParams();
  const communityNumber = params?.communityNumber as string;
  const navigateWithTransition = useViewTransition();
  const { editToastShow, setEditToastShow } = editStore();

  const { community, post, update, postMutation, updateMutation, postImageMutation, updateImageMutation } =
    useCommunity(Number(communityNumber));
  const { saveFinalImages, images, finalImages, reset } = useUploadStore();
  const {
    images: editImages,
    finalImages: editFinalImages,
    saveFinalImages: saveEditImages,
    reset: editReset,
  } = useEditStore();
  const { images: detailImages } = useCommunity(Number(communityNumber));

  const [value, setValue] = useState<string>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (community.data && isEdit) {
      setValue(community.data.categoryName);
      setTitle(community.data.title);
      setContent(community.data.content);
    }
  }, [isEdit, JSON.stringify(community.data)]);

  const submitCommunity = () => {
    if (!value || title === '' || content === '') return;
    if (isEdit) {
      if (!communityNumber) return;
      const detailImageList = detailImages.data ?? [];
      const initialImages = [...detailImageList];
      const currentImages = [...editImages];
      const activeImages = currentImages.filter((img) => img.status !== 'd');
      const deletedImages = [
        ...currentImages.filter((img) => img.status === 'd'),
        ...initialImages.filter((initialImg) => !currentImages.some((current) => current.imageNumber === initialImg.imageNumber)),
      ];
      const activeResult = activeImages.reduce(
        (acc: EditFinalImages, currentImage) => {
          const initialIndex = initialImages.findIndex((img) => img.imageNumber === currentImage.imageNumber);
          if (initialIndex === -1) { acc.statuses.push('i'); acc.urls.push(currentImage.url); return acc; }
          const currentOrderIndex = activeImages.findIndex((img) => img.imageNumber === currentImage.imageNumber);
          const initialOrderIndex = initialImages.findIndex((img) => img.imageNumber === currentImage.imageNumber);
          acc.statuses.push(currentOrderIndex !== initialOrderIndex ? 'y' : 'n');
          acc.urls.push(currentImage.url);
          return acc;
        },
        { statuses: [], urls: [] }
      );
      saveEditImages({
        statuses: [...activeResult.statuses, ...deletedImages.map(() => 'd')] as ('n' | 'y' | 'd' | 'i')[],
        urls: [...activeResult.urls, ...deletedImages.map((img) => img.url)],
      });
      update({ categoryName: value, communityNumber: Number(communityNumber), title, content });
    } else {
      saveFinalImages();
      post({ categoryName: value, title, content });
    }
  };

  useEffect(() => {
    if (updateMutation.isSuccess && updateMutation.data) {
      if (editFinalImages.urls.length > 0) {
        updateImageMutation.mutateAsync({ editImages: editFinalImages, communityNumber: updateMutation.data?.postNumber });
      } else {
        setEditToastShow(true);
        document.documentElement.style.viewTransitionName = 'forward';
        navigateWithTransition(`/community/detail/${updateMutation.data?.postNumber}`);
      }
    }
  }, [updateMutation.isSuccess && updateMutation.data, JSON.stringify(editFinalImages)]);

  useEffect(() => {
    if (updateImageMutation.isSuccess) {
      editReset();
      setEditToastShow(true);
      document.documentElement.style.viewTransitionName = 'forward';
      navigateWithTransition(`/community/detail/${updateMutation.data?.postNumber}`);
    }
  }, [updateImageMutation.isSuccess, updateMutation.data?.postNumber]);

  useEffect(() => {
    if (postImageMutation.isSuccess) {
      reset();
      document.documentElement.style.viewTransitionName = 'forward';
      navigateWithTransition(`/community/detail/${postMutation.data?.postNumber}`);
    }
  }, [postImageMutation.isSuccess, postMutation.data?.postNumber]);

  useEffect(() => {
    if (postMutation.isSuccess && postMutation.data) {
      if (finalImages.tempUrls.length > 0) {
        postImageMutation.mutateAsync({ uploadImages: finalImages, communityNumber: postMutation.data?.postNumber });
      } else {
        document.documentElement.style.viewTransitionName = 'forward';
        navigateWithTransition(`/community/detail/${postMutation.data?.postNumber}`);
      }
    }
  }, [postMutation.isSuccess && postMutation.data, JSON.stringify(finalImages)]);

  const handleRemoveValue = () => setTitle('');

  const isDisabled = title === '' || content === '' || !value;

  return (
    <>
      <div className="px-6">
        <Spacing size={8} />
        <Select initOpen={true} noneValue="말머리" list={LIST} value={value} setValue={(v) => setValue(v)} />
        <Spacing size="3.8svh" />
        <InputField
          value={title}
          placeholder="제목을 입력해주세요. (최대 20자)"
          isRemove={true}
          handleRemoveValue={handleRemoveValue}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Spacing size="3.8svh" />
        <TextareaField
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력해주세요. (최대 2,000자)"
        />
        {/* <Spacing size="3.8svh" /> */}
        {/* <AddImage isEdit={isEdit} /> */}
        <ButtonContainer>
          <Button
            onClick={submitCommunity}
            disabled={isDisabled}
            addStyle={
              isDisabled
                ? { backgroundColor: 'rgba(220, 220, 220, 1)', color: 'rgba(132, 132, 132, 1)', boxShadow: '-2px 4px 5px 0px rgba(170, 170, 170, 0.1)' }
                : undefined
            }
            text="완료"
          />
        </ButtonContainer>
      </div>
    </>
  );
};

export default CommunityForm;
