import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

interface EarningSource {
  label: string;
  percentage: number;
  class: string; // Class for the progress bar color
  labelClass: string; // Class for the label background color
}

@Component({
    selector: 'app-earning-source',
    imports: [NgClass],
    templateUrl: './earning-source.component.html',
    styleUrl: './earning-source.component.scss'
})
export class EarningSourceComponent {
  @Input() earningSources: EarningSource[] = [];
}
