import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { createNonIata } from '@/api/nonIataApi';
import { NonIata, NonIataCreateRequest } from '@/types/nonIata.types';
import { ApiError } from '@/types/api.types';

export interface NonIataCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newAccount: NonIata) => void;
}

export const NonIataCreateModal: React.FC<NonIataCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<{ message: string; details?: string[] } | null>(null);

  const resetForm = () => {
    setCode('');
    setName('');
    setContactName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setErrors({});
    setApiError(null);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      newErrors.code = 'Agency code is required';
    } else if (cleanCode.length < 2 || cleanCode.length > 50) {
      newErrors.code = 'Code must be between 2 and 50 characters';
    }

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
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: NonIataCreateRequest = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        contactName: contactName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      const created = await createNonIata(payload);
      resetForm();
      onCreated(created);
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError({
          message: err.message || 'Failed to create Non-IATA account',
          details: err.details,
        });
      } else {
        setApiError({
          message: 'An unexpected error occurred while creating the account',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Non-IATA Account"
      description="Register a new sub-agent account. Initial status will be set to Active."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {apiError && (
          <Alert
            variant="danger"
            title="Unable to create account"
            message={apiError.message}
            details={apiError.details}
            onDismiss={() => setApiError(null)}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Agency Code */}
          <div>
            <Input
              label="Agency Code *"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (errors.code) setErrors((prev) => ({ ...prev, code: '' }));
              }}
              placeholder="e.g. AAT or NIR01"
              error={errors.code}
              disabled={isSubmitting}
              autoFocus
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Short code used during Excel matching. Unique & immutable.
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
          <label htmlFor="create-notes" className="block text-sm font-medium text-slate-700 mb-1">
            Notes & Comments
          </label>
          <textarea
            id="create-notes"
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
            Add Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};
