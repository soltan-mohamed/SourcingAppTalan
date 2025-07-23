import { Injectable } from '@angular/core';
import { Evaluation } from 'app/models/evaluation';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InterviewStateService {
  private interviewUpdatedSource = new Subject<Evaluation>();

  // Observable que les composants peuvent écouter
  interviewUpdated$ = this.interviewUpdatedSource.asObservable();

  // Méthode pour diffuser qu'une interview a été mise à jour
  notifyInterviewUpdated(evaluation: Evaluation) {
    this.interviewUpdatedSource.next(evaluation);
  }
}
