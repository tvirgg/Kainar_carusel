import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import Slide from './Slide';
import './Slider.css';

const Slider = ({ slides }) => {
  const visibleSlidesCount = 7; // Количество видимых слайдов на десктопе
  const slidesLength = slides.length;
  const totalSlides = slidesLength + 2 * visibleSlidesCount; // Общее количество слайдов, включая клоны
  const centralSlideIndex = Math.floor(visibleSlidesCount / 2); // Индекс центрального слайда

  const [currentIndex, setCurrentIndex] = useState(visibleSlidesCount);
  const [slideWidth, setSlideWidth] = useState(0);
  const [currentZone, setCurrentZone] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false); // Новое состояние для блокировки анимации
  const [isLoading, setIsLoading] = useState(true); // Новое состояние для экрана загрузки
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Состояние для определения мобильной версии
  const sliderRef = useRef(null);
  const animationTimeout = useRef(null);
  const startX = useRef(0);
  const endX = useRef(0);

  const fixedSlideWidth = 70; // Фиксированное значение ширины слайда в процентах
  const slideMargin = 10; // Отступ между слайдами в пикселях

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextSlide = (times = 1, delay = 0) => {
    if (isAnimating) return; // Предотвращает новую анимацию, если текущая еще не завершена
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
      }, i * delay); // Регулирует задержку по мере необходимости
    }
  };

  const prevSlide = (times = 1, delay = 0) => {
    if (isAnimating) return; // Предотвращает новую анимацию, если текущая еще не завершена
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
      }, i * delay); // Регулирует задержку по мере необходимости
    }
  };

  const handleSwipeStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleSwipeEnd = (e) => {
    endX.current = e.changedTouches[0].clientX;
    const swipeDistance = startX.current - endX.current;

    // Определите порог для дистанции свайпа, чтобы считать его действительным свайпом
    const swipeThreshold = 50;

    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0) {
        // Свайп влево
        nextSlide(1);
      } else {
        // Свайп вправо
        prevSlide(1);
      }
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
          styles.height = '300px'; // Предполагаем, что 300px - это полная высота, которую вы упомянули
          break;
        default:
          styles.height = '200px';
      }
    }

    return styles;
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

  const getCurrentMobileSlide = () => {
    const containerWidth = sliderRef.current.offsetWidth;
    const scrollLeft = sliderRef.current.scrollLeft;
    const slideFullWidth = (containerWidth * (fixedSlideWidth / 100)) + (slideMargin * 2); // Полная ширина слайда, включая отступы

    // Вычисляем индекс текущего центрального слайда
    const centralSlide = Math.round(scrollLeft / slideFullWidth);
    return centralSlide;
  };

  useLayoutEffect(() => {
    const handleResize = () => {
      const containerWidth = document.querySelector('.slider-container').offsetWidth;
      const slideMargin = 10; // Регулируйте по мере необходимости
      const centralSlideWidth = containerWidth * 0.4; // 40% ширины контейнера
      const totalMarginWidth = (visibleSlidesCount - 1) * (slideMargin * 2); // Общая ширина отступов
      const remainingWidth = containerWidth - centralSlideWidth - totalMarginWidth; // Оставшаяся ширина для других слайдов
      const sideSlideWidth = remainingWidth / (visibleSlidesCount - 0.80); // Ширина каждого бокового слайда

      document.documentElement.style.setProperty('--slide-margin', `${slideMargin}px`);
      document.documentElement.style.setProperty('--central-slide-width', `${centralSlideWidth}px`);
      document.documentElement.style.setProperty('--side-slide-width', `${sideSlideWidth}px`);
      setSlideWidth(sideSlideWidth + 2 * slideMargin); // Включая отступы для вычисления translateX
      setIsLoading(false); // Отключить загрузку после установки размеров
    };

    if (!isMobile) {
      handleResize(); // Начальный вызов для установки значений
    }
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      setIsLoading(false); // Отключить загрузку на мобильных устройствах
    }
  }, [isMobile]);

  const handleMouseMove = (e) => {
    if (isAnimating || isMobile) return; // Предотвращает обработку движения мыши во время анимации или на мобильных устройствах

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const mouseX = e.clientX - sliderRect.left;

    const centralSlideWidth = sliderRect.width * 0.4; // Ширина центрального слайда
    const sideSlideWidth = (sliderRect.width - centralSlideWidth) / (visibleSlidesCount - 0.85); // Ширина каждого бокового слайда

    const zones = [
      sideSlideWidth * 1, // Зона 1: 100% бокового слайда
      sideSlideWidth * 2, // Зона 2: 200% бокового слайда
      sideSlideWidth * 3, // Зона 3: 300% бокового слайда
      centralSlideWidth, // Начало центрального слайда (начало Зоны 4)
      sliderRect.width - sideSlideWidth * 3, // Зона 5: 300% бокового слайда с правой стороны
      sliderRect.width - sideSlideWidth * 2, // Зона 6: 200% бокового слайда с правой стороны
      sliderRect.width - sideSlideWidth * 1 // Зона 7: 100% бокового слайда с правой стороны
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

  const getSlideClassMobile = (index) => {
    const relativeIndex = (index + totalSlides - currentIndex) % totalSlides;
    if (relativeIndex === visibleSlidesCount + 1) { // Исправляем здесь
      return 'slide center';
    } else {
      return 'slide';
    }
  };

  const renderDots = () => {
    return (
      <div className="slide-dots">
        {slides.map((_, index) => {
          const isActive = ((currentIndex - visibleSlidesCount) % slidesLength) === index;
          return (
            <div key={index} className={`dot ${isActive ? 'active' : ''}`} />
          );
        })}
      </div>
    );
  };

  return (
    <div className="slider-container" ref={sliderRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onTouchStart={handleSwipeStart} onTouchEnd={handleSwipeEnd}>
      {isLoading ? (
        <div className="loading-screen">Loading...</div>
      ) : (
        <>
          {!isMobile && <button onClick={() => prevSlide(1)} className="nav left-nav">‹</button>}
          <div className="slider-wrapper">
            <div className="slider" style={{ transform: `translateX(-${isMobile ? currentIndex * ((fixedSlideWidth / 100 * document.querySelector('.slider-container').offsetWidth) + slideMargin * 2) : currentIndex * slideWidth}px)` }}>
              {getClonedSlides().map((slide, index) => (
                <Slide
                  key={index}
                  slide={slide}
                  className={isMobile ? getSlideClassMobile(index) : getSlideClass(index)}
                  style={isMobile ? { flex: '0 0 70%', margin: '0 10px', filter: `grayscale(${index === currentIndex ? 0 : 1})`, opacity: 1, boxShadow: `${index === currentIndex ? '0 0 15px rgba(255, 255, 255, 0.4)' : 'none'}` } : getSlideStyle(index)}
                />
              ))}
            </div>
          </div>
          {!isMobile && <button onClick={() => nextSlide(1)} className="nav right-nav">›</button>}
          {isMobile && renderDots()} {/* Add dots for mobile view */}
        </>
      )}
    </div>
  );
};

export default Slider;
