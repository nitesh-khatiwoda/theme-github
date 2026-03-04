/**
 * Interactive Component JavaScript
 * Handles expand/collapse functionality for interactive items
 */

(function() {
  'use strict';

  /**
   * Initialize interactive component
   * @param {HTMLElement} section - The section element
   */
  function initInteractiveComponent(section) {
    // Check if already initialized
    if (section.dataset.interactiveInitialized === 'true') {
      return;
    }
    
    section.dataset.interactiveInitialized = 'true';
    
    const items = section.querySelectorAll('[data-interactive-item]');
    
    if (items.length === 0) {
      return;
    }
    
    items.forEach((item, index) => {
      const header = item.querySelector('.interactive-item-header');
      const content = item.querySelector('.interactive-item-content');
      
      if (!header || !content) {
        return;
      }
      
      // Click handler
      const handleClick = (e) => {
        e.preventDefault();
        toggleItem(item, header, content);
      };
      
      // Keyboard handler (Enter and Space)
      const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleItem(item, header, content);
        }
      };
      
      header.addEventListener('click', handleClick);
      header.addEventListener('keydown', handleKeyDown);
      
      // Set initial ARIA attributes
      header.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
    });
  }
  
  /**
   * Toggle item open/closed state
   * @param {HTMLElement} item - The item element
   * @param {HTMLElement} header - The header element
   * @param {HTMLElement} content - The content element
   */
  function toggleItem(item, header, content) {
    const isActive = item.classList.contains('active');
    
    if (isActive) {
      // Close item
      item.classList.remove('active');
      header.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
    } else {
      // Open item
      item.classList.add('active');
      header.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
      
      // Optional: Close other items (accordion behavior)
      // Uncomment the following lines if you want accordion behavior
      /*
      const section = item.closest('[data-interactive-component]');
      if (section) {
        const allItems = section.querySelectorAll('[data-interactive-item]');
        allItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            const otherHeader = otherItem.querySelector('.interactive-item-header');
            const otherContent = otherItem.querySelector('.interactive-item-content');
            if (otherHeader && otherContent) {
              otherItem.classList.remove('active');
              otherHeader.setAttribute('aria-expanded', 'false');
              otherContent.setAttribute('aria-hidden', 'true');
            }
          }
        });
      }
      */
    }
  }
  
  /**
   * Initialize all interactive components on page load
   */
  function initAllInteractiveComponents() {
    const sections = document.querySelectorAll('[data-interactive-component]');
    sections.forEach((section) => {
      initInteractiveComponent(section);
    });
  }
  
  // Initialize on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllInteractiveComponents);
  } else {
    initAllInteractiveComponents();
  }
  
  // Support for Fluid editor dynamic loading
  if (typeof window.Fluid !== 'undefined') {
    document.addEventListener('fluid:section:load', function(e) {
      const section = e.detail?.section;
      if (section && section.querySelector('[data-interactive-component]')) {
        initInteractiveComponent(section.querySelector('[data-interactive-component]'));
      }
    });
  }
  
  // Also listen for general section loads (for compatibility)
  document.addEventListener('DOMContentLoaded', function() {
    // Re-initialize in case sections were added dynamically
    setTimeout(initAllInteractiveComponents, 100);
  });
  
})();

