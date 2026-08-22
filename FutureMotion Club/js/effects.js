/* ==========================================================================
   FutureMotion Club — Interactive Effects (3D tilt + Typewriter)
   ========================================================================== */

/* ---------- 3D Parallax Tilt Cards ---------- */
function initTiltCards() {
    // Only run on desktop (mouse-enabled devices)
    if ('ontouchstart' in window) return;

    var cards = document.querySelectorAll('.gallery-item .card');
    if (cards.length === 0) {
        // Cards not rendered yet — retry after 300ms
        setTimeout(initTiltCards, 300);
        return;
    }

    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        // Store handler references on the card itself
        card._tiltMove = function (e) {
            var rect = this.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var centerX = rect.width / 2;
            var centerY = rect.height / 2;
            var rotateX = ((y - centerY) / centerY) * -8;
            var rotateY = ((x - centerX) / centerX) * 8;

            this.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';

            // Dynamic glow that follows the cursor
            var glow = this.querySelector('.card-glow');
            if (!glow) {
                var g = document.createElement('div');
                g.className = 'card-glow';
                this.appendChild(g);
                glow = g;
            }
            glow.style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(0,191,255,0.25), transparent 60%)';
        };

        card._tiltLeave = function () {
            this.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
            var glow = this.querySelector('.card-glow');
            if (glow) glow.style.background = 'none';
        };

        card.addEventListener('mousemove', card._tiltMove);
        card.addEventListener('mouseleave', card._tiltLeave);
    }
}

/* ---------- Typewriter Effect for Hero Title ---------- */
function startTypewriter() {
    var el = document.getElementById('typewriter');
    if (!el) return;

    var text = el.getAttribute('data-text') || 'The Gallery';
    var index = 0;
    el.textContent = '';

    function type() {
        if (index < text.length) {
            el.textContent += text.charAt(index);
            index++;
            setTimeout(type, 80);
        }
    }
    // Wait 500ms before starting
    setTimeout(type, 500);
}

// Expose functions globally
window.initTiltCards = initTiltCards;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(initTiltCards, 500);
    startTypewriter();
});