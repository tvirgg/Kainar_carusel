import React, { useState, useLayoutEffect, useRef } from 'react';
import Slide from './Slide';
import './Slider.css';

const Slider = ({ slides }) => {
  const visibleSlidesCount = 7; // Number of visible slides
  const slidesLength = slides.length;
  const totalSlides = slidesLength + 2 * visibleSlidesCount; // Total slides including clones
  const centralSlideIndex = Math.floor(visibleSlidesCount / 2); // Index of the central slide

  const [currentIndex, setCurrentIndex] = useState(visibleSlidesCount);
  const [slideWidth, setSlideWidth] = useState(0);
  const [currentZone, setCurrentZone] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false); // New state for animation lock
  const [isLoading, setIsLoading] = useState(true); // New state for loading screen
  const sliderRef = useRef(null);
  const animationTimeout = useRef(null);

  const nextSlide = (times = 1, delay = 0) => {
    if (isAnimating) return; // Prevent new animation if already animating
    setIsAnimating(true);
    clearTimeout(animationTimeout.current);

    for (let i = 0; i < times; i++) {
      setTimeout(() => {
        setCurrentIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          if (newIndex >= totalSlides - visibleSlidesCount) {
            animationTimeout.current = setTimeout(() => {
              setIsAnimating(false);
              setCurrentIndex(visibleSlidesCount);
            }, 1500);
          } else {
            animationTimeout.current = setTimeout(() => {
              setIsAnimating(false);
            }, 1500);
          }
          return newIndex;
        });
      }, i * delay); // Adjust delay as needed
    }
  };

  const prevSlide = (times = 1, delay = 0) => {
    if (isAnimating) return; // Prevent new animation if already animating
    setIsAnimating(true);
    clearTimeout(animationTimeout.current);

    for (let i = 0; i < times; i++) {
      setTimeout(() => {
        setCurrentIndex(prevIndex => {
          const newIndex = prevIndex - 1;
          if (newIndex < visibleSlidesCount) {
            animationTimeout.current = setTimeout(() => {
              setIsAnimating(false);
              setCurrentIndex(totalSlides - 2 * visibleSlidesCount);
            }, 1500);
          } else {
            animationTimeout.current = setTimeout(() => {
              setIsAnimating(false);
            }, 1500);
          }
          return newIndex;
        });
      }, i * delay); // Adjust delay as needed
    }
  };

  const getSlideClass = (index) => {
    const relativeIndex = (index + totalSlides - currentIndex) % totalSlides;
    if (relativeIndex === centralSlideIndex) {
      return 'slide center';
    } else if (relativeIndex < visibleSlidesCount) {
      return 'slide';
    } else {
      return 'slide hidden';
    }
  };

  const getSlideStyle = (index) => {
    const relativeIndex = (index + totalSlides - currentIndex) % totalSlides;
    let blurValue = 0;
    if (relativeIndex === 0 || relativeIndex === visibleSlidesCount - 1) {
      blurValue = 3;
    } else if (relativeIndex === 1 || relativeIndex === visibleSlidesCount - 2) {
      blurValue = 2;
    } else if (relativeIndex === 2 || relativeIndex === visibleSlidesCount - 3) {
      blurValue = 1;
    }

    const styles = { 
      filter: `blur(${blurValue}px) grayscale(${relativeIndex === centralSlideIndex ? 0 : 1})`
    };

    if (relativeIndex >= visibleSlidesCount) {
      styles.height = '200px';
    } else {
      switch (relativeIndex) {
        case 0:
        case visibleSlidesCount - 1:
          styles.height = '200px';
          break;
        case 1:
        case visibleSlidesCount - 2:
          styles.height = '230px';
          break;
        case 2:
        case visibleSlidesCount - 3:
          styles.height = '270px';
          break;
        case centralSlideIndex:
          styles.height = '300px'; // Assuming 300px is the full height you mentioned
          break;
        default:
          styles.height = '200px';
      }
    }

    return styles;
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      const containerWidth = document.querySelector('.slider-container').offsetWidth;
      const slideMargin = 10; // Adjust as needed
      const centralSlideWidth = containerWidth * 0.4; // 40% of container width
      const totalMarginWidth = (visibleSlidesCount - 1) * (slideMargin * 2); // Total margin width
      const remainingWidth = containerWidth - centralSlideWidth - totalMarginWidth; // Remaining width for other slides
      const sideSlideWidth = remainingWidth / (visibleSlidesCount - 0.85); // Width of each side slide

      document.documentElement.style.setProperty('--slide-margin', `${slideMargin}px`);
      document.documentElement.style.setProperty('--central-slide-width', `${centralSlideWidth}px`);
      document.documentElement.style.setProperty('--side-slide-width', `${sideSlideWidth}px`);
      setSlideWidth(sideSlideWidth + 2 * slideMargin); // Including the margins for the translateX calculation
      setIsLoading(false); // Turn off loading after dimensions are set
    };

    handleResize(); // Initial call to set values
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (isAnimating) return; // Prevent handling mouse move during animation

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const mouseX = e.clientX - sliderRect.left;

    const centralSlideWidth = sliderRect.width * 0.4; // Width of central slide
    const sideSlideWidth = (sliderRect.width - centralSlideWidth) / (visibleSlidesCount - 0.85); // Width of each side slide

    const zones = [
      sideSlideWidth * 1, // Zone 1: 100% of side slide
      sideSlideWidth * 2, // Zone 2: 200% of side slide
      sideSlideWidth * 3, // Zone 3: 300% of side slide
      centralSlideWidth, // Central slide start (Zone 4 start)
      sliderRect.width - sideSlideWidth * 3, // Zone 5: 300% of side slide from right
      sliderRect.width - sideSlideWidth * 2, // Zone 6: 200% of side slide from right
      sliderRect.width - sideSlideWidth * 1 // Zone 7: 100% of side slide from right
    ];

    if (mouseX < zones[0]) {
      if (currentZone !== 1) {
        setCurrentZone(1);
        prevSlide(3);
        console.log('GO_LEFT_3');
      }
    } else if (mouseX < zones[1]) {
      if (currentZone !== 2) {
        setCurrentZone(2);
        prevSlide(2);
        console.log('GO_LEFT_2');
      }
    } else if (mouseX < zones[2]) {
      if (currentZone !== 3) {
        setCurrentZone(3);
        prevSlide(1);
        console.log('GO_LEFT_1');
      }
    } else if (mouseX < zones[3]) {
      if (currentZone !== 4) {
        setCurrentZone(4);
        console.log('CENTER');
      }
    } else if (mouseX < zones[4]) {
      if (currentZone !== 5) {
        setCurrentZone(5);
        console.log('CENTER');
      }
    } else if (mouseX < zones[5]) {
      if (currentZone !== 6) {
        setCurrentZone(6);
        nextSlide(1);
        console.log('GO_RIGHT_1');
      }
    } else if (mouseX < zones[6]) {
      if (currentZone !== 7) {
        setCurrentZone(7);
        nextSlide(2);
        console.log('GO_RIGHT_2');
      }
    } else if (currentZone !== 8) {
      setCurrentZone(8);
      nextSlide(3);
      console.log('GO_RIGHT_3');
    }
  };

  const handleMouseLeave = () => {
    setCurrentZone(null);
  };

  const getClonedSlides = () => {
    const clonesBefore = slides.slice(-visibleSlidesCount);
    const clonesAfter = slides.slice(0, visibleSlidesCount);
    return [...clonesBefore, ...slides, ...clonesAfter];
  };

  return (
    <div className="slider-container" ref={sliderRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {isLoading ? (
        <div className="loading-screen">Loading...</div>
      ) : (
        <>
          <button onClick={() => prevSlide(1)} className="nav left-nav">‹</button>
          <div className="slider-wrapper">
            <div className="slider" style={{ transform: `translateX(-${currentIndex * slideWidth}px)` }}>
              {getClonedSlides().map((slide, index) => (
                <Slide
                  key={index}
                  slide={slide}
                  className={getSlideClass(index)}
                  style={getSlideStyle(index)}
                />
              ))}
            </div>
          </div>
          <button onClick={() => nextSlide(1)} className="nav right-nav">›</button>
        </>
      )}
    </div>
  );
};

export default Slider;