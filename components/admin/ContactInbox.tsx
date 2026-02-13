"use client";

import { useState, useMemo } from "react";
import { ContactDTO } from "@/lib/server/mappers/MapContact";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MailOpen,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Building2,
  CheckCheck,
  Clock,
} from "lucide-react";

import MessageDetailSheet from "./MessageDetailSheet";

interface ContactsInboxProps {
  initialContacts: ContactDTO[];
}

type FilterStatus = "all" | "unread" | "read" | "replied";
type SortBy = "newest" | "oldest" | "unread-first";

const ITEMS_PER_PAGE = 5;

export default function ContactsInbox({ initialContacts }: ContactsInboxProps) {
  const [contacts, setContacts] = useState<ContactDTO[]>(initialContacts);
  const [selectedContact, setSelectedContact] = useState<ContactDTO | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Open message detail and mark as read
  const handleContactClick = (contact: ContactDTO) => {
    setSelectedContact(contact);
    setSheetOpen(true);

    // Mark as read if not already read
    if (!contact.read) {
      handleMarkAsRead(contact.id);
    }
  };

  // Close sheet
  const handleCloseSheet = () => {
    setSheetOpen(false);
    setTimeout(() => setSelectedContact(null), 300);
  };

  // Mark message as read
  const handleMarkAsRead = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId && !c.read) {
          return { ...c, read: true, readAt: new Date().toISOString() };
        }
        return c;
      })
    );

    // Update selected contact as well
    if (selectedContact && selectedContact.id === contactId && !selectedContact.read) {
      setSelectedContact({
        ...selectedContact,
        read: true,
        readAt: new Date().toISOString(),
      });
    }
  };

  // Mark message as replied after successful reply
  const handleReplySuccess = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === contactId && !c.replied) {
          return {
            ...c,
            replied: true,
            repliedAt: new Date().toISOString(),
            read: true,
            readAt: c.readAt || new Date().toISOString(),
          };
        }
        return c;
      })
    );

    // Update selected contact as well
    if (selectedContact && selectedContact.id === contactId && !selectedContact.replied) {
      setSelectedContact({
        ...selectedContact,
        replied: true,
        repliedAt: new Date().toISOString(),
        read: true,
        readAt: selectedContact.readAt || new Date().toISOString(),
      });
    }
  };

  // Filter and search logic
  const filteredContacts = useMemo(() => {
    let filtered = [...contacts];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.subject?.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    // Status filter
    if (filterStatus === "unread") {
      filtered = filtered.filter((c) => !c.read);
    } else if (filterStatus === "read") {
      filtered = filtered.filter((c) => c.read && !c.replied);
    } else if (filterStatus === "replied") {
      filtered = filtered.filter((c) => c.replied);
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === "unread-first") {
      filtered.sort((a, b) => {
        if (!a.read && b.read) return -1;
        if (a.read && !b.read) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return filtered;
  }, [contacts, searchQuery, filterStatus, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Stats
  const unreadCount = contacts.filter((c) => !c.read).length;
  const readCount = contacts.filter((c) => c.read && !c.replied).length;
  const repliedCount = contacts.filter((c) => c.replied).length;
  const totalCount = contacts.length;

  // Format time (Yesterday, Thursday, etc.)
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inbox</h1>
          <p className="text-gray-600">Manage and respond to contact messages</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Messages</p>
                <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Unread</p>
                <p className="text-3xl font-bold text-primary">{unreadCount}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Read</p>
                <p className="text-3xl font-bold text-blue-600">{readCount}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <MailOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Replied</p>
                <p className="text-3xl font-bold text-green-600">{repliedCount}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, subject..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filterStatus}
              onValueChange={(value: FilterStatus) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value: SortBy) => {
                setSortBy(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="unread-first">Unread First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {paginatedContacts.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => handleContactClick(contact)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !contact.read ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        contact.replied
                          ? "bg-green-100 text-green-600"
                          : !contact.read
                          ? "bg-primary text-white"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {!contact.read ? (
                        <Mail className="h-5 w-5" />
                      ) : contact.replied ? (
                        <CheckCheck className="h-5 w-5" />
                      ) : (
                        <MailOpen className="h-5 w-5" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`font-semibold text-gray-900 ${
                              !contact.read ? "font-bold" : ""
                            }`}
                          >
                            {contact.name}
                          </h3>
                          {contact.read && contact.replied ? (
                            <Badge className="bg-green-50 text-green-700 border-green-200">
                              <CheckCheck className="h-3 w-3 mr-1" />
                              Replied
                            </Badge>
                          ) : contact.read ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <MailOpen className="h-3 w-3 mr-1" />
                              Read
                            </Badge>
                          ) : (
                            <Badge className="bg-primary text-white">
                              <Mail className="h-3 w-3 mr-1" />
                              Unread
                            </Badge>
                          )}
                        </div>
                        <span className="text-sm text-gray-500 flex-shrink-0 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatMessageTime(contact.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span>{contact.email}</span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </span>
                        {contact.organization && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {contact.organization}
                          </span>
                        )}
                      </div>

                      {contact.subject && (
                        <p
                          className={`text-sm mb-1 ${
                            !contact.read ? "font-semibold text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {contact.subject}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {contact.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredContacts.length)} of{" "}
              {filteredContacts.length} messages
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-10"
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Sheet */}
      {selectedContact && (
        <MessageDetailSheet
          contact={selectedContact}
          open={sheetOpen}
          onClose={handleCloseSheet}
          onReplySuccess={handleReplySuccess}
        />
      )}
    </div>
  );
}