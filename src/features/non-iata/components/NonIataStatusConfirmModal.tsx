import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { updateNonIataStatus } from '@/api/nonIataApi';
import { NonIata, NonIataStatus } from '@/types/nonIata.types';
import { ApiError } from '@/types/api.types';

export interface NonIataStatusConfirmModalProps {
  account: NonIata | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedAccount: NonIata) => void;
}

export const NonIataStatusConfirmModal: React.FC<NonIataStatusConfirmModalProps> = ({
  account,
  isOpen,
  onClose,
  onStatusUpdated,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  if (!account) return null;

  const isDeactivating = account.status === 'ACTIVE';
  const targetStatus: NonIataStatus = isDeactivating ? 'INACTIVE' : 'ACTIVE';

  const handleConfirm = async () => {
    setApiError(null);
    setIsSubmitting(true);

    try {
      const updated = await updateNonIataStatus(account.id, targetStatus);
      onStatusUpdated(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError(err.message);
      } else {
        setApiError('An unexpected error occurred while updating status');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={isDeactivating ? 'Deactivate Non-IATA Account' : 'Activate Non-IATA Account'}
      maxWidth="sm"
    >
      <div className="space-y-4">
        {apiError && (
          <Alert
            variant="danger"
            message={apiError}
            onDismiss={() => setApiError(null)}
          />
        )}

        <div className="text-sm text-slate-600">
          <p className="mb-2">
            Are you sure you want to{' '}
            <span className="font-semibold text-slate-900">
              {isDeactivating ? 'deactivate' : 'activate'}
            </span>{' '}
            the sub-agent account:
          </p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <div className="font-medium text-slate-900">{account.name}</div>
            <div className="text-xs font-mono text-slate-500 mt-0.5">Code: {account.code}</div>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          {isDeactivating
            ? 'Deactivating an agency marks it as inactive. Existing sales transactions and payment ledger history remain completely preserved.'
            : 'Activating this account will return it to active operational status for sales matching and payment processing.'}
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDeactivating ? 'danger' : 'primary'}
            isLoading={isSubmitting}
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isDeactivating ? 'Deactivate Account' : 'Activate Account'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
