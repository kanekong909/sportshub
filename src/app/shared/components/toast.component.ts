// shared/components/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 space-y-2">
      @for (toast of toastService.toasts(); track $index) {
        <div
          [class]="getToastClass(toast.type)"
          class="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slideIn min-w-[300px] max-w-md"
          (click)="toastService.remove(toast)"
        >
          <span class="text-xl">{{ getIcon(toast.type) }}</span>
          <span class="flex-1 text-sm font-medium">{{ toast.message }}</span>
          <button class="opacity-50 hover:opacity-100">✕</button>
        </div>
      }
    </div>

    <style>
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      .animate-slideIn {
        animation: slideIn 0.3s ease-out;
      }
    </style>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);

  getToastClass(type: string) {
    return {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    }[type];
  }

  getIcon(type: string) {
    return {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ'
    }[type];
  }
}
