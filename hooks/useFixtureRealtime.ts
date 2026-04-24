"use client";

import { useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type MessageHandler = (payload: any) => void;

export function useFixtureRealtime(fixtureId: string) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const handlersRef = useRef<Map<string, MessageHandler>>(new Map());

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`fixture:${fixtureId}`);

    channel
      .on("broadcast", { event: "*" }, (payload) => {
        const handler = handlersRef.current.get(payload.event);
        if (handler) {
          handler(payload.payload);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [fixtureId]);

  const broadcast = useCallback(
    (event: string, payload: any) => {
      channelRef.current?.send({
        type: "broadcast",
        event,
        payload,
      });
    },
    []
  );

  const on = useCallback((event: string, handler: MessageHandler) => {
    handlersRef.current.set(event, handler);
  }, []);

  return { broadcast, on };
}
