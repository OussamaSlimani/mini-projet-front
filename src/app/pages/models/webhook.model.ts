export interface Webhook {
  id?: string;
  name: string;
  pipelineUrl: string;
  environmentId: string;
  pat: string;
  lastTriggered?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}