export interface Recruitment {
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
}

export enum RecruitmentStatus {
  RECRUITED = 'RECRUITED',
  NOT_RECRUITED = 'NOT_RECRUITED',
  IN_PROGRESS = 'IN_PROGRESS'
}