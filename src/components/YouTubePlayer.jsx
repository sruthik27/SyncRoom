import React, { forwardRef } from "react";
import YouTube from "react-youtube";

const YouTubePlayer = forwardRef(
  (
    { videoId, isPlaying, currentTime, onReady, onStateChange, className },
    ref,
  ) => {
    const opts = {
      height: "100%",
      width: "100%",
      playerVars: {
        controls: 0, // Hide default controls
        disablekb: 1, // Disable keyboard controls
        modestbranding: 1, // Hide YouTube logo
        rel: 0, // Disable related videos at the end
        showinfo: 0, // Hide video info
        fs: 0, // Disable fullscreen button
        iv_load_policy: 3, // Disable annotations
        preventFullScreen: 1, // Disable fullscreen on click
      },
    };

    return (
      <div className="relative w-full pt-[56.25%]" data-testid="youtube-player">
        <div className="absolute inset-0">
          <YouTube
            videoId={videoId}
            ref={ref}
            onReady={onReady}
            onStateChange={onStateChange}
            opts={opts}
            onClick={(e) => e.preventDefault()}
            className={`w-full h-full ${className}`}
            iframeClassName="w-full h-full"
            data-testid="youtube-iframe"
          />
        </div>
      </div>
    );
  },
);

export default YouTubePlayer;
