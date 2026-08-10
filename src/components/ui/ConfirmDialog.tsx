import Modal from './Modal';
import Button from './Button';

interface Props {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({ open, title = 'Are you sure?', message, confirmText = 'Confirm', cancelText = 'Cancel', danger, loading, onConfirm, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={message} size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmText}</Button>
        </>
      }
    >
      <p className="text-sm text-ink-600 dark:text-ink-300">This action cannot be undone.</p>
    </Modal>
  );
}
