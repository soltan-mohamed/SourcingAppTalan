import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private sidebarCollapsedSubject = new BehaviorSubject<boolean>(false);
  
  /**
   * Observable for sidebar collapsed state
   */
  public sidebarCollapsed$: Observable<boolean> = this.sidebarCollapsedSubject.asObservable();

  /**
   * Set the sidebar collapsed state
   * @param collapsed - whether the sidebar is collapsed
   */
  setSidebarCollapsed(collapsed: boolean): void {
    this.sidebarCollapsedSubject.next(collapsed);
  }

  /**
   * Get the current sidebar collapsed state
   * @returns current collapsed state
   */
  get isSidebarCollapsed(): boolean {
    return this.sidebarCollapsedSubject.value;
  }

  /**
   * Toggle the sidebar collapsed state
   * @returns new collapsed state
   */
  toggleSidebar(): boolean {
    const newState = !this.sidebarCollapsedSubject.value;
    this.setSidebarCollapsed(newState);
    return newState;
  }
}
