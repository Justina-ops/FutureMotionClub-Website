(function ($) {
  "use strict";
  if (!$) return;

  function escapeHtml(value) {
    return $("<div>").text(value == null ? "" : String(value)).html();
  }

  function loadHomeApi() {
    var $grid = $("#homeApiGrid");

    $.ajax({
      url: "https://openlibrary.org/search.json",
      method: "GET",
      data: {
        q: "animation multimedia",
        limit: 12,
        fields: "title,author_name,first_publish_year,cover_i"
      },
      dataType: "json",
      timeout: 8000
    })
      .done(function (data) {
        var docs = (data && Array.isArray(data.docs)) ? data.docs.filter(function (book) { return book && book.cover_i; }).slice(0, 3) : [];

        $grid.empty();

        if (!docs.length) {
          return;
        }

        $.each(docs, function (_, book) {
          var title = escapeHtml(book.title || "Untitled creative resource");
          if (title.length > 72) {
            title = title.slice(0, 69).trim() + "…";
          }
          var author = escapeHtml((book.author_name && book.author_name[0]) || "Author information unavailable");
          var year = escapeHtml(book.first_publish_year || "Year unavailable");
          var cover = book.cover_i
            ? '<img class="home-api-cover" src="https://covers.openlibrary.org/b/id/' + encodeURIComponent(book.cover_i) + '-M.jpg" alt="Cover of ' + title + '" loading="lazy">'
            : '';

          $grid.append(
            '<article class="home-api-item">' +
            cover +
            '<div class="home-api-copy">' +
            '<span class="home-api-label">OPEN LIBRARY</span>' +
            '<h3>' + title + '</h3>' +
            '<p>' + author + ' · ' + year + '</p>' +
            '</div>' +
            '</article>'
          );
        });

      })
      .fail(function () {
        $grid.html('<p class="home-api-copy">Creative resources are temporarily unavailable. Please try again later.</p>');
      });
  }

  $(function () {
    var shareUrl = window.location.href;
    $(".twitter-share-button").attr(
      "href",
      "https://twitter.com/intent/tweet?text=Check%20out%20FutureMotion%20Club&url=" + encodeURIComponent(shareUrl)
    );
    loadHomeApi();
  });
})(window.jQuery);
