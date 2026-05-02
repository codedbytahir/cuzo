export type MentorMessage = {
  id: string;
  text: string;
  isUser?: boolean;
};

export type MentorMessageType = 'hint' | 'threat' | 'tactic' | 'teach' | 'analyze' | 'proactive' | 'mistake' | 'great_move';

export interface MentorContext {
  fen: string;
  playerColor: 'w' | 'b';
  lastMove?: { from: string; to: string } | null;
  worldName?: string;
  levelName?: string;
  worldId?: number;
  playerSkillLevel?: number; // 1-5
  conceptsLearned?: string[];
  commonMistakes?: string[];
}

export interface MentorRequest {
  type: MentorMessageType;
  context: MentorContext;
  customQuestion?: string;
}

export interface MentorResponse {
  message: string;
  error?: string;
}
