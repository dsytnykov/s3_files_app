import React, { useState } from "react";
import { getFolderName } from "../utils/fileUtils";
import { useAppContext } from "../context/AppContext";
import FolderContextMenu from "./FolderContextMenu";

const folderCoverImage =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNTAgMTIwIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEyMCIgcng9IjMiIGZpbGw9IiNmZmVhYTciLz48cGF0aCBkPSJNMCwwIEwxNTAsMCBMMTM1LDUwIEwwLDUwIFoiIGZpbGw9IiNmZGNiNmUiLz48cGF0aCBkPSJNMCw1MCBMMTM1LDUwIEwxMjUsMTIwIEwwLDEyMCBaIiBmaWxsPSIjZTE3MDU1IiBvcGFjaXR5PSIwLjgiLz48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEyMCIgcng9IjMiIGZpbGw9InJnYmEoMjU1LCAxOTMsIDcsIDAuMikiIHN0cm9rZVdpZHRoPSIxIi8+PC9zdmc+";

const FolderItem = ({ folder, isSelected, onSelect, onNavigate }) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const {
    dropTarget,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isDragging,
  } = useAppContext();

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const getFolderNameFromUIPath = (uiPath) => {
    if (!uiPath) return "";
    const parts = uiPath.split("/").filter((p) => p);
    return parts.length > 0 ? parts[parts.length - 1] : "";
  };

  const handleClick = (e) => {
    if (e.target.type !== "checkbox") {
      onNavigate(folder.uiPath);
    }
  };

  const handleDoubleClick = () => {
    onNavigate(folder.uiPath);
  };

  const isDropTarget = dropTarget && dropTarget.path === folder.path;

  return (
    <div
      className={`folder-item ${isSelected ? "selected" : ""} ${
        isDropTarget ? "drop-target" : ""
      } ${isDragging ? "dragging" : ""}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      draggable="true"
      onDragStart={(e) => handleDragStart(folder, e)}
      onDragOver={(e) => handleDragOver(folder, e)}
      onDragLeave={() => handleDragLeave()}
      onDrop={(e) => handleDrop(folder, e)}
      onDragEnd={() => handleDragEnd()}
    >
      <div className="folder-select">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="folder-preview">
        <div className="folder-cover-image">
          <img src={folderCoverImage} alt="Folder" className="folder-cover" />
        </div>
      </div>

      <div className="folder-info">
        <div
          className="folder-name"
          title={getFolderNameFromUIPath(folder.uiPath || folder.path)}
        >
          {getFolderNameFromUIPath(folder.uiPath || folder.path)}
        </div>
      </div>

      {isDropTarget && <div className="drop-indicator"></div>}

      {showContextMenu && (
        <FolderContextMenu
          folder={folder}
          position={contextMenuPosition}
          onClose={() => setShowContextMenu(false)}
        />
      )}
    </div>
  );
};

export default FolderItem;
