import React from 'react';

const SectionHeading = ({ title, subtitle, align = 'center' }) => (
  <header className={`section-heading section-heading--${align}`}>
    <h2>{title}</h2>
    {subtitle && <p>{subtitle}</p>}
  </header>
);

export default SectionHeading;
