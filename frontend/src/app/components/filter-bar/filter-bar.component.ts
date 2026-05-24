import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterState, SstOptions } from '../../models/sst.models';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">Sede</span>
        <select class="filter-select" [(ngModel)]="f.sede" (change)="emit()">
          <option value="ALL">Todas las sedes</option>
          @for (s of options.sedes; track s.value) {
            <option [value]="s.value">{{ s.label }}</option>
          }
        </select>
      </div>
      <div class="filter-sep"></div>
      <div class="filter-group">
        <span class="filter-label">Planta / Área</span>
        <select class="filter-select" [(ngModel)]="f.planta" (change)="emit()">
          <option value="ALL">Todas las plantas</option>
          @for (p of options.plantas; track p) {
            <option [value]="p">{{ p }}</option>
          }
        </select>
      </div>
      <div class="filter-sep"></div>
      <div class="filter-group">
        <span class="filter-label">Tipo de Riesgo</span>
        <select class="filter-select" [(ngModel)]="f.riesgo" (change)="emit()">
          <option value="ALL">Todos los riesgos</option>
          @for (r of options.riesgos; track r) {
            <option [value]="r">{{ r }}</option>
          }
        </select>
      </div>
      <div class="filter-sep"></div>
      <div class="filter-group">
        <span class="filter-label">Estado</span>
        <select class="filter-select" [(ngModel)]="f.estado" (change)="emit()">
          <option value="ALL">Todos los estados</option>
          @for (e of options.estados; track e) {
            <option [value]="e">{{ e }}</option>
          }
        </select>
      </div>
      <div class="filter-sep"></div>
      <div class="filter-group">
        <span class="filter-label">Desde</span>
        <input type="date" class="filter-input-date" [(ngModel)]="f.desde" (change)="emit()" />
      </div>
      <div class="filter-group">
        <span class="filter-label">Hasta</span>
        <input type="date" class="filter-input-date" [(ngModel)]="f.hasta" (change)="emit()" />
      </div>
      <button class="filter-clear" style="margin-left:auto" (click)="clear()">✕ Limpiar</button>
      @if (activeCount > 0) {
        <span class="filter-active-count">{{ activeCount }} activo{{ activeCount !== 1 ? 's' : '' }}</span>
      }
    </div>
  `
})
export class FilterBarComponent {
  @Input() options: SstOptions = { sedes: [], plantas: [], riesgos: [], estados: [], niveles: [] };
  @Output() filterChange = new EventEmitter<FilterState>();

  f: FilterState = { sede: 'ALL', planta: 'ALL', riesgo: 'ALL', estado: 'ALL', desde: '2026-01-01', hasta: '2026-05-14' };

  get activeCount(): number {
    return [this.f.sede, this.f.planta, this.f.riesgo, this.f.estado].filter(v => v !== 'ALL').length
      + (this.f.desde ? 1 : 0) + (this.f.hasta ? 1 : 0);
  }

  emit() { this.filterChange.emit({ ...this.f }); }

  clear() {
    this.f = { sede: 'ALL', planta: 'ALL', riesgo: 'ALL', estado: 'ALL', desde: '2026-01-01', hasta: '2026-05-14' };
    this.emit();
  }
}
