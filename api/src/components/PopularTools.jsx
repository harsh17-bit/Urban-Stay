import { Link } from 'react-router-dom';
import './PopularTools.css';

const TOOLS = [
  {
    title: 'EMI Calculator',
    desc: 'Calculate your home loan EMI',
    href: '/emi-calculator',
  },
  {
    title: 'Home Interior',
    desc: 'Design your dream home interior',
    href: '/home-interior',
  },
  {
    title: 'Loan Eligibility',
    desc: 'See what you can borrow for your home',
    href: 'loan-eligibility',
  },
  {
    title: 'Area Converter',
    desc: 'Convert one area into any other easily',
    href: 'area-converter',
  },
];

const PopularTools = () => {
  return (
    <section className="popular-tools">
      <div className="popular-tools-container">
        <h2 className="popular-tools-title">Use popular tools</h2>
        <p className="popular-tools-subtitle">Go from browsing to buying</p>
        <div className="popular-tools-grid">
          {TOOLS.map((tool) =>
            tool.href.startsWith('/') ? (
              <Link
                key={tool.title}
                to={tool.href}
                className="popular-tools-card"
              >
                <h3 className="popular-tools-card-title">{tool.title}</h3>
                <p className="popular-tools-card-desc">{tool.desc}</p>
              </Link>
            ) : (
              <a
                key={tool.title}
                href={tool.href}
                className="popular-tools-card"
              >
                <h3 className="popular-tools-card-title">{tool.title}</h3>
                <p className="popular-tools-card-desc">{tool.desc}</p>
              </a>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default PopularTools;
