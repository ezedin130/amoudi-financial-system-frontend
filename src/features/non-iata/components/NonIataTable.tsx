import React from 'react';
import { NonIata } from '@/types/nonIata.types';
import { NonIataStatusBadge } from './NonIataStatusBadge';
import { IEdit, IEye, IPhone, IMail } from '@/components/ui/Icons';
import { useAuth } from '@/auth/AuthContext';

export interface NonIataTableProps {
  items: NonIata[];
  isLoading: boolean;
  onViewAccount: (id: number) => void;
  onEditAccount?: (account: NonIata) => void;
  onToggleStatus?: (account: NonIata) => void;
}

export const NonIataTable: React.FC<NonIataTableProps> = ({
  items,
  isLoading,
  onViewAccount,
  onEditAccount,
  onToggleStatus,
}) => {
  const { user } = useAuth();
  const isFinance = user?.role === 'FINANCE';

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Agency Name
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Code
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Contact Person
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Phone / Email
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-4 py-3.5">
                  <div className="h-4 bg-slate-200 rounded w-36 mb-1" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 bg-slate-200 rounded w-16" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 bg-slate-200 rounded w-28" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-4 bg-slate-200 rounded w-32" />
                </td>
                <td className="px-4 py-3.5">
                  <div className="h-5 bg-slate-200 rounded-full w-16" />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="h-4 bg-slate-200 rounded w-24 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-400 mb-3">
          <IEye size={24} />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">No Non-IATA accounts found</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No sub-agent accounts matched the selected search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Agency Name
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Code
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Contact Person
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Phone / Email
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-left">
              Status
            </th>
            <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((account) => {
            const isInactive = account.status === 'INACTIVE';
            return (
              <tr
                key={account.id}
                onClick={() => onViewAccount(account.id)}
                className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                  isInactive ? 'bg-slate-50/30' : ''
                }`}
              >
                {/* Agency Name */}
                <td className="px-4 py-3 font-medium text-slate-900">
                  <div className="flex items-center gap-2">
                    <span className="truncate max-w-xs">{account.name}</span>
                  </div>
                </td>

                {/* Short Code */}
                <td className="px-4 py-3">
                  <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {account.code}
                  </span>
                </td>

                {/* Contact Person */}
                <td className="px-4 py-3 text-xs text-slate-600">
                  {account.contactName ? (
                    <span>{account.contactName}</span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>

                {/* Phone / Email */}
                <td className="px-4 py-3 text-xs text-slate-600">
                  <div className="flex flex-col gap-0.5">
                    {account.phone && (
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <IPhone size={12} className="text-slate-400 shrink-0" />
                        {account.phone}
                      </span>
                    )}
                    {account.email && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <IMail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{account.email}</span>
                      </span>
                    )}
                    {!account.phone && !account.email && <span className="text-slate-400">—</span>}
                  </div>
                </td>

                {/* Status Badge */}
                <td className="px-4 py-3">
                  <NonIataStatusBadge status={account.status} />
                </td>

                {/* Action buttons */}
                <td className="px-4 py-3 text-right">
                  <div
                    className="inline-flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* View Account button */}
                    <button
                      type="button"
                      onClick={() => onViewAccount(account.id)}
                      className="text-xs font-medium text-[#0F2E22] hover:text-[#CBA326] px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                      title="View agency account details & statements"
                    >
                      View Account →
                    </button>

                    {/* Edit button (Finance Only) */}
                    {isFinance && onEditAccount && (
                      <button
                        type="button"
                        onClick={() => onEditAccount(account)}
                        className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors"
                        title="Edit agency details"
                        aria-label={`Edit ${account.name}`}
                      >
                        <IEdit size={15} />
                      </button>
                    )}

                    {/* Status Toggle (Finance Only) */}
                    {isFinance && onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(account)}
                        className={`text-xs px-2 py-0.5 rounded font-medium border transition-colors ${
                          account.status === 'ACTIVE'
                            ? 'text-slate-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 border-slate-200'
                            : 'text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 border-emerald-200'
                        }`}
                        title={
                          account.status === 'ACTIVE' ? 'Deactivate agency' : 'Activate agency'
                        }
                      >
                        {account.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
