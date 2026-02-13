import { IContact } from "@/models/contactModel";

export interface ContactDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject?: string;
  description: string;
  organization?: string;
  createdAt: string;
  replied?: boolean;
  repliedAt?: string;
  read?: boolean;
  readAt?: string;
}

export function mapContactToDTO(contact: IContact): ContactDTO {
  return {
    id: contact._id.toString(),
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    subject: contact.subject || "",
    description: contact.description,
    organization: contact.organization || "",
    createdAt: contact.createdAt?.toISOString() || "",
    replied: contact.replied || false,
    repliedAt: contact.repliedAt?.toISOString() || "",
    read: contact.read || false,
    readAt: contact.readAt?.toISOString() || "",
  };
}
