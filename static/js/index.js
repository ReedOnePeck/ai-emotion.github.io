window.HELP_IMPROVE_VIDEOJS = false;

// --- Your existing code for the interpolation animation ---
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
// --- End of existing code ---


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });


    // --- NEW VIDEO LAZY LOADING LOGIC ---

    const PRELOAD_AHEAD = 2; // Preloads 2 videos before and 2 after the current one. (2+2+1 = 5 total)

    /**
     * Loads a window of videos around the current index and plays the current one.
     * @param {object} carousel - The bulmaCarousel instance.
     * @param {number} currentIndex - The index of the slide to be treated as current.
     */
    function updateAndPlayCurrentVideo(carousel, currentIndex) {
        // Pause all videos in this carousel to ensure only one plays at a time
        carousel.slides.forEach(slide => {
            const video = slide.querySelector('video');
            if (video && !video.paused) {
                video.pause();
            }
        });

        const numSlides = carousel.state.length;
        
        // Load a "window" of videos around the new current index for a smooth experience
        for (let i = -PRELOAD_AHEAD; i <= PRELOAD_AHEAD; i++) {
            // Calculate the correct index, handling wrapping for looping carousels
            let indexToLoad = (currentIndex + i + numSlides) % numSlides;
            
            // Find all slides with this index (original and clones) and load their videos
            carousel.slides.filter(s => parseInt(s.dataset.sliderIndex) === indexToLoad).forEach(slide => {
              const video = slide.querySelector('video');
              const source = video ? video.querySelector('source') : null;
              
              // If the video has a data-src and no src, it means it hasn't been loaded yet
              if (video && source && source.dataset.src && !source.getAttribute('src')) {
                  source.setAttribute('src', source.dataset.src);
                  video.load(); // Tell the video element to load the new source
              }
            });
        }
        
        // Find the currently visible slide and play its video
        const currentSlide = carousel.element.querySelector('.slider-item.is-current');
        if (currentSlide) {
            const videoToPlay = currentSlide.querySelector('video');
            if (videoToPlay) {
                // Ensure the video source is set before trying to play
                const source = videoToPlay.querySelector('source');
                if (source && source.getAttribute('src')) {
                    const playPromise = videoToPlay.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            // Autoplay was prevented by the browser, which is common.
                            // The 'controls' attribute will allow the user to play it manually.
                            console.warn("Video autoplay was prevented:", error);
                        });
                    }
                } else {
                  // If not loaded yet, add a one-time event listener to play when ready
                  videoToPlay.addEventListener('canplay', () => {
                    const playPromise = videoToPlay.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => console.warn("Video autoplay was prevented:", error));
                    }
                  }, { once: true });
                }
            }
        }
    }

    var carouselOptions = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false, // Set to false because our script now handles playback
    }

		// Initialize all video carousels
    var carousels = bulmaCarousel.attach('.results-carousel', carouselOptions);

    // Loop on each carousel to set up lazy loading and events
    carousels.forEach(carousel => {
      // Initially load the videos for the starting slide
      updateAndPlayCurrentVideo(carousel, carousel.state.index);

      // Add a listener to load/play videos when the slide changes
      carousel.on('after:show', state => {
        updateAndPlayCurrentVideo(carousel, state.next);
      });
    });

    // --- END OF NEW LOGIC ---


    // --- Your existing code for the interpolation animation ---
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();
    // --- End of existing code ---
});
