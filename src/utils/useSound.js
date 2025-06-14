import { useEffect, useRef } from "react";
export const useSound = (src, volume = 0.5) => {
  const soundRef = useRef(null);

  useEffect(() => {
    // Создаем аудио элемент при монтировании
    soundRef.current = new Audio(process.env.PUBLIC_URL + src);
    soundRef.current.volume = volume;

    return () => {
      // Очистка при размонтировании
      if (soundRef.current) {
        soundRef.current.pause();
        soundRef.current = null;
      }
    };
  }, [src, volume]);

  const play = () => {
    if (soundRef.current) {
      soundRef.current.currentTime = 0;
      soundRef.current.play().catch((e) => {
        console.error("Ошибка воспроизведения звука:", e);
      });
    }
  };

  return play;
};
