$(document).ready(function() {
    // Detect mobile
    if (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) ||
         (navigator.msMaxTouchPoints > 0)) {
            // Touch capabilities are available, it must be a mobile device
            $(".mobile-only").css("visibility", "visible");
            $(".mobile-only").css("display", "inline");
    }

});