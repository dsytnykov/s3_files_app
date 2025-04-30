import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { isValidFileName } from "../../utils/fileUtils";
import Modal from "../UI/Modal";

const CreateFolderDialog = ({ onClose }) => {
  const [folderName, setFolderName] = useState("");
  const [error, setError] = useState("");
  const { createFolder, isLoading } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!folderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    if (!isValidFileName(folderName)) {
      setError("Folder name contains invalid characters");
      return;
    }

    try {
      await createFolder(folderName);
      onClose();
    } catch (err) {
      setError(`Failed to create folder: ${err.message}`);
    }
  };

  return (
    <Modal title="Create New Folder" onClose={onClose}>
      <form onSubmit={handleSubmit} className="dialog-form">
        <div className="form-group">
          <label htmlFor="folder-name">Folder Name:</label>
          <input
            type="text"
            id="folder-name"
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
              setError("");
            }}
            autoFocus
            disabled={isLoading}
          />
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="dialog-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="confirm-button" disabled={isLoading}>
            Create Folder
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateFolderDialog;
