import React, { useState, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { formatFileSize } from "../utils/fileUtils";
import ProgressBar from "./UI/ProgressBar";

const UploadComponent = () => {
  const {
    uploadFiles,
    currentPath,
    operationProgress,
    isLoading,
    currentOperation,
  } = useAppContext();
  const [dragging, setDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);

    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
  };

  const handleUpload = async () => {
    if (selectedFiles.length > 0) {
      await uploadFiles(selectedFiles);
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <div className="upload-component">
      <div
        className={`drop-zone ${dragging ? "active" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          multiple
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <div className="drop-zone-content">
          <i className="fas fa-cloud-upload-alt"></i>
          <p>Drag and drop files here or click to select</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files ({selectedFiles.length})</h3>

          <div className="files-list">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="file-item removable"
                onClick={() => removeFile(index)}
                title="Click to remove file"
              >
                <div className="file-info-wrapper">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
                <button
                  className="remove-file-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>

          <div className="upload-actions">
            <button
              className="upload-button"
              onClick={handleUpload}
              disabled={isLoading || selectedFiles.length === 0}
            >
              <i className="fas fa-upload"></i>
              Upload to {currentPath || "Root"}
            </button>

            <button
              className="cancel-button"
              onClick={handleCancel}
              disabled={isLoading || selectedFiles.length === 0}
            >
              <i className="fas fa-times"></i>
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading && currentOperation === "Uploading files" && (
        <div className="upload-progress">
          <p>{currentOperation}</p>
          <ProgressBar progress={operationProgress} />
        </div>
      )}
    </div>
  );
};

export default UploadComponent;
