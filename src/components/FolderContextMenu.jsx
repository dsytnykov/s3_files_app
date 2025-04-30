import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { getFolderName } from "../utils/fileUtils";
import RenameDialog from "./dialogs/RenameDialog";

const FolderContextMenu = ({ folder, position, onClose }) => {
  const menuRef = useRef(null);
  const {
    deleteSelectedItems,
    toggleSelectItem,
    selectedItems,
    navigateToFolder,
  } = useAppContext();

  const [showRenameDialog, setShowRenameDialog] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleOpen = () => {
    navigateToFolder(folder.path);
    onClose();
  };

  const handleRename = () => {
    setShowRenameDialog(true);
  };

  const handleDelete = () => {
    if (!selectedItems.some((item) => item.path === folder.path)) {
      selectedItems.forEach((item) => {
        if (item.path !== folder.path) {
          toggleSelectItem(item);
        }
      });
      toggleSelectItem(folder);
    }

    deleteSelectedItems();
    onClose();
  };

  const calculatePosition = () => {
    const style = {
      position: "fixed",
      left: position.x,
      top: position.y,
    };

    if (menuRef.current) {
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      if (position.x + menuWidth > viewportWidth) {
        style.left = viewportWidth - menuWidth;
      }

      if (position.y + menuHeight > viewportHeight) {
        style.top = viewportHeight - menuHeight;
      }
    }

    return style;
  };

  return (
    <>
      <div className="context-menu" ref={menuRef} style={calculatePosition()}>
        <ul>
          <li onClick={handleOpen}>
            <i className="fas fa-folder-open"></i> Open
          </li>
          <li onClick={handleRename}>
            <i className="fas fa-edit"></i> Rename
          </li>
          <li className="separator"></li>
          <li onClick={handleDelete} className="danger">
            <i className="fas fa-trash"></i> Delete
          </li>
        </ul>
      </div>

      {showRenameDialog && (
        <RenameDialog
          item={{
            ...folder,
            name: getFolderName(folder.path),
          }}
          isFolder={true}
          onClose={() => {
            setShowRenameDialog(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default FolderContextMenu;
