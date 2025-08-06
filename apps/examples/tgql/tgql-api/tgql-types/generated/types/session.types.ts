// Auto-generated types for session sector - do not edit manually

export interface Session {
  id: string;
  tutor: string;
  student: string;
  date: Date;
  duration: number;
}

export interface SessionInput {
  tutor: string;
  student: string;
  date: Date;
  duration: number;
}

// Operations for SessionResolver
export type allSessionsQuery = {
  result: Session[];
};
export type sessionQuery = {
  result: Session;
};
export type addSessionMutation = {
  result: Session;
};