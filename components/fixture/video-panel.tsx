"use client";

import {
  LiveKitRoom,
  VideoTrack,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";

interface VideoPanelProps {
  token: string;
  livekitUrl: string;
  homeName: string;
  awayName: string;
}

export default function VideoPanel({
  token,
  livekitUrl,
  homeName,
  awayName,
}: VideoPanelProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      video={true}
      audio={true}
      style={{ height: "100%" }}
    >
      <VideoGrid homeName={homeName} awayName={awayName} />
    </LiveKitRoom>
  );
}

function VideoGrid({
  homeName,
  awayName,
}: {
  homeName: string;
  awayName: string;
}) {
  const tracks = useTracks([Track.Source.Camera], {
    onlySubscribed: false,
  });
  const participants = useParticipants();

  return (
    <div className="flex gap-2 w-full">
      {participants.length === 0 && (
        <>
          <Placeholder name={homeName} color="primary" />
          <Placeholder name={awayName} color="accent" />
        </>
      )}
      {participants.map((participant) => {
        const videoTrack = tracks.find(
          (t) =>
            t.participant.identity === participant.identity &&
            t.source === Track.Source.Camera
        );

        return (
          <div
            key={participant.identity}
            className="flex-1 bg-[#1A1A1A] border border-[#262626] aspect-[4/3] relative overflow-hidden"
          >
            {videoTrack ? (
              <VideoTrack
                trackRef={videoTrack}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="font-[var(--font-space-grotesk)] font-bold text-3xl text-white/20">
                  {participant.name?.[0] ?? "?"}
                </span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
              <p className="text-[10px] font-[var(--font-space-grotesk)] font-bold text-white truncate">
                {participant.name ?? "Player"}
              </p>
            </div>
          </div>
        );
      })}
      {/* Show placeholder for missing participant */}
      {participants.length === 1 && (
        <Placeholder name="Waiting..." color="accent" />
      )}
    </div>
  );
}

function Placeholder({
  name,
  color,
}: {
  name: string;
  color: "primary" | "accent";
}) {
  return (
    <div className="flex-1 bg-[#1A1A1A] border border-[#262626] aspect-[4/3] flex items-center justify-center">
      <div className="text-center">
        <div
          className={`w-16 h-16 bg-[#262626] mx-auto mb-2 flex items-center justify-center font-[var(--font-space-grotesk)] font-bold text-2xl ${
            color === "primary" ? "text-primary" : "text-accent"
          }`}
        >
          {name[0]?.toUpperCase() ?? "?"}
        </div>
        <p className="text-xs font-[var(--font-space-grotesk)] font-bold text-white/50">
          {name}
        </p>
      </div>
    </div>
  );
}
