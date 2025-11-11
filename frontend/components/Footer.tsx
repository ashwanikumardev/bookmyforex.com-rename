import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">BookMyForex</h3>
            <p className="text-sm mb-4">
              India's most trusted forex marketplace. Get the best exchange rates for currency, forex cards, and international money transfers.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
              <li><Link href="/rates" className="hover:text-primary-400 transition-colors">Live Rates</Link></li>
              <li><Link href="/buy-currency" className="hover:text-primary-400 transition-colors">Buy Currency</Link></li>
              <li><Link href="/forex-card" className="hover:text-primary-400 transition-colors">Forex Card</Link></li>
              <li><Link href="/send-money" className="hover:text-primary-400 transition-colors">Send Money</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-primary-400 transition-colors">Help Center</Link></li>
              <li><Link href="/faq" className="hover:text-primary-400 transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-primary-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Business Park, Mumbai, Maharashtra 400001, India</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+91 1800-123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>support@bookmyforex.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} BookMyForex. All rights reserved.</p>
          <p className="mt-2 text-gray-500">
            RBI Authorized | Secure Transactions | Best Rate Guarantee
          </p>
        </div>
      </div>
    </footer>
  );
}
