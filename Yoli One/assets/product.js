function observeVariantChange(){
  $(document).on('change', 'select.variation-dropdown', function () {
    if ($(this).hasClass('variant-single-dropdown')) {
      return;
    }
    if ($(this).closest('section.product-header-4, .fluid-sidebar-clone').length) {
      return;
    }
    let option_value_ids = [];
    $('select.variation-dropdown:not(.variant-single-dropdown)').each(function () {
      option_value_ids.push($(this).val());
    })
    const url = window.location.href.split('?')[0]
    const data = {
      option_value_ids: option_value_ids,
      subscription_plan:  $('select.subscription-plans-dropdown')?.val()
    };

    if ($('input[name="fluid-checkout-subscribe"]:checked')[0]?.value == 'subscription') {
      data.subscribe = true;
    }
    $.ajax({
      url: url,
      data: data,
      success: function (response) {
        // Parse the response and replace the form with id 'product-form'
        const newForm = $(response).find('section.product-details-section'); // Extract the updated form
        if (newForm.length) {
          $('section.product-details-section').replaceWith(newForm); // Replace the old form
        } else {
          console.error('Updated form not found in the response.');
        }
      },
    })
  });
}

function observeSubscriptionPlanChange() {
  $(document).on('change', '.subscription-plans-dropdown', function () {
     updateSubscriptionPrice()
     updateSubscribeUI()
  });
}

function updateSubscriptionPrice() {
  if ($('.subscription-plans-dropdown').length) {
    const price = $('.subscription-plans-dropdown').find(":selected").data('subscriptionPrice')
    $('.subscription-price').text(price)
  }
}

function observeQuantityChange() {
  $(document).on('click', '#decrease_quantity', () => {
    var oldVal = parseInt($('#quantity').text())
    const chatQuantity = document.getElementById('fluid-checkout-quantity')
    var newVal = oldVal - 1
    if (newVal <= 0) {
      $('#decrease_quantity').removeClass('pointer').addClass('is-disabled')
      $('#add-to-cart-button').addClass('disabled')
    }
    if (oldVal > 0) {
      $('#quantity').text(newVal)
      chatQuantity.value = newVal
      $('#increase_quantity').removeClass('is-disabled').addClass('pointer')
    }
    if ($('[data-fluid-add-to-cart]').length) {
      $('[data-fluid-add-to-cart]')[0].dataset.fluidQuantity = newVal
    }
    outofStockHandler(newVal)
  })

  $(document).on('click', '#increase_quantity', () => {
    var oldVal = parseInt($('#quantity').text())
    const chatQuantity = document.getElementById('fluid-checkout-quantity')
    var newVal = oldVal + 1
    const maxQuantity = chatQuantity.dataset.maxQuantity ? parseInt(chatQuantity.dataset.maxQuantity) : null;

    if (!maxQuantity || (newVal <= maxQuantity)) {
      $('#quantity').text(oldVal + 1)
      chatQuantity.value = newVal
      $('#decrease_quantity').removeClass('is-disabled').addClass('pointer')
      $('#add-to-cart-button').removeClass('disabled')
      if ($('[data-fluid-add-to-cart]').length) {
        $('[data-fluid-add-to-cart]')[0].dataset.fluidQuantity = newVal
      }
    }
    outofStockHandler(newVal)
  })
}

function outofStockHandler(quantity) {
  const chatQuantity = document.getElementById('fluid-checkout-quantity')
  if (!chatQuantity) return;
  const maxQuantity = chatQuantity.dataset.maxQuantity ? parseInt(chatQuantity.dataset.maxQuantity) : null;
  if (maxQuantity && quantity >= maxQuantity) {
    $('.error-message-container').html(`<div class="error-message">This product is out of stock.</div>`)
    $('#increase_quantity').removeClass('pointer').addClass('is-disabled')
  } else {
    $('#increase_quantity').removeClass('is-disabled').addClass('pointer')
    $('.error-message-container').html('')
  }
}

function updateSubscribeUI() {
  let subscribe = $('input[name="fluid-checkout-subscribe"]:checked')[0]?.value == 'subscription';
  let addToCartBtn = document.querySelector("[data-fluid-add-to-cart]");

  if (addToCartBtn) {
    addToCartBtn.setAttribute('data-fluid-subscribe', subscribe ? 'true' : 'false');
  }

  if (subscribe) {
    $('.subscription-plans')?.show();
    if (addToCartBtn) {
      // Use dropdown value when present (multiple plans); else use Subscribe card's plan (single plan, no dropdown)
      const dropdownVal = $('select.subscription-plans-dropdown')?.val();
      const cardPlanId = $('.subscription-option-card[data-option="1"]').attr('data-subscription-plan-id') || '';
      addToCartBtn.dataset.fluidSubscriptionPlanId = (dropdownVal != null && dropdownVal !== '') ? dropdownVal : cardPlanId;
    }
  } else {
    $('.subscription-plans')?.hide();
    if (addToCartBtn) {
      addToCartBtn.dataset.fluidSubscriptionPlanId = '';
    }
  }
}

function observeSubscriptionChange() {
  $(document).on('change', 'input[name="fluid-checkout-subscribe"]', updateSubscribeUI);
}

function accordion(){
  $(document).on("click",".accordion-header",function(e){
    e.preventDefault();
    if($(this).hasClass('active')){
      $(this).removeClass('active')
      $(this).next(".accordion-content").slideUp();
    } else {
      $(this).addClass('active')
      $(this).next(".accordion-content").slideDown();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  updateSubscribeUI();
  updateSubscriptionPrice();
  observeVariantChange();
  observeQuantityChange();
  observeSubscriptionChange();
  observeSubscriptionPlanChange();
  accordion();
  $(document).on("click",".clickable-image",function(e){
    e.preventDefault();
    const sectionID = $(this).data('section-id');
    $(`#imageModal-${sectionID}`).addClass('active');

  });
  $(document).on('click','.modal-close',function(e){
    e.preventDefault();
    const sectionID = $(this).data('section-id');
    $(`#imageModal-${sectionID}`).removeClass('active');
  })
})
