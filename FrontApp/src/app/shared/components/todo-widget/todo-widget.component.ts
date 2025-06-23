import { MatTooltipModule } from '@angular/material/tooltip';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDropList,
  CdkDrag,
  CdkDragHandle,
  CdkDragPlaceholder,
} from '@angular/cdk/drag-drop';

import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgClass } from '@angular/common';

interface Todo {
  title: string;
  done: boolean;
  priority: 'Low' | 'Normal' | 'High';
}

@Component({
    selector: 'app-todo-widget',
    imports: [
        MatIcon,
        MatCheckbox,
        CdkDropList,
        CdkDrag,
        CdkDragHandle,
        CdkDragPlaceholder,
        NgClass,
        MatTooltipModule,
    ],
    templateUrl: './todo-widget.component.html',
    styleUrl: './todo-widget.component.scss'
})
export class TodoWidgetComponent {
  @Input() todos: Todo[] = [];
  @Output() todoToggled = new EventEmitter<Todo>();
  @Output() todosUpdated = new EventEmitter<Todo[]>();

  toggle(todo: Todo): void {
    todo.done = !todo.done;
    this.todoToggled.emit(todo);
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.todos, event.previousIndex, event.currentIndex);
    this.todosUpdated.emit(this.todos);
  }

  trackByFn(index: number, todo: Todo): string {
    return todo.title; // or use a unique identifier if available
  }
}
