import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
//import { rowsAnimation } from '@shared/table.animations';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'app-table-card',
    //animations: [rowsAnimation],
    imports: [
        MatTableModule,
        MatSortModule,
        MatCheckboxModule,
        MatIconModule,
        CommonModule,
        MatProgressBarModule,
        MatTooltipModule,
        MatButtonModule,
        FeatherIconsComponent,
    ],
    templateUrl: './table-card.component.html',
    styleUrl: './table-card.component.scss'
})
export class TableCardComponent<T> implements OnInit {
  @Input() dataSource: T[] = [];
  @Input() columnDefinitions: any[] = [];
  selection = new SelectionModel<T>(true, []);
  dataSourceTable!: MatTableDataSource<T>;
  displayedColumns: string[] = []; // New property for displayed columns

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.dataSourceTable = new MatTableDataSource(this.dataSource);
    this.setDisplayedColumns(); // Initialize displayed columns

    this.dataSourceTable.sort = this.sort; // Assign the MatSort to the data source
  }

  setDisplayedColumns() {
    this.displayedColumns = [...this.columnDefinitions.map((col) => col.def)];
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceTable.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSourceTable.data.forEach((row) => this.selection.select(row));
  }

  editCall(row: T) {
    // Logic for editing
  }

  deleteItem(row: T) {
    // Logic for deleting
  }

  onContextMenu(event: MouseEvent, row: T) {
    // Context menu logic (if needed)
  }

  getProgressBarColor(value: number): string {
    if (value < 50) {
      return 'warn';
    } else if (value >= 50 && value <= 70) {
      return 'accent';
    } else {
      return 'primary';
    }
  }
}
