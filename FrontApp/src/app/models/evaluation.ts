import {User} from './user'

export interface Evaluation {
    id : number,
    description: string,
    date: string,
    type: string,
    statut: string,
    evaluateur_id: number,
    recrutement_id : number,
    editing : boolean,
    editingText : boolean
}