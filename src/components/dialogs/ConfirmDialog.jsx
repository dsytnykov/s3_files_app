import React from "react";
import Modal from "../UI/Modal";

const ConfirmDialog = ({
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal title={title} onClose={onCancel}>
      <div className="confirm-dialog">
        <div className="confirm-message">{message}</div>

        <div className="dialog-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-button ${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
