import React, { useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { isImage } from "../utils/fileUtils";

const FileContextMenu = ({ file, position, onClose }) => {
  const menuRef = useRef(null);
  const {
    deleteSelectedItems,
    downloadSelectedFiles,
    toggleSelectItem,
    selectedItems,
    getFilePreviewUrl,
  } = useAppContext();

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

  const handlePreview = async () => {
    try {
      if (isImage(file.name)) {
        const url = await getFilePreviewUrl(file);
        window.open(url, "_blank");
      } else {
        handleDownload();
      }
    } catch (error) {
      console.error("Error previewing file:", error);
    }
    onClose();
  };

  const handleDownload = () => {
    if (!selectedItems.some((item) => item.path === file.path)) {
      selectedItems.forEach((item) => {
        if (item.path !== file.path) {
          toggleSelectItem(item);
        }
      });
      toggleSelectItem(file);
    }

    downloadSelectedFiles();
    onClose();
  };

  const handleDelete = () => {
    if (!selectedItems.some((item) => item.path === file.path)) {
      selectedItems.forEach((item) => {
        if (item.path !== file.path) {
          toggleSelectItem(item);
        }
      });
      toggleSelectItem(file);
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
    <div className="context-menu" ref={menuRef} style={calculatePosition()}>
      <ul>
        <li onClick={handlePreview}>
          <i className="fas fa-eye"></i> Preview
        </li>
        <li onClick={handleDownload}>
          <i className="fas fa-download"></i> Download
        </li>
        <li
          onClick={() => {
            // TODO: Show rename dialog
            onClose();
          }}
        >
          <i className="fas fa-edit"></i> Rename
        </li>
        <li
          onClick={() => {
            // TODO: Show move dialog
            onClose();
          }}
        >
          <i className="fas fa-arrow-right"></i> Move
        </li>
        <li className="separator"></li>
        <li onClick={handleDelete} className="danger">
          <i className="fas fa-trash"></i> Delete
        </li>
      </ul>
    </div>
  );
};

export default FileContextMenu;
