import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { isImage, getFileIcon, formatFileSize } from "../utils/fileUtils";
import { Spinner } from "./UI/Spinner";
import Modal from "./UI/Modal";

const FilePreview = ({ file, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getFilePreviewUrl } = useAppContext();

  useEffect(() => {
    loadPreview();
  }, [file]);

  const loadPreview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = await getFilePreviewUrl(file);
      setPreviewUrl(url);
    } catch (err) {
      setError("Failed to load preview");
      console.error("Preview error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (previewUrl) {
      const a = document.createElement("a");
      a.href = previewUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getContentType = () => {
    const extension = file.name.split(".").pop().toLowerCase();

    if (isImage(file.name)) {
      return "image";
    }

    const videoExtensions = ["mp4", "webm", "ogg", "mov"];
    if (videoExtensions.includes(extension)) {
      return "video";
    }

    const audioExtensions = ["mp3", "wav", "ogg"];
    if (audioExtensions.includes(extension)) {
      return "audio";
    }

    const pdfExtension = "pdf";
    if (extension === pdfExtension) {
      return "pdf";
    }

    const textExtensions = [
      "txt",
      "md",
      "json",
      "csv",
      "html",
      "xml",
      "css",
      "js",
    ];
    if (textExtensions.includes(extension)) {
      return "text";
    }

    return "unknown";
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="preview-loading">
          <Spinner size="large" />
          <p>Loading preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="preview-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button className="retry-button" onClick={loadPreview}>
            Retry
          </button>
        </div>
      );
    }

    const contentType = getContentType();

    switch (contentType) {
      case "image":
        return (
          <div className="image-preview">
            <img
              src={previewUrl}
              alt={file.name}
              onError={() => setError("Failed to load image")}
            />
          </div>
        );

      case "video":
        return (
          <div className="video-preview">
            <video controls width="100%">
              <source src={previewUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="audio-preview">
            <audio controls>
              <source src={previewUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case "pdf":
        return (
          <div className="pdf-preview">
            <iframe
              src={`${previewUrl}#view=FitH&toolbar=0&navpanes=0`}
              title={file.name}
              width="100%"
              height="500px"
            />
          </div>
        );

      case "text":
        return (
          <div className="text-preview">
            <p>
              Text preview is not available directly. Please download the file
              to view its contents.
            </p>
          </div>
        );

      default:
        return (
          <div className="unknown-preview">
            <div className="file-icon-large">
              <i className={`fas fa-${getFileIcon(file.name)}`}></i>
            </div>
            <p>Preview not available for this file type</p>
          </div>
        );
    }
  };

  return (
    <Modal title={`Preview: ${file.name}`} onClose={onClose}>
      <div className="file-preview-container">
        <div className="file-preview-content">{renderPreview()}</div>

        <div className="file-preview-info">
          <div className="file-info-item">
            <span className="file-info-label">Name:</span>
            <span className="file-info-value">{file.name}</span>
          </div>

          <div className="file-info-item">
            <span className="file-info-label">Size:</span>
            <span className="file-info-value">{formatFileSize(file.size)}</span>
          </div>

          <div className="file-info-item">
            <span className="file-info-label">Last Modified:</span>
            <span className="file-info-value">
              {new Date(file.lastModified).toLocaleString()}
            </span>
          </div>

          <div className="file-info-item">
            <span className="file-info-label">Type:</span>
            <span className="file-info-value">
              {file.contentType || "Unknown"}
            </span>
          </div>
        </div>

        <div className="file-preview-actions">
          <button
            className="download-button"
            onClick={handleDownload}
            disabled={!previewUrl}
          >
            <i className="fas fa-download"></i> Download
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FilePreview;
