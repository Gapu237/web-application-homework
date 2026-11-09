
import { useEffect, useState } from "react";

export interface AirdropTimerResult {
  remainingMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function useAirdropTimer(
  targetEpochMs: number
): AirdropTimerResult {
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    // Luôn lấy thời gian thực tại thời điểm cập nhật.
    const syncTime = () => {
      setCurrentTime(Date.now());
    };

    // Cập nhật thời gian định kỳ.
    const intervalId = window.setInterval(syncTime, 250);

    // Đồng bộ lại khi người dùng quay lại tab.
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncTime();
      }
    };

    // Đồng bộ lại khi cửa sổ trình duyệt được focus.
    window.addEventListener("focus", syncTime);
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", syncTime);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  // Tính thời gian còn lại từ mốc kết thúc tuyệt đối.
  const remainingMs = Math.max(0, targetEpochMs - currentTime);

  const totalSeconds = Math.ceil(remainingMs / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    remainingMs,
    days,
    hours,
    minutes,
    seconds,
    isExpired: remainingMs <= 0,
  };
}
