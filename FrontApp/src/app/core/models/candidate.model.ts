export interface Candidate {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut?: Statut;
  skills?: string[];
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
}