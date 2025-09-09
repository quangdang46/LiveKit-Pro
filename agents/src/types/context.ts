export type ExecutionContext = {
  currentNodeId: string;
  lastInput?: string | number;
}

export type ProcessingResult = {
  success: boolean;
  nextNodeId?: string;
  output?: OutputData;
  error?: string;
  shouldWait?: boolean;
};

export type OutputData = {
  type: 'speech' | 'dtmf' | 'error';
  message?: string;
};
