import { Injectable } from '@angular/core';

const KEY_ACCESS_TOKEN = 'access-token';
const KEY_TOKEN = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class UiTokenStorageService {
  public getAccessToken(): string | null {
    return (
      window.sessionStorage.getItem(KEY_ACCESS_TOKEN) ??
      window.localStorage.getItem(KEY_ACCESS_TOKEN)
    );
  }

  public getToken(): string | null {
    return (
      window.sessionStorage.getItem(KEY_TOKEN) ??
      window.localStorage.getItem(KEY_TOKEN)
    );
  }
}
