'use client';
import { useState } from 'react';
import ImageModal from '@/shared/ui/modal/ImageModal';
import { Image } from '@/model/community';

interface DetailImagesProps {
  images: Image[];
}

interface ImageInfo {
  image: string;
  count: number;
  allCount: number;
}

const DetailImages = ({ images }: DetailImagesProps) => {
  const [openModal, setOpenModal] = useState(false);
  const [imageInfo, setImageInfo] = useState<ImageInfo>();

  const onClickImage = (info: ImageInfo) => {
    setImageInfo(info);
    setOpenModal(true);
  };

  return (
    <>
      {openModal && imageInfo && (
        <ImageModal setModalOpen={setOpenModal} {...imageInfo} />
      )}
      <div
        className="w-full h-[191px] rounded-[15px] grid gap-[11px]"
        style={{ gridTemplateColumns: images.length > 1 ? '1fr 1fr' : '1fr' }}
      >
        {images.map((image, idx) => (
          <div
            key={idx}
            className="w-full h-full bg-cover rounded-[15px]"
            style={{
              backgroundImage: `url(${image.url})`,
              ...(images.length === 3 && idx === 0 ? { gridRow: '1 / span 2' } : {}),
            }}
            onClick={() => onClickImage({ image: image.url, allCount: images.length, count: idx + 1 })}
          />
        ))}
      </div>
    </>
  );
};

export default DetailImages;
