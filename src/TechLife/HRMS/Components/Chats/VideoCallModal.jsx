import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff } from "lucide-react";

function VideoCallModal({ onClose, currentUser, selectedUser, isCaller }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const wsRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const audioRef = useRef(null);
  const displayName = selectedUser?.name || "Unknown";
  const displayInitial = displayName?.trim()?.charAt(0)?.toUpperCase() || "?";

  useEffect(() => {
    audioRef.current = new Audio("/assets/teams_ringtone.mp3");
    audioRef.current.loop = true;
    audioRef.current.play().catch(() => {});

    const setup = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      stream.getAudioTracks().forEach((track) => (track.enabled = true));
      stream.getVideoTracks().forEach((track) => (track.enabled = true));
      localStreamRef.current = stream;

      setMicOn(true);
      setCameraOn(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        event.streams[0]
          .getTracks()
          .forEach((track) => remoteStreamRef.current.addTrack(track));
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
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
        if (isCaller) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          ws.send(JSON.stringify({ type: "offer", offer }));
        }
      };

      ws.onmessage = async (msg) => {
        const data = JSON.parse(msg.data);

        if (data.type === "offer") {
          if (pc.signalingState !== "stable") return;
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", answer }));
        } else if (data.type === "answer") {
          if (pc.signalingState !== "have-local-offer") return;
          await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
        } else if (data.type === "ice" && data.candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (err) {
            console.error("ICE add error:", err);
          }
        }
      };
    };

    setup();
    return () => cleanup();
  }, [isCaller]);

  useEffect(() => {
    if (
      !screenSharing &&
      cameraOn &&
      localVideoRef.current &&
      localStreamRef.current
    ) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [cameraOn, screenSharing]);

  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setMicOn(false);
    setCameraOn(false);
    setScreenSharing(false);
  };

  const handleClose = () => {
    cleanup();
    onClose();
  };

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !micOn;
    });
    setMicOn((prev) => !prev);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !cameraOn;
    });
    setCameraOn((prev) => !prev);
  };

  const toggleScreenShare = async () => {
    try {
      const pc = pcRef.current;
      if (!screenSharing && pc) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);
        if (localVideoRef.current)
          localVideoRef.current.srcObject = screenStream;
        setScreenSharing(true);
        screenTrack.onended = async () => {
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack && sender) await sender.replaceTrack(camTrack);
          if (localVideoRef.current)
            localVideoRef.current.srcObject = localStreamRef.current;
          setScreenSharing(false);
        };
      }
    } catch (err) {
      console.warn("Screen share failed", err);
    }
  };

  return (
    <div
      style={{ zIndex: "111" }}
      className="fixed inset-0 z-50   bg-opacity-100 flex justify-center items-center"
    >
      <div className="w-full h-full max-w-5xl bg-gray-900 text-white rounded-lg flex flex-col">
        <div className="p-3 text-center text-sm text-gray-400">
          Calling <strong>{displayName}</strong>...
        </div>

        <div className="flex-1 flex gap-6 p-6 justify-evenly">
          <div className="w-1/2 h-96 bg-black rounded-lg flex items-center justify-center relative">
            {cameraOn || screenSharing ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-bold">
                {displayInitial}
              </div>
            )}
            {!micOn && (
              <div className="absolute bottom-2 left-2 bg-red-600 px-2 py-1 text-xs rounded flex items-center gap-1">
                <MicOff size={14} /> Muted
              </div>
            )}
          </div>

          <div className="w-1/2 h-96 bg-black rounded-lg">
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-center gap-5 p-4 bg-gray-800">
          <button
            onClick={toggleMic}
            title="Mic"
            className={`p-3 rounded-full ${
              micOn ? "bg-blue-600" : "bg-red-600"
            }`}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          <button
            onClick={toggleCamera}
            title="Camera"
            className={`p-3 rounded-full ${
              cameraOn ? "bg-blue-600" : "bg-red-600"
            }`}
          >
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>

          <button
            onClick={toggleScreenShare}
            title="Share Screen"
            className={`p-3 rounded-full ${
              screenSharing ? "bg-yellow-600" : "bg-blue-600"
            }`}
          >
            <Monitor size={20} />
          </button>

          <button
            onClick={handleClose}
            title="End Call"
            className="p-3 rounded-full bg-red-700 hover:bg-red-800"
          >
            <PhoneOff size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default VideoCallModal;
