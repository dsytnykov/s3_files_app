import React, { useState, useEffect, useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import {
  isImage,
  isVideoFile,
  isTextFile,
  isCodeFile,
  getFileIcon,
  getFolderName,
} from "../utils/fileUtils";
import BreadcrumbNav from "./BreadcrumbNav";
import SortingDropdown from "./SortingDropdown";
import { Spinner } from "./UI/Spinner";
import MediaViewerModal from "./MediaViewerModal";

const GridListView = () => {
  const {
    currentPath,
    folders,
    files,
    isLoading,
    navigateToFolder,
    navigateUp,
    getFilePreviewUrl,
    selectedItems,
    toggleSelectItem,
    selectAll,
    deselectAll,
    s3Service,
    getSortedFolders,
    getSortedFiles,
    isDragging,
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  } = useAppContext();

  const [mediaViewerContent, setMediaViewerContent] = useState(null);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(null);
  const [filePreviewUrls, setFilePreviewUrls] = useState({});

  const mediaFiles = useMemo(() => {
    return files.filter((f) => isImage(f.name) || isVideoFile(f.name));
  }, [files]);

  useEffect(() => {
    const loadPreviews = async () => {
      const previewUrls = {};

      for (const file of files) {
        try {
          if (isImage(file.name) || isVideoFile(file.name)) {
            const url = await getFilePreviewUrl(file);
            previewUrls[file.path] = {
              url,
              type: isVideoFile(file.name) ? "video" : "image",
            };
          } else if (isTextFile(file.name) || isCodeFile(file.name)) {
            try {
              const content = await s3Service.getFileContent(file);

              if (content) {
                const lines = content.split("\n").slice(0, 8);
                const previewContent = lines.join("\n");

                previewUrls[file.path] = {
                  content: previewContent,
                  type: isCodeFile(file.name) ? "code" : "text",
                };
              }
            } catch (textError) {
              console.error("Error loading text content:", textError);
            }
          }
        } catch (error) {
          console.error("Error loading preview:", error);
        }
      }

      setFilePreviewUrls(previewUrls);
    };

    loadPreviews();
  }, [files, getFilePreviewUrl, s3Service]);

  const handleBreadcrumbClick = (path) => {
    navigateToFolder(path);
  };

  const handleFolderClick = (folder, event) => {
    if (event.target.type !== "checkbox") {
      navigateToFolder(folder.uiPath);
    }
  };

  const handleFileClick = (file, event) => {
    if (event.target.type !== "checkbox") {
      if (isImage(file.name) || isVideoFile(file.name)) {
        const index = mediaFiles.findIndex((f) => f.path === file.path);
        loadMediaPreview(file, index);
      }
    }
  };

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

  const getFolderIcon = () => {
    return "fas fa-folder";
  };

  const getFileTypeIcon = (fileName) => {
    if (fileName.endsWith(".pdf")) {
      return "fas fa-file-pdf";
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      return "fas fa-file-excel";
    } else if (isVideoFile(fileName)) {
      return "fas fa-file-video";
    } else if (isTextFile(fileName)) {
      return "fas fa-file-alt";
    } else if (isCodeFile(fileName)) {
      return "fas fa-file-code";
    } else {
      return `fas fa-${getFileIcon(fileName)}`;
    }
  };

  const areAllItemsSelected = () => {
    const totalItems = folders.length + files.length;
    return totalItems > 0 && selectedItems.length === totalItems;
  };

  const handleSelectAllChange = (e) => {
    if (e.target.checked) {
      selectAll();
    } else {
      deselectAll();
    }
  };

  const getBreadcrumbs = () => {
    if (!currentPath) {
      return [{ name: "Home", path: "" }];
    }

    const pathParts = currentPath.split("/").filter((part) => part !== "");
    const breadcrumbs = [{ name: "Home", path: "" }];

    let currentBreadcrumbPath = "";
    for (let i = 0; i < pathParts.length; i++) {
      currentBreadcrumbPath += `${pathParts[i]}/`;
      breadcrumbs.push({
        name: pathParts[i],
        path: currentBreadcrumbPath,
      });
    }

    return breadcrumbs;
  };

  if (isLoading && !folders.length && !files.length) {
    return <Spinner />;
  }

  return (
    <div
      className={`grid-list-view ${isDragging ? "dragging-over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="grid-list-header">
        <BreadcrumbNav
          breadcrumbs={getBreadcrumbs()}
          onBreadcrumbClick={handleBreadcrumbClick}
          onNavigateUp={navigateUp}
          canNavigateUp={!!currentPath}
        />

        <div className="view-controls">
          <div className="select-all-container">
            <input
              type="checkbox"
              id="select-all-grid"
              checked={areAllItemsSelected()}
              onChange={handleSelectAllChange}
              disabled={!folders.length && !files.length}
            />
            <label htmlFor="select-all-grid">
              {selectedItems.length > 0
                ? `${selectedItems.length} selected`
                : "Select All"}
            </label>
          </div>

          <SortingDropdown />
        </div>
      </div>

      {/* Folders section */}
      <div
        className="grid-section"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="section-header">
          <h2>Folders</h2>
        </div>

        {folders.length === 0 ? (
          <div className="empty-section">No folders</div>
        ) : (
          <div className="grid-items">
            {getSortedFolders().map((folder) => (
              <div
                key={folder.path}
                className={`grid-folder-item ${
                  selectedItems.some((item) => item.path === folder.path)
                    ? "selected"
                    : ""
                } ${
                  dropTarget && dropTarget.path === folder.path
                    ? "drop-target"
                    : ""
                }`}
                onClick={(e) => handleFolderClick(folder, e)}
                draggable="true"
                onDragStart={(e) => handleDragStart(folder, e)}
                onDragOver={(e) => handleDragOver(folder, e)}
                onDragLeave={() => handleDragLeave()}
                onDrop={(e) => handleDrop(folder, e)}
                onDragEnd={() => handleDragEnd()}
              >
                <div className="item-select">
                  <input
                    type="checkbox"
                    checked={selectedItems.some(
                      (item) => item.path === folder.path
                    )}
                    onChange={() => toggleSelectItem(folder)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="grid-folder-icon">
                  <i className={getFolderIcon()}></i>
                </div>
                <div className="grid-item-name">
                  {getFolderName(folder.path)}
                </div>

                {dropTarget && dropTarget.path === folder.path && (
                  <div className="drop-indicator"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files section */}
      <div className="grid-section">
        <div className="section-header">
          <h2>Files</h2>
        </div>

        {files.length === 0 ? (
          <div className="empty-section">No files</div>
        ) : (
          <div className="grid-items">
            {getSortedFiles().map((file) => (
              <div
                key={file.path}
                className={`grid-file-item ${
                  selectedItems.some((item) => item.path === file.path)
                    ? "selected"
                    : ""
                }`}
                onClick={(e) => handleFileClick(file, e)}
                draggable="true"
                onDragStart={(e) => handleDragStart(file, e)}
                onDragEnd={() => handleDragEnd()}
              >
                <div className="item-select">
                  <input
                    type="checkbox"
                    checked={selectedItems.some(
                      (item) => item.path === file.path
                    )}
                    onChange={() => toggleSelectItem(file)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="grid-file-thumbnail">
                  {filePreviewUrls[file.path] ? (
                    filePreviewUrls[file.path].type === "image" ? (
                      <img
                        src={filePreviewUrls[file.path].url}
                        alt={file.name}
                      />
                    ) : filePreviewUrls[file.path].type === "video" ? (
                      <div className="video-preview-container">
                        <video
                          className="video-thumbnail-element"
                          src={filePreviewUrls[file.path].url}
                          preload="metadata"
                          muted
                          playsInline
                          controls={false}
                        />
                        <div className="play-indicator"></div>
                      </div>
                    ) : filePreviewUrls[file.path].type === "text" ||
                      filePreviewUrls[file.path].type === "code" ? (
                      <div
                        className={`file-content-preview ${
                          filePreviewUrls[file.path].type
                        }`}
                      >
                        <pre
                          className={`file-text-preview ${
                            filePreviewUrls[file.path].type === "code"
                              ? "code"
                              : ""
                          }`}
                        >
                          {filePreviewUrls[file.path].content}
                        </pre>
                      </div>
                    ) : (
                      <i className={getFileTypeIcon(file.name)}></i>
                    )
                  ) : (
                    <i className={getFileTypeIcon(file.name)}></i>
                  )}
                </div>
                <div className="grid-item-name">{file.name}</div>
              </div>
            ))}
          </div>
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
    </div>
  );
};

export default GridListView;
