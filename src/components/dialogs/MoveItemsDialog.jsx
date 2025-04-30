import React, { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import { getFolderName } from "../../utils/fileUtils";
import Modal from "../UI/Modal";
import { Spinner } from "../UI/Spinner";

const MoveItemsDialog = ({ items, onClose }) => {
  const [selectedDestination, setSelectedDestination] = useState("");
  const [folderStructure, setFolderStructure] = useState([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { s3Service, moveSelectedItems, errorService } = useAppContext();

  useEffect(() => {
    loadFolders(currentPath);
  }, [currentPath]);

  const loadFolders = async (path) => {
    setLoading(true);
    setError("");

    try {
      const { folders } = await s3Service.listObjects(path);

      const enhancedFolders = await Promise.all(
        folders.map(async (folder) => {
          const displayPath = await s3Service.stripUserPrefixFromPath(
            folder.path
          );
          return {
            ...folder,
            displayPath,
          };
        })
      );

      setFolderStructure(enhancedFolders);
    } catch (err) {
      setError("Failed to load folders");
      errorService.handleError(err, "loading folder structure");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToFolder = (folderPath) => {
    setCurrentPath(folderPath);
  };

  const handleNavigateUp = () => {
    if (!currentPath) return;

    const pathParts = currentPath.split("/").filter((part) => part !== "");
    pathParts.pop();

    const parentPath = pathParts.length ? `${pathParts.join("/")}/` : "";
    setCurrentPath(parentPath);
  };

  const handleFolderSelect = (folderPath) => {
    setSelectedDestination(folderPath);
  };

  const handleMoveConfirm = async () => {
    if (!selectedDestination) {
      setError("Please select a destination folder");
      return;
    }

    try {
      await moveSelectedItems(selectedDestination);
      onClose();
    } catch (err) {
      setError(`Failed to move items: ${err.message}`);
    }
  };

  const getDisplayPath = async () => {
    if (!currentPath) return "Root";
    try {
      const userPrefix = await s3Service.getUserPrefix();
      if (currentPath.startsWith(userPrefix)) {
        return currentPath.substring(userPrefix.length) || "Root";
      }
      return currentPath || "Root";
    } catch (err) {
      return currentPath || "Root";
    }
  };

  const [displayPath, setDisplayPath] = useState("Root");

  useEffect(() => {
    const updateDisplayPath = async () => {
      const path = await getDisplayPath();
      setDisplayPath(path);
    };
    updateDisplayPath();
  }, [currentPath]);

  return (
    <Modal title={`Move ${items.length} item(s)`} onClose={onClose}>
      <div className="move-dialog-content">
        <div className="folder-navigation">
          {currentPath && (
            <button
              className="navigate-up-button"
              onClick={handleNavigateUp}
              disabled={loading}
            >
              <i className="fas fa-level-up-alt"></i> Up
            </button>
          )}

          <div className="current-path">
            <span className="path-label">Current Path:</span> {displayPath}
          </div>
        </div>

        <div className="folder-list">
          {loading ? (
            <div className="loading-indicator">
              <Spinner />
              <span>Loading folders...</span>
            </div>
          ) : folderStructure.length === 0 ? (
            <div className="empty-state">No folders found in this location</div>
          ) : (
            folderStructure.map((folder) => (
              <div
                key={folder.path}
                className={`folder-item ${
                  selectedDestination === folder.path ? "selected" : ""
                }`}
              >
                <div
                  className="folder-select"
                  onClick={() => handleFolderSelect(folder.path)}
                >
                  <input
                    type="radio"
                    name="destination"
                    checked={selectedDestination === folder.path}
                    onChange={() => handleFolderSelect(folder.path)}
                  />
                  <i className="fas fa-folder"></i>
                  <span>{getFolderName(folder.path)}</span>
                </div>

                <button
                  className="navigate-button"
                  onClick={() => handleNavigateToFolder(folder.path)}
                  title="Open folder"
                >
                  <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="dialog-actions">
          <button type="button" className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="confirm-button"
            onClick={handleMoveConfirm}
            disabled={!selectedDestination}
          >
            Move Here
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MoveItemsDialog;
