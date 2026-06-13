import Modal from "./Modal";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Delete">
      <p style={{ marginBottom: "20px" }}>{message}</p>

      <div className="flex gap-md" style={{ justifyContent: "flex-end" }}>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-danger" onClick={onConfirm}>
          Yes, Delete
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;