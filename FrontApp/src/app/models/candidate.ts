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
  cv?: string;
  responsable : User;
  dateCreation : string;
  hiringDate?: string;
  experiencePeriod?: string;
  recrutements : Recrutement[]
}