import { Injectable } from '@angular/core';

const IMPERSONATION_KEY = 'impersonationId';

@Injectable({
  providedIn: 'root'
})
export class UiImpersonationStorageService {
  public getId(): string | null {
    return window.localStorage.getItem(IMPERSONATION_KEY);
  }
}
