// core/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: Toast['type'] = 'success', duration = 3000) {
    const toast = { message, type, duration };
    this.toasts.update(t => [...t, toast]);

    setTimeout(() => {
      this.toasts.update(t => t.filter(t => t !== toast));
    }, duration);
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  info(message: string) { this.show(message, 'info'); }
  warning(message: string) { this.show(message, 'warning'); }

  remove(toast: Toast) {
    this.toasts.update(t => t.filter(t => t !== toast));
  }
}
