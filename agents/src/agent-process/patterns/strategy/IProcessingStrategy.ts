export interface IProcessingStrategy {
  process(input: any): Promise<void>;
}