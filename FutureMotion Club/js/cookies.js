document.addEventListener('DOMContentLoaded', () => {

  const banner =
    document.getElementById('cookieBanner');

  const acceptButton =
    document.getElementById('acceptCookies');

  const declineButton =
    document.getElementById('declineCookies');


  if (!banner) return;


  const consent =
    localStorage.getItem('vf-cookie-consent');


  /* --------------------------------------------------------------
     ALREADY MADE A CHOICE
  -------------------------------------------------------------- */

  if (!consent) {

    banner.classList.add('show');

    banner.setAttribute(
      'aria-hidden',
      'false'
    );

  }


  /* --------------------------------------------------------------
     ACCEPT
  -------------------------------------------------------------- */

  if (acceptButton) {

    acceptButton.addEventListener('click', () => {

      localStorage.setItem(
        'vf-cookie-consent',
        'accepted'
      );

      closeBanner();

    });

  }


  /* --------------------------------------------------------------
     DECLINE
  -------------------------------------------------------------- */

  if (declineButton) {

    declineButton.addEventListener('click', () => {

      localStorage.setItem(
        'vf-cookie-consent',
        'declined'
      );

      closeBanner();

    });

  }


  /* --------------------------------------------------------------
     CLOSE BANNER
  -------------------------------------------------------------- */

  function closeBanner() {

    banner.classList.remove('show');

    banner.setAttribute(
      'aria-hidden',
      'true'
    );

  }

});