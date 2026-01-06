import { Capacitor } from '@capacitor/core';

export interface OverlayPermissionPlugin {
  checkPermission(): Promise<{ value: boolean }>;
  requestPermission(): Promise<{ value: boolean }>;
}

export const OverlayPermission = Capacitor.isNativePlatform() 
  ? (Capacitor.registerPlugin('OverlayPermission') as OverlayPermissionPlugin)
  : {
      checkPermission: async () => ({ value: true }),
      requestPermission: async () => ({ value: true })
    };