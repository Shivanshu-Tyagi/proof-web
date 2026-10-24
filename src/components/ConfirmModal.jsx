import Modal from './Modal';

// A plain "are you sure" dialog with equal-weight buttons
const ConfirmModal = ({ title, text, confirmLabel = 'Delete', onConfirm, onClose, busy = false }) => (
  <Modal
    title={title}
    onClose={onClose}
    footer={<>
      <button type="button" className="btn btn-secondary flex-1" onClick={onClose}>Keep it</button>
      <button type="button" className="btn btn-danger flex-1" disabled={busy} onClick={onConfirm}>{confirmLabel}</button>
    </>}
  >
    <p className="page-sub">{text}</p>
  </Modal>
);

export default ConfirmModal;
