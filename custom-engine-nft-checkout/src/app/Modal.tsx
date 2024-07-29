import React from 'react';
import ReactModal from 'react-modal';
import { StaticImageData } from 'next/image';

interface CustomModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  videoSrc: string | StaticImageData;
  images: string[];
}

const CustomModal: React.FC<CustomModalProps> = ({ isOpen, onRequestClose, videoSrc, images }) => {
  const videoSrcString = typeof videoSrc === 'string' ? videoSrc : videoSrc.src;

  return (
    <ReactModal isOpen={isOpen} onRequestClose={onRequestClose} className="custom-modal">
      <button onClick={onRequestClose} className="close-button">Close</button>
      <div className="modal-content">
        <video src={videoSrcString} controls className="modal-video"></video>
        <div className="modal-images">
          {images.map((imgSrc, index) => (
            <img key={index} src={imgSrc} alt={`NFT ${index}`} className="modal-image" />
          ))}
        </div>
      </div>
    </ReactModal>
  );
};

export default CustomModal;
