"use client";
import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Github,
  FileText,
  Code,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { FooterBackgroundGradient, TextHoverEffect } from "@/components/ui/hover-footer";

function HoverFooter() {
  // Footer link data customized for TaskFlow
  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Task Management", href: "#tasks" },
        // { label: "Features", href: "#features" },
        // { label: "Security", href: "#security" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#docs", external: true },
        { label: "API Reference", href: "#api" },
        {
          label: "Live Demo",
          href: "/dashboard",
          pulse: true,
        },
        // { label: "GitHub", href: "https://github.com", external: true },
      ],
    },
  ];

  // Contact info data
  const contactInfo = [
    {
      icon: <Mail size={18} className="text-[#3ca2fa]" />,
      text: "hello@taskflow.com",
      href: "mailto:hello@taskflow.com",
    },
    {
      icon: <Github size={18} className="text-[#3ca2fa]" />,
      text: "https://github.com",
      href: "https://github.com",
    },
    {
      icon: <MapPin size={18} className="text-[#3ca2fa]" />,
      text: "Built with ❤️ using Next.js",
    },
  ];

  // Social/community icons
  const socialLinks = [
    { icon: <Github size={20} />, label: "GitHub", href: "https://github.com/WasayBaig10" },
    { icon: <MessageCircle size={20} />, label: "Discord", href: "#" },
    { icon: <Code size={20} />, label: "GitHub", href: "#" },
    { icon: <ExternalLink size={20} />, label: "Website", href: "#" },
  ];

  return (
    <footer className="font-comfortaa bg-gray-100 dark:bg-[#0F0F11]/10 relative h-fit rounded-3xl overflow-hidden m-4 sm:m-6 lg:m-8">
      <div className=" max-w-7xl mx-auto p-8 sm:p-12 lg:p-14 z-40 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-8 lg:gap-12 pb-8 lg:pb-12">
          {/* Brand section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="font-lobster_two text-gray-900 dark:text-white text-2xl sm:text-3xl font-bold">TaskFlow</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
              Modern task management with beautiful UI/UX, dark mode, and seamless animations.
            </p>
          </div>

          {/* Footer link sections */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-gray-900 dark:text-white text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                {section.title}
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link.label} className="relative">
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 dark:text-gray-400 hover:text-[#3ca2fa] dark:hover:text-[#3ca2fa] transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="text-gray-600 dark:text-gray-400 hover:text-[#3ca2fa] dark:hover:text-[#3ca2fa] transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    )}
                    {link.pulse && (
                      <span className="absolute top-1 right-[-10px] w-2 h-2 rounded-full bg-[#3ca2fa] animate-pulse"></span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact section */}
          <div>
            <h4 className="text-gray-900 dark:text-white text-base sm:text-lg font-semibold mb-4 sm:mb-6">
              Connect
            </h4>
            <ul className="space-y-3 sm:space-y-4">
              {contactInfo.map((item, i) => (
                <li key={i} className="flex items-center space-x-3">
                  {item.icon}
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href?.startsWith('http') ? '_blank' : undefined}
                      rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-gray-600 dark:text-gray-400 hover:text-[#3ca2fa] dark:hover:text-[#3ca2fa] transition-colors text-sm"
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      {item.text}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-t border-gray-300 dark:border-gray-700 my-6 sm:my-8" />

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs sm:text-sm space-y-4 md:space-y-0">
          {/* Social icons */}
          <div className="flex space-x-4 sm:space-x-6 text-gray-600 dark:text-gray-400">
            {socialLinks.map(({ icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#3ca2fa] dark:hover:text-[#3ca2fa] transition-colors"
              >
                {icon}
              </a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-center md:text-left text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
          </p>
        </div>
      </div>

      {/* Text hover effect - hidden on smaller screens */}
      <div className="hidden lg:flex h-[25rem] -mt-48 -mb-32 xl:h-[30rem] xl:-mt-52 xl:-mb-36">
        <TextHoverEffect text="T-Flow" className="z-50" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}

export default HoverFooter;
