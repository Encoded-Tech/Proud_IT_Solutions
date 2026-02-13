import ContactsInbox from "@/components/admin/ContactInbox";
import { getAllContacts } from "@/lib/server/actions/admin/inbox/inboxActions";


export default async function ContactsPage() {
  const res = await getAllContacts();
  const contacts = res.data || [];

  return <ContactsInbox initialContacts={contacts} />;
}