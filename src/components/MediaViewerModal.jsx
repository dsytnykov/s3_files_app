import React, { useEffect, useRef } from "react";

const MediaViewerModal = ({
  media,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" && hasNext && onNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && hasPrevious && onPrevious) {
        onPrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrevious, hasNext, hasPrevious]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  if (!media) return null;

  return (
    <div className="media-modal-overlay" onClick={handleBackdropClick}>
      <div
        className="media-modal-content"
        ref={modalRef}
        onClick={handleContentClick}
      >
        {/* Close button */}
        <button className="media-modal-close" onClick={onClose} title="Close">
          <i className="fas fa-times"></i>
        </button>

        {/* Navigation buttons */}
        {hasPrevious && onPrevious && (
          <button
            className="media-modal-nav-button media-modal-prev"
            onClick={onPrevious}
            title="Previous"
          >
            <svg
              width="24"
              height="40"
              viewBox="0 0 24 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 36L4 20L20 4"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {hasNext && onNext && (
          <button
            className="media-modal-nav-button media-modal-next"
            onClick={onNext}
            title="Next"
          >
            <svg
              width="24"
              height="40"
              viewBox="0 0 24 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 4L20 20L4 36"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Media content */}
        {media.type === "image" ? (
          <div className="media-modal-image-container">
            <img
              src={media.url}
              alt={media.name || "Image preview"}
              className="media-modal-image"
            />
            {media.name && (
              <div className="media-modal-title">{media.name}</div>
            )}
          </div>
        ) : media.type === "video" ? (
          <div className="media-modal-video-container">
            <video
              src={media.url}
              controls
              autoPlay
              className="media-modal-video"
            />
            {media.name && (
              <div className="media-modal-title">{media.name}</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default MediaViewerModal;
