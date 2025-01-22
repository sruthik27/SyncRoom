import React, { useState, useEffect, useRef } from "react";
import YouTubePlayer from "./YouTubePlayer.jsx";
import { Button } from "@/components/ui/button";
import "../App.css";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlayCircle,
  PauseCircle,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  VolumeX,
  Music2,
  ListMusic,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MusicVisualizer from "@/components/MusicVisualizer.jsx";
import YouTube from "react-youtube";
import { useSoundEffects } from "@/hooks/useSoundEffects.js";
import RunningText from "./RunningText.jsx";
import SparklingStars from "./SparklingStars.jsx";
import PlayingSongIndicator from "@/components/PlayingIndicator.jsx";
import { motion } from "framer-motion";

const AudioPlayer = ({
  wsRef,
  roomId,
  userName,
  isAdmin,
  setSnackbarMessage,
  roomSongsCount,
  setRoomSongsCount,
  fetchRoomMembers,
}) => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isShuffleOn, setIsShuffleOn] = useState(false);
  const [isRepeatOn, setIsRepeatOn] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  const { playClick, playToggle, playSeek, playVolume } = useSoundEffects();

  const audioRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const currentSongRef = useRef(currentSong);
  const currentProgressRef = useRef(currentProgress);
  const isPlayingRef = useRef(isPlaying);
  const isShuffleOnRef = useRef(isShuffleOn);
  const isRepeatOnRef = useRef(isRepeatOn);
  const isAdminRef = useRef(isAdmin);
  useEffect(() => {
    currentProgressRef.current = currentProgress;
  }, [currentProgress]);
  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  useEffect(() => {
    isAdminRef.current = isAdmin;
  }, [isAdmin]);
  useEffect(() => {
    isShuffleOnRef.current = isShuffleOn;
  }, [isShuffleOn]);
  useEffect(() => {
    isRepeatOnRef.current = isRepeatOn;
  }, [isRepeatOn]);

  // Define the fetchRoomState function
  const fetchRoomState = async () => {
    try {
      const response = await fetch(
        `https://lu84xxokwg.execute-api.ap-south-1.amazonaws.com/default/RoomStatus?roomId=${roomId}`,
      );
      const data = await response.json();
      console.log(data);
      if (data.songList) {
        const songsArray = data.songList
          .sort((a, b) => a.time - b.time)
          .map((song) => ({
            name: song.songName,
            url: song.songUrl,
            adder: song.userName,
            time: song.time,
          }));
        setSongs(songsArray);
      }
      setRoomSongsCount(data.roomSongs);
      if (data.isRepeat) {
        setIsRepeatOn(true);
      }
      if (data.isShuffle) {
        setIsShuffleOn(true);
      }

      const currentTime = Math.floor(Date.now() / 1000);
      const timeSinceCreation = currentTime - data.createdAt;
      const timeRemaining = 3600 - timeSinceCreation;

      if (timeRemaining > 0) {
        setTimeout(() => {
          localStorage.removeItem("userName");
          localStorage.removeItem("roomId");
          window.location.href = "/expired";
        }, timeRemaining * 1000);
      } else {
        localStorage.removeItem("userName");
        localStorage.removeItem("roomId");
        window.location.href = "/expired";
      }
    } catch (error) {
      console.error("Error fetching room state:", error);
    }
  };

  // To call fetchRoomState and notify ws on component mount
  useEffect(() => {
    setTimeout(fetchRoomState, isAdminRef.current ? 2000 : 1000);
    setSnackbarMessage("Syncing room status...");
    const interval = setInterval(() => {
      if (wsRef?.current?.readyState === WebSocket.OPEN) {
        sendWebSocketMessage({
          action: "membersedit",
          roomId,
          isRemove: false,
          user: userName,
          notifyMessage: `${userName} joined the room`,
        });
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Add WebSocket message handler
  useEffect(() => {
    if (roomId && userName) {
      let retryCount = 0;

      const setupWebSocketHandlers = (ws) => {
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        };
        ws.onerror = (error) => {
          console.error("WebSocket Error:", error);
          ws.close();
        };
        ws.onclose = () => {
          console.log("WebSocket Disconnected");
          if (retryCount < 15) {
            setTimeout(() => {
              const newWs = new WebSocket(
                `wss://oftfeteezj.execute-api.ap-south-1.amazonaws.com/production/?roomId=${roomId}&userId=${userName}`,
              );
              wsRef.current = newWs;
              setupWebSocketHandlers(newWs);
              retryCount++;
            }, 5000);
          } else {
            console.log("Max retry attempts reached. Refreshing page.");
            window.location.reload();
          }
        };
      };

      if (wsRef?.current) {
        setupWebSocketHandlers(wsRef.current);
      }
    }
  }, [wsRef]);

  const updateProgressInterval = async () => {
    if (currentPlayer === "youtube" && youtubePlayerRef.current) {
      let currentProgress =
        await youtubePlayerRef.current.internalPlayer.getCurrentTime();
      setCurrentProgress(currentProgress);
    }
  };

  //To update progressbar
  useEffect(() => {
    let interval = null;
    if (isPlaying && currentPlayer === "youtube") {
      interval = setInterval(() => {
        updateProgressInterval().catch(console.error);
      }, 100);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isPlaying, currentPlayer, youtubePlayerRef]);

  const handleRepeatShuffle = (isRepeat, isShuffle) => {
    if (isRepeat !== undefined) {
      setIsRepeatOn(isRepeat);
      if (isRepeat) {
        setIsShuffleOn(false);
      }
    }
    if (isShuffle !== undefined) {
      setIsShuffleOn(isShuffle);
      if (isShuffle) {
        setIsRepeatOn(false);
      }
    }
  };

  const handleWebSocketMessage = async (data) => {
    if (data.action === "songsedit") {
      if (data.count !== roomSongsCount) {
        try {
          const response = await fetch(
            `https://6qmvsw8tgd.execute-api.ap-south-1.amazonaws.com/v1/GetRoomSongs?roomId=${roomId}`,
          );
          const newSongs = await response.json();
          setSongs(newSongs.sort((a, b) => a.time - b.time));
          setRoomSongsCount(data.count);
        } catch (error) {
          console.error("Error fetching updated songs:", error);
        }
      }
    } else if (data.action === "membersedit") {
      fetchRoomMembers();
      if (data.notifyMessage === "sorryyouareremoved") {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
        window.location.href = "/removed";
        return;
      }
      if (data.notifyMessage.includes("joined") && isAdminRef.current) {
        sendWebSocketMessage({
          action: "playback",
          songName: currentSongRef.current?.name,
          songUrl: currentSongRef.current?.url,
          currentTime: currentProgressRef.current,
          isPlaying: isPlayingRef.current,
          roomId,
        });
      }
    } else if (data.action === "playback") {
      if (
        data.songUrl === currentSong?.url &&
        data.currentTime === currentProgress &&
        data.isPlaying === isPlaying
      ) {
        console.log("All values are the same");
        return; // Return immediately if all values are the same
      }

      //Playback handler
      const receivedSong = {
        name: data.songName,
        url: data.songUrl,
      };
      // If the song URL is different, we need to change the song
      if (currentSong?.url !== data.songUrl) {
        if (receivedSong) {
          // Create a promise to handle the state updates
          await new Promise((resolve) => {
            setCurrentSong(receivedSong);
            setIsPlaying(data.isPlaying);

            if (isYouTubeUrl(receivedSong.url)) {
              setCurrentPlayer("youtube");
            } else {
              setCurrentPlayer("audio");
            }
            resolve();
          });

          // Small timeout to ensure state updates have propagated
          await new Promise((resolve) => setTimeout(resolve, 100));
          // Handle YouTube player
          if (isYouTubeUrl(receivedSong.url) && youtubePlayerRef.current) {
            let attempts = 0;
            const retryStateCheck = async () => {
              if (attempts < 3) {
                let currentState =
                  await youtubePlayerRef.current.internalPlayer.getPlayerState();
                attempts++;
                setTimeout(retryStateCheck, 200); // Adjust delay as needed
              } else {
                await youtubePlayerRef.current.internalPlayer.seekTo(
                  data.currentTime,
                  true,
                );
                let currentState =
                  await youtubePlayerRef.current.internalPlayer.getPlayerState();
                if (
                  data.isPlaying &&
                  currentState !== YouTube.PlayerState.PLAYING
                ) {
                  youtubePlayerRef.current.internalPlayer.playVideo();
                  await youtubePlayerRef.current.internalPlayer.seekTo(
                    data.currentTime,
                  );
                } else if (
                  !data.isPlaying &&
                  currentState !== YouTube.PlayerState.PAUSED
                ) {
                  console.log("Pausing");
                  youtubePlayerRef.current.internalPlayer.pauseVideo();
                  await youtubePlayerRef.current.internalPlayer.seekTo(
                    data.currentTime,
                  );
                }
              }
            };
            retryStateCheck();
          }
          // Handle Audio player
          else if (!isYouTubeUrl(receivedSong.url) && audioRef.current) {
            async function waitForAudioPlayerReady(
              audioPlayer,
              timeout = 10000,
            ) {
              return new Promise((resolve, reject) => {
                if (!audioPlayer.src) {
                  reject(new Error("Audio player has no source"));
                  return;
                }

                // If already ready, resolve immediately
                if (audioPlayer.readyState > 0) {
                  resolve(true);
                  return;
                }

                // Trigger load in case the player hasn't started loading
                audioPlayer.load();

                // Set up the canplay event listener
                const onCanPlay = () => {
                  audioPlayer.removeEventListener("canplay", onCanPlay);
                  resolve(true);
                };

                // Listen for the canplay event
                audioPlayer.addEventListener("canplay", onCanPlay);

                // Set a timeout to prevent indefinite waiting
                setTimeout(() => {
                  audioPlayer.removeEventListener("canplay", onCanPlay);
                  reject(
                    new Error(
                      "Audio player did not become ready within timeout period",
                    ),
                  );
                }, timeout);
              });
            }
            // Usage in play/pause logic
            try {
              audioRef.current.src = receivedSong.url;
              await waitForAudioPlayerReady(audioRef.current);
              audioRef.current.currentTime = data.currentTime;
              audioRef.current.oncanplay = () => {
                if (data.isPlaying) {
                  console.log("Playing audio");
                  audioRef.current.play();
                } else {
                  audioRef.current.pause();
                }
              };
            } catch (error) {
              console.error("Error setting up audio player:", error);
            }
          }
        }
      }
      // If it's the same song, just update the playback state and time
      else {
        setIsPlaying(data.isPlaying);

        if (currentPlayer === "youtube" && youtubePlayerRef.current) {
          youtubePlayerRef.current.internalPlayer.seekTo(data.currentTime);
          if (data.isPlaying) {
            youtubePlayerRef.current.internalPlayer.playVideo();
          } else {
            youtubePlayerRef.current.internalPlayer.pauseVideo();
          }
        } else if (currentPlayer === "audio" && audioRef.current) {
          audioRef.current.currentTime = data.currentTime;
          audioRef.current.oncanplay = () => {
            if (data.isPlaying) {
              audioRef.current.play();
            } else {
              audioRef.current.pause();
            }
          };
        }
      }

      // Update progress state
      setCurrentProgress(data.currentTime);
    } else if (data.action === "playcontrol") {
      //Return/Shuffle handler
      handleRepeatShuffle(data.isRepeat, data.isShuffle);
    }
    // Show notification message
    setSnackbarMessage(data.notifyMessage);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]{11})/,
    );
    return match ? match[1] : null;
  };

  const isYouTubeUrl = (url) => {
    return (
      url && url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/)
    );
  };

  const sendWebSocketMessage = (messageData) => {
    console.log(wsRef?.current?.readyState);
    if (wsRef?.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData));
    }
  };

  const handleButtonClick = (callback) => {
    const now = Date.now();
    if (now - lastClickTime < 1000) {
      return;
    }
    setLastClickTime(now);
    callback();
  };

  const handlePlayPause = async (isManual = false) => {
    playToggle();
    let runninTime = 0;
    if (currentPlayer === "youtube" && youtubePlayerRef.current) {
      runninTime =
        await youtubePlayerRef.current.internalPlayer.getCurrentTime();
    } else if (currentPlayer === "audio" && audioRef.current) {
      runninTime = audioRef.current.currentTime;
    }

    const newIsPlaying = !isPlayingRef.current;
    setIsPlaying(newIsPlaying);
    if (currentPlayer === "audio" && audioRef.current) {
      audioRef.current.oncanplay = () => {
        if (newIsPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      };
      if (audioRef.current.readyState > 0) {
        if (newIsPlaying) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      } else {
        audioRef.current.load();
      }
    } else if (currentPlayer === "youtube" && youtubePlayerRef.current) {
      if (newIsPlaying) {
        youtubePlayerRef.current.internalPlayer.playVideo();
      } else {
        youtubePlayerRef.current.internalPlayer.pauseVideo();
      }
    }
    if (isManual) {
      sendWebSocketMessage({
        action: "playback",
        songName: currentSongRef.current?.name,
        songUrl: currentSongRef.current?.url,
        currentTime: runninTime,
        isPlaying: newIsPlaying,
        roomId,
        notifyMessage: `${userName} ${newIsPlaying ? "played" : "paused"} the song`,
      });
    }

    handleWebSocketMessage({
      action: "playback",
      songUrl: currentSong?.url,
      currentTime: runninTime,
      isPlaying: newIsPlaying,
      roomId,
      notifyMessage: null,
    });
  };

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.setActionHandler("play", () =>
        handlePlayPause(false),
      );
      navigator.mediaSession.setActionHandler("pause", () =>
        handlePlayPause(false),
      );
      navigator.mediaSession.setActionHandler(
        "previoustrack",
        playPreviousSong,
      );
      navigator.mediaSession.setActionHandler("nexttrack", playNextSong);
    }

    return () => {
      if ("mediaSession" in navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
      }
    };
  }, [handlePlayPause]);

  const handleSeek = (e) => {
    playSeek();
    const newTime = parseFloat(e.target.value);
    setCurrentProgress(newTime);
    if (currentPlayer === "audio" && audioRef.current) {
      audioRef.current.currentTime = newTime;
    } else if (currentPlayer === "youtube" && youtubePlayerRef.current) {
      youtubePlayerRef.current.internalPlayer.seekTo(newTime, true);
    }

    sendWebSocketMessage({
      action: "playback",
      songName: currentSongRef.current?.name,
      songUrl: currentSongRef.current?.url,
      currentTime: newTime,
      isPlaying,
      roomId,
      notifyMessage: `${userName} moved to ${formatTime(newTime)}`,
    });
  };

  const handleVolumeChange = (e) => {
    playVolume();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);

    if (currentPlayer === "audio" && audioRef.current) {
      audioRef.current.volume = newVolume;
    } else if (currentPlayer === "youtube" && youtubePlayerRef.current) {
      youtubePlayerRef.current.internalPlayer.setVolume(newVolume * 100);
    }
  };

  const toggleMute = () => {
    playToggle();
    const newIsMuted = !isMuted;
    setIsMuted(newIsMuted);

    if (newIsMuted) {
      setPreviousVolume(volume);
      setVolume(0);
      if (currentPlayer === "audio" && audioRef.current) {
        audioRef.current.volume = 0;
      } else if (currentPlayer === "youtube" && youtubePlayerRef.current) {
        youtubePlayerRef.current.internalPlayer.mute();
      }
    } else {
      setVolume(previousVolume);
      if (currentPlayer === "audio" && audioRef.current) {
        audioRef.current.volume = previousVolume;
      } else if (currentPlayer === "youtube" && youtubePlayerRef.current) {
        youtubePlayerRef.current.internalPlayer.unMute();
        youtubePlayerRef.current.internalPlayer.setVolume(previousVolume * 100);
      }
    }
  };

  const getCurrentSongIndex = () => {
    return songs.findIndex((song) => song.url === currentSong?.url);
  };

  const handleSongEnd = () => {
    if (isRepeatOnRef.current) {
      if (currentPlayer === "audio" && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else if (currentPlayer === "youtube" && youtubePlayerRef.current) {
        youtubePlayerRef.current.internalPlayer.seekTo(0);
        youtubePlayerRef.current.internalPlayer.playVideo();
      }
    } else {
      playNextSong(false);
    }
  };

  const playNextSong = (isManual = false) => {
    handleButtonClick(() => {
      if (isManual) playClick();
      if (songs.length <= 1) return;

      const currentIndex = getCurrentSongIndex();
      let nextIndex;

      if (isShuffleOnRef.current && (isAdminRef.current || isManual)) {
        do {
          nextIndex = Math.floor(Math.random() * songs.length);
        } while (nextIndex === currentIndex);
        playSong(songs[nextIndex], true);
      } else {
        nextIndex = (currentIndex + 1) % songs.length;
        playSong(songs[nextIndex], isManual);
      }
    });
  };

  const playPreviousSong = (isManual = false) => {
    handleButtonClick(() => {
      if (isManual) playClick();
      if (songs.length === 0) return;

      const currentIndex = getCurrentSongIndex();
      let prevIndex;

      if (isShuffleOnRef.current) {
        do {
          prevIndex = Math.floor(Math.random() * songs.length);
        } while (prevIndex === currentIndex);
      } else {
        prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
      }
      playSong(songs[prevIndex], isManual);
    });
  };

  const playSong = async (song, isManual = false) => {
    if (isManual) {
      sendWebSocketMessage({
        action: "playback",
        songName: song?.name,
        songUrl: song?.url,
        currentTime: 0,
        isPlaying: true,
        roomId,
        notifyMessage: `${userName} started playing ${song.name}`,
      });
    }
    handleWebSocketMessage({
      action: "playback",
      songUrl: song?.url,
      songName: song?.name,
      currentTime: 0,
      isPlaying: true,
      roomId,
      notifyMessage: null,
    });
  };

  const [removing, setRemoving] = useState([]);

  // Remove a song from the room
  async function triggerRemoveSongFromRoom(roomId, songUrl) {
    const url =
      "https://2vtd71x7m7.execute-api.ap-south-1.amazonaws.com/default/RemoveSongFromRoom";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: roomId,
          songUrl: songUrl,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Song removed successfully:", data);
      } else {
        console.error("Failed to remove song:", data);
      }
      return response;
    } catch (error) {
      console.error("Error:", error);
    }
  }

  const handleRemoveSong = (song) => {
    playClick();
    setSnackbarMessage(`Removing ${song.name}...`);
    triggerRemoveSongFromRoom(roomId, song.url).then((r) => {
      if (r.ok) {
        setRemoving((prev) => [...prev, song.time]); // Mark the song as being removed
        sendWebSocketMessage({
          action: "songsedit",
          roomId,
          notifyMessage: `${userName} removed ${song.name}`,
        });
        // Wait for animation to finish before actually removing the item
        setTimeout(() => {
          setSongs((prev) => prev.filter((t) => t.time !== song.time));
          setRemoving((prev) => prev.filter((t) => t !== song.time)); // Remove from state after animation
          setSnackbarMessage(`Removed ${song.name}`);
        }, 400); // Matches the animation duration (0.4s)
      } else {
        setSnackbarMessage(`Failed to remove ${song.name}`);
      }
    }); // Remove the song from the room
  };

  const handleToggleRepeat = () => {
    playToggle();
    const newIsRepeatOn = !isRepeatOn;
    setIsRepeatOn(newIsRepeatOn);
    if (newIsRepeatOn) {
      setIsShuffleOn(false);
    }

    sendWebSocketMessage({
      action: "playback",
      roomId,
      isRepeat: newIsRepeatOn,
      notifyMessage: `${userName} ${newIsRepeatOn ? "enabled" : "disabled"} repeat mode`,
    });
  };

  const handleToggleShuffle = () => {
    playToggle();
    const newIsShuffleOn = !isShuffleOn;
    setIsShuffleOn(newIsShuffleOn);
    if (newIsShuffleOn) {
      setIsRepeatOn(false);
    }

    sendWebSocketMessage({
      action: "playback",
      roomId,
      isShuffle: newIsShuffleOn,
      notifyMessage: `${userName} ${newIsShuffleOn ? "enabled" : "disabled"} shuffle mode`,
    });
  };

  const isMobile = window.innerWidth < 640;

  const PlaylistHeader = ({ songCount }) => {
    return (
      <CardHeader className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ListMusic className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-medium text-primary-foreground">
              {songCount}
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Playlist</h3>
            <p className="text-sm text-muted-foreground">
              {songCount} {songCount === 1 ? "song" : "songs"} in queue
            </p>
          </div>
        </div>
      </CardHeader>
    );
  };

  return (
    <div>
      {songs.length === 0 ? (
        <>
          {/*<SparklingStars />*/}
          <div
            className={`flex items-center justify-center ${
              isMobile ? "h-[50vh]" : "h-[60vh]"
            }`}
          >
            <h3 className="text-lg font-semibold text-muted-foreground">
              No songs in the room
            </h3>
          </div>
        </>
      ) : (
        <div className={`flex-1 flex ${"flex-col"} p-4`}>
          {/* Playlist */}
          <div className="w-full">
            <Card>
              <PlaylistHeader songCount={songs.length} />
              <CardContent className="p-0">
                <ScrollArea
                  className={`${
                    currentPlayer === "youtube"
                      ? isMobile
                        ? "h-[30vh]"
                        : "h-[40vh]"
                      : isMobile
                        ? "h-[70vh]"
                        : "h-[60vh]"
                  }`}
                  onScroll={(e) => {
                    const target = e.target;
                    if (
                      target.scrollHeight - target.scrollTop ===
                      target.clientHeight
                    ) {
                      target.parentElement.scrollBy(0, 10);
                    }
                  }}
                >
                  <div className="space-y-2" data-testid="playlist">
                    {songs.map((song, i) => {
                      const isNowPlaying = currentSong?.url === song?.url;

                      return (
                        <motion.div
                          key={i}
                          className={cn(
                            "w-full p-3 flex items-center gap-3 rounded-lg relative",
                            "hover:bg-secondary transition-colors song-item",
                            removing.includes(song.time) && "animate-slide-out",
                            isNowPlaying &&
                              "bg-primary/5 border border-primary/20",
                          )}
                          animate={
                            isNowPlaying
                              ? {
                                  boxShadow: [
                                    "0 0 0 0 rgba(147, 51, 234, 0)",
                                    "0 0 0 4px rgba(147, 51, 234, 0.1)",
                                    "0 0 0 0 rgba(147, 51, 234, 0)",
                                  ],
                                }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          data-testid={`playlist-item-${i}`}
                        >
                          {/* Song Button */}
                          <button
                            className="flex items-center gap-3 text-left overflow-hidden flex-1"
                            onClick={(e) => {
                              e.currentTarget.classList.remove(
                                "animate-click-effect",
                              );
                              void e.currentTarget.offsetWidth;
                              e.currentTarget.classList.add(
                                "animate-click-effect",
                              );
                              playSong(song, true);
                              e.currentTarget.addEventListener(
                                "animationend",
                                () => {
                                  e.currentTarget.classList.remove(
                                    "animate-click-effect",
                                  );
                                },
                                { once: true },
                              );
                            }}
                            data-testid={`playlist-item-button-${i}`}
                          >
                            <div className="relative">
                              {isNowPlaying && isPlaying ? (
                                <PlayingSongIndicator
                                  data-testid={`playing-indicator-${i}`}
                                />
                              ) : (
                                <Music2 className="h-5 w-5 text-muted-foreground shrink-0" />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <RunningText
                                text={song.name}
                                className={cn(
                                  "font-medium text-sm",
                                  isNowPlaying && "text-primary",
                                )}
                              />
                            </div>
                            <span
                              className={cn(
                                "text-sm text-muted-foreground shrink-0",
                                isNowPlaying && "text-primary/80",
                              )}
                            >
                              - {song?.adder}
                            </span>
                          </button>

                          {/* Trash Icon */}
                          <button
                            onClick={() => handleRemoveSong(song)}
                            className="text-muted-foreground p-1 hover:text-red-600 transition-colors"
                            data-testid={`remove-button-${i}`}
                          >
                            <Trash className="h-5 w-5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          {/* Player */}
          <div
            className={`${
              currentPlayer === "youtube" ? "w-full mt-4" : "hidden"
            }`}
          >
            <div className="w-full player">
              {currentPlayer === "youtube" && (
                <Card
                  className={`overflow-hidden youtube-player-wrapper ${isPlaying ? "glowing-border" : ""}`}
                >
                  <CardContent className="p-0">
                    <YouTubePlayer
                      ref={youtubePlayerRef}
                      videoId={getYouTubeVideoId(currentSong?.url)}
                      isPlaying={isPlaying}
                      currentTime={currentProgress}
                      onReady={(event) => {
                        setDuration(event.target.getDuration());
                        if (isPlaying) {
                          event.target.playVideo();
                        }
                        event.target.seekTo(currentProgress, true);
                        event.target.setVolume(volume * 100);
                      }}
                      onStateChange={(event) => {
                        const newDuration = event.target.getDuration();
                        if (newDuration !== duration) {
                          setDuration(newDuration);
                        }
                        if (!isDragging) {
                          setCurrentProgress(event.target.getCurrentTime());
                        }
                        // Handle play/pause/end detection
                        if (
                          event.data === YouTube.PlayerState.PLAYING &&
                          !isPlaying
                        ) {
                          handlePlayPause(false); // Video started playing
                        } else if (
                          event.data === YouTube.PlayerState.PAUSED &&
                          isPlaying
                        ) {
                          handlePlayPause(false); // Video paused
                        }
                        if (event.data === YouTube.PlayerState.ENDED) {
                          handleSongEnd();
                        }
                      }}
                      data-testid="youtube-player"
                    />
                  </CardContent>
                </Card>
              )}
              {currentPlayer === "audio" && (
                <audio
                  ref={audioRef}
                  onEnded={handleSongEnd}
                  onTimeUpdate={() => {
                    if (!isDragging) {
                      setCurrentProgress(audioRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    setDuration(audioRef.current.duration);
                  }}
                  data-testid="audio-player"
                />
              )}
            </div>
          </div>
        </div>
      )}
      {/*Control panel*/}
      <div
        className="fixed bottom-0 left-0 right-0 z-[200]"
        data-testid="control-panel"
      >
        <div className="min-h-20 border-t border-border bg-card">
          <div className="mx-auto px-2 sm:px-10 md:px-20 lg:px-40 py-2 sm:py-3">
            <SparklingStars />
            {isMobile ? (
              <div className="flex flex-col gap-2">
                {/* Song Info Row */}
                <div className="flex items-center gap-2 justify-center px-4 align-middle">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center relative overflow-hidden">
                    {isPlaying ? (
                      <MusicVisualizer />
                    ) : (
                      <Music2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex items-center justify-center overflow-hidden">
                    {currentSong?.name ? (
                      <RunningText
                        text={currentSong.name}
                        className="font-medium text-sm"
                      />
                    ) : null}
                  </div>
                </div>

                {/* Progress Bar Row */}
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xs text-muted-foreground w-12 text-center">
                    {formatTime(currentProgress)}
                  </span>
                  <div className="flex-1 h-1 bg-secondary rounded-full relative">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentProgress}
                      onChange={handleSeek}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${(currentProgress / duration) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-center">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Main Controls Row */}
                <div className="flex items-center justify-between px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleShuffle}
                    className={cn(
                      "h-8 w-8 sm:h-10 sm:w-10",
                      isShuffleOn ? "text-purple-500" : "text-muted-foreground",
                    )}
                  >
                    <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playPreviousSong}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    disabled={
                      Date.now() - lastClickTime < 1000 || songs.length === 0
                    }
                  >
                    <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => handlePlayPause(true)}
                    disabled={currentSong?.url == null}
                    data-testid="play-pause-button"
                  >
                    {isPlaying ? (
                      <PauseCircle
                        className="h-6 w-6 sm:h-8 sm:w-8"
                        data-testid="pause-icon"
                      />
                    ) : (
                      <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={playNextSong}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                    disabled={
                      Date.now() - lastClickTime < 1000 || songs.length === 0
                    }
                  >
                    <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleRepeat}
                    className={cn(
                      "h-8 w-8 sm:h-10 sm:w-10",
                      isRepeatOn ? "text-purple-500" : "text-muted-foreground",
                    )}
                  >
                    <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Progress Bar Row */}
                <div className="flex items-center gap-2 w-full">
                  <span className="text-xs text-muted-foreground w-12 text-center">
                    {formatTime(currentProgress)}
                  </span>
                  <div className="flex-1 h-1 bg-secondary rounded-full relative">
                    <input
                      type="range"
                      min="0"
                      max={duration}
                      value={currentProgress}
                      onChange={handleSeek}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{
                        width: `${(currentProgress / duration) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-center">
                    {formatTime(duration)}
                  </span>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between px-2">
                  {/* Song Info - Left */}
                  <div className="flex items-center gap-2 w-1/4 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-secondary rounded-lg flex items-center justify-center relative overflow-hidden">
                      {isPlaying ? (
                        <MusicVisualizer />
                      ) : (
                        <Music2 className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {currentSong?.name ? (
                        <RunningText
                          text={currentSong.name}
                          className="font-medium text-sm"
                        />
                      ) : null}
                    </div>
                  </div>

                  {/* Main Controls - Center */}
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleShuffle}
                      className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10",
                        isShuffleOn
                          ? "text-purple-500"
                          : "text-muted-foreground",
                      )}
                    >
                      <Shuffle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={playPreviousSong}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      disabled={
                        Date.now() - lastClickTime < 1000 || songs.length === 0
                      }
                    >
                      <SkipBack className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handlePlayPause(true)}
                      disabled={currentSong?.url == null}
                    >
                      {isPlaying ? (
                        <PauseCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                      ) : (
                        <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={playNextSong}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                      disabled={
                        Date.now() - lastClickTime < 1000 || songs.length === 0
                      }
                    >
                      <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleToggleRepeat}
                      className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10",
                        isRepeatOn
                          ? "text-purple-500"
                          : "text-muted-foreground",
                      )}
                    >
                      <Repeat className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </div>

                  {/* Volume Controls - Right */}
                  <div className="flex items-center gap-1 sm:gap-2 w-1/4 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      {volume === 0 ? (
                        <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </Button>
                    <input
                      className="w-16 sm:w-24"
                      type="range"
                      min="0"
                      max="1"
                      step="0.10"
                      value={volume}
                      onChange={handleVolumeChange}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
