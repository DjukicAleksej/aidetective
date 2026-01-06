export type CaseStatus = 'Open' | 'Solved';

export interface Suspect {
  id: string;
  name: string;
  role: string;
  description: string;
  alibi: string;
  motive: string;
  notes: string;
  imageUrl: string;
}

export interface Clue {
  id: string;
  title: string;
  description: string;
  source: string;
  confidence: 'Confirmed' | 'Questionable' | 'Disputed';
  linkedSuspects?: string[];
}

export interface TimelineEvent {
  id: string;
  time: string;
  date: string;
  description: string;
  involvedSuspects: string[];
  isGap?: boolean;
}

export interface Statement {
  id: string;
  speakerId: string;
  speakerName: string;
  content: string;
  timestamp: string;
  context?: string;
}

export interface Theory {
  id: string;
  title: string;
  content: string;
  linkedClues: string[];
  linkedSuspects: string[];
  createdAt?: string;
}

export interface InvestigationCase {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  parties: Suspect[];
  clues: Clue[];
  timeline: TimelineEvent[];
  statements: Statement[];
  theories: Theory[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AccusationResult {
  case_overview: {
    summary: string;
  };
  victim_profile: {
    name: string;
    background: string;
  };
  suspects_analysis: {
    suspect_id: string;
    name: string;
    initial_suspicion: string;
    why_not_guilty: string;
  }[];
  key_evidence: {
    evidence_id: string;
    description: string;
    importance: string;
  }[];
  timeline_reconstruction: {
    time: string;
    event: string;
    implication: string;
  }[];
  motive: {
    description: string;
  };
  method: {
    description: string;
  };
  killer_reveal: {
    suspect_id: string;
    name: string;
    reveal_line: string;
  };
  final_monologue: {
    text: string;
  };
}

