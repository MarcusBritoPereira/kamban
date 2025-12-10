import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-simple-input-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
        <div class="bg-brand-dark border border-white/10 rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
            <h2 class="text-xl font-bold mb-4 text-white">{{ title }}</h2>

            <div class="mb-6">
                <label class="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{{ label }}</label>
                <input [(ngModel)]="value" (keyup.enter)="onSubmit()" type="text"
                    class="w-full bg-black/20 text-white px-4 py-3 border border-white/10 rounded-lg focus:outline-none focus:border-brand-yellow/50 transition-colors"
                    [placeholder]="placeholder" autofocus>
            </div>

            <div class="flex justify-end space-x-3">
                <button type="button" (click)="onCancel()"
                    class="px-4 py-2 text-gray-400 hover:text-white font-medium transition-colors text-sm">
                    Cancelar
                </button>
                <button type="button" (click)="onSubmit()" [disabled]="!value.trim()"
                    class="bg-brand-yellow text-brand-black px-5 py-2 rounded-lg hover:bg-yellow-400 font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-sm">
                    Confirmar
                </button>
            </div>
        </div>
    </div>
  `,
    styles: []
})
export class SimpleInputDialogComponent {
    @Input() title: string = '';
    @Input() label: string = 'Nome';
    @Input() placeholder: string = '';
    @Input() value: string = '';

    @Output() submit = new EventEmitter<string>();
    @Output() close = new EventEmitter<void>();

    onSubmit() {
        if (this.value.trim()) {
            this.submit.emit(this.value);
        }
    }

    onCancel() {
        this.close.emit();
    }
}
