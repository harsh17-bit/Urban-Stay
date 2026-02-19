import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { label: "About Us", href: "#about" },
    { label: "Contact", href: "#contact" },
    { label: "Careers", href: "#careers" },
    { label: "Blog", href: "#blog" },
  ];

  const serviceLinks = [
    { label: "Buy Property", href: "/properties?listingType=buy" },
    { label: "Rent Property", href: "/properties?listingType=rent" },
    { label: "Post Property", href: "/post-property" },
  ];

  const socialLinks = [
    { icon: FiFacebook, href: "#", label: "Facebook" },
    { icon: FiTwitter, href: "#", label: "Twitter" },
    { icon: FiInstagram, href: "#", label: "Instagram" },
    { icon: FiLinkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-300 mt-20 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[var(--color-primary)]/8 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[var(--color-accent)]/8 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex-shrink-0 group">
            <h1 className="text-2xl font-bold">
              <span className="brand-gradient">Urban</span>
              <span className="brand-accent">Stay</span>
            </h1>
          </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your trusted platform to buy, rent, and sell properties across India.
              We make finding your dream home simple and seamless.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-[var(--color-primary)] hover:text-white hover:border-transparent hover:scale-110 transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 relative">
              Company
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-[var(--color-accent)] rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--color-accent)] transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-[var(--color-accent)] transition-all duration-300 group-hover:w-2 rounded-full"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 relative">
              Services
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-[var(--color-accent)] rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-[var(--emerald)] transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-[var(--emerald)] transition-all duration-300 group-hover:w-2 rounded-full"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-5 relative">
              Get In Touch
              <span className="absolute -bottom-1 left-0 w-8 h-0.5 bg-[var(--color-accent)] rounded-full"></span>
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:support@urbanstay.com"
                  className="flex items-center gap-3 text-gray-400 hover:text-[var(--color-accent)] transition-colors duration-300 text-sm group"
                >
                  <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-[var(--color-primary)]/15 group-hover:border-[var(--color-primary)]/25 transition-all duration-300">
                    <FiMail className="w-4 h-4" />
                  </span>
                  support@urbanstay.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919878854312"
                  className="flex items-center gap-3 text-gray-400 hover:text-[var(--color-accent)] transition-colors duration-300 text-sm group"
                >
                  <span className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-[var(--color-primary)]/15 group-hover:border-[var(--color-primary)]/25 transition-all duration-300">
                    <FiPhone className="w-4 h-4" />
                  </span>
                  +91 98788 54312
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center sm:text-left">
              © {currentYear} <span className="text-gray-400">UrbanStay.com</span>. All rights reserved.
            </p>
            
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
