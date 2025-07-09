import { Evaluation } from "./evaluation.model";

export interface Recruitment {
  recruteur: { id: number; name: string; };
  id: number;
  position: string;
  status: RecruitmentStatus;
  demandeur: {
    id: number;
    name: string;
  };
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