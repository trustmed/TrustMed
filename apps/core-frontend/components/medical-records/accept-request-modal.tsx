"use client";

import { useState } from 'react';
import { ShieldCheck, Clock, X, Check, User, FileText, Loader2, Inbox } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConsentRequest, ConsentRequestsApi } from '@/lib/api/consentRequests';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  pendingRequests: ConsentRequest[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AcceptRequestModal({ pendingRequests, open, onClose, onSuccess }: Props) {
  const [durations, setDurations] = useState<Record<string, string>>({});
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());

  const handleGrant = async (request: ConsentRequest) => {
    const duration = durations[request.id];
    if (!duration) return;
    setSubmittingIds((prev) => new Set(prev).add(request.id));
    try {
      await ConsentRequestsApi.acceptRequest(request.id, duration);
      onSuccess();
    } catch (error) {
      console.error('Failed to accept request', error);
    } finally {
      setSubmittingIds((prev) => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
  };

  const handleDeny = async (request: ConsentRequest) => {
    setSubmittingIds((prev) => new Set(prev).add(request.id));
    try {
      await ConsentRequestsApi.rejectRequest(request.id);
      onSuccess();
    } catch (error) {
      console.error('Failed to reject request', error);
    } finally {
      setSubmittingIds((prev) => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
  };

  const setDuration = (requestId: string, value: string) => {
    setDurations((prev) => ({ ...prev, [requestId]: value }));
  };

  const getRequesterName = (request: ConsentRequest) => {
    if (request.requester) {
      const name = `${request.requester.firstName || ''} ${request.requester.lastName || ''}`.trim();
      return name || request.requester.email || 'Unknown';
    }
    return 'A doctor or hospital';
  };

  const getRecordName = (request: ConsentRequest) => {
    return request.record?.originalFileName || request.record?.fileName || request.recordId;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[580px] max-h-[85vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Access Requests</DialogTitle>
              <DialogDescription className="mt-0.5">
                {pendingRequests.length === 0
                  ? 'No pending requests at this time.'
                  : `${pendingRequests.length} pending request${pendingRequests.length !== 1 ? 's' : ''} awaiting your decision.`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Request List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
                <Inbox className="h-7 w-7 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-neutral-500">All caught up!</p>
              <p className="text-xs text-neutral-400 mt-1">No pending access requests.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingRequests.map((request) => {
                const isSubmitting = submittingIds.has(request.id);
                const duration = durations[request.id] || '';
                return (
                  <div
                    key={request.id}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/30 p-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-600"
                  >
                    {/* Requester Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {getRequesterName(request)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-400">
                          <FileText className="h-3 w-3 shrink-0" />
                          <span className="truncate">{getRecordName(request)}</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-neutral-400 shrink-0 mt-1">
                        {request.createdAt ? formatDate(request.createdAt) : ''}
                      </span>
                    </div>

                    {/* Duration + Actions Row */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <Select value={duration} onValueChange={(v) => setDuration(request.id, v)}>
                          <SelectTrigger className="h-9 text-xs bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700">
                            <Clock className="h-3.5 w-3.5 mr-1.5 text-neutral-400" />
                            <SelectValue placeholder="Select duration..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30m">30 Minutes</SelectItem>
                            <SelectItem value="1h">1 Hour</SelectItem>
                            <SelectItem value="2h">2 Hours</SelectItem>
                            <SelectItem value="4h">4 Hours</SelectItem>
                            <SelectItem value="24h">24 Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-3 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 shrink-0"
                        onClick={() => handleDeny(request)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <X className="h-3.5 w-3.5 mr-1" /> Deny
                          </>
                        )}
                      </Button>
                        <Button
                          size="sm"
                          className="h-10 px-5 text-xs font-bold bg-[#003366] hover:bg-[#002b54] text-white rounded-xl shadow-[0_4px_12px_rgba(0,51,102,0.25)] transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
                          onClick={() => handleGrant(request)}
                          disabled={!duration || isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1.5" /> Grant Access
                            </>
                          )}
                        </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
