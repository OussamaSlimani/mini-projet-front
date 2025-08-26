export interface Engine {
  id: string;
  name: string;
  state: string;
  environment_id: string;
  environment_name: string;
}

export interface Environment {
  id: string;
  name: string;
  hasEngine: boolean;
  status: string;
}