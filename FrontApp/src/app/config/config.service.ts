import { Injectable } from '@angular/core';
import { InConfiguration } from '../core/models/config.interface';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  public configData!: InConfiguration;

  constructor() {
    this.setConfigData();
  }

  setConfigData() {
    this.configData = {
      layout: {
        rtl: false,
        variant: 'light',
        theme_color: 'white',
        logo_bg_color: 'white',
        sidebar: {
          collapsed: false,
          backgroundColor: 'light',
        },
      },
    };
  }
}
