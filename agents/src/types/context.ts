export type ExecutionContext = {
  currentNodeId: string;
  variables: Map<string, any>;
  lastInput?: string;
}

export type ProcessingResult = {
  success: boolean;
  nextNodeId?: string;
  output?: any;
  error?: string;
  shouldWait?: boolean;
};
