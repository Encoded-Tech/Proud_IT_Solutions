import ContactsInbox from "@/components/admin/ContactInbox";
import { getAllContacts } from "@/lib/server/actions/admin/inbox/inboxActions";
import { connection } from "next/server";


export default async function ContactsPage() {
  await connection();
  const res = await getAllContacts();
  const contacts = res.data || [];

  return <ContactsInbox initialContacts={contacts} />;
}
