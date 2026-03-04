/**
 * Global JavaScript for SLAPP Theme
 */

// Background Image Handler
document.addEventListener('DOMContentLoaded', function() {
  // Handle data-bg attributes
  const bgElements = document.querySelectorAll('[data-bg]');
  bgElements.forEach(element => {
    const bgUrl = element.getAttribute('data-bg');
    if (bgUrl) {
      element.style.backgroundImage = `url('${bgUrl}')`;
    }
  });
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});

// Mobile Menu Toggle (if needed)
const mobileMenuToggle = document.querySelector('[data-mobile-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (mobileMenuToggle && mobileMenu) {
  mobileMenuToggle.addEventListener('click', function() {
    mobileMenu.classList.toggle('active');
    this.setAttribute('aria-expanded', 
      this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
    );
  });
}

// Add to Cart functionality placeholder
window.addToCart = function(productId, quantity = 1) {
  console.log(`Adding product ${productId} to cart, quantity: ${quantity}`);
  // This will be connected to Fluid's cart API
};

// Newsletter form handler placeholder
const newsletterForms = document.querySelectorAll('[data-newsletter-form]');
newsletterForms.forEach(form => {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    console.log(`Newsletter signup: ${email}`);
    // This will be connected to Fluid's marketing API
  });
});

// Ensure customer account forms are not blocked by overlays or CSS
document.addEventListener('DOMContentLoaded', function() {
  // Make sure customer account login/register forms work properly
  const customerForms = document.querySelectorAll('form[action*="/account"], form[action*="/customers"], form[id*="customer"]');
  customerForms.forEach(form => {
    // Ensure form is visible and clickable
    form.style.pointerEvents = 'auto';
    form.style.opacity = '1';
    form.style.zIndex = '9999';
    form.style.position = 'relative';
    
    // Ensure all inputs and buttons are clickable
    const inputs = form.querySelectorAll('input, button, select, textarea');
    inputs.forEach(input => {
      input.style.pointerEvents = 'auto';
      input.style.cursor = (input.type === 'submit' || input.tagName === 'BUTTON') ? 'pointer' : 'text';
      // Don't modify disabled state - let Shopify handle that
    });
  });
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in-visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements with fade-in class
document.querySelectorAll('.fade-in').forEach(el => {
  observer.observe(el);
});

// Sticky Timeline Steps - Scroll Progress Animation
function initStickyTimeline() {
  const timelineSections = document.querySelectorAll('.sticky-timeline-steps');
  
  timelineSections.forEach(section => {
    // Skip if already initialized
    if (section.dataset.timelineInitialized === 'true') return;
    section.dataset.timelineInitialized = 'true';
    
    const timelineFill = section.querySelector('.timeline-line-fill');
    const steps = section.querySelectorAll('.step-item');
    const rightColumn = section.querySelector('.right-column-timeline');
    const timelineContainer = section.querySelector('.timeline-line-container');
    const leftColumn = section.querySelector('.left-column-sticky');
    
    if (!timelineFill || !steps.length || !rightColumn || !timelineContainer) return;
    
    // Optimize fill element for smooth updates
    timelineFill.style.willChange = 'height';
    timelineFill.style.transform = 'translateZ(0)'; // Force GPU acceleration
    
    // Store initial container position for reliable calculations
    const getContainerBounds = () => {
      const containerRect = timelineContainer.getBoundingClientRect();
      const scrollY = window.scrollY;
      return {
        top: scrollY + containerRect.top,
        bottom: scrollY + containerRect.top + containerRect.height,
        height: containerRect.height
      };
    };
    
    // Function to update timeline based on scroll position
    const updateTimeline = () => {
      const viewportCenter = window.innerHeight / 2;
      const scrollY = window.scrollY;
      const viewportCenterY = scrollY + viewportCenter;
      
      // Get the bounds of the timeline container (the line itself)
      const containerBounds = getContainerBounds();
      
      // Calculate fill percentage based on where viewport center intersects the timeline
      // The fill's bottom edge should always be at the viewport center
      let fillPercentage = 0;
      
      if (viewportCenterY >= containerBounds.top && viewportCenterY <= containerBounds.bottom) {
        // Viewport center is within the timeline - calculate fill based on position
        const progress = (viewportCenterY - containerBounds.top) / containerBounds.height;
        fillPercentage = Math.min(Math.max(progress * 100, 0), 100);
      } else if (viewportCenterY < containerBounds.top) {
        // Viewport center is above the timeline - no fill
        fillPercentage = 0;
      } else {
        // Viewport center is below the timeline - full fill
        fillPercentage = 100;
      }
      
      // Update fill height immediately - bottom edge aligns with viewport center
      // This will decrease when scrolling up and increase when scrolling down
      timelineFill.style.height = `${fillPercentage}%`;
      
      // Calculate the actual fill line position (where the fill ends)
      // This is the precise position where the filled portion of the line reaches
      const fillLinePosition = containerBounds.top + (containerBounds.height * fillPercentage / 100);
      
      // Update step states - mark steps as filled based on whether fill line has reached them
      steps.forEach((step, index) => {
        const stepRect = step.getBoundingClientRect();
        const stepTop = scrollY + stepRect.top;
        // Use the marker circle position for precision - get the circle element
        const markerCircle = step.querySelector('.marker-circle');
        let stepMarkerPosition = stepTop + (stepRect.height / 2); // fallback to step center
        
        if (markerCircle) {
          const markerRect = markerCircle.getBoundingClientRect();
          stepMarkerPosition = scrollY + markerRect.top + (markerRect.height / 2);
        }
        
        // Circle is filled if the fill line has reached or passed the circle's center
        // Circles fill when scrolling down and unfill when scrolling up
        if (fillLinePosition >= stepMarkerPosition) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
    };
    
    // Function to center left column vertically in viewport
    const updateLeftColumnCenter = () => {
      if (!leftColumn) return;
      
      // When sticky, position top at 50vh, then translate up by half element height
      // This centers the element vertically in the viewport
      const viewportCenter = window.innerHeight / 2;
      
      // Set top to viewport center, then translate up by half element height
      // Using CSS calc would be ideal but JavaScript ensures it works reliably
      leftColumn.style.top = `${viewportCenter}px`;
      leftColumn.style.transform = `translateY(-50%)`;
      leftColumn.style.transition = 'none'; // Prevent transition on transform for instant centering
    };
    
    // Scroll handler - update directly for immediate, attached feel
    // Using passive listener so it doesn't block scrolling
    const handleScroll = () => {
      updateTimeline();
      updateLeftColumnCenter();
    };
    
    // Resize handler
    const handleResize = () => {
      updateTimeline();
      updateLeftColumnCenter();
    };
    
    // Initial update
    updateTimeline();
    updateLeftColumnCenter();
    
    // Listen to scroll events - updates happen immediately during scroll
    // Passive listener ensures smooth scrolling performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Store cleanup function
    section._timelineCleanup = () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  });
}

// Initialize horizontal timeline (fills left to right based on vertical scroll)
function initHorizontalTimeline() {
  const timelineSections = document.querySelectorAll('.horizontal-timeline-steps');
  
  timelineSections.forEach(section => {
    // Skip if already initialized
    if (section.dataset.timelineInitialized === 'true') return;
    section.dataset.timelineInitialized = 'true';
    
    const timelineFill = section.querySelector('.timeline-line-fill');
    const steps = section.querySelectorAll('.step-item');
    const timelineContainer = section.querySelector('.timeline-line-container');
    
    if (!timelineFill || !steps.length || !timelineContainer) return;
    
    // Optimize fill element for smooth updates
    timelineFill.style.willChange = 'width';
    timelineFill.style.transform = 'translateZ(0)'; // Force GPU acceleration
    
    // Store initial container position for reliable calculations
    const getContainerBounds = () => {
      const containerRect = timelineContainer.getBoundingClientRect();
      const scrollY = window.scrollY;
      return {
        top: scrollY + containerRect.top,
        bottom: scrollY + containerRect.top + containerRect.height,
        left: scrollY + containerRect.left,
        right: scrollY + containerRect.left + containerRect.width,
        width: containerRect.width
      };
    };
    
    // Function to update timeline based on scroll position
    const updateTimeline = () => {
      const viewportCenter = window.innerHeight / 2;
      const scrollY = window.scrollY;
      const viewportCenterY = scrollY + viewportCenter;
      
      // Get the bounds of the timeline container (the line itself)
      const containerBounds = getContainerBounds();
      
      // Calculate fill percentage based on where viewport center intersects the timeline section
      // The fill's right edge should progress as we scroll down
      let fillPercentage = 0;
      
      if (viewportCenterY >= containerBounds.top && viewportCenterY <= containerBounds.bottom) {
        // Viewport center is within the timeline section - calculate fill based on position
        const progress = (viewportCenterY - containerBounds.top) / (containerBounds.bottom - containerBounds.top);
        fillPercentage = Math.min(Math.max(progress * 100, 0), 100);
      } else if (viewportCenterY < containerBounds.top) {
        // Viewport center is above the timeline - no fill
        fillPercentage = 0;
      } else {
        // Viewport center is below the timeline - full fill
        fillPercentage = 100;
      }
      
      // Update fill width immediately - fills left to right
      timelineFill.style.width = `${fillPercentage}%`;
      
      // Calculate the actual fill line position (where the fill ends horizontally)
      const fillLinePosition = containerBounds.left + (containerBounds.width * fillPercentage / 100);
      
      // Update step states - mark steps as filled based on whether fill line has reached them
      steps.forEach((step, index) => {
        const stepRect = step.getBoundingClientRect();
        const stepLeft = scrollY + stepRect.left;
        const stepCenter = stepLeft + (stepRect.width / 2);
        
        // Circle is filled if the fill line has reached or passed the step's center
        if (fillLinePosition >= stepCenter) {
          step.classList.add('active');
        } else {
          step.classList.remove('active');
        }
      });
    };
    
    // Scroll handler - update directly for immediate, attached feel
    const handleScroll = () => {
      updateTimeline();
    };
    
    // Resize handler
    const handleResize = () => {
      updateTimeline();
    };
    
    // Initial update
    updateTimeline();
    
    // Listen to scroll events - updates happen immediately during scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    
    // Store cleanup function
    section._timelineCleanup = () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initStickyTimeline();
  initHorizontalTimeline();
});

// Re-initialize when Fluid editor makes changes (if applicable)
if (typeof window.Fluid !== 'undefined') {
  document.addEventListener('fluid:section:load', () => {
    initStickyTimeline();
    initHorizontalTimeline();
  });
}

