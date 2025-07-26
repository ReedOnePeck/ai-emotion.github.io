window.HELP_IMPROVE_VIDEOJS = false;

// --- Interpolation animation code ---
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
// --- End interpolation code ---

$(document).ready(function() {
    // Navbar burger toggle
    $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    // --- FIXED VIDEO CAROUSEL WITH LAZY LOADING ---
    const PRELOAD_AHEAD = 1; // Preload 1 video before and after current
    
    // Initialize carousel with correct options
    var options = {
      slidesToScroll: 1,
      slidesToShow: 3,
      loop: true,
      infinite: true,
      autoplay: false,
    };

    // Initialize carousels
    var carousels = bulmaCarousel.attach('.carousel', options);
    
    // Function to handle video lazy loading
    function updateVideosForCarousel(carousel, currentIndex) {
      const numSlides = carousel.state.length;
      
      // Reset all videos
      carousel.slides.forEach(slide => {
        const video = slide.querySelector('video');
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });
      
      // Load videos in a window around current index
      for (let i = -PRELOAD_AHEAD; i <= PRELOAD_AHEAD; i++) {
        const indexToLoad = (currentIndex + i + numSlides) % numSlides;
        const slide = carousel.slides[indexToLoad];
        
        if (slide) {
          const video = slide.querySelector('video');
          const source = video.querySelector('source');
          
          // Lazy load if needed
          if (source && source.dataset.src && !source.src) {
            source.src = source.dataset.src;
            video.load();
          }
        }
      }
      
      // Play current video
      const currentSlide = carousel.slides[currentIndex];
      if (currentSlide) {
        const video = currentSlide.querySelector('video');
        if (video) {
          video.play().catch(e => console.log("Autoplay prevented:", e));
        }
      }
    }

    // Setup each carousel
    carousels.forEach(carousel => {
      // Initialize for first slide
      updateVideosForCarousel(carousel, carousel.state.index);
      
      // Handle slide changes
      carousel.on('after:show', state => {
        updateVideosForCarousel(carousel, state.index);
      });
    });

    // --- End video carousel code ---

    // --- Original interpolation code ---
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();
});
