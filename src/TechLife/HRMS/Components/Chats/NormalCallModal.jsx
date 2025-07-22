import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";

function NormalCallModal({ onClose, selectedUser, currentUser }) {
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const streamRef = useRef(null);
  const wsRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const audioRef = useRef(null);

  const [micOn, setMicOn] = useState(true);

  const isGroup = selectedUser?.isGroup === true;
  const displayName = selectedUser?.name || "Unknown";
  const displayInitial = displayName?.trim()?.charAt(0)?.toUpperCase() || "?";

  useEffect(() => {
    audioRef.current = new Audio("/assets/teams_ringtone.mp3");
    audioRef.current.loop = true;
    audioRef.current.play().catch((err) => {
      console.warn("Ringtone autoplay blocked:", err.message);
    });

    const init = async () => {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = localStream;
        if (localAudioRef.current) {
          localAudioRef.current.srcObject = localStream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peerConnectionRef.current = pc;

        localStream
          .getTracks()
          .forEach((track) => pc.addTrack(track, localStream));

        pc.ontrack = (event) => {
          event.streams[0]
            .getTracks()
            .forEach((track) => remoteStreamRef.current.addTrack(track));
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStreamRef.current;
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({ type: "ice", candidate: event.candidate })
            );
          }
        };

        const ws = new WebSocket("wss://ws.postman-echo.com/raw");
        wsRef.current = ws;

        ws.onopen = async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws.send(JSON.stringify({ type: "offer", offer }));
        };

        ws.onmessage = async (message) => {
          try {
            const data = JSON.parse(message.data);
            if (data.type === "offer") {
              await pc.setRemoteDescription(
                new RTCSessionDescription(data.offer)
              );
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              ws.send(JSON.stringify({ type: "answer", answer }));
            } else if (data.type === "answer") {
              await pc.setRemoteDescription(
                new RTCSessionDescription(data.answer)
              );
            } else if (data.type === "ice" && data.candidate) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } catch (err) {
            console.error("WebRTC signaling error:", err);
          }
        };
      } catch (err) {
        console.error("Mic access error:", err);
      }
    };

    init();

    return () => {
      cleanupMedia();
    };
  }, []);

  const cleanupMedia = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = null;
        localAudioRef.current.pause();
      }

      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = null;
        remoteAudioRef.current.pause();
      }

      if (peerConnectionRef.current) {
        peerConnectionRef.current
          .getSenders()
          .forEach((sender) => peerConnectionRef.current.removeTrack(sender));
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      remoteStreamRef.current = new MediaStream();
    } catch (err) {
      console.error("Error during cleanup:", err);
    }
  };

  const handleClose = () => {
    cleanupMedia();
    onClose();
  };

  const toggleMic = () => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !micOn;
    });
    setMicOn((prev) => !prev);
  };

  return (
    <div className="fixed inset-0   bg-opacity-100 z-112 flex items-center justify-center">
      <div className="bg-white text-black rounded-lg p-6 w-full max-w-md flex flex-col items-center gap-6 shadow-lg">
        <h2 className="text-lg font-semibold">Calling {displayName}...</h2>

        <div className="flex flex-col items-center">
          {selectedUser?.profilePic ? (
            <img
              src={selectedUser.profilePic}
              alt={displayName}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-500 text-white text-3xl flex items-center justify-center">
              {displayInitial}
            </div>
          )}
          <p className="mt-2 text-gray-600">
            {isGroup ? "Group Voice Call" : "Voice Call"}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full ${
              micOn ? "bg-blue-600" : "bg-red-600"
            } text-white`}
            title={micOn ? "Mute Mic" : "Unmute Mic"}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={handleClose}
            className="p-3 rounded-full bg-red-700 hover:bg-red-800 text-white"
            title="End Call"
          >
            <PhoneOff size={20} />
          </button>
        </div>

        <audio ref={localAudioRef} autoPlay muted />
        <audio ref={remoteAudioRef} autoPlay />
      </div>
    </div>
  );
}

export default NormalCallModal;
