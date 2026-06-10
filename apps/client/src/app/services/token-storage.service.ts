import { Injectable } from '@angular/core';

import { KEY_ACCESS_TOKEN, KEY_TOKEN } from './settings-storage.service';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  public getAccessToken(): string | null {
    return (
      window.sessionStorage.getItem(KEY_ACCESS_TOKEN) ||
      window.localStorage.getItem(KEY_ACCESS_TOKEN)
    );
  }

  public getToken(): string | null {
    return (
      window.sessionStorage.getItem(KEY_TOKEN) ||
      window.localStorage.getItem(KEY_TOKEN)
    );
  }

  public saveAccessToken(accessToken: string, staySignedIn = false) {
    window.localStorage.removeItem(KEY_ACCESS_TOKEN);
    window.sessionStorage.removeItem(KEY_ACCESS_TOKEN);

    if (staySignedIn) {
      window.localStorage.setItem(KEY_ACCESS_TOKEN, accessToken);
    }

    window.sessionStorage.setItem(KEY_ACCESS_TOKEN, accessToken);
  }

  public saveToken(token: string, staySignedIn = false) {
    window.localStorage.removeItem(KEY_TOKEN);
    window.sessionStorage.removeItem(KEY_TOKEN);

    if (staySignedIn) {
      window.localStorage.setItem(KEY_TOKEN, token);
    }

    window.sessionStorage.setItem(KEY_TOKEN, token);
  }
}
