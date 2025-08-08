import React, { useState } from 'react';
import type { ReactNode } from 'react';
import './CollapsibleSection.css';

interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (!disabled) {
      setIsExpanded(prev => !prev);
    }
  };

  return (
    <div className={`collapsible-section ${disabled ? 'disabled' : ''}`}>
      <button
        className={`collapsible-header ${isExpanded ? 'expanded' : 'collapsed'}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isExpanded}
        aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
        type="button"
      >
        <span className="section-title">{title}</span>
        <span className={`chevron ${isExpanded ? 'up' : 'down'}`}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </button>
      
      <div
        id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
        className={`collapsible-content ${isExpanded ? 'expanded' : 'collapsed'}`}
        aria-hidden={!isExpanded}
      >
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};
