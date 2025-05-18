import React, { useEffect, useRef, useState } from "react";
import { hightlightsSlides } from "../constants";
import gsap from "gsap";
import { pauseImg, playImg, replayImg } from "../utils";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const VideoCarousel = () => {
  const videoRef = useRef([]);
  const videoSpanRef = useRef([]);
  const videoDivRef = useRef([]);
  const [video, setVideo] = useState({
    isEnd: false,
    startPlay: false,
    videoId: 0,
    isLastVideo: false,
    isPlaying: false,
  });

  const [loadedData, setLoadedData] = useState([]);

  const { isEnd, startPlay, videoId, isLastVideo, isPlaying } = video;

  useEffect(() => {
    // Animate slider when videoId changes
    gsap.to("#slider", {
      x: `-${100 * videoId}%`,
      duration: 2,
      ease: "power2.inOut",
    });
  }, [videoId]);

  useEffect(() => {
    // Manage video playback based on the state
    if (videoRef.current[videoId]) {
      if (isPlaying) {
        videoRef.current[videoId].play();
      } else {
        videoRef.current[videoId].pause();
      }
    }
  }, [videoId, isPlaying]);

  const handleLoadedMetaData = (i, e) => setLoadedData((prev) => [...prev, e]);

  useEffect(() => {
    // Handle progress bar animation for each video
    let currentProgress = 0;
    let span = videoSpanRef.current[videoId];

    if (span) {
      let anim = gsap.to(span, {
        onUpdate: () => {
          const progress = Math.ceil(anim.progress() * 100);
          if (progress !== currentProgress) {
            currentProgress = progress;

            gsap.to(videoDivRef.current[videoId], {
              width: window.innerWidth < 760 ? "10vw" : "4vw",
            });
            gsap.to(span, {
              width: `${currentProgress}%`,
              backgroundColor: "white",
            });
          }
        },
        onComplete: () => {
          if (isPlaying) {
            gsap.to(videoDivRef.current[videoId], {
              width: '12px',
            });
            gsap.to(span, {
              backgroundColor: '#afafaf',
            });
          }
        },
      });

      if (videoId === 0) {
        anim.restart();
      }

      const animUpdate = () => {
        anim.progress(
          videoRef.current[videoId].currentTime / hightlightsSlides[videoId].videoDuration
        );
      };

      if (isPlaying) {
        gsap.ticker.add(animUpdate);
      } else {
        gsap.ticker.remove(animUpdate);
      }

      // Clean up animation ticker
      return () => {
        gsap.ticker.remove(animUpdate);
      };
    }
  }, [videoId, startPlay, isPlaying]);

  const handleProcess = (type, i) => {
    switch (type) {
      case "video-end":
        setVideo((prev) => ({ ...prev, isEnd: true, videoId: i + 1 }));
        break;
      case "video-last":
        setVideo((prev) => ({ ...prev, isLastVideo: true }));
        break;
      case "video-reset":
        setVideo((prev) => ({ ...prev, isLastVideo: false, videoId: 0 }));
        break;
      case "play":
      case "pause":
        setVideo((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
        break;
      default:
        return video;
    }
  };

  useEffect(() => {
    if (!startPlay) {
      setVideo((prev) => ({ ...prev, startPlay: true, isPlaying: true }));
    }
  }, []);

  return (
    <>
      <div id="slider" className="flex items-center transition-transform duration-2000 ease-in-out">
        {hightlightsSlides.map((list, i) => (
          <div key={list.id} className="sm:pr-20 pr-10">
            <div className="video-carousel_container">
              <div className="w-full h-full bg-black flex-center rounded-3xl overflow-hidden">
                <video
                  playsInline
                  preload="auto"
                  muted
                  className={`${
                    list.id === 2 && 'translate-x-44'}
                    pointer-events-none
                  }`}
                  ref={(el) => (videoRef.current[i] = el)}
                  onEnded={() =>
                    i !== hightlightsSlides.length - 1
                      ? handleProcess('video-end', i)
                      : handleProcess('video-last')
                  }
                  onPlay={() => {
                    setVideo((prevVideo) => ({
                      ...prevVideo,
                      isPlaying: true,
                    }));
                  }}
                  onLoadedMetadata={(e) => handleLoadedMetaData(i, e)}
                >
                  <source src={list.video} type="video/mp4" />
                </video>
              </div>
              <div className="absolute top-12 left-[5%] z-10">
                {list.textLists.map((text) => (
                  <p key={text} className="md:text-2xl text-xl font-medium">
                    {text}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="relative flex-center mt-10">
        <div className="flex-center py-5 px-7 bg-gray-300 rounded-full backdrop-blur">
          {hightlightsSlides.map((_, i) => (
            <span
              key={i}
              ref={(el) => (videoDivRef.current[i] = el)}
              className="mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer"
            >
              <span
                className="absolute h-full w-full rounded-full"
                ref={(el) => (videoSpanRef.current[i] = el)}
              />
            </span>
          ))}
        </div>
        <button
          className="control-btn"
          onClick={() => {
            if (isLastVideo) {
              handleProcess("video-reset");
            } else if (!isPlaying) {
              handleProcess("play");
            } else {
              handleProcess("pause");
            }
          }}
        >
          <img
            src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg}
            alt={isLastVideo ? "replay" : !isPlaying ? "Play" : "pause"}
          />
        </button>
      </div>
    </>
  );
};

export default VideoCarousel;
