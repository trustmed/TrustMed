import { useState } from 'react';
import { ShieldAlert, Clock, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MedicalRecord } from '@/types/medical-records';
import { ConsentRequest, ConsentRequestsApi } from '@/lib/api/consentRequests';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  record: MedicalRecord;
  pendingRequest?: ConsentRequest;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AcceptRequestModal({ record, pendingRequest, open, onClose, onSuccess }: Props) {
  const [duration, setDuration] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!pendingRequest) return null;

  const handleGrant = async () => {
    if (!duration) return;
    setIsSubmitting(true);
    try {
      await ConsentRequestsApi.acceptRequest(pendingRequest.id, duration);
      onSuccess();
    } catch (error) {
      console.error('Failed to accept request', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeny = async () => {
    setIsSubmitting(true);
    try {
      await ConsentRequestsApi.rejectRequest(pendingRequest.id);
      onSuccess();
    } catch (error) {
      console.error('Failed to reject request', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const requesterName = record.requestStatus?.createdBy || "A doctor or hospital";
  const requestedAt = record.requestStatus?.createdAt ? new Date(record.requestStatus.createdAt).toLocaleString() : '';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 dark:bg-red-900/40 rounded-full">
              <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-xl">Grant Access</DialogTitle>
              <DialogDescription className="mt-1">
                {requesterName} is requesting access to your record.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Requested Record
            </h4>
            <p className="text-sm text-neutral-500 mt-1 truncate">
              {record.fileName || "No title"}
            </p>
            {requestedAt && (
              <p className="text-[11px] text-neutral-400 mt-2">
                Requested on: {requestedAt}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Select Access Duration
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="How long should they have access?" />
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
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={handleDeny}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" /> Deny
          </Button>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleGrant}
            disabled={!duration || isSubmitting}
          >
            <Check className="w-4 h-4 mr-2" /> Grant Access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
