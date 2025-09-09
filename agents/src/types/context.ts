export type ExecutionContext = {
  currentNodeId: string;
  lastInput?: any;
}

export type ProcessingResult = {
  success: boolean;
  nextNodeId?: string;
  output?: any;
  error?: string;
  shouldWait?: boolean;
};
