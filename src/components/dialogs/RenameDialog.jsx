import React, { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { isValidFileName } from "../../utils/fileUtils";
import Modal from "../UI/Modal";

const RenameDialog = ({ item, isFolder = false, onClose }) => {
  const [newName, setNewName] = useState(item.name);
  const [error, setError] = useState("");
  const { renameItem, renameFolder, isLoading } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newName.trim()) {
      setError("Name cannot be empty");
      return;
    }

    if (!isValidFileName(newName)) {
      setError("Name contains invalid characters");
      return;
    }

    if (newName === item.name) {
      onClose();
      return;
    }

    try {
      if (isFolder) {
        await renameFolder(item, newName);
      } else {
        await renameItem(item, newName);
      }
      onClose();
    } catch (err) {
      setError(`Failed to rename: ${err.message}`);
    }
  };

  return (
    <Modal title={`Rename ${isFolder ? "Folder" : "File"}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="dialog-form">
        <div className="form-group">
          <label htmlFor="new-name">New Name:</label>
          <input
            type="text"
            id="new-name"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
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
          <button
            type="submit"
            className="confirm-button"
            disabled={isLoading || newName === item.name}
          >
            Rename
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameDialog;
