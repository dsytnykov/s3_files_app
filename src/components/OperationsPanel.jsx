import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import CreateFolderDialog from "./dialogs/CreateFolderDialog";
import MoveItemsDialog from "./dialogs/MoveItemsDialog";
import RenameDialog from "./dialogs/RenameDialog";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import ProgressBar from "./UI/ProgressBar";
import ViewSelector from "./ViewSelector";

const OperationsPanel = () => {
  const {
    selectedItems,
    deleteSelectedItems,
    downloadSelectedFiles,
    isLoading,
    currentOperation,
    operationProgress,
  } = useAppContext();

  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  const getFirstSelectedItem = () => {
    return selectedItems.length > 0 ? selectedItems[0] : null;
  };

  const hasMultipleSelection = () => {
    return selectedItems.length > 1;
  };

  const hasSelection = () => {
    return selectedItems.length > 0;
  };

  const handleRenameAction = () => {
    if (hasSelection() && !hasMultipleSelection()) {
      const item = getFirstSelectedItem();
      setShowRenameDialog(true);
    }
  };

  const handleDeleteAction = () => {
    if (hasSelection()) {
      setShowDeleteConfirmDialog(true);
    }
  };

  const handleMoveAction = () => {
    if (hasSelection()) {
      setShowMoveDialog(true);
    }
  };

  const handleDownloadAction = () => {
    if (hasSelection()) {
      downloadSelectedFiles();
    }
  };

  return (
    <div className="operations-panel">
      <div className="operations-toolbar">
        <div className="left-operations">
          <button
            className="new-folder-button"
            onClick={() => setShowCreateFolderDialog(true)}
            disabled={isLoading}
          >
            <i className="fas fa-folder-plus"></i>
            New Folder
          </button>
          <ViewSelector />
        </div>

        <div className="selection-operations">
          <button
            className="move-button"
            disabled={!hasSelection() || isLoading}
            onClick={handleMoveAction}
          >
            <i className="fas fa-arrow-right"></i>
            Move
          </button>

          <button
            className="rename-button"
            disabled={!hasSelection() || hasMultipleSelection() || isLoading}
            onClick={handleRenameAction}
          >
            <i className="fas fa-edit"></i>
            Rename
          </button>

          <button
            className="download-button"
            disabled={!hasSelection() || isLoading}
            onClick={handleDownloadAction}
          >
            <i className="fas fa-download"></i>
            Download
          </button>

          <button
            className="delete-button"
            disabled={!hasSelection() || isLoading}
            onClick={handleDeleteAction}
          >
            <i className="fas fa-trash"></i>
            Delete
          </button>
        </div>
      </div>

      {isLoading && currentOperation && (
        <div className="operation-progress">
          <div className="operation-info">
            <span className="operation-name">{currentOperation}</span>
            <span className="operation-percentage">{operationProgress}%</span>
          </div>
          <ProgressBar progress={operationProgress} />
        </div>
      )}

      {/* Dialogs */}
      {showCreateFolderDialog && (
        <CreateFolderDialog onClose={() => setShowCreateFolderDialog(false)} />
      )}

      {showMoveDialog && (
        <MoveItemsDialog
          items={selectedItems}
          onClose={() => setShowMoveDialog(false)}
        />
      )}

      {showRenameDialog && (
        <RenameDialog
          item={getFirstSelectedItem()}
          isFolder={getFirstSelectedItem().type === "folder"}
          onClose={() => setShowRenameDialog(false)}
        />
      )}

      {showDeleteConfirmDialog && (
        <ConfirmDialog
          title="Confirm Deletion"
          message={`Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`}
          confirmLabel="Delete"
          confirmVariant="danger"
          onConfirm={() => {
            deleteSelectedItems();
            setShowDeleteConfirmDialog(false);
          }}
          onCancel={() => setShowDeleteConfirmDialog(false)}
        />
      )}
    </div>
  );
};

export default OperationsPanel;
