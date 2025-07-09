import { Evaluation } from "./evaluation.model";
import { User } from "./user";

export interface Recruitment {
  id: number;
  position: string;
  status: RecruitmentStatus;
  recruteur: User;
  manager: User;
  candidate: {
    id: number;
    name: string;
  };
  evaluations?: Evaluation[];
}

export enum RecruitmentStatus {
  RECRUITED = 'RECRUITED',
  NOT_RECRUITED = 'NOT_RECRUITED',
  IN_PROGRESS = 'IN_PROGRESS'
}