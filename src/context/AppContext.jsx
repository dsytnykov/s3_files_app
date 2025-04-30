import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getFolderName } from "../utils/fileUtils";

const AppContext = createContext();

export const AppProvider = ({ children, appConfig }) => {
  const [currentPath, setCurrentPath] = useState("");
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentOperation, setCurrentOperation] = useState(null);
  const [operationProgress, setOperationProgress] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // 'standard' or 'grid'
  const [sortBy, setSortBy] = useState("name"); // 'name', 'type', 'size', 'date'
  const [sortDirection, setSortDirection] = useState("asc");
  const [draggedItems, setDraggedItems] = useState([]);
  const [dropTarget, setDropTarget] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [currentS3Path, setCurrentS3Path] = useState("");

  const s3Service = appConfig.s3Service;
  const errorService = appConfig.errorService;

  const loadFolderContents = async (uiPath = "") => {
    try {
      setIsLoading(true);
      setCurrentOperation("Loading folder contents");

      const {
        folders: newFolders,
        files: newFiles,
        s3Path,
        uiPath: resultUiPath,
      } = await s3Service.listObjects(uiPath);

      setFolders(newFolders);
      setFiles(newFiles);
      setCurrentPath(uiPath);
      setCurrentS3Path(s3Path);
      setSelectedItems([]);
    } catch (error) {
      errorService.handleError(error, "loading folder contents");
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  const navigateUp = async () => {
    if (!currentPath) {
      return;
    }

    const pathParts = currentPath.split("/").filter((p) => p);
    pathParts.pop();

    const parentUIPath = pathParts.length > 0 ? `${pathParts.join("/")}/` : "";

    loadFolderContents(parentUIPath);
  };

  const createFolder = async (folderName) => {
    try {
      setIsLoading(true);
      setCurrentOperation("Creating folder");

      await s3Service.createFolder(folderName, currentPath);
      toast.success(`Folder ${folderName} created successfully`);

      await loadFolderContents(currentPath);
    } catch (error) {
      errorService.handleError(error, "creating folder");
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  const renameFolder = async (folder, newName) => {
    try {
      setIsLoading(true);
      setCurrentOperation(`Renaming folder to ${newName}`);

      if (!newName || newName.trim() === "") {
        throw new Error("Folder name cannot be empty");
      }

      if (!/^[a-zA-Z0-9_\-. ]+$/.test(newName)) {
        throw new Error("Folder name contains invalid characters");
      }

      const result = await s3Service.renameFolder(folder.path, newName);

      toast.success(`Folder renamed successfully to ${newName}`);

      if (currentPath === folder.path) {
        await loadFolderContents(result.newPath);
      } else {
        await loadFolderContents(currentPath);
      }

      return result;
    } catch (error) {
      errorService.handleError(error, "renaming folder");
      throw error;
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  const deleteSelectedItems = async () => {
    try {
      setIsLoading(true);
      setCurrentOperation("Deleting items");

      const totalItems = selectedItems.length;
      let processed = 0;

      for (const item of selectedItems) {
        if (item.type === "folder") {
          await s3Service.deleteFolder(item.path);
        } else {
          await s3Service.deleteFile(item.path);
        }

        processed++;
        setOperationProgress(Math.floor((processed / totalItems) * 100));
      }

      toast.success(`${totalItems} item(s) deleted successfully`);

      await loadFolderContents(currentPath);
    } catch (error) {
      errorService.handleError(error, "deleting items");
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
      setOperationProgress(0);
    }
  };

  const uploadFiles = async (files) => {
    try {
      setIsLoading(true);
      setCurrentOperation("Uploading files");

      const totalFiles = files.length;
      let uploaded = 0;

      for (const file of files) {
        await s3Service.uploadFile(file, currentPath);

        uploaded++;
        setOperationProgress(Math.floor((uploaded / totalFiles) * 100));
      }

      toast.success(`${totalFiles} file(s) uploaded successfully`);

      await loadFolderContents(currentPath);
    } catch (error) {
      errorService.handleError(error, "uploading files");
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
      setOperationProgress(0);
    }
  };

  const moveSelectedItems = async (destinationPath) => {
    try {
      setIsLoading(true);
      setCurrentOperation("Moving items");

      const totalItems = selectedItems.length;
      let moved = 0;

      for (const item of selectedItems) {
        if (item.type === "file") {
          const oldKey = item.path;
          const newKey = `${destinationPath}${item.name}`;

          await s3Service.moveFile(oldKey, newKey);
        }

        moved++;
        setOperationProgress(Math.floor((moved / totalItems) * 100));
      }

      toast.success(`${moved} item(s) moved successfully`);

      await loadFolderContents(currentPath);
    } catch (error) {
      errorService.handleError(error, "moving items");
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
      setOperationProgress(0);
    }
  };

  const renameItem = async (item, newName) => {
    try {
      setIsLoading(true);
      setCurrentOperation("Renaming item");

      if (item.type === "file") {
        const oldKey = item.path;
        const pathParts = oldKey.split("/");
        pathParts.pop();
        const newKey = [...pathParts, newName].join("/");

        await s3Service.moveFile(oldKey, newKey);
        toast.success(`Item renamed successfully to ${newName}`);
      } else if (item.type === "folder") {
        // Renaming folders is more complex as it requires moving all contents
        // This would be a more extensive implementation
        toast.error("Folder renaming is not implemented yet");
      }

      await loadFolderContents(currentPath);
    } catch (error) {
      errorService.handleError(error, "renaming item");
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
    }
  };

  const downloadSelectedFiles = async () => {
    try {
      setIsLoading(true);
      setCurrentOperation("Preparing files for download");

      const filesToDownload = selectedItems.filter(
        (item) => item.type === "file"
      );

      if (filesToDownload.length === 0) {
        toast.warn("No files selected for download");
        return;
      }

      const totalFiles = filesToDownload.length;
      let processed = 0;

      if (totalFiles === 1) {
        const fileUrl = await s3Service.getSignedUrl(filesToDownload[0].path);

        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = filesToDownload[0].name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("File downloaded successfully");
      } else {
        const JSZip = await import("jszip").then((module) => module.default);
        const zip = new JSZip();

        for (const file of filesToDownload) {
          const fileUrl = await s3Service.getSignedUrl(file.path);
          const response = await fetch(fileUrl);
          const blob = await response.blob();

          zip.file(file.name, blob);

          processed++;
          setOperationProgress(Math.floor((processed / totalFiles) * 100));
        }

        const zipBlob = await zip.generateAsync({ type: "blob" });

        const link = document.createElement("a");
        link.href = URL.createObjectURL(zipBlob);
        link.download = "download.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success(`${totalFiles} files downloaded as ZIP`);
      }
    } catch (error) {
      errorService.handleError(error, "downloading files");
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
      setOperationProgress(0);
    }
  };

  const toggleSelectItem = (item) => {
    setSelectedItems((prevSelected) => {
      const isSelected = prevSelected.some(
        (selected) => selected.path === item.path
      );

      if (isSelected) {
        return prevSelected.filter((selected) => selected.path !== item.path);
      } else {
        return [...prevSelected, item];
      }
    });
  };

  const selectAll = () => {
    setSelectedItems([...folders, ...files]);
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  const getFilePreviewUrl = async (file) => {
    try {
      return await s3Service.getSignedUrl(file.path);
    } catch (error) {
      errorService.handleError(error, "getting file preview");
      return null;
    }
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(newSortBy);
      setSortDirection("asc");
    }
  };

  const sortItems = (items) => {
    return [...items].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "folder" ? -1 : 1;
      }

      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "type":
          const extA = a.name.split(".").pop().toLowerCase();
          const extB = b.name.split(".").pop().toLowerCase();
          comparison = extA.localeCompare(extB);
          break;
        case "size":
          const sizeA = a.size || 0;
          const sizeB = b.size || 0;
          comparison = sizeA - sizeB;
          break;
        case "date":
          const dateA = new Date(a.lastModified || 0);
          const dateB = new Date(b.lastModified || 0);
          comparison = dateA - dateB;
          break;
        default:
          comparison = a.name.localeCompare(b.name);
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  };

  const getSortedFolders = () => {
    return sortItems(folders);
  };

  const getSortedFiles = () => {
    return sortItems(files);
  };

  const handleDragStart = (item, event) => {
    event.stopPropagation();

    event.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        items:
          selectedItems.length > 0 &&
          selectedItems.some((i) => i.path === item.path)
            ? selectedItems
            : [item],
      })
    );

    const dragPreview = document.createElement("div");
    const itemsToMove =
      selectedItems.length > 0 &&
      selectedItems.some((i) => i.path === item.path)
        ? selectedItems
        : [item];

    dragPreview.className = "drag-preview";
    dragPreview.innerHTML = `
    <div class="drag-preview-count">${itemsToMove.length}</div>
    <div class="drag-preview-label">item${
      itemsToMove.length > 1 ? "s" : ""
    }</div>
  `;
    document.body.appendChild(dragPreview);
    event.dataTransfer.setDragImage(dragPreview, 25, 25);

    setDraggedItems(itemsToMove);
    setIsDragging(true);

    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleDragOver = (folder, event) => {
    event.preventDefault();
    event.stopPropagation();

    const isValidDropTarget = isValidTarget(folder);

    if (isValidDropTarget) {
      event.dataTransfer.dropEffect = "move";
      setDropTarget(folder);
    } else {
      event.dataTransfer.dropEffect = "none";
    }
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = async (targetFolder, event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(false);
    setDropTarget(null);

    try {
      let itemsToMove = draggedItems;
      if (itemsToMove.length === 0) {
        try {
          const data = JSON.parse(
            event.dataTransfer.getData("application/json")
          );
          itemsToMove = data.items || [];
        } catch (e) {
          console.error("Error parsing drag data", e);
          return;
        }
      }

      if (
        itemsToMove.length === 0 ||
        !targetFolder ||
        !targetFolder.path ||
        targetFolder.type !== "folder" ||
        !isValidTarget(targetFolder)
      ) {
        console.log("Invalid drop target or no items to move", targetFolder);
        return;
      }

      setIsLoading(true);
      setCurrentOperation("Moving items");

      const destinationPath = targetFolder.path;
      console.log(`Moving items to destination: ${destinationPath}`);

      let processed = 0;
      const totalItems = itemsToMove.length;

      for (const item of itemsToMove) {
        try {
          if (item.type === "file") {
            const newPath = `${destinationPath}${item.name}`;
            console.log(`Moving file from ${item.path} to ${newPath}`);
            await s3Service.moveFile(item.path, newPath);
          } else if (item.type === "folder") {
            const folderName = item.name || getFolderName(item.path);

            const newPath = `${destinationPath}${folderName}/`;

            console.log(`Moving folder from ${item.path} to ${newPath}`);

            await s3Service.renameFolder(item.path, newPath);
          }

          processed++;
          setOperationProgress(Math.floor((processed / totalItems) * 100));
        } catch (itemError) {
          console.error(`Error moving item ${item.path}:`, itemError);
          errorService.handleError(itemError, `moving item ${item.path}`);
        }
      }

      toast.success(`${processed} item(s) moved successfully`);

      await loadFolderContents(currentPath);
    } catch (error) {
      errorService.handleError(error, "moving items");
    } finally {
      setIsLoading(false);
      setCurrentOperation(null);
      setOperationProgress(0);
      setDraggedItems([]);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDropTarget(null);
    setDraggedItems([]);
  };

  const isValidTarget = (folder) => {
    if (!folder || !folder.path || folder.type !== "folder") return false;

    if (!draggedItems.length) return false;

    for (const item of draggedItems) {
      if (item.path === folder.path) return false;

      if (item.type === "folder" && folder.path.startsWith(item.path))
        return false;
    }

    return true;
  };

  useEffect(() => {
    loadFolderContents(currentPath);
  }, []);

  const contextValue = {
    currentPath,
    folders,
    files,
    selectedItems,
    isLoading,
    currentOperation,
    operationProgress,
    s3Service,
    errorService,
    sortBy,
    sortDirection,
    viewMode,
    draggedItems,
    dropTarget,
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    isValidTarget,
    handleSort,
    getSortedFolders,
    getSortedFiles,
    loadFolderContents,
    createFolder,
    renameFolder,
    deleteSelectedItems,
    uploadFiles,
    moveSelectedItems,
    renameItem,
    downloadSelectedFiles,
    toggleSelectItem,
    selectAll,
    deselectAll,
    getFilePreviewUrl,
    navigateToFolder: (folderPath) => loadFolderContents(folderPath),
    navigateUp,
    toggleViewMode: () =>
      setViewMode((prev) => (prev === "grid" ? "standard" : "grid")),
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
};

export default AppContext;
