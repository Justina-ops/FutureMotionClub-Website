/* ==========================================================================
   FutureMotion Club — Homepage Interactive Script Suite
   ========================================================================== */

$(document).ready(function () {

  // 1. Navigation Dropdown Interface Mechanics
  $('#fmNavDropTriggerBtn').on('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    $('[fm-node="nav-dropdown-menu"]').toggle();
  });

  // 2. Footer Quick Site Directory Drawer Click Mechanics
  $('#fmFooterDropdownTriggerBtn').on('click', function (e) {
    e.preventDefault(); e.stopPropagation();
    $('[fm-node="footer-popup-menu"]').attr('fm-state', function (i, val) {
      return val === 'visible' ? 'hidden' : 'visible';
    });
  });

  // Smooth dismiss handler when clicking background areas
  $(document).on('click', function () {
    $('[fm-node="nav-dropdown-menu"]').hide();
    $('[fm-node="footer-popup-menu"]').attr('fm-state', 'hidden');
  });

  // 3. Fast Typewriter Processing Sequence
  const textContainerNode = document.getElementById("fmTypewriterTextField");
  const coreMessageString = "Welcome to the ultimate learning space for digital animation and multimedia design. Explore new skills, build visual showreels, and collaborate with creative students across campus tracks.";
  let charIdx = 0;

  function runTypewriterLoop() {
    if (textContainerNode && charIdx < coreMessageString.length) {
      textContainerNode.textContent += coreMessageString.charAt(charIdx);
      charIdx++;
      setTimeout(runTypewriterLoop, 15);
    }
  }
  runTypewriterLoop();

  // 4. Bulletproof Height-Based Scroll Reveal Integration
  const $scrollTargetCardUnit = $('[fm-node="animated-scroll-card"]');

  if ($scrollTargetCardUnit.length) {
    function calculateViewportIntersectionReveal() {
      const topScrollOffset = $(window).scrollTop();
      const currentHeightWindow = $(window).height();
      const positionElementTop = $scrollTargetCardUnit.offset().top;

      // Forces animation to trigger safely when card enters view
      if (topScrollOffset + currentHeightWindow > positionElementTop + 120) {
        $scrollTargetCardUnit.attr('fm-state', 'active');
      } else {
        $scrollTargetCardUnit.attr('fm-state', 'inactive');
      }
    }

    $(window).on('scroll resize', calculateViewportIntersectionReveal);
    calculateViewportIntersectionReveal();
  }

  // 5. Cockpit Dashboard Math Calculations Stat Loops
  let activeLiveProgressPercent = 74;
  const projectQueueFilesList = ["studio_reel_2026_final.mov", "3d_fluid_simulation.blend", "character_walk_cycle.aep", "vector_logo_intro.mp4"];
  let collectionIteratorIndex = 0;

  setInterval(() => {
    if (typeof $ !== 'undefined') {
      const simulatedGpuLoad = (Math.random() * (47.5 - 38.2) + 38.2).toFixed(1);
      const simulatedFpsRate = (Math.random() * (60.1 - 59.4) + 59.4).toFixed(1);
      const simulatedLatencyValue = Math.floor(Math.random() * (15 - 11) + 11);

      $('#fmGpuFieldNode').text(`${simulatedGpuLoad}%`);
      $('#fmFpsFieldNode').text(`${simulatedFpsRate} FPS`);
      $('#fmLatencyFieldNode').text(`${simulatedLatencyValue}ms`);

      activeLiveProgressPercent += Math.floor(Math.random() * 4) + 1;

      if (activeLiveProgressPercent >= 100) {
        activeLiveProgressPercent = 0;
        collectionIteratorIndex = (collectionIteratorIndex + 1) % projectQueueFilesList.length;
        $('#fmQueueFileNameField').text(projectQueueFilesList[collectionIteratorIndex]);

        $('#fmQueueStatusTextLabel').text("COMPLETED").css("color", "#39ff14");
        setTimeout(() => {
          $('#fmQueueStatusTextLabel').text("PROCESSING CORE_01").css("color", "#00bfff");
        }, 1200);
      }

      $('#fmQueuePercentCounterLabel').text(`${activeLiveProgressPercent}%`);
      $('#fmQueueProgressBarFillNode').css('width', `${activeLiveProgressPercent}%`);
    }
  }, 1600);

});
