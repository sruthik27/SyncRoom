import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import React, { useCallback, useEffect, useRef, useState } from "react";
import AudioPlayer from "./components/AudioPlayer.jsx";
import "./App.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircleIcon,
  Share2,
  InfoIcon,
  LogOut,
  Music3,
  Music4,
  Sparkles,
  Users,
} from "lucide-react";
import { Alert, Snackbar } from "@mui/material";
import RoomView from "./components/RoomView.jsx";
import FileUpload from "@/components/FileUpload.jsx";
import SparklingStars from "@/components/SparklingStars.jsx";
import { useSoundEffects } from "@/hooks/useSoundEffects.js";
import MembersSidebar from "@/components/MembersSidebar.jsx";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import InfoPopup from "@/components/InfoPopup.jsx";
import Footer from "@/components/Footer.jsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import YouTubeSearch from "@/components/YouTubeSearch";

// AWS Configuration
const REGION = import.meta.env.VITE_REGION;
const s3 = new S3Client({
  region: REGION,
  credentials: fromCognitoIdentityPool({
    clientConfig: { region: REGION },
    identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID,
  }),
});

const LoginView = ({ userName, setUserName, onSubmit }) => {
  const [isValid, setIsValid] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>_]/.test(userName);
    setIsValid(!hasSymbols && userName.length > 0);
  }, [userName]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (isValid && userName.trim()) {
        setIsSubmitting(true);
        onSubmit(e).finally(() => setIsSubmitting(false));
      }
    },
    [isValid, userName, onSubmit],
  );

  return (
    <div className="min-h-[95vh] flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border-2 relative overflow-hidden">
          <CardHeader className="space-y-2 relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mx-auto mb-4"
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center music-playing-border">
                <Music4 className="w-12 h-12 text-primary" />
              </div>
            </motion.div>

            <CardTitle
              className="text-3xl font-bold text-center"
              data-testId="name-card"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              >
                Time to tune in and turn up!
              </motion.span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 p-6 relative">
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              data-testId="name-form"
            >
              <div className="relative">
                <motion.div
                  animate={isFocused ? { scale: 1.02 } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Input
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`h-12 text-lg bg-secondary/50 backdrop-blur-sm transition-colors
                      ${!isValid && userName ? "border-red-500 focus:ring-red-500" : "focus:ring-primary/50"}`}
                    data-testId={"name-input"}
                  />
                </motion.div>

                <AnimatePresence>
                  {!isValid && userName && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute -bottom-6 left-0 flex items-center gap-1 text-red-500 text-sm"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Name cannot contain symbols</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 text-lg relative overflow-hidden"
                  disabled={!isValid || !userName.trim() || isSubmitting}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  data-testId={"submit-name-button"}
                >
                  <span className="relative z-10">Continue</span>
                  <AnimatePresence>
                    {isHovered && isValid && userName.trim() && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                      >
                        <Sparkles className="w-5 h-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

// Component for the main music room interface
const MusicView = ({
  userName,
  roomId,
  wsRef,
  isAdmin,
  setIsAdmin,
  setSnackbarMessage,
}) => {
  const [usernames, setUsernames] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHelpPopupOpen, setIsHelpPopupOpen] = useState(false);
  const [roomSongsCount, setRoomSongsCount] = useState(0);
  const { playClick } = useSoundEffects();
  const fetchRoomMembers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_GET_ROOM_MEMBERS_API}?roomId=${roomId}`,
      );
      const data = await response.json();
      const usernames = data.userIds;
      setUsernames(usernames);
      console.log(usernames);
      if (usernames[0] === userName) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error fetching room members:", error);
    }
  };

  useEffect(() => {
    fetchRoomMembers();
  }, [roomId]);

  // const isValidYouTubeUrl = (url) => {
  //   console.log(url);
  //   const regex =
  //     /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})(?:\S+)?$/;
  //   return regex.test(url);
  // };

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !roomId) return;
    if (selectedFiles.length + roomSongsCount > 20) {
      setSnackbarMessage(
        "❗Exceeds room songs limit. Remove some songs to add more.",
      );
      return;
    }
    setSnackbarMessage("Uploading...");
    try {
      let atleastOneUploaded = false;
      for (const selectedFile of selectedFiles) {
        if (selectedFile.size > 10 * 1024 * 1024) {
          // 10 MB in bytes
          setSnackbarMessage(
            `File ${selectedFile.name} is larger than 10 MB and cannot be uploaded.`,
          );
          continue;
        }
        const fileName = encodeURIComponent(
          selectedFile.name
            .replace(/\.mp3$/i, "")
            .replaceAll(" ", "_")
            .toLowerCase(),
        );
        const keyWithRoomId = `${roomId}/${fileName}`;

        // Upload to S3
        await s3.send(
          new PutObjectCommand({
            Bucket: import.meta.env.VITE_BUCKET_NAME,
            Key: keyWithRoomId,
            Body: selectedFile,
          }),
        );

        // Generate S3 URL
        const url = `https://${import.meta.env.VITE_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${keyWithRoomId}`;

        // Update room's song list
        const response = await fetch(
          `${import.meta.env.VITE_ADD_SONG_TO_ROOM_API}?roomId=${roomId}&songName=${fileName}&songUrl=${encodeURIComponent(url)}&userName=${userName}`,
        );
        const result = await response.json();
        if (result.message === "already_exists") {
          setSnackbarMessage("Song already exists in room");
        } else {
          atleastOneUploaded = true;
          setSnackbarMessage(`Upload succeeded! - ${selectedFile.name}`);
        }
      }
      if (atleastOneUploaded) {
        wsRef.current.send(
          JSON.stringify({
            action: "songsedit",
            roomId: roomId,
            notifyMessage: `${userName} added new ${selectedFiles.length === 1 ? "song" : "songs"}`,
          }),
        );
      }
      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
      setSnackbarMessage("Upload failed. Please try again.");
    }
  };

  const handleYouTubeSubmit = async (name, url) => {
    playClick();
    // if (!youtubeUrl.trim() || !isValidYouTubeUrl(youtubeUrl)) {
    //   setSnackbarMessage("Invalid YouTube URL");
    //   console.error("Invalid YouTube URL");
    //   return;
    // }

    // const urlParams = new URLSearchParams(new URL(youtubeUrl).search);
    // const playListId = urlParams.get("list");

    // if (playListId) {
    //   setSnackbarMessage("Adding playlist...");
    //   try {
    //     const response = await fetch(
    //       `https://invidious.jing.rocks/api/v1/playlists/${playListId}`,
    //     );
    //     const data = await response.json();
    //
    //     let counter = 0;
    //     for (const video of data.videos) {
    //       if (roomSongsCount + counter > 20) {
    //         setSnackbarMessage(
    //           "❗Exceeds room songs limit. Remove some songs to add more.",
    //         );
    //         break;
    //       }
    //       const songName = video.title;
    //       const songUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
    //
    //       const response = await fetch(
    //       `${import.meta.env.VITE_ADD_SONG_TO_ROOM_API}?roomId=${roomId}&songName=${encodeURIComponent(songName)}&songUrl=${encodeURIComponent(url)}&userName=${userName}`,
    //     );
    //       const result = await response.json();
    //       if (result.message === "already_exists") {
    //         setSnackbarMessage("Song already exists in room");
    //       } else {
    //         counter++;
    //       }
    //     }
    //     wsRef.current.send(
    //       JSON.stringify({
    //         roomId: roomId,
    //         action: "songsedit",
    //         notifyMessage: `${userName} added songs`,
    //       }),
    //     );
    //     setSnackbarMessage("Playlist added successfully!");
    //   } catch (error) {
    //     console.error("Error adding playlist:", error);
    //     setSnackbarMessage("Failed to add playlist. Please try again.");
    //   }
    // }
    if (roomSongsCount >= 20) {
      setSnackbarMessage(
        "❗Exceeds room songs limit. Remove some songs to add more.",
      );
      // setYoutubeUrl("");
      // setYoutubeSongName("");
      return;
    }
    setSnackbarMessage("Adding song...");
    try {
      // const res = await fetch(
      //   `https://www.youtube.com/oembed?url=${youtubeUrl}&format=json`,
      // );
      // const data = await res.json();
      const songName = name.split("|")[0].trim();
      const response = await fetch(
        `${import.meta.env.VITE_ADD_SONG_TO_ROOM_API}?roomId=${roomId}&songName=${encodeURIComponent(songName)}&songUrl=${encodeURIComponent(url)}&userName=${userName}`,
      );
      const result = await response.json();
      if (result.message === "already_exists") {
        setSnackbarMessage("Song already exists in room");
      } else {
        wsRef.current.send(
          JSON.stringify({
            roomId: roomId,
            action: "songsedit",
            notifyMessage: `${userName} added ${songName}`,
          }),
        );
        setTimeout(() => {
          setSnackbarMessage("Song added successfully!");
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding YouTube song:", error);
      setSnackbarMessage("Failed to add song. Please try again.");
    }
  };

  const handleRemoveMember = (selectedUsername) => {
    usernames.splice(usernames.indexOf(selectedUsername), 1);
    setUsernames([...usernames]);
    wsRef.current.send(
      JSON.stringify({
        roomId,
        action: "membersedit",
        isRemove: true,
        user: selectedUsername,
        notifyMessage: `${userName} removed ${selectedUsername}`,
      }),
    );
  };

  const handleExit = () => {
    localStorage.removeItem("userName");
    localStorage.removeItem("roomId");
    window.location.href = window.location.pathname;
  };

  const isMobile = window.innerWidth < 640;

  return (
    <div className="min-h-[95vh] flex flex-col">
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipContent>
                  <p>About app and Feedback</p>
                </TooltipContent>
                <TooltipTrigger>
                  <InfoIcon
                    className="h-4 w-4 cursor-pointer"
                    onClick={() => setIsHelpPopupOpen(true)}
                  />
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipContent>
                  <p>Share this for people to join</p>
                </TooltipContent>
                <TooltipTrigger>
                  <div className="flex items-center flex-wrap">
                    <h2
                      className={`font-semibold ${isMobile ? "text-[1em]" : "text-xl"} cursor-pointer whitespace-nowrap`}
                      onClick={() => {
                        navigator.clipboard.writeText(roomId);
                        setSnackbarMessage("Room name copied!");
                        setSnackbarOpen(true);
                      }}
                    >
                      Room: {roomId}
                    </h2>
                    <Share2
                      className="ml-2 h-5 w-5 inline-block cursor-pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.href.replace(/\/$/, "")}?roomId=${roomId}`,
                        );
                        setSnackbarMessage("Room URL copied to clipboard!");
                        setSnackbarOpen(true);
                      }}
                    />
                  </div>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
          <h1 className="header-text" data-test="header-title">
            Sync Room
          </h1>
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground hidden sm:block">
              Welcome, {userName}!
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipContent>
                  <p>View and remove any room members</p>
                </TooltipContent>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => {
                      playClick();
                      setIsSidebarOpen((prev) => !prev);
                    }}
                  >
                    <Users className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-white">
                      {usernames.length}
                    </span>
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipContent>
                  <p>Leave the room 👋</p>
                </TooltipContent>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExit}
                    className="h-8 w-8 sm:h-10 sm:w-10"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Music Area */}
        <main className="flex-1 px-6 overflow-auto h-full">
          <div className="max-w-7xl mx-auto space-y-6 h-full">
            {/* Upload Section */}
            <Card className="w-full">
              <CardContent className="p-3">
                <FileUpload
                  handleUpload={handleUpload}
                  handleFileChange={handleFileChange}
                />
                <div className="my-4"></div>
                {/* YouTube Upload Section */}
                <YouTubeSearch onSubmit={handleYouTubeSubmit} />
                {/*<div className="flex items-center gap-4 flex-col sm:flex-row mt-4">*/}
                {/*  <Input*/}
                {/*    placeholder="Paste YouTube Song or Playlist's URL"*/}
                {/*    value={youtubeUrl}*/}
                {/*    onChange={(e) => setYoutubeUrl(e.target.value)}*/}
                {/*    onKeyDown={(e) => {*/}
                {/*      if (e.key === "Enter") {*/}
                {/*        handleYouTubeSubmit();*/}
                {/*      }*/}
                {/*    }}*/}
                {/*    className="bg-secondary"*/}
                {/*  />*/}
                {/*  <Button*/}
                {/*    onClick={handleYouTubeSubmit}*/}
                {/*    disabled={youtubeUrl === ""}*/}
                {/*  >*/}
                {/*    <Youtube className="h-4 w-4 mr-2" />*/}
                {/*    Add From YouTube*/}
                {/*  </Button>*/}
                {/*</div>*/}
              </CardContent>
            </Card>
            {/* Player */}
            <ScrollArea>
              <Card className={"h-auto"}>
                <AudioPlayer
                  wsRef={wsRef}
                  roomId={roomId}
                  userName={userName}
                  isAdmin={isAdmin}
                  setSnackbarMessage={setSnackbarMessage}
                  fetchRoomMembers={fetchRoomMembers}
                  roomSongsCount={roomSongsCount}
                  setRoomSongsCount={setRoomSongsCount}
                />
              </Card>
            </ScrollArea>
            <div className={isMobile ? "h-[14vh]" : "h-[10vh]"}></div>
          </div>
        </main>
        {/* Members Sidebar */}
        <MembersSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          usernames={usernames}
          currentUser={userName}
          isAdmin={isAdmin}
          onRemoveMember={handleRemoveMember}
          playSound={playClick}
        />
      </div>
      {isHelpPopupOpen && (
        <InfoPopup onClose={() => setIsHelpPopupOpen(false)} />
      )}
    </div>
  );
};

// Utility function to set item with TTL in localStorage
const setWithExpiry = (key, value, ttl) => {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

// Utility function to get item with TTL from localStorage
const getWithExpiry = (key) => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
};

function App() {
  // State management
  const [userName, setUserName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [view, setView] = useState("room");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showContinuePopup, setShowContinuePopup] = useState(false);

  // Refs
  const wsRef = useRef(null);

  const handleContinue = () => {
    const storedRoomId = getWithExpiry("roomId");
    const storedUserName = getWithExpiry("userName");
    setShowContinuePopup(false);
    setRoomId(storedRoomId);
    setUserName(storedUserName);
    console.log("Connecting");
    connectToWebSocket(storedRoomId, storedUserName);
    setView("music");
  };

  const handleCancel = () => {
    setShowContinuePopup(false);
    localStorage.removeItem("userName");
    localStorage.removeItem("roomId");
    setView("room");
  };

  // WebSocket connection handler
  const connectToWebSocket = useCallback((roomId, userName) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    if (roomId && userName) {
      console.log("really connecting");
      wsRef.current = new WebSocket(
        `${import.meta.env.VITE_WEBSOCKET_URL}?roomId=${roomId}&userId=${userName}`,
      );
      wsRef.current.onopen = () => {
        console.log("WebSocket Connected");
      };
    }
  }, []);

  // Check for stored userName and roomId on component mount
  useEffect(() => {
    const checkStoredData = async () => {
      if (
        window.location.pathname !== "/removed" &&
        window.location.pathname !== "/expired"
      ) {
        const storedUserName = getWithExpiry("userName");
        const storedRoomId = getWithExpiry("roomId");
        if (
          storedUserName &&
          storedRoomId &&
          storedUserName.trim() &&
          storedRoomId.trim()
        ) {
          const response = await fetch(
            `${import.meta.env.VITE_DOES_ROOM_EXIST_API}?roomId=${storedRoomId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );
          const data = await response.json();
          if (data.exists) {
            setShowContinuePopup(true);
          } else {
            localStorage.removeItem("userName");
            localStorage.removeItem("roomId");
            setView("room");
          }
        } else if (window.location.search.includes("roomId")) {
          const urlParams = new URLSearchParams(window.location.search);
          const roomIdFromUrl = urlParams.get("roomId");
          if (roomIdFromUrl) {
            setRoomId(roomIdFromUrl);
            setView("login");
          }
        }
      }
    };

    checkStoredData();
  }, []);

  //Close handler
  useEffect(() => {
    const handleUnload = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            roomId,
            action: "membersedit",
            isRemove: true,
            user: userName,
            notifyMessage: `${userName} left room`,
          }),
        );
      }
    };

    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("unload", handleUnload);
    };
  }, [roomId, userName, wsRef]);

  // Event handlers
  const handleLogin = useCallback(
    async (e) => {
      e.preventDefault();
      if (!userName.trim()) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_IS_NAME_AVAILABLE_API}?roomId=${roomId}&userId=${userName}`,
        );
        const data = await response.json();

        if (data.isFull) {
          setSnackbarMessage("Room is full, try later");
          setSnackbarOpen(true);
          setRoomId("");
          setView("room");
          return;
        }

        if (data.name_available) {
          connectToWebSocket(roomId, userName);
          setWithExpiry("userName", userName, 3600000); // 1 hour TTL
          setWithExpiry("roomId", roomId, 3600000); // 1 hour TTL
          setWithExpiry("isAdmin", isCreatingRoom, 3600000); // 1 hour TTL
          setView("music");
        } else {
          setSnackbarMessage("Name already taken in room, try different");
          setSnackbarOpen(true);
          setUserName("");
        }
      } catch (error) {
        console.error("Error checking name availability:", error);
      }
    },
    [userName, roomId, isCreatingRoom, connectToWebSocket],
  );

  const handleJoinRoom = useCallback(
    async (e) => {
      e.preventDefault();
      if (!roomId.trim()) return;
      try {
        const response = await fetch(
          `${import.meta.env.VITE_DOES_ROOM_EXIST_API}?roomId=${roomId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.json();
        //proceed to create if not exist
        if (isCreatingRoom) {
          if (!data.exists) {
            setView("login");
          } else {
            setSnackbarMessage("Room Name already taken!");
            setSnackbarOpen(true);
            setRoomId("");
          }
        } else {
          if (data.exists) {
            setView("login");
          } else {
            setSnackbarMessage("Room does not exist!");
            setSnackbarOpen(true);
            setRoomId("");
          }
        }
      } catch (error) {
        console.error("Error checking room existence:", error);
      }
    },
    [roomId, isCreatingRoom],
  );

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  // Render appropriate view
  return (
    <div className="App">
      <SparklingStars />
      {showContinuePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-secondary rounded-lg shadow-lg p-6 max-w-sm w-full relative"
          >
            <div className="absolute top-2 right-2">
              <Music4 className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div className="absolute top-2 left-2">
              <Music3 className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-lg font-semibold mb-4 text-center text-primary">
              Do you want to continue in the same room:{" "}
              <span className="font-bold">{getWithExpiry("roomId")}</span>?
            </p>
            <div className="flex justify-around">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={handleContinue}
                  className="w-24 bg-primary text-white flex items-center justify-center gap-2"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  Yes
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="w-24 border-primary text-primary flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-5 h-5" />
                  No
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
      {view === "login" && (
        <LoginView
          userName={userName}
          setUserName={setUserName}
          onSubmit={handleLogin}
        />
      )}
      {view === "room" && (
        <RoomView
          roomId={roomId}
          setRoomId={setRoomId}
          setIsCreatingRoom={setIsCreatingRoom}
          onSubmit={handleJoinRoom}
        />
      )}
      {view === "music" && (
        <MusicView
          userName={userName}
          roomId={roomId}
          wsRef={wsRef}
          isAdmin={isCreatingRoom}
          setIsAdmin={setIsCreatingRoom}
          setSnackbarMessage={(message) => {
            if (message) {
              if (snackbarOpen && snackbarMessage === message) return;
              if (
                snackbarOpen &&
                (snackbarMessage.includes("Song added successfully!") ||
                  snackbarMessage.includes("Upload succeeded!"))
              )
                return;
              setSnackbarMessage(message);
              setSnackbarOpen(true);
            }
          }}
        />
      )}
      {(view === "room" || view === "login") && <Footer />}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={snackbarMessage === "Uploading..." ? null : 3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        ContentProps={{
          sx: {
            backgroundColor: "#D1C4E9",
            color: "#370250",
          },
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={
            snackbarMessage === "Song added successfully!" ||
            snackbarMessage === "Upload succeeded!"
              ? "success"
              : "info"
          }
          icon={
            snackbarMessage === "Song added successfully!" ||
            snackbarMessage === "Upload succeeded!" ? (
              <CheckCircleIcon style={{ color: "#370250" }} />
            ) : (
              <InfoIcon style={{ color: "#370250" }} />
            )
          }
          sx={{ width: "100%", backgroundColor: "#D1C4E9", color: "#370250" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
