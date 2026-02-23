import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/knowledge-hub", label: "Knowledge Hub" },
  { href: "/screening/instructions", label: "Screening" },
  { href: "/therapy", label: "Therapy" },
];

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <Link href="/" className="site-footer__brand">
            <span>VA</span>
            <span>
              VisionAI
              <span className="block text-xs font-normal text-slate-300">
                Smart Amblyopia Screening & Therapy
              </span>
            </span>
          </Link>
          <div className="site-footer__links">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="site-footer__cta">
          <p>
            VisionAI is a digital companion for families and clinicians. It does not replace
            professional ophthalmic diagnosis. Always consult a qualified specialist for
            personalised care.
          </p>
          <p>Email: hello@visionai.health · Partnerships: partnerships@visionai.health</p>
        </div>
        <div className="site-footer__bottom">
          <span>© {currentYear} VisionAI. All rights reserved.</span>
          <div className="site-footer__legal">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Clinical Disclaimer</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
