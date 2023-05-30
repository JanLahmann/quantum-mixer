import { Injectable } from '@angular/core';
import { CircuitData } from '../circuit-composer/model/circuit';
import { API_BASE_URL, OrderData, UsecaseBitMappingItem, UsecaseData, UsecasePreferences } from '../api';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsecaseService {

  public usecases: UsecaseData[] = [];

  public usecase: ReplaySubject<UsecaseData> = new ReplaySubject(); // UsecaseData | null = null;
  private _usecase: UsecaseData | null = null;
  public preferences: ReplaySubject<UsecasePreferences> = new ReplaySubject();   // UsecasePreferences | null = null;
  private _preferences: UsecasePreferences | null = null;
  public preferencesSchema: any = null;

  constructor() {
    this.loadUsecases();
  }

  private async fetch<R, T>(path: string, method: 'GET'|'POST' = 'GET', data: T | null = null): Promise<R> {
    return new Promise((resolve, reject) => {
      fetch(`${API_BASE_URL}${path}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : undefined
      }).then(async res => {
        const data: R = await res.json();
        resolve(data);
      }, error => {
        reject(error);
      })
    })
  }

  public async loadUsecases(): Promise<UsecaseData[]> {
    const usecases = await this.fetch<UsecaseData[], null>(`/api/usecase`);
    this.usecases = usecases;
    return usecases;
  }

  public async setUsecase(id: string): Promise<void> {
    if(this._usecase && this._usecase.id == id) {
      return;
    }
    const usecase = await this.fetch<UsecaseData, null>(`/api/usecase/${id}`);
    if(usecase.loginRequired) {
      const currentUrl = encodeURI(location.href);
      location.href = `${API_BASE_URL}/api/usecase/${id}/auth/login?redirect=${currentUrl}`;
    }
    this._usecase = usecase;
    this.usecase.next(usecase);
    this.preferencesSchema = await this.fetch<any, null>(`/api/usecase/${id}/preferences/schema`);
    const preferences = await this.fetch<UsecasePreferences, null>(`/api/usecase/${id}/preferences`);
    this._preferences = preferences;
    this.preferences.next(preferences);
  }

  public getBitMapping(bits: string): UsecaseBitMappingItem | null {
    if(!this._preferences) {
      return null;
    }
    const items = this._preferences.bitMapping.filter(b => b.bits == bits);
    if(items.length > 0) {
      return items[0];
    } else {
      return null;
    }
  }

  public async order(data: string[]): Promise<boolean> {
    if(!this._usecase) {
      return false;
    }
    return this.fetch<boolean, OrderData>(`/api/usecase/${this._usecase.id}/order`, 'POST', {
      items: data
    });
  }

  public async setPreferences(pref: UsecasePreferences) {
    if(!this._usecase) {
      return;
    }
    return this.fetch<boolean, UsecasePreferences>(`/api/usecase/${this._usecase.id}/preferences`, 'POST', pref).then(async _ => {
      const preferences = await this.fetch<UsecasePreferences, null>(`/api/usecase/${this._usecase!.id}/preferences`);
      this._preferences = preferences;
      this.preferences.next(preferences);
    }, error => {
      throw error;
    })
  }

}
