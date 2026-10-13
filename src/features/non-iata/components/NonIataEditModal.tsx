import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ILock } from '@/components/ui/Icons';
import { updateNonIata } from '@/api/nonIataApi';
import { NonIata, NonIataUpdateRequest } from '@/types/nonIata.types';
import { ApiError } from '@/types/api.types';

export interface NonIataEditModalProps {
  account: NonIata | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedAccount: NonIata) => void;
}

export const NonIataEditModal: React.FC<NonIataEditModalProps> = ({
  account,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<{ message: string; details?: string[] } | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setContactName(account.contactName || '');
      setPhone(account.phone || '');
      setEmail(account.email || '');
      setNotes(account.notes || '');
      setErrors({});
      setApiError(null);
    }
  }, [account]);

  const handleClose = () => {
    if (!isSubmitting) {
      setErrors({});
      setApiError(null);
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanName = name.trim();
    if (!cleanName) {
      newErrors.name = 'Agency name is required';
    } else if (cleanName.length < 2 || cleanName.length > 200) {
      newErrors.name = 'Name must be between 2 and 200 characters';
    }

    if (contactName.trim().length > 200) {
      newErrors.contactName = 'Contact name must not exceed 200 characters';
    }

    if (phone.trim().length > 50) {
      newErrors.phone = 'Phone number must not exceed 50 characters';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      } else if (email.trim().length > 150) {
        newErrors.email = 'Email must not exceed 150 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    setApiError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload: NonIataUpdateRequest = {
        name: name.trim(),
        contactName: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const updated = await updateNonIata(account.id, payload);
      onUpdated(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError({
          message: err.message || 'Failed to update Non-IATA account',
          details: err.details,
        });
      } else {
        setApiError({
          message: 'An unexpected error occurred while updating the account',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!account) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Non-IATA Account"
      description={`Update details for ${account.name} (${account.code})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <Alert
            variant="danger"
            title="Unable to update account"
            message={apiError.message}
            details={apiError.details}
            onDismiss={() => setApiError(null)}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Agency Code (Immutable) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Agency Code
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                value={account.code}
                disabled
                className="block w-full text-sm rounded-md border border-slate-200 bg-slate-100/80 px-3 py-2 text-slate-600 font-mono font-medium cursor-not-allowed select-none"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                <ILock size={14} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Code is immutable to maintain historical sales and payment integrity.
            </p>
          </div>

          {/* Agency Name */}
          <div>
            <Input
              label="Agency Name *"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="e.g. Addis Ababa Travel Agency"
              error={errors.name}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Contact Person */}
          <Input
            label="Contact Person"
            value={contactName}
            onChange={(e) => {
              setContactName(e.target.value);
              if (errors.contactName) setErrors((prev) => ({ ...prev, contactName: '' }));
            }}
            placeholder="e.g. Mohamed Ali"
            error={errors.contactName}
            disabled={isSubmitting}
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            placeholder="e.g. +251 91 123 4567"
            error={errors.phone}
            disabled={isSubmitting}
          />
        </div>

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder="e.g. agency@example.com"
          error={errors.email}
          disabled={isSubmitting}
        />

        {/* Notes */}
        <div>
          <label htmlFor="edit-notes" className="block text-sm font-medium text-slate-700 mb-1">
            Notes & Comments
          </label>
          <textarea
            id="edit-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            placeholder="Optional address, operational notes, or branch details..."
            className="block w-full text-sm rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#CBA326] focus:ring-1 focus:ring-[#CBA326] disabled:bg-slate-50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
