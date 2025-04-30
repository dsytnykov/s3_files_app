import React from "react";
import { ToastContainer } from "react-toastify";
import { useAppContext } from "../../context/AppContext";
import FileExplorer from "../FileExplorer";
import OperationsPanel from "../OperationsPanel";
import UploadComponent from "../UploadComponent";
import UserMenu from "../UserMenu";

const MainLayout = ({ onResetConfig }) => {
  const { isDragging, handleDragLeave } = useAppContext();

  return (
    <div className={`s3-manager-layout ${isDragging ? "is-dragging" : ""}`}>
      <header className="app-header">
        <div className="app-header-logo">
          <div className="app-logo">
            <img
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSI+CiAgPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iOCIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMTUiLz4KICA8cGF0aCBkPSJNNTYgMjRINjRWMzJINTZWMjRaIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC44Ii8+CiAgPHBhdGggZD0iTTE2IDI4SDY0VjY0SDE2VjI4WiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuOCIvPgogIDxwYXRoIGQ9Ik0yOCAxOEg1MkwyOCAyOEg1Mkw0OCAxOEgyOFoiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjkiLz4KICA8Y2lyY2xlIGN4PSI0MCIgY3k9IjQ2IiByPSIxMiIgZmlsbD0iIzM0OThkYiIvPgogIDxjaXJjbGUgY3g9IjQwIiBjeT0iNDYiIHI9IjgiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjMiLz4KICA8Y2lyY2xlIGN4PSI0MCIgY3k9IjQ2IiByPSI0IiBmaWxsPSIjMzQ5OGRiIi8+CiAgPGNpcmNsZSBjeD0iNTYiIGN5PSIzNCIgcj0iMyIgZmlsbD0iI2YzOWMxMiIvPgo8L3N2Zz4K"
              alt="File Manager Logo"
            />
          </div>
          <h1 className="app-title">File Manager</h1>
        </div>
        <UserMenu onResetConfig={onResetConfig} />
      </header>

      <div
        className="app-container"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDragLeave={() => {
          handleDragLeave();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <main className="main-content">
          <OperationsPanel />
          <FileExplorer />
        </main>

        <aside className="sidebar">
          <UploadComponent />
        </aside>
      </div>
    </div>
  );
};

export default MainLayout;
