"use client";

import { useState, useEffect } from "react";
import { ContactDTO } from "@/lib/server/mappers/MapContact";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Mail,
  Phone,
  Building2,
  Calendar,
  CheckCheck,
  Send,
  Loader2,
  X,
  Reply,
  MailOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { replyToContactAction, markContactAsRead } from "@/lib/server/actions/admin/inbox/inboxActions";
import toast from "react-hot-toast";

interface MessageDetailSheetProps {
  contact: ContactDTO;
  open: boolean;
  onClose: () => void;
  onReplySuccess: (contactId: string) => void;
}

export default function MessageDetailSheet({
  contact,
  open,
  onClose,
  onReplySuccess,
}: MessageDetailSheetProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubject, setReplySubject] = useState(
    contact.subject ? `Re: ${contact.subject}` : "Re: Your inquiry"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mark as read when sheet opens
  useEffect(() => {
    if (open && !contact.read) {
      markContactAsRead(contact.id).catch((error) => {
        console.error("Failed to mark as read:", error);
      });
    }
  }, [open, contact.id, contact.read]);

  const handleSubmitReply = async () => {
    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("contactId", contact.id);
    formData.append("replyMessage", replyMessage);
    formData.append("subject", replySubject);

    try {
      const result = await replyToContactAction(formData);

      if (result.success) {
        toast.success("Reply sent successfully");
        setShowReplyForm(false);
        setReplyMessage("");
        onReplySuccess(contact.id);
      } else {
        toast.error(result.message || "Failed to send reply");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-3xl p-0 flex flex-col h-full overflow-hidden">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-2xl mb-1">{contact.name}</SheetTitle>
                  <SheetDescription className="text-sm">
                    {formatDistanceToNow(new Date(contact.createdAt), { addSuffix: true })}
                  </SheetDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {contact.replied && contact.repliedAt ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
                    <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
                    Replied
                  </Badge>
                ) : contact.read && contact.readAt ? (
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100">
                    <MailOpen className="h-3.5 w-3.5 mr-1.5" />
                    Read
                  </Badge>
                ) : (
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Unread
                  </Badge>
                )}
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6 space-y-6">
            {/* Contact Information Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm font-medium text-primary hover:underline truncate block"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                {contact.organization && (
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">Organization</p>
                      <p className="text-sm font-medium text-gray-900">{contact.organization}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">Received</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(contact.createdAt)}</p>
                  </div>
                </div>

                {contact.readAt && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50/50 border border-blue-200">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MailOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-600 mb-0.5">Read</p>
                      <p className="text-sm font-medium text-blue-700">
                        {formatDate(contact.readAt)}
                      </p>
                    </div>
                  </div>
                )}

                {contact.repliedAt && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50/50 border border-green-200">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <CheckCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-green-600 mb-0.5">Reply Sent</p>
                      <p className="text-sm font-medium text-green-700">
                        {formatDate(contact.repliedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Subject */}
            {contact.subject && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Subject
                </h3>
                <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {contact.subject}
                </p>
              </div>
            )}

            {/* Message */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                Message
              </h3>
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-base">
                  {contact.description}
                </p>
              </div>
            </div>

            {/* Reply Form - Inside scrollable area */}
            {showReplyForm && (
              <div className="space-y-4 pb-6">
                <Separator />
                
                <div className="bg-blue-50/50 border-2 border-blue-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Send className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Compose Reply</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyMessage("");
                      }}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="replySubject" className="text-sm font-medium">
                        Subject
                      </Label>
                      <Input
                        id="replySubject"
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        placeholder="Reply subject"
                        className="mt-1.5 h-11 bg-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="replyMessage" className="text-sm font-medium">
                        Your Message
                      </Label>
                      <Textarea
                        id="replyMessage"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply here..."
                        rows={8}
                        className="mt-1.5 resize-none bg-white"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          {replyMessage.length} / 2000 characters
                        </p>
                        {replyMessage.length > 1900 && (
                          <p className="text-xs text-orange-600 font-medium">
                            {2000 - replyMessage.length} characters remaining
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSubmitReply}
                        disabled={isSubmitting || !replyMessage.trim()}
                        className="flex-1 h-11 font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending Reply...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReplyForm(false);
                          setReplyMessage("");
                        }}
                        disabled={isSubmitting}
                        className="h-11"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed (only show when reply form is NOT open) */}
        {!showReplyForm && (
          <div className="flex-shrink-0 px-6 py-4 border-t bg-gray-50">
            <Button
              onClick={() => setShowReplyForm(true)}
              className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              size="lg"
              disabled={contact.replied}
            >
              <Reply className="h-5 w-5 mr-2" />
              {contact.replied ? "Already Replied" : `Reply to ${contact.name.split(" ")[0]}`}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}