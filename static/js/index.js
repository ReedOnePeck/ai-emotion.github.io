window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

$(document).ready(function() {
    // Navbar burger toggle
    $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    // Carousel options (same as original)
    var options = {
        slidesToScroll: 1,
        slidesToShow: 3,
        loop: true,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
    };

    // Initialize carousels (same as original)
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Add lazy loading functionality to carousels
    for(var i = 0; i < carousels.length; i++) {
        // Get the carousel instance
        var carousel = carousels[i];
        
        // Function to load videos near current slide
        function loadNearbyVideos() {
            var currentIndex = carousel.state.currentIndex;
            var slides = carousel.slides;
            var slidesToShow = carousel.options.slidesToShow;
            
            // Calculate range to load (current slide and adjacent ones)
            var start = Math.max(0, currentIndex - 1);
            var end = Math.min(slides.length, currentIndex + slidesToShow + 1);
            
            // Load videos in the calculated range
            for (var j = start; j < end; j++) {
                var slide = slides[j];
                var video = slide.querySelector('video');
                if (video) {
                    var source = video.querySelector('source[data-src]');
                    if (source && !source.src) {
                        // Replace data-src with actual src
                        source.src = source.dataset.src;
                        // Remove data-src to prevent re-loading
                        source.removeAttribute('data-src');
                        // Load the video source
                        video.load();
                        
                        // Set autoplay for the center video
                        if (j === currentIndex + Math.floor(slidesToShow / 2)) {
                            video.autoplay = true;
                        }
                    }
                }
            }
        }
        
        // Load initial videos
        loadNearbyVideos();
        
        // Listen for slide changes to load new videos
        carousel.on('after:show', function(state) {
            loadNearbyVideos();
        });
    }

    // Original interpolation code
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();
});
