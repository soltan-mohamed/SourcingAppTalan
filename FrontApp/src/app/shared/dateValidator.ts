import { AbstractControl, ValidatorFn } from '@angular/forms';

export function fifteenMinuteStepValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;

    const minutes = new Date(value).getMinutes();
    return minutes % 15 === 0 ? null : { invalidStep: true };
  };
}
