export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar.This scalar is serialized to a string in ISO 8601 format and parsed from a string in ISO 8601 format. */
  DateTimeISO: { input: any; output: any; }
};

export type Mutation = {
  __typename?: 'Mutation';
  addSession: Session;
  addUser: User;
};


export type MutationAddSessionArgs = {
  input: SessionInput;
};


export type MutationAddUserArgs = {
  input: UserInput;
};

export type Query = {
  __typename?: 'Query';
  allSessions: Array<Session>;
  allUsers: Array<User>;
  session: Maybe<Session>;
  user: Maybe<User>;
};


export type QuerySessionArgs = {
  id: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};

export type Session = {
  __typename?: 'Session';
  date: Scalars['DateTimeISO']['output'];
  duration: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  notes: Maybe<Scalars['String']['output']>;
  student: Scalars['String']['output'];
  tutor: Scalars['String']['output'];
};

export type SessionInput = {
  date: Scalars['DateTimeISO']['input'];
  duration: Scalars['Int']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  student: Scalars['String']['input'];
  tutor: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Maybe<Scalars['String']['output']>;
};

export type UserInput = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  role?: InputMaybe<Scalars['String']['input']>;
};
