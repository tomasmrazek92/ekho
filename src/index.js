function runFSSort() {
  window.FinsweetAttributes ||= [];
  window.FinsweetAttributes.push([
    'list',
    (listInstances) => {
      listInstances.forEach((listInstance) => {
        listInstance.addHook('start', (items) => {
          listInstance.sorting.value = {
            fieldKey: 'order',
            direction: 'asc',
            interacted: true,
          };

          return items;
        });

        // Trigger the lifecycle to start
        listInstance.triggerHook('start');
      });
    },
  ]);
}
function animateLogos() {
  const totalItems = $('.logo_menu-item').length;
  let currentIndex = 0;
  let timer;

  function animateNext(nextIndex) {
    clearTimeout(timer);

    if (nextIndex === undefined) {
      nextIndex = (currentIndex + 1) % totalItems;
    }

    $('.logo_menu-item').removeClass('is-active');
    $('.logos_list').removeClass('active');

    $('.logo_menu-item').eq(nextIndex).addClass('is-active');
    $('.logos_list').eq(nextIndex).addClass('active');

    currentIndex = nextIndex;

    timer = setTimeout(function () {
      animateNext();
    }, 4000);
  }

  $('.logo_menu-item').on('click', function () {
    const clickedIndex = $(this).index('.logo_menu-item');
    animateNext(clickedIndex);
  });

  animateNext(0);
}
function animateTabs() {
  // Define constants
  const activeClass = 'is-active';
  const animDuration = 0.2;

  // Find all tab containers
  $('[data-tab-container]').each(function () {
    const $container = $(this);
    const $tabItems = $container.find('[data-tab-item]');
    let $tabVisuals = $container.find('[data-tab-visual]');

    // Track animation state
    let isAnimating = false;
    let pendingTab = null;

    // Skip if no tabs found
    if ($tabItems.length === 0) return;

    // Preselect default
    let $activeTab = $tabItems.first();
    $activeTab.addClass(activeClass);

    // Get the active tab value and show corresponding visual
    const activeValue = $activeTab.attr('data-tab-item');

    // Make sure visuals are properly initialized
    if ($tabVisuals.length > 0) {
      // Hide all visuals first
      $tabVisuals.hide().css('opacity', 0);

      // Then show and fade in the active one
      const $activeVisual = $tabVisuals.filter(`[data-tab-visual="${activeValue}"]`);
      $activeVisual.show().css('opacity', 1);
    }

    // For all non-active tabs, set content heights to 0
    $tabItems
      .not('.' + activeClass)
      .find('[data-tab-content]')
      .css('height', '0');

    // Make sure active tab contents are visible
    $activeTab.find('[data-tab-content]').css('height', 'auto');

    // Handle tab hover
    $tabItems.on('mouseenter', function () {
      const $hoveredTab = $(this);

      // Skip if already active
      if ($hoveredTab.hasClass(activeClass)) return;

      // If animation in progress, store as pending and return
      if (isAnimating) {
        pendingTab = $hoveredTab;
        return;
      }

      // Start animation
      isAnimating = true;
      changeTab($hoveredTab);
    });

    // Function to change tab with animation
    function changeTab($newTab) {
      const hoveredValue = $newTab.attr('data-tab-item');
      const $targetVisual = $tabVisuals.filter(`[data-tab-visual="${hoveredValue}"]`);

      // Get current active elements
      const $currentActiveTab = $tabItems.filter('.' + activeClass);
      const $currentVisual = $tabVisuals.filter(':visible');

      // Update active state
      $tabItems.removeClass(activeClass);
      $newTab.addClass(activeClass);

      // Kill any running animations
      gsap.killTweensOf($currentActiveTab.find('[data-tab-content]'));
      gsap.killTweensOf($newTab.find('[data-tab-content]'));
      gsap.killTweensOf($currentVisual);
      gsap.killTweensOf($targetVisual);

      // Get all content elements in current and new tabs
      const $currentContents = $currentActiveTab.find('[data-tab-content]');
      const $newContents = $newTab.find('[data-tab-content]');

      // Collapse current contents
      if ($currentContents.length) {
        gsap.to($currentContents, {
          height: 0,
          duration: animDuration,
          stagger: 0.05,
        });
      }

      // Expand new contents
      if ($newContents.length) {
        $newContents.each(function (index) {
          const $content = $(this);

          // Measure auto height
          $content.css('height', 'auto');
          const autoHeight = $content.outerHeight();
          $content.css('height', '0');

          // Animate to auto height
          gsap.to($content, {
            height: autoHeight,
            duration: 0.3,
          });
        });
      }

      // Animate visuals
      gsap.to($currentVisual, {
        opacity: 0,
        duration: animDuration,
        onComplete: function () {
          $currentVisual.hide();
          $targetVisual.show();

          gsap.fromTo(
            $targetVisual,
            { opacity: 0 },
            {
              opacity: 1,
              duration: animDuration,
              onComplete: function () {
                // Animation completed
                isAnimating = false;

                // Check if another tab is waiting
                if (pendingTab) {
                  const $nextTab = pendingTab;
                  pendingTab = null;

                  // Process the next tab after a small delay
                  setTimeout(function () {
                    changeTab($nextTab);
                  }, 50);
                }
              },
            }
          );
        },
      });
    }
  });
}

$(document).ready(function () {
  runFSSort();
  animateLogos();
  animateTabs();
});
