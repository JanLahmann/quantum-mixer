import { Injectable } from '@angular/core';
import { CircuitData } from '../circuit-composer/model/circuit';
import { API_BASE_URL, OrderData, UsecaseBitMappingItem, UsecaseData, UsecasePreferences } from '../api';

@Injectable({
  providedIn: 'root'
})
export class UsecaseService {

  public usecases: UsecaseData[] = [];

  public usecase: UsecaseData | null = null;
  public preferences: UsecasePreferences | null = null;
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
    if(this.usecase && this.usecase.id == id) {
      return;
    }
    const usecase = await this.fetch<UsecaseData, null>(`/api/usecase/${id}`);
    if(usecase.loginRequired) {
      const currentUrl = encodeURI(location.href);
      location.href = `${API_BASE_URL}/api/usecase/${id}/auth/login?redirect=${currentUrl}`;
    }
    this.usecase = usecase;
    this.preferencesSchema = await this.fetch<any, null>(`/api/usecase/${id}/preferences/schema`);
    this.preferences = await this.fetch<UsecasePreferences, null>(`/api/usecase/${id}/preferences`);
  }

  public getCircuitById(id: string): CircuitData | null {
    if(!this.usecase) {
      return null;
    }
    const circuits = this.usecase.circuitsCatalogue.map(c => c.items).flat().filter(c => c.id == id);
    if(circuits.length > 0) {
      return circuits[0].data;
    } else {
      return null;
    }
  }

  public getBitMapping(bits: string): UsecaseBitMappingItem | null {
    if(!this.preferences) {
      return null;
    }
    const items = this.preferences.bitMapping.filter(b => b.bits == bits);
    if(items.length > 0) {
      return items[0];
    } else {
      return null;
    }
  }

  public async order(data: string[]): Promise<boolean> {
    console.log('order', data, this.usecase)
    if(!this.usecase) {
      return false;
    }
    return this.fetch<boolean, OrderData>(`/api/usecase/${this.usecase.id}/order`, 'POST', {
      items: data
    });
  }

  public async setPreferences(pref: UsecasePreferences) {
    if(!this.usecase) {
      return;
    }
    return this.fetch<boolean, UsecasePreferences>(`/api/usecase/${this.usecase.id}/preferences`, 'POST', pref).then(async _ => {
      this.preferences = await this.fetch<UsecasePreferences, null>(`/api/usecase/${this.usecase!.id}/preferences`);
    }, error => {
      throw error;
    })
  }

}
