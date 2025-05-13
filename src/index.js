function initNav() {
  function createObserver(targetSelector, callback) {
    const targetNodes = $(targetSelector);
    targetNodes.each(function () {
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            callback(mutation.target);
          }
        });
      });
      observer.observe(this, { attributes: true, attributeFilter: ['class'] }); // Pass the DOM node directly
    });
  }

  // Open Logic
  let scrollPosition;
  let menuOpen = false;
  let navBg = $('.nav_wrap-bg');
  const disableScroll = () => {
    if (!menuOpen) {
      scrollPosition = $(window).scrollTop();
      $('html, body').scrollTop(0).addClass('overflow-hidden');
      navBg.show();
    } else {
      $('html, body').scrollTop(scrollPosition).removeClass('overflow-hidden');
      navBg.hide();
    }
    menuOpen = !menuOpen;
  };

  // Create observers for the elements with their respective callbacks
  createObserver('.w-nav-button', disableScroll);
}
function runFSSort() {
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      listInstances.forEach((listInstance) => {
        listInstance.addHook('start', (items) => {
          let trigger = $('[fs-list-element="sort-trigger"]');
          if (trigger.length) {
            trigger[0].click();
          }
        });

        // Trigger the lifecycle to start
        listInstance.triggerHook('start');
      });
    },
  ]);
}
function initTags() {
  $('[data-partner-slug]').each(function () {
    let partnerSlug = $(this).attr('data-partner-slug');
    let useCases = $(this).find('[data-use-cases]');
    let buildingBlocks = $(this).find('[data-building-blocks]');
    let vehicleTypes = $(this).find('[data-vehicle-types]');

    if (partnerSlug !== '') {
      useCases.load(`/partner/${partnerSlug} #use-cases-list`);
      buildingBlocks.load(`/partner/${partnerSlug} #building-blocks-list`);
      vehicleTypes.load(`/partner/${partnerSlug} #vehicle-types-list`);
    }
  });
}
function animateLogos() {
  $('.logos_wrap').each(function () {
    let items = $(this).find('.logo_menu-item');
    let lists = $(this).find('.logos_list');
    const totalItems = items.length;
    let currentIndex = 0;
    let timer;

    function animateNext(nextIndex) {
      clearTimeout(timer);

      if (nextIndex === undefined) {
        nextIndex = (currentIndex + 1) % totalItems;
      }

      items.removeClass('is-active');
      lists.removeClass('active');

      items.eq(nextIndex).addClass('is-active');
      lists.eq(nextIndex).addClass('active');

      currentIndex = nextIndex;

      timer = setTimeout(function () {
        animateNext();
      }, 4000);
    }

    items.on('click', function () {
      const clickedIndex = $(this).index(items);
      animateNext(clickedIndex);
    });

    animateNext(0);
  });
}
function animateTabs() {
  // Configuration
  var config = {
    activeClass: 'is-active',
    animDuration: 0.2,
    mobileBreakpoint: 991,
  };

  var tabContainers = [];

  // Tab Container Class
  function TabContainer($container) {
    this.$el = $container;
    this.$tabItems = $container.find('[data-tab-item]');
    this.$tabVisuals = $container.find('[data-tab-visual]');
    this.isAnimating = false;
    this.pendingTab = null;
    this.isMobile = window.innerWidth <= config.mobileBreakpoint;

    // Initialize if we have tab items
    if (this.$tabItems.length > 0) {
      this.init();
    }
  }

  // Initialize the tab container
  TabContainer.prototype.init = function () {
    var self = this;

    // Find active tab or use first tab
    var $activeTab =
      this.$tabItems.filter('.' + config.activeClass).length > 0
        ? this.$tabItems.filter('.' + config.activeClass)
        : this.$tabItems.first();

    $activeTab.addClass(config.activeClass);

    // Initialize visuals
    if (this.$tabVisuals.length > 0) {
      var activeValue = $activeTab.attr('data-tab-item');
      this.$tabVisuals.hide().css('opacity', 0);
      this.$tabVisuals
        .filter('[data-tab-visual="' + activeValue + '"]')
        .show()
        .css('opacity', 1);
    }

    // Set initial heights
    this.setTabHeights($activeTab);

    // Bind event handlers
    this.bindEvents();
  };

  // Set tab content heights
  TabContainer.prototype.setTabHeights = function ($activeTab) {
    // Set all tabs to height 0
    this.$tabItems
      .not('.' + config.activeClass)
      .find('[data-tab-content]')
      .css('height', '0');

    // Set active tab to auto height
    $activeTab.find('[data-tab-content]').css('height', 'auto');
  };

  // Bind event handlers based on screen size
  TabContainer.prototype.bindEvents = function () {
    var self = this;

    // Remove existing event handlers
    this.$tabItems.off('mouseenter click');

    if (this.isMobile) {
      // Mobile event handling (click only)
      this.$tabItems.on('click', function (e) {
        var $clickedTab = $(this);
        var $tabLink = $clickedTab.find('a');

        if ($clickedTab.hasClass(config.activeClass) && $tabLink.length > 0) {
          return true; // Allow link click if tab already active
        }

        e.preventDefault();

        if (self.isAnimating) {
          self.pendingTab = $clickedTab;
          return;
        }

        self.isAnimating = true;
        self.changeTab($clickedTab);
      });
    } else {
      // Desktop event handling (hover + click)
      this.$tabItems.on('mouseenter', function () {
        var $hoveredTab = $(this);

        if ($hoveredTab.hasClass(config.activeClass)) return;

        if (self.isAnimating) {
          self.pendingTab = $hoveredTab;
          return;
        }

        self.isAnimating = true;
        self.changeTab($hoveredTab);
      });

      this.$tabItems.on('click', function (e) {
        var $clickedTab = $(this);
        var $tabLink = $clickedTab.find('a');

        if (!$clickedTab.hasClass(config.activeClass) || $tabLink.length === 0) {
          e.preventDefault();
        }
      });
    }
  };

  // Scroll to tab (mobile only)
  TabContainer.prototype.scrollToTab = function ($tab) {
    var navHeight = $('.w-nav').outerHeight() || 0;
    var tabTop = $tab.offset().top;
    var scrollPosition = tabTop - navHeight;

    $('html, body').animate(
      {
        scrollTop: scrollPosition,
      },
      400
    );
  };

  // Change active tab
  TabContainer.prototype.changeTab = function ($newTab) {
    var self = this;
    var hoveredValue = $newTab.attr('data-tab-item');
    var $targetVisual = this.$tabVisuals.filter('[data-tab-visual="' + hoveredValue + '"]');

    var $currentActiveTab = this.$tabItems.filter('.' + config.activeClass);
    var $currentVisual = this.$tabVisuals.filter(':visible');

    // Update active class
    this.$tabItems.removeClass(config.activeClass);
    $newTab.addClass(config.activeClass);

    // Kill any existing tweens
    gsap.killTweensOf($currentActiveTab.find('[data-tab-content]'));
    gsap.killTweensOf($newTab.find('[data-tab-content]'));
    gsap.killTweensOf($currentVisual);
    gsap.killTweensOf($targetVisual);

    // Animate content heights
    var $currentContents = $currentActiveTab.find('[data-tab-content]');
    var $newContents = $newTab.find('[data-tab-content]');

    // Collapse current content
    if ($currentContents.length) {
      gsap.to($currentContents, {
        height: 0,
        duration: config.animDuration,
        stagger: 0.05,
      });
    }

    // Expand new content
    if ($newContents.length) {
      $newContents.each(function () {
        var $content = $(this);

        $content.css('height', 'auto');
        var autoHeight = $content.outerHeight();
        $content.css('height', '0');

        gsap.to($content, {
          height: autoHeight,
          duration: 0.3,
        });
      });
    }

    // Animate visuals
    gsap.to($currentVisual, {
      opacity: 0,
      duration: config.animDuration,
      onComplete: function () {
        $currentVisual.hide();
        $targetVisual.show();

        gsap.fromTo(
          $targetVisual,
          { opacity: 0 },
          {
            opacity: 1,
            duration: config.animDuration,
            onComplete: function () {
              self.isAnimating = false;

              // Scroll to tab on mobile
              if (self.isMobile) {
                setTimeout(function () {
                  self.scrollToTab($newTab);
                }, 50);
              }

              // Handle pending tab change if any
              if (self.pendingTab) {
                var $nextTab = self.pendingTab;
                self.pendingTab = null;

                setTimeout(function () {
                  self.changeTab($nextTab);
                }, 50);
              }
            },
          }
        );
      },
    });
  };

  // Update container with new elements
  TabContainer.prototype.refresh = function () {
    var oldTabItemsLength = this.$tabItems.length;
    var oldTabVisualsLength = this.$tabVisuals.length;

    // Update references
    this.$tabItems = this.$el.find('[data-tab-item]');
    this.$tabVisuals = this.$el.find('[data-tab-visual]');

    var hasNewItems = this.$tabItems.length > oldTabItemsLength;
    var hasNewVisuals = this.$tabVisuals.length > oldTabVisualsLength;

    // Check if we need to reinitialize
    if (hasNewItems || hasNewVisuals) {
      var $activeTab = this.$tabItems.filter('.' + config.activeClass);

      // Set active tab if none exists
      if ($activeTab.length === 0 && this.$tabItems.length > 0) {
        $activeTab = this.$tabItems.first();
        $activeTab.addClass(config.activeClass);

        if (this.$tabVisuals.length > 0) {
          var activeValue = $activeTab.attr('data-tab-item');
          this.$tabVisuals.hide().css('opacity', 0);
          this.$tabVisuals
            .filter('[data-tab-visual="' + activeValue + '"]')
            .show()
            .css('opacity', 1);
        }
      }

      // Update heights and event handlers
      this.setTabHeights($activeTab);
      this.bindEvents();
    }

    // Update mobile state if needed
    var newIsMobile = window.innerWidth <= config.mobileBreakpoint;
    if (this.isMobile !== newIsMobile) {
      this.isMobile = newIsMobile;
      this.bindEvents();
    }
  };

  // Initialize all containers
  function initAllContainers() {
    $('[data-tab-container]').each(function () {
      var $container = $(this);

      // Check if already initialized
      var existingContainer = findContainer($container[0]);

      if (!existingContainer) {
        var tabContainer = new TabContainer($container);
        if (tabContainer.$tabItems.length > 0) {
          tabContainers.push(tabContainer);
        }
      }
    });
  }

  // Find a container by element
  function findContainer(element) {
    for (var i = 0; i < tabContainers.length; i++) {
      if (tabContainers[i].$el[0] === element) {
        return tabContainers[i];
      }
    }
    return null;
  }

  // Global refresh function
  window.refreshTabs = function () {
    // Check for new containers
    initAllContainers();

    // Refresh existing containers
    for (var i = 0; i < tabContainers.length; i++) {
      tabContainers[i].refresh();
    }
  };

  // Initialize all containers
  initAllContainers();

  // Window resize handler
  $(window).on('resize', function () {
    for (var i = 0; i < tabContainers.length; i++) {
      tabContainers[i].refresh();
    }
  });

  // Set up observer for dynamic content
  if (typeof MutationObserver !== 'undefined') {
    var observer = new MutationObserver(function (mutations) {
      var shouldRefresh = false;

      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        if (mutation.type === 'childList') {
          for (var j = 0; j < mutation.addedNodes.length; j++) {
            var node = mutation.addedNodes[j];
            if (node.nodeType === 1) {
              // Element node
              if (
                $(node).find('[data-tab-item]').length > 0 ||
                $(node).find('[data-tab-visual]').length > 0 ||
                $(node).find('[data-tab-container]').length > 0 ||
                $(node).is('[data-tab-item]') ||
                $(node).is('[data-tab-visual]') ||
                $(node).is('[data-tab-container]')
              ) {
                shouldRefresh = true;
                break;
              }
            }
          }
          if (shouldRefresh) break;
        }
      }

      if (shouldRefresh) {
        setTimeout(window.refreshTabs, 10);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  } else {
    // Fallback for older browsers
    setInterval(window.refreshTabs, 2000);
  }
}
function initModal() {
  function initModalBasic() {
    const modalGroup = document.querySelector('[data-modal-group-status]');
    const modals = document.querySelectorAll('[data-modal-name]');
    const modalTargets = document.querySelectorAll('[data-modal-target]');

    // Open modal
    modalTargets.forEach((modalTarget) => {
      modalTarget.addEventListener('click', function () {
        const modalTargetName = this.getAttribute('data-modal-target');

        // Close all modals
        modalTargets.forEach((target) => target.setAttribute('data-modal-status', 'not-active'));
        modals.forEach((modal) => modal.setAttribute('data-modal-status', 'not-active'));

        // Activate clicked modal
        document
          .querySelector(`[data-modal-target="${modalTargetName}"]`)
          .setAttribute('data-modal-status', 'active');
        document
          .querySelector(`[data-modal-name="${modalTargetName}"]`)
          .setAttribute('data-modal-status', 'active');

        // Set group to active
        if (modalGroup) {
          modalGroup.setAttribute('data-modal-group-status', 'active');
        }
      });
    });

    // Close modal
    document.querySelectorAll('[data-modal-close]').forEach((closeBtn) => {
      closeBtn.addEventListener('click', closeAllModals);
    });

    // Close modal on `Escape` key
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    });

    // Function to close all modals
    function closeAllModals() {
      modalTargets.forEach((target) => target.setAttribute('data-modal-status', 'not-active'));

      if (modalGroup) {
        modalGroup.setAttribute('data-modal-group-status', 'not-active');
      }
    }
  }

  initModalBasic();
}

$(document).ready(function () {
  initNav();
  runFSSort();
  initTags();
  animateLogos();
  animateTabs();
  initModal();
});
