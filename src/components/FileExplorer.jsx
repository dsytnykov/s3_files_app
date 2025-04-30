import React from "react";
import { useAppContext } from "../context/AppContext";
import { getParentPath } from "../utils/fileUtils";
import FileItem from "./FileItem";
import FolderItem from "./FolderItem";
import BreadcrumbNav from "./BreadcrumbNav";
import SortingDropdown from "./SortingDropdown";
import { Spinner } from "./UI/Spinner";
import { EmptyState } from "./UI/EmptyState";
import GridListView from "./GridListView";

const FileExplorer = () => {
  const {
    viewMode,
    currentPath,
    folders,
    files,
    isLoading,
    navigateToFolder,
    navigateUp,
    selectedItems,
    toggleSelectItem,
    selectAll,
    deselectAll,
    getSortedFolders,
    getSortedFiles,
  } = useAppContext();

  const handleBreadcrumbClick = (path) => {
    navigateToFolder(path);
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

  if (isLoading && !folders.length && !files.length) {
    return <Spinner />;
  }

  if (viewMode === "grid") {
    return <GridListView />;
  }

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <BreadcrumbNav
          breadcrumbs={getBreadcrumbs()}
          onBreadcrumbClick={handleBreadcrumbClick}
          onNavigateUp={navigateUp}
          canNavigateUp={!!currentPath}
        />

        <div className="file-explorer-toolbar">
          <div className="toolbar-left">
            <div className="select-all-container">
              <input
                type="checkbox"
                id="select-all"
                checked={areAllItemsSelected()}
                onChange={handleSelectAllChange}
                disabled={!folders.length && !files.length}
              />
              <label htmlFor="select-all">Select All</label>
            </div>
          </div>

          <div className="toolbar-right">
            <SortingDropdown />
          </div>
        </div>
      </div>

      <div className="file-explorer-content">
        {folders.length === 0 && files.length === 0 ? (
          <EmptyState
            message="This folder is empty"
            subMessage="Upload files or create folders to get started"
          />
        ) : (
          <div className="items-grid">
            {getSortedFolders().map((folder) => (
              <FolderItem
                key={folder.path}
                folder={folder}
                isSelected={selectedItems.some(
                  (item) => item.path === folder.path
                )}
                onSelect={() => toggleSelectItem(folder)}
                onNavigate={() => navigateToFolder(folder.uiPath)}
              />
            ))}

            {getSortedFiles().map((file) => (
              <FileItem
                key={file.path}
                file={file}
                isSelected={selectedItems.some(
                  (item) => item.path === file.path
                )}
                onSelect={() => toggleSelectItem(file)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
