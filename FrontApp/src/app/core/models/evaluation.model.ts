import { Statut } from "./candidate.model";
import { Recruitment } from "./recruitment.model";
import { User } from "./user";

export interface Evaluation {
  id?: number;
  description?: string;
  date?: Date | string;
  type?: TypeEvaluation;
  statut?: Statut;
  evaluateur?: User;
  recrutement?: Recruitment;
}

export enum TypeEvaluation {
  TECHNICAL = 'TECHNICAL',
  BEHAVIORAL = 'BEHAVIORAL',
  MANAGERIAL = 'MANAGERIAL'
}