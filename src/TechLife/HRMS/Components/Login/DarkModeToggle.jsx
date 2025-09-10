// DarkModeToggle.jsx
import React from 'react';
import './DarkModeToggle.css';

const DarkModeToggle = ({ isDark, onToggle }) => {
  return (
    <button
      className={`dark-mode-toggle ${isDark ? 'dark' : 'light'}`}
      onClick={onToggle}
      aria-label="Toggle dark mode"
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          <svg 
            className="moon-icon" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path 
              d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0784 17.4784 15.0784C12.7838 15.0784 9.0784 11.373 9.0784 6.67844C9.0784 5.22675 9.43789 3.85661 10.0784 2.65686C6.80891 3.85661 4.5 7.06943 4.5 10.8284C4.5 15.523 8.20538 19.2284 12.9 19.2284C16.6589 19.2284 19.8717 16.9195 21.0715 13.65C21.0001 13.7784 20.7607 14.0078 21.5 14.0784Z" 
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </button>
  );
};

export default DarkModeToggle;
