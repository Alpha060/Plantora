"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ChangePasswordDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ChangePasswordDialog({ trigger, open: controlledOpen, onOpenChange: setControlledOpen }: ChangePasswordDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = setControlledOpen || setInternalOpen;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Password changed successfully!");
      setOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger render={trigger as any} />
      ) : controlledOpen === undefined ? (
        <DialogTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
          <Lock className="h-4 w-4" />
          Change Password
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-emerald-600" />
            Change Password
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="current-password" className="text-sm font-medium">
              Current Password
            </Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">Minimum 8 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Changing...</>
            ) : (
              "Update Password"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
