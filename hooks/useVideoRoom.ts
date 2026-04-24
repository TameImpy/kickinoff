"use client";

import { useState, useCallback } from "react";

interface VideoRoomState {
  token: string | null;
  roomName: string | null;
  livekitUrl: string | null;
  connected: boolean;
  error: string | null;
}

export function useVideoRoom(fixtureId: string) {
  const [state, setState] = useState<VideoRoomState>({
    token: null,
    roomName: null,
    livekitUrl: null,
    connected: false,
    error: null,
  });

  const connect = useCallback(async () => {
    try {
      const res = await fetch(`/api/fixtures/${fixtureId}/create-room`, {
        method: "POST",
      });

      if (!res.ok) {
        setState((prev) => ({ ...prev, error: "Failed to create room" }));
        return;
      }

      const data = await res.json();
      setState({
        token: data.token,
        roomName: data.room_name,
        livekitUrl: data.livekit_url,
        connected: true,
        error: null,
      });
    } catch {
      setState((prev) => ({ ...prev, error: "Connection failed" }));
    }
  }, [fixtureId]);

  return { ...state, connect };
}
