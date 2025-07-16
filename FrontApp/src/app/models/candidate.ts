import {User} from './user'
import { Recrutement } from './recrutement';

type CandidateStatus = 'CONTACTED' | 'SCHEDULED' | 'CANCELLED' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'VIVIER';

export interface Candidate {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  skills: string[];
  statut: CandidateStatus;
  cv : string;
  responsable : User;
  dateCreation : string;
  recrutements : Recrutement[]
}

/*export interface Candidate {
  recrutements: never[];
  isDeleteable: boolean;
  isEditable: boolean;
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut?: Statut;
  skills: string[];
  cv?: string;
  responsable?: {
    id: number;
    name: string;
  };
}

export enum Statut {
  CONTACTED = 'CONTACTED',
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  VIVIER = 'VIVIER'
}*/