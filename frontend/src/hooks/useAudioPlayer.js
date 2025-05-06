// src/hooks/useAudioPlayer.js
import { useState, useEffect } from 'react';

const useAudioPlayer = () => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    return () => {
      // Cleanup audio when component unmounts
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  const playAudio = (url, id) => {
    // Pause current audio if playing
    if (audio) {
      audio.pause();
    }

    // Create new audio instance
    const newAudio = new Audio(url);
    newAudio.play()
      .then(() => {
        setCurrentlyPlaying(id);
        setAudio(newAudio);
      })
      .catch(error => {
        console.error('Error playing audio:', error);
      });

    // Handle when audio finishes playing
    newAudio.onended = () => {
      setCurrentlyPlaying(null);
    };
  };

  const pauseAudio = () => {
    if (audio) {
      audio.pause();
      setCurrentlyPlaying(null);
    }
  };

  return { currentlyPlaying, playAudio, pauseAudio };
};

export default useAudioPlayer;