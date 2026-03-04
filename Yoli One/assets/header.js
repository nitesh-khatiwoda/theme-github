 /**
 * Yoli Theme - Header JavaScript
 * Handles mobile menu, country/language selection, and locale persistence
 */

// Cookie helper function
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// Mobile Country/Language Selector
function mobileCountryLanguage() {
  // Open mobile country/language panel
  $(document).on("click", "#show-language-and-country, #top-bar-locale-trigger, .mobile-locale-trigger", function(e) {
    e.preventDefault();
    $("#mobile-country-language").addClass("show");
    $("#body-overlay").addClass("show");
  });

  // Close mobile country/language panel
  $(document).on("click", "#close-language-and-country", function() {
    $("#mobile-country-language").removeClass("show");
    $("#mobile-country-language").removeClass("btn-enable");
    $("#body-overlay").removeClass("show");
  });

  // Search functionality for countries and languages
  $(document).on("keyup", ".search-language, .search-country", function() {
    const searchText = $(this).val().toLowerCase();
    const listToSearchSelector = $(this).data("target");
    
    $("." + listToSearchSelector).find("li:not(.current-selected-item)").each(function() {
      const listItem = $(this);
      const itemText = listItem.text().toLowerCase();
      
      if (itemText.indexOf(searchText) === -1) {
        listItem.hide();
      } else {
        listItem.css('display', 'flex');
      }
    });
  });

  // Handle country/language item selection
  $(document).on("click", ".language-item, .country-item", function() {
    const itemHTML = $(this).html();
    const itemIso = $(this).data("value");
    const isLanguageItem = $(this).hasClass('language-item');
    const searchFieldSelector = isLanguageItem ? $('.search-language') : $('.search-country');
    const currentSelectedItemSelector = isLanguageItem ? '#current-selected-language' : '#current-selected-country';
    const isSearchEnabled = searchFieldSelector.val() && searchFieldSelector.val().length > 0;

    // Update selection state
    $(this).siblings("li").removeClass("selected");
    $(this).addClass("selected");
    
    // Enable the save button
    $("#mobile-country-language").addClass("btn-enable");
    
    // Update the current selected item display
    $(this).parent("ul").children(".current-selected-item").html(itemHTML);
    $(this).parent("ul").children(".current-selected-item").attr("data-value", itemIso);

    // Show current selected item if search was active
    if (isSearchEnabled) {
      $(currentSelectedItemSelector).css('display', 'flex');
    }
  });
}

// Tab switching functionality
function tab() {
  $(document).on("click", ".tab-menu-item", function(e) {
    e.preventDefault();
    const tabMenuId = $(this).attr("id");
    const tabContentSelector = $(this).closest(".tab-menu").next(".tab-content");
    
    // Update active class on tab menu item
    $(this).siblings("li").removeClass("active");
    $(this).addClass("active");

    // Show/hide tab content
    tabContentSelector.children("li").css("display", "none");
    tabContentSelector.children("li").removeClass("active");
    tabContentSelector.children("." + tabMenuId + "-content").css("display", "block");
    tabContentSelector.children("." + tabMenuId + "-content").addClass("active");
  });
}

// Save locale selection with FluidCommerceSDK integration
function setCookieCountryAndLanguage() {
  $(document).on('click', '.saveLocaleBtn', async function() {
    let country, language;

    if ($(this).hasClass('mobile-save-btn')) {
      // Mobile selector - get values from data attributes
      country = $(this).closest('.locale-selector').find('.country-selector, #current-selected-country').data("value");
      language = $(this).closest('.locale-selector').find('.language-selector, #current-selected-language').data("value");
    } else {
      // Desktop selector - get values from form inputs
      country = $(this).closest('.locale-selector').find('.country-selector').val();
      language = $(this).closest('.locale-selector').find('.language-selector').val();
    }

    // Ensure we have values
    if (!country) country = getCookie('fluid_country') || 'us';
    if (!language) language = getCookie('fluid_language') || 'en';

    if (window.FluidCommerceSDK) {
      try {
        await window.FluidCommerceSDK.updateLocaleSettings({ country, language });
      } catch (error) {
        console.error("Error updating locale settings:", error);
        // Fallback to cookie storage
        setCookie('fluid_language', language, 365);
        setCookie('fluid_country', country, 365);
      }
    } else {
      // Fallback when FluidCommerceSDK is not available
      setCookie('fluid_language', language, 365);
      setCookie('fluid_country', country, 365);
    }

    // Reload the page to apply changes
    location.href = location.pathname;
  });
}

// Expose saveLocaleBtn function globally for inline scripts
window.saveLocaleBtn = async function(country, language) {
  // Ensure we have values
  if (!country) country = getCookie('fluid_country') || 'us';
  if (!language) language = getCookie('fluid_language') || 'en';

  if (window.FluidCommerceSDK) {
    try {
      await window.FluidCommerceSDK.updateLocaleSettings({ country, language });
    } catch (error) {
      console.error("Error updating locale settings:", error);
      setCookie('fluid_language', language, 365);
      setCookie('fluid_country', country, 365);
    }
  } else {
    setCookie('fluid_language', language, 365);
    setCookie('fluid_country', country, 365);
  }

  location.href = location.pathname;
};

// TomSelect initialization for desktop dropdowns (if present)
function initLanguageDropdowns() {
  if (typeof TomSelect !== 'undefined') {
    if ($("#languages:not(.tomselected)").length) {
      new TomSelect("#languages:not(.tomselected)", {
        allowEmptyOption: false,
        controlInput: null,
      });
    }
    
    if ($("#countries:not(.tomselected)").length) {
      new TomSelect("#countries:not(.tomselected)", {
        allowEmptyOption: false,
        create: false,
        maxItems: 1,
        searchField: ['text'],
        valueField: 'value',
        labelField: 'text',
        maxOptions: null,
        render: {
          option: function(data, escape) {
            return `
              <div class="option-wrapper">
                <div class="option-item">
                  <span class="flag-icon fi fi-${escape(data.flag)}"></span>
                  <span class="country-name">${escape(data.text)}</span>
                </div>
              </div>`;
          },
          item: function(data, escape) {
            return `
              <div class="selected-item">
                <span class="flag-icon fi fi-${escape(data.flag)}"></span>
                <span class="country-name">${escape(data.text)}</span>
              </div>`;
          }
        }
      });
    }
  }
}

// Desktop language dropdown toggle
function initDesktopLanguageDropdown() {
  $(document).on('click', '#show-language-country-dropdown', function() {
    $(this).addClass('active');
    $('#transparent-overlay').addClass('show hide-language-country-dropdown');
  });

  $(document).on('click', '.hide-language-country-dropdown', function() {
    $('#show-language-country-dropdown').removeClass('active');
    $(this).removeClass('show hide-language-country-dropdown');
  });
}

// Fluid banner positioning handler
function addJustNavBar() {
  setTimeout(function() {
    if ($('#fluid-script-banner').length) {
      const bannerHeight = $('#fluid-script-banner').innerHeight();
      const hasBanner = $('#fluid-script-banner').length > 0;
      const bannerTop = parseInt($('#fluid-script-banner').css('top'), 10);
      const top = (hasBanner ? bannerHeight + Math.max(bannerTop, -Math.abs(bannerHeight)) : 0);

      $('body').addClass('banner-is-enable').removeClass('banner-is-removed');
      $('.site-header:not(.media-header)')?.css({ top });
    } else {
      $('.site-header:not(.media-header)').css({ top: 0 });
      $('body').addClass('banner-is-removed').removeClass('banner-is-enable');
    }
  }, 0);
}

// Initialize banner observer
function initBannerObserver() {
  const bannerObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(_mutation) {
      addJustNavBar();
    });
  });

  const domObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.id === 'fluid-script-banner') {
          addJustNavBar();
          const banner = document.getElementById('fluid-script-banner');
          bannerObserver.observe(banner, {
            attributes: true,
            attributeFilter: ['style'],
          });
        }
      });

      mutation.removedNodes.forEach((node) => {
        if (node.id === 'fluid-script-banner') {
          addJustNavBar();
          domObserver.disconnect();
          bannerObserver.disconnect();
        }
      });
    });
  });
  
  domObserver.observe(document.body, { childList: true, subtree: true });
}

// Initialize all header functionality
document.addEventListener("DOMContentLoaded", function() {
  mobileCountryLanguage();
  tab();
  setCookieCountryAndLanguage();
  initLanguageDropdowns();
  initDesktopLanguageDropdown();
  initBannerObserver();
});

