import {User} from './user'
import {Evaluation} from './evaluation'

export interface Recrutement {
    id : number,
    position: string,
    statut: string,
    demandeur: User,
    evaluations: Evaluation[],
    date : string
}