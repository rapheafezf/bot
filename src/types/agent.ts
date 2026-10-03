export type MissionStatus = 
  | 'preparing'
  | 'running'
  | 'waiting_validation'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type PermissionMode = 'observation' | 'assistance' | 'strict_automation';

export type StepStatus = 'pending' | 'running' | 'waiting_approval' | 'completed' | 'failed' | 'skipped';

export type LogLevel = 'info' | 'tool_call' | 'tool_result' | 'security_alert' | 'approval_request' | 'error';

export interface MissionStep {
  id: string;
  mission_id: string;
  step_order: number;
  description: string;
  tool_name: string;
  parameters: Record<string, any>;
  status: StepStatus;
  result?: any;
  proof?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

export interface ActionLog {
  id: number;
  mission_id: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ValidationRequest {
  id: string;
  mission_id: string;
  step_id?: string;
  type: 'email_send' | 'file_delete' | 'file_overwrite' | 'external_request' | 'system_action';
  title: string;
  payload: {
    account?: string;
    to_email?: string;
    subject?: string;
    body?: string;
    attachments?: string[];
    filepath?: string;
    content?: string;
    diff_preview?: string;
    command?: string;
    working_dir?: string;
    [key: string]: any;
  };
  status: 'pending' | 'approved' | 'rejected';
  justification?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Prospect {
  id: string;
  mission_id?: string;
  company_name: string;
  website?: string;
  city?: string;
  activity?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  source_url?: string;
  collected_at: string;
  observations?: string;
  hypotheses?: string;
  missing_info?: string;
  proposal_email_subject?: string;
  proposal_email_body?: string;
  status: 'new' | 'validated' | 'contacted' | 'excluded';
  is_excluded: boolean;
}

export interface WorkspaceFile {
  name: string;
  path: string;
  size_bytes: number;
  is_dir: boolean;
  modified_at: string;
  extension: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  prompt: string;
  cron_expression?: string;
  frequency: 'daily' | 'weekly' | 'hourly';
  time_of_day?: string;
  is_active: boolean;
  last_run_at?: string;
  next_run_at?: string;
}

export interface Mission {
  id: string;
  title: string;
  user_prompt: string;
  status: MissionStatus;
  permission_mode: PermissionMode;
  created_at: string;
  updated_at: string;
  result_summary?: string;
  steps_count: number;
  error_message?: string;
  steps?: MissionStep[];
  logs?: ActionLog[];
  validations?: ValidationRequest[];
  prospects?: Prospect[];
}

export interface AgentSettings {
  ai_provider: 'gemini' | 'ollama' | 'openai';
  ollama_url: string;
  ollama_model: string;
  openai_url: string;
  openai_model: string;
  openai_key_configured: boolean;
  gemini_model: string;
  default_mode: PermissionMode;
  authorized_dir: string;
  smtp_configured: boolean;
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_from?: string;
  desktop_control_enabled: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  created_at: string;
  last_login_at: string | null;
  email_verified: boolean;
  status: 'active' | 'disabled';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  company: string;
  created_at: string;
  last_login_at: string;
  login_count: number;
  email_verified: boolean;
  status: 'active' | 'disabled';
}
