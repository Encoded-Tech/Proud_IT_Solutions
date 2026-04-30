import { Icon } from "@iconify/react/dist/iconify.js";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "@/components/ui/optimized-image";
import Link from "next/link";
import NewsletterSubscriptionForm from "@/components/client/NewsletterSubscriptionForm";

const CURRENT_YEAR = new Date().getUTCFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white shadow-sm">
      <div className="mx-4 max-w-7xl py-12 xl:mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="mb-4 flex items-center">
              <figure>
                <Image
                  src="/logo/logomain.png"
                  alt="logo"
                  width={1000}
                  height={1000}
                  className="w-20 object-contain md:w-40"
                />
              </figure>
            </div>
            <p className="mb-6 max-w-sm text-sm leading-6 text-zinc-600">
              Your premier destination for accessories, performance gear, and dependable support.
            </p>

            <div className="space-y-3 text-sm text-zinc-700">
              <div className="flex items-center">
                <Phone className="mr-3 h-4 w-4 text-red-500" />
                <span>+977-9867174242</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-3 h-4 w-4 text-red-500" />
                <span>proudnepalits@gmail.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-3 h-4 w-4 text-red-500" />
                <span>Kathmandu, Nepal</span>
              </div>
            </div>

            <div className="mt-10 flex justify-start space-x-4">
              <Link href="https://www.facebook.com/proudnepal" target="_blank">
                <Icon icon="logos:facebook" width="30" height="30" />
              </Link>
              <Link href="https://www.instagram.com/proudnepalit" target="_blank">
                <Icon icon="skill-icons:instagram" width="30" height="30" />
              </Link>
              <Link href="https://wa.me/9779867174242" target="_blank">
                <Icon icon="logos:whatsapp-icon" width="30" height="30" />
              </Link>
              <Link
                href="https://www.youtube.com/@proudnepalitsupplierspvtltd"
                target="_blank"
              >
                <Icon icon="logos:youtube-icon" width="30" height="30" />
              </Link>
              <Link href="https://www.tiktok.com/@shyamlalregmi5?lang=en" target="_blank">
                <Icon icon="logos:tiktok-icon" width="30" height="30" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 font-semibold">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/shop?category=headset" className="text-sm transition-colors hover:text-primary">
                  Headsets
                </Link>
              </li>
              <li>
                <Link href="/shop?category=monitor" className="text-sm transition-colors hover:text-primary">
                  Monitors
                </Link>
              </li>
              <li>
                <Link href="/shop?category=printers" className="text-sm transition-colors hover:text-primary">
                  Printers
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="mb-4 font-semibold">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm transition-colors hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/build-my-pc" className="text-sm transition-colors hover:text-primary">
                  Build My PC
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-1">
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-sm transition-colors hover:text-primary">
                  Promotions
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3 lg:justify-self-end">
            <NewsletterSubscriptionForm />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="mx-4 max-w-7xl py-6 xl:mx-auto">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="text-center text-sm lg:text-left">
              &copy; {CURRENT_YEAR} Proud Nepal. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-2 text-sm">Designed and Developed by EncodedTech</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
