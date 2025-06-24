import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, AfterViewInit, ViewChild, SimpleChanges } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-table-card',
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
export class TableCardComponent<T> implements OnInit, OnChanges, AfterViewInit {
  @Input() dataSource: T[] = [];
  @Input() columnDefinitions: any[] = [];
  
  selection = new SelectionModel<T>(true, []);
  dataSourceTable!: MatTableDataSource<T>;
  displayedColumns: string[] = [];

  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  ngOnInit() {
    console.log('ngOnInit - dataSource:', this.dataSource);
    console.log('ngOnInit - columnDefinitions:', this.columnDefinitions);
    this.initializeTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('ngOnChanges called:', changes);
    if (changes['dataSource'] && this.dataSource) {
      this.updateDataSource();
    }
    if (changes['columnDefinitions'] && this.columnDefinitions) {
      this.setDisplayedColumns();
    }
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit - sort:', this.sort);
    console.log('ngAfterViewInit - dataSourceTable:', this.dataSourceTable);
    
    setTimeout(() => {
      if (this.dataSourceTable && this.sort) {
        this.dataSourceTable.sort = this.sort;
        console.log('Sort assigned successfully');
      } else {
        console.error('Failed to assign sort - missing dependencies');
      }
    }, 0);
  }

  private initializeTable() {
    this.dataSourceTable = new MatTableDataSource(this.dataSource);
    this.setDisplayedColumns();
    console.log('Table initialized with displayedColumns:', this.displayedColumns);
  }

  private updateDataSource() {
    if (this.dataSourceTable) {
      this.dataSourceTable.data = this.dataSource;
    } else {
      this.dataSourceTable = new MatTableDataSource(this.dataSource);
    }
    
    // Re-assign sort after data update
    setTimeout(() => {
      if (this.sort) {
        this.dataSourceTable.sort = this.sort;
        console.log('Sort re-assigned after data update');
      }
    }, 0);
  }

  setDisplayedColumns() {
    // Create displayed columns array
    const dynamicColumns = this.columnDefinitions
      .filter(col => col.type !== 'check' && col.type !== 'actionBtn')
      .map(col => col.def);
    
    this.displayedColumns = [...dynamicColumns, 'actions'];
    console.log('displayedColumns set to:', this.displayedColumns);
  }

  // Test method to manually trigger sort
  testSort() {
    if (this.dataSourceTable && this.sort) {
      console.log('Manual sort test - current sort:', this.sort.active, this.sort.direction);
      this.dataSourceTable.sort = this.sort;
    } else {
      console.error('Cannot test sort - missing dependencies');
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSourceTable?.data?.length || 0;
    return numSelected === numRows;
  }

  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSourceTable.data.forEach((row) => this.selection.select(row));
    }
  }

  editCall(row: T) {
    console.log('Edit row:', row);
  }

  onContextMenu(event: MouseEvent, row: T) {
    event.preventDefault();
    console.log('Context menu for row:', row);
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