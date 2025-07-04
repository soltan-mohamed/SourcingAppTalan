// app/pipes/initials.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    return name?.split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .join('') || '';
  }
}