import { useEffect, useState } from 'react';
import { Room, Track, RemoteParticipant, ParticipantKind } from 'livekit-client';

interface AudioActivityState {
  isAgentSpeaking: boolean;
  audioLevel: number;
}

export function useAudioActivity(room: Room | null) {
  const [audioActivity, setAudioActivity] = useState<AudioActivityState>({
    isAgentSpeaking: false,
    audioLevel: 0
  });

  useEffect(() => {
    if (!room) return;

    let animationFrame: number;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let sourceNode: MediaStreamAudioSourceNode | null = null;
    let lastSpeakingState = false;

    const updateAudioLevels = () => {
      const allParticipants = Array.from(room.remoteParticipants.values());
      const agent = allParticipants.find(p => 
        p.kind === ParticipantKind.AGENT || 
        p.identity.includes('agent')
      );

      if (agent) {
        const audioTracks = agent.getTrackPublications();
        const audioTrack = Array.from(audioTracks.values()).find(track => 
          track.kind === Track.Kind.Audio && track.track
        );
        
        if (audioTrack?.track && audioTrack.track.mediaStreamTrack) {
          try {
            if (!audioContext) {
              audioContext = new AudioContext();
              analyser = audioContext.createAnalyser();
              analyser.fftSize = 256;
              
              const mediaStream = new MediaStream([audioTrack.track.mediaStreamTrack]);
              sourceNode = audioContext.createMediaStreamSource(mediaStream);
              sourceNode.connect(analyser);
            }

            if (analyser) {
              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(dataArray);
              
              const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
              const audioLevel = Math.round((average / 255) * 100);
              const isAgentSpeaking = audioLevel > 5;
              
              // Alert khi agent bắt đầu nói
              if (isAgentSpeaking && !lastSpeakingState) {
                alert('Agent đang nói!');
                lastSpeakingState = true;
              } else if (!isAgentSpeaking && lastSpeakingState) {
                lastSpeakingState = false;
              }
              
              setAudioActivity({
                isAgentSpeaking,
                audioLevel
              });
            }
          } catch (error) {
            console.error('Audio error:', error);
          }
        }
      }

      animationFrame = requestAnimationFrame(updateAudioLevels);
    };

    updateAudioLevels();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (sourceNode) {
        sourceNode.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [room]);

  return audioActivity;
}