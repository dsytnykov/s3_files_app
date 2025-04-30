import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import {
  formatFileSize,
  isImage,
  getFileIcon,
  isTextFile,
  isPdfFile,
  isCodeFile,
  isOfficeFile,
  isVideoFile,
} from "../utils/fileUtils";
import { Spinner } from "./UI/Spinner";
import FileContextMenu from "./FileContextMenu";
import MediaViewerModal from "./MediaViewerModal";

const FileItem = ({ file, isSelected, onSelect }) => {
  const {
    getFilePreviewUrl,
    s3Service,
    handleDragStart,
    handleDragEnd,
    isDragging,
  } = useAppContext();

  const [previewUrl, setPreviewUrl] = useState(null);
  const [contentPreview, setContentPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [mediaViewerContent, setMediaViewerContent] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(null);

  const { files } = useAppContext();

  useEffect(() => {
    setPreviewUrl(null);
    setContentPreview(null);

    if (isImage(file.name)) {
      loadImagePreview();
    } else if (isVideoFile(file.name)) {
      loadVideoPreview();
    } else if (isTextFile(file.name) || isCodeFile(file.name)) {
      loadTextPreview();
    } else if (isPdfFile(file.name)) {
      loadPdfPreview();
    } else if (isOfficeFile(file.name)) {
      loadOfficePreview();
    } else {
      setContentPreview({
        type: "generic",
        extension: file.name.split(".").pop().toLowerCase(),
      });
    }
  }, [file]);

  const mediaFiles = useMemo(() => {
    return files.filter((f) => isImage(f.name) || isVideoFile(f.name));
  }, [files]);

  const handleNextMedia = () => {
    if (currentMediaIndex === null || mediaFiles.length === 0) return;

    const nextIndex = (currentMediaIndex + 1) % mediaFiles.length;
    loadMediaPreview(mediaFiles[nextIndex], nextIndex);
  };

  const handlePreviousMedia = () => {
    if (currentMediaIndex === null || mediaFiles.length === 0) return;

    const prevIndex =
      (currentMediaIndex - 1 + mediaFiles.length) % mediaFiles.length;
    loadMediaPreview(mediaFiles[prevIndex], prevIndex);
  };

  const loadMediaPreview = async (mediaFile, index) => {
    try {
      const url = await getFilePreviewUrl(mediaFile);

      setCurrentMediaIndex(index);

      setMediaViewerContent({
        type: isImage(mediaFile.name) ? "image" : "video",
        url: url,
        name: mediaFile.name,
      });
    } catch (error) {
      console.error("Error loading media preview:", error);
    }
  };

  const loadPdfPreview = async () => {
    setIsLoading(true);
    try {
      const url = await getFilePreviewUrl(file);

      setContentPreview({
        type: "pdf",
        extension: "pdf",
        url: url,
        visualPreview: true,
      });
    } catch (error) {
      console.error("Error loading PDF preview:", error);
      setContentPreview({
        type: "pdf",
        extension: "pdf",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfficePreview = async () => {
    setIsLoading(true);
    try {
      const extension = file.name.split(".").pop().toLowerCase();

      if (extension === "docx" || extension === "doc") {
        const url = await getFilePreviewUrl(file);

        setContentPreview({
          type: "office",
          extension: extension,
          url: url,
          visualPreview: true,
        });
      } else {
        setContentPreview({
          type: "office",
          extension: extension,
        });
      }
    } catch (error) {
      console.error("Error loading Office preview:", error);
      const extension = file.name.split(".").pop().toLowerCase();
      setContentPreview({
        type: "office",
        extension: extension,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadImagePreview = async () => {
    setIsLoading(true);
    try {
      const url = await getFilePreviewUrl(file);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error loading image preview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVideoPreview = async () => {
    setIsLoading(true);
    try {
      const url = await getFilePreviewUrl(file);
      setContentPreview({
        type: "video",
        url: url,
      });
    } catch (error) {
      console.error("Error loading video preview:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTextPreview = async () => {
    setIsLoading(true);
    try {
      let content = await s3Service.getFileContent(file);

      if (content) {
        const lines = content.split("\n").slice(0, 8);
        content = lines.join("\n");

        setContentPreview({
          type: isCodeFile(file.name) ? "code" : "text",
          content: content,
        });
      } else {
        try {
          const url = await getFilePreviewUrl(file);
          const response = await fetch(url);
          content = await response.text();

          if (content) {
            const lines = content.split("\n").slice(0, 8);
            content = lines.join("\n");

            setContentPreview({
              type: isCodeFile(file.name) ? "code" : "text",
              content: content,
            });
          } else {
            throw new Error("Could not get text content");
          }
        } catch (fallbackError) {
          console.error("Error in fallback text loading:", fallbackError);
          setContentPreview({
            type: isCodeFile(file.name) ? "code" : "text",
            content: null,
            extension: file.name.split(".").pop().toLowerCase(),
          });
        }
      }
    } catch (error) {
      console.error("Error loading text preview:", error);

      setContentPreview({
        type: isCodeFile(file.name) ? "code" : "text",
        content: null,
        extension: file.name.split(".").pop().toLowerCase(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleClick = (e) => {
    if (e.target.type === "checkbox") {
      return;
    }

    if (isImage(file.name) && previewUrl) {
      e.stopPropagation();

      const index = mediaFiles.findIndex((f) => f.path === file.path);
      loadMediaPreview(file, index);
      return;
    }

    if (isVideoFile(file.name) && contentPreview?.url) {
      e.stopPropagation();

      const index = mediaFiles.findIndex((f) => f.path === file.path);
      loadMediaPreview(file, index);
      return;
    }

    onSelect();
  };

  const handleCloseMediaViewer = () => {
    setMediaViewerContent(null);
  };

  const getIconClass = (fileExtension) => {
    switch (fileExtension) {
      case "pdf":
        return "fas fa-file-pdf";
      case "doc":
      case "docx":
        return "fas fa-file-word";
      case "xls":
      case "xlsx":
        return "fas fa-file-excel";
      case "ppt":
      case "pptx":
        return "fas fa-file-powerpoint";
      case "txt":
      case "log":
        return "fas fa-file-alt";
      case "md":
        return "fas fa-file-code";
      default:
        return `fas fa-${getFileIcon(fileExtension)}`;
    }
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="thumbnail-loading">
          <Spinner size="small" />
        </div>
      );
    }

    if (isImage(file.name) && previewUrl) {
      return (
        <img
          src={previewUrl}
          alt={file.name}
          className="file-thumbnail"
          onError={() => setPreviewUrl(null)}
        />
      );
    }

    if (contentPreview) {
      switch (contentPreview.type) {
        case "text":
        case "code":
          if (contentPreview.content) {
            return (
              <div className={`file-content-preview ${contentPreview.type}`}>
                <pre
                  className={`file-text-preview ${
                    contentPreview.type === "code" ? "code" : ""
                  }`}
                >
                  {contentPreview.content}
                </pre>
              </div>
            );
          } else {
            // Fallback for text files when content couldn't be loaded
            return (
              <div className="file-content-preview text">
                <div className="file-preview-icon">
                  <i
                    className={getIconClass(contentPreview.extension || "txt")}
                  ></i>
                </div>
                <div className="preview-label">
                  {contentPreview.extension?.toUpperCase() || "TXT"}
                </div>
              </div>
            );
          }

        case "video":
          return (
            <div className="file-content-preview video">
              {contentPreview.url && (
                <div className="video-wrapper">
                  <video
                    className="video-thumbnail-element"
                    src={contentPreview.url}
                    preload="metadata"
                    muted
                    playsInline
                    controls={false}
                  />
                  <div className="play-indicator"></div>
                </div>
              )}
            </div>
          );

        case "pdf":
          // Enhanced visual PDF preview
          if (contentPreview.visualPreview) {
            return (
              <div className="file-content-preview pdf-visual-preview">
                <div className="pdf-document-preview">
                  <div className="pdf-preview-header">
                    <div className="pdf-icon-small">
                      <i className="fas fa-file-pdf"></i>
                    </div>
                    <div className="pdf-title-bar">PDF</div>
                  </div>
                  <div className="pdf-preview-content">
                    <div className="pdf-text-placeholder">
                      <div className="pdf-line"></div>
                      <div className="pdf-line"></div>
                      <div className="pdf-line short"></div>
                      <div className="pdf-line medium"></div>
                      <div className="pdf-line"></div>
                    </div>
                    <div className="pdf-watermark">PDF</div>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div className="file-content-preview pdf-preview">
                <div className="file-preview-icon">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div className="preview-label">PDF Document</div>
              </div>
            );
          }

        case "office":
          const iconClass =
            contentPreview.extension === "docx" ||
            contentPreview.extension === "doc"
              ? "fas fa-file-word"
              : contentPreview.extension === "xlsx" ||
                contentPreview.extension === "xls"
              ? "fas fa-file-excel"
              : contentPreview.extension === "pptx" ||
                contentPreview.extension === "ppt"
              ? "fas fa-file-powerpoint"
              : "fas fa-file";

          const docType =
            contentPreview.extension === "docx" ||
            contentPreview.extension === "doc"
              ? "Word Document"
              : contentPreview.extension === "xlsx" ||
                contentPreview.extension === "xls"
              ? "Excel Spreadsheet"
              : contentPreview.extension === "pptx" ||
                contentPreview.extension === "ppt"
              ? "PowerPoint Presentation"
              : "Office Document";

          // Enhanced visual Word document preview
          if (
            contentPreview.visualPreview &&
            (contentPreview.extension === "docx" ||
              contentPreview.extension === "doc")
          ) {
            return (
              <div className="file-content-preview office-visual-preview word-document">
                <div className="word-document-preview">
                  <div className="word-preview-header">
                    <div className="word-icon-small">
                      <i className="fas fa-file-word"></i>
                    </div>
                    <div className="word-title-bar">Word</div>
                  </div>
                  <div className="word-preview-content">
                    <div className="word-text-placeholder">
                      <div className="word-line"></div>
                      <div className="word-line"></div>
                      <div className="word-line short"></div>
                      <div className="word-line medium"></div>
                      <div className="word-line"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div className="file-content-preview office">
                <div className="file-preview-icon">
                  <i className={iconClass}></i>
                </div>
                <div className="preview-label">{docType}</div>
              </div>
            );
          }

        case "generic":
          return (
            <div className="file-content-preview">
              <div className="file-preview-icon">
                <i className={getIconClass(contentPreview.extension)}></i>
              </div>
              <div className="preview-label">
                {contentPreview.extension.toUpperCase()}
              </div>
            </div>
          );

        default:
          return <div></div>;
      }
    }

    return (
      <div className="file-icon">
        <i className={`fas fa-${getFileIcon(file.name)}`}></i>
      </div>
    );
  };

  return (
    <>
      <div
        className={`file-item ${isSelected ? "selected" : ""} ${
          isDragging ? "dragging" : ""
        }`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        draggable="true"
        onDragStart={(e) => handleDragStart(file, e)}
        onDragEnd={() => handleDragEnd()}
      >
        <div className="file-select">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        <div className="file-preview">{renderPreview()}</div>

        <div className="file-info">
          <div className="file-name" title={file.name}>
            {file.name}
          </div>
          <div className="file-details">
            <span className="file-size">{formatFileSize(file.size)}</span>
            <span className="file-date">
              {new Date(file.lastModified).toLocaleDateString()}
            </span>
          </div>
        </div>

        {showContextMenu && (
          <FileContextMenu
            file={file}
            position={contextMenuPosition}
            onClose={() => setShowContextMenu(false)}
          />
        )}
      </div>

      {/* Media Viewer Modal */}
      {mediaViewerContent && (
        <MediaViewerModal
          media={mediaViewerContent}
          onClose={() => {
            setMediaViewerContent(null);
            setCurrentMediaIndex(null);
          }}
          onNext={handleNextMedia}
          onPrevious={handlePreviousMedia}
          hasNext={mediaFiles.length > 1}
          hasPrevious={mediaFiles.length > 1}
        />
      )}
    </>
  );
};

export default FileItem;
