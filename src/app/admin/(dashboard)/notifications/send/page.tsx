"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function AdminNotificationsSendPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("promo");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), message: message.trim(), type, target }),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Notification sent to ${json.sent} users`);
        router.push("/admin/notifications");
      } else {
        toast.error(json.error || "Failed to send");
      }
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/notifications">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-serif text-gray-900 tracking-tight">Broadcast Notification</h1>
          <p className="text-sm text-muted-foreground mt-1">Send a notification to platform users</p>
        </div>
      </div>

      <Card className="shadow-sm border-gray-100">
        <CardHeader className="border-b bg-gray-50/50">
          <CardTitle className="text-base">Compose</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input placeholder="e.g. Weekend Sale — 20% off!" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Message *</Label>
            <textarea
              className="flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Write your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => { if (v) setType(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="promo">Promo</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={target} onValueChange={(v) => { if (v) setTarget(v); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="buyers">Buyers Only</SelectItem>
                  <SelectItem value="sellers">Sellers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleSend}
            disabled={sending}
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send Notification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
