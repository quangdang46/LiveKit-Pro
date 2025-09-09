export type ExecutionContext = {
  currentNodeId: string;
  variables: Map<string, any>;
  lastInput?: any;
}

export type ProcessingResult = {
  success: boolean;
  nextNodeId?: string;
  output?: any;
  error?: string;
  shouldWait?: boolean;
};
