import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export const USERNAME_PATTERN = /^[A-Za-z0-9](?:[A-Za-z0-9._-]{1,48}[A-Za-z0-9])?$/;
export const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d\s]).{8,128}$/;
export const PERSON_NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{0,49}$/;
export const FULL_NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,199}$/;
export const PHONE_PATTERN = /^[0-9]{10}$/;
export const LICENSE_NUMBER_PATTERN = /^[A-Za-z0-9/-]{4,50}$/;
export const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{1,49}$/;

export function trimRequired(minLength = 1, maxLength?: number): ValidatorFn[] {
  const validators: ValidatorFn[] = [Validators.required, noWhitespaceValidator(), Validators.minLength(minLength)];
  if (maxLength !== undefined) {
    validators.push(Validators.maxLength(maxLength));
  }
  return validators;
}

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string') {
      return null;
    }
    return value.trim().length === 0 ? { whitespace: true } : null;
  };
}

export function matchFieldsValidator(field: string, confirmField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const first = group.get(field);
    const second = group.get(confirmField);
    if (!first || !second) {
      return null;
    }

    if (first.value !== second.value) {
      second.setErrors({ ...(second.errors ?? {}), mismatch: true });
      return { mismatch: true };
    }

    if (second.hasError('mismatch')) {
      const { mismatch, ...rest } = second.errors ?? {};
      second.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}

export function differentFieldsValidator(field: string, comparisonField: string, errorKey = 'sameValue'): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const first = group.get(field);
    const second = group.get(comparisonField);
    if (!first || !second) {
      return null;
    }

    if (first.value && second.value && first.value === second.value) {
      second.setErrors({ ...(second.errors ?? {}), [errorKey]: true });
      return { [errorKey]: true };
    }

    if (second.hasError(errorKey)) {
      const { [errorKey]: _, ...rest } = second.errors ?? {};
      second.setErrors(Object.keys(rest).length ? rest : null);
    }
    return null;
  };
}

export function clinicHoursValidator(startHour = 8, endHour = 20): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return null;
    }

    const hours = value.getHours();
    return hours < startHour || hours > endHour || (hours === endHour && value.getMinutes() > 0)
      ? { clinicHours: true }
      : null;
  };
}

export function futureOrTodayDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      return null;
    }

    const candidate = new Date(value);
    candidate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return candidate < today ? { pastDate: true } : null;
  };
}
