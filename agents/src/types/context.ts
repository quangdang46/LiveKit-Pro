export type ExecutionContext = {
  currentNodeId: string;
  lastInput?: string | number;
  isSpeaking?: boolean;
  interruptHandled?: boolean;
  roomName?: string;
  participantId?: string;
};

export type ProcessingResult = {
  success: boolean;
  nextNodeId?: string;
  output?: OutputData;
  error?: string;
  shouldWait?: boolean;
  shouldRollback?: boolean;
  isInterrupt?: boolean;
};

export type OutputData = {
  type: "speech" | "dtmf" | "error" | "recording";
  message?: string;
  audio?: Buffer;
  recordingStarted?: boolean;
  egressId?: string;
  playBeep?: boolean;
};
