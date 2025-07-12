import {User} from './user'

export interface Evaluation {
    id : number,
    description: string,
    date: string,
    type: string,
    statut: string,
    evaluateur: User,
    editing : boolean
}