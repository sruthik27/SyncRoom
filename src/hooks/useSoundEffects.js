import useSound from "use-sound";

// Using high-quality, subtle sound effects
const SOUND_URLS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  toggle: "/switched.mp3",
  seek: "https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3",
  volume: "https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3",
};

export const useSoundEffects = () => {
  const [playClick] = useSound(SOUND_URLS.click, { volume: 0.2 });
  const [playToggle] = useSound(SOUND_URLS.toggle, { volume: 0.15 });
  const [playSeek] = useSound(SOUND_URLS.seek, { volume: 0.1 });
  const [playVolume] = useSound(SOUND_URLS.volume, { volume: 0.15 });

  return {
    playClick,
    playToggle,
    playSeek,
    playVolume,
  };
};
