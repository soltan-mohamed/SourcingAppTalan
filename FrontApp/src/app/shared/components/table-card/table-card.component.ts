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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditCandidat } from 'app/components/edit-candidat/edit-candidat';
import { CreateRecrutement } from 'app/components/create-recrutement/create-recrutement';
import { CandidateHistory } from 'app/components/candidate-history/candidate-history';

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
    MatDialogModule
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

  constructor(
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    //console.log('ngOnInit - dataSource:', this.dataSource);
    //console.log('ngOnInit - columnDefinitions:', this.columnDefinitions);
    this.initializeTable();
  }

  ngOnChanges(changes: SimpleChanges) {
    //console.log('ngOnChanges called:', changes);
    if (changes['dataSource'] && this.dataSource) {
      this.updateDataSource();
    }
    if (changes['columnDefinitions'] && this.columnDefinitions) {
      this.setDisplayedColumns();
    }
  }

  ngAfterViewInit() {
    //console.log('ngAfterViewInit - sort:', this.sort);
    //console.log('ngAfterViewInit - dataSourceTable:', this.dataSourceTable);
    
    setTimeout(() => {
      if (this.dataSourceTable && this.sort) {
        this.dataSourceTable.sort = this.sort;
        //console.log('Sort assigned successfully');
      } else {
        //console.error('Failed to assign sort - missing dependencies');
      }
    }, 0);
  }

  private initializeTable() {
    this.dataSourceTable = new MatTableDataSource(this.dataSource);
    console.log("DATESOURCETABLE ", this.dataSourceTable);
    this.setDisplayedColumns();
    //console.log('Table initialized with displayedColumns:', this.displayedColumns);
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
        //console.log('Sort re-assigned after data update');
      }
    }, 0);
  }

  setDisplayedColumns() {
    // Create displayed columns array
    const dynamicColumns = this.columnDefinitions
      .filter(col => col.type !== 'check' && col.type !== 'actionBtn')
      .map(col => col.def);
    
    this.displayedColumns = [...dynamicColumns, 'actions'];
    //console.log('displayedColumns set to:', this.displayedColumns);
  }

  // Test method to manually trigger sort
  testSort() {
    if (this.dataSourceTable && this.sort) {
      //console.log('Manual sort test - current sort:', this.sort.active, this.sort.direction);
      this.dataSourceTable.sort = this.sort;
    } else {
      //console.error('Cannot test sort - missing dependencies');
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

  onContextMenu(event: MouseEvent, row: T) {
    event.preventDefault();
    //console.log('Context menu for row:', row);
  }

  newHiringProcess(row: T): void {
    const dialogRef = this.dialog.open(CreateRecrutement, {
      width: '800px',
      disableClose: false,
      data: row 
    });

    // Handle the dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //console.log('Dialog was closed with data:', result);
      } else {
        //console.log('Dialog was closed without saving');
      }
    });
  }

@Input() refreshCallback?: () => void;

// Update the openHistory method
openHistory(row: T): void {
  const dialogRef = this.dialog.open(CandidateHistory, {
    width: '90vw',       
    maxWidth: 'none',
    disableClose: false,
    data: row 
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result?.statusChanged && this.refreshCallback) {
      this.refreshCallback();
    }
  });
}

  editCall(row: T): void {
    const dialogRef = this.dialog.open(EditCandidat, {
      width: '800px',
      disableClose: false,
      data: row 
    });

    // Handle the dialog result
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        //console.log('Dialog was closed with data:', result);
        // Handle the updated candidate data
      } else {
        //console.log('Dialog was closed without saving');
      }
    });
  }

  openCvFile(cvPath: string): void {
    if (cvPath) {
      // Since we're now storing only filenames, show info about the file
      const userChoice = confirm(
        `CV File: ${cvPath}\n\n` 
      );
      
      if (userChoice) {
        // Try to open assuming file exists in uploads folder
        const fullUrl = `http://localhost:9090/talan/uploads/${cvPath}`;
        window.open(fullUrl, '_blank');
      }
    } else {
      alert('No CV file available for this candidate.');
    }
  }
}