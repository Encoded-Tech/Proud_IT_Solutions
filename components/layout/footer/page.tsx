import { Icon } from "@iconify/react/dist/iconify.js";
import { Mail, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 shadow-sm">
      {/* Main Footer Content */}
      <div className="max-w-7xl xl:mx-auto mx-4  py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <figure>
                <Image
                  src="/logo/logomain.png"
                  alt="logo"
                  width={1000}
                  height={1000}
                  className="object-contain md:w-40 w-20"
                />
              </figure>
            </div>
            <p className=" mb-6 max-w-sm">
              Your premier destination for accessories.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-3 " />
                <span className="text-sm">+977-9867174242</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-3 " />
                <span className="text-sm">proudnepalits@gmail.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-3 " />
                <span className="text-sm">Kathmandu , Nepal</span>
              </div>
            </div>

            {/* Social Media & App Downloads */}
            <div className="mt-12 ">
                {/* Social Media */}
                <div className="flex  justify-start space-x-4">
                  <Link href="#">
                    <Icon icon="logos:facebook" width="30" height="30" />{" "}
                  </Link>

                  <Link href="#">
                    <Icon icon="skill-icons:instagram" width="30" height="30" />{" "}
                  </Link>
                  <Link href="#">
                    <Icon icon="logos:whatsapp-icon" width="30" height="30" />
                  </Link>
                </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className=" font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shop"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Headsets
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Keyboards
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Mouse
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className=" font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Shipping Info
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="text-sm hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className=" font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/blogs"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Blogs
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl xl:mx-auto mx-4  py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="text-sm  text-center lg:text-left">
              © {new Date().getFullYear()} Proud Nepal. All rights reserved.
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm  mr-2">
                Designed and Developed by EncodedTech
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
