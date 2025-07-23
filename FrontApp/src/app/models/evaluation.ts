import {User} from './user'

export interface Evaluation {
    id : number,
    description: string,
    date: string,
    type: string,
    statut: string,
    lieuEvaluation : string,
    evaluateur?: {
    id: number;
    fullName: string;
  };
     recrutement?: {
    id: number;
    poste: string;
    candidate?: {
      id: number;
      fullName: string;
    };
  };
    editing : boolean,
    editingText : boolean
}