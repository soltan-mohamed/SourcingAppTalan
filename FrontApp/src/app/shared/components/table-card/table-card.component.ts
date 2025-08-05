import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnChanges, AfterViewInit, ViewChild, SimpleChanges } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EditCandidat } from 'app/components/edit-candidat/edit-candidat';
import { CreateRecrutement } from 'app/components/create-recrutement/create-recrutement';
import { CandidateHistory } from 'app/components/candidate-history/candidate-history';
import { CandidatesService } from 'app/services/candidates-service';

@Component({
  selector: 'app-table-card',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
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
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private cs : CandidatesService
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

      if (this.dataSourceTable && this.paginator) {
        this.dataSourceTable.paginator = this.paginator;
        //console.log('Paginator assigned successfully');
      } else {
        //console.error('Failed to assign paginator - missing dependencies');
      }
    }, 0);
  }

  private initializeTable() {
    this.dataSourceTable = new MatTableDataSource(this.dataSource);
    console.log("DATESOURCETABLE ", this.dataSourceTable);
    this.setDisplayedColumns();
    
    // Connect sort and paginator if available
    setTimeout(() => {
      if (this.sort) {
        this.dataSourceTable.sort = this.sort;
      }
      if (this.paginator) {
        this.dataSourceTable.paginator = this.paginator;
      }
    }, 0);
    //console.log('Table initialized with displayedColumns:', this.displayedColumns);
  }

  private updateDataSource() {
    if (this.dataSourceTable) {
      this.dataSourceTable.data = this.dataSource;
    } else {
      this.dataSourceTable = new MatTableDataSource(this.dataSource);
    }
    
    // Re-assign sort and paginator after data update
    setTimeout(() => {
      if (this.sort) {
        this.dataSourceTable.sort = this.sort;
        //console.log('Sort re-assigned after data update');
      }
      
      if (this.paginator) {
        this.dataSourceTable.paginator = this.paginator;
        //console.log('Paginator re-assigned after data update');
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

  openCvFile(candidateId: number) {
  // Assuming you have a CandidateService with a method to fetch CV as Blob
  this.cs.getCandidateCv(candidateId).subscribe({
    next: (blob: Blob) => {
      // Create a blob URL
      const url = window.URL.createObjectURL(blob);

      // Open in a new tab
      window.open(url);

      // Optional: revoke URL after some time to release memory
      setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    },
    error: (err) => {
      console.error('Error loading CV file', err);
    }
  });
}



}