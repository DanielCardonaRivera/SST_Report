import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewReportForm, SstOptions } from '../../models/sst.models';

@Component({
  selector: 'app-new-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay open" (click)="onOverlay($event)">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <div class="modal-title">Reportar Condición Insegura</div>
            <div class="modal-sub">Complete el formulario · el reporte queda registrado en el sistema SST</div>
          </div>
          <button class="modal-close" (click)="close.emit()">✕</button>
        </div>
        <div class="modal-body">
          @if (errors.length > 0) {
            <div class="form-error">
              @for (e of errors; track e) { <div>• {{ e }}</div> }
            </div>
          }

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">Fecha <span class="req">*</span></label>
              <input type="date" class="form-input" [(ngModel)]="f.fecha" />
            </div>
            <div class="form-group">
              <label class="form-label">Sede <span class="req">*</span></label>
              <select class="form-select" [(ngModel)]="f.sede">
                <option value="">— Selecciona —</option>
                @for (s of options.sedes; track s.value) {
                  <option [value]="s.value">{{ s.label }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Área / Planta <span class="req">*</span></label>
              <select class="form-select" [(ngModel)]="f.planta">
                <option value="">— Selecciona —</option>
                @for (p of options.plantas; track p) {
                  <option [value]="p">{{ p }}</option>
                }
              </select>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Reportado por <span class="req">*</span></label>
              <input type="text" class="form-input" [(ngModel)]="f.reportador" placeholder="Nombre completo" />
            </div>
            <div class="form-group">
              <label class="form-label">Cargo / Rol</label>
              <input type="text" class="form-input" [(ngModel)]="f.cargo" placeholder="Ej: Operario tejido" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Tipo de Riesgo <span class="req">*</span></label>
            <div class="radio-tiles">
              @for (r of options.riesgos; track r) {
                <div class="radio-tile" [class.selected]="f.riesgo === r" (click)="f.riesgo = r">
                  <span class="radio-tile-dot"></span> {{ r }}
                </div>
              }
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Nivel de Riesgo <span class="req">*</span></label>
              <select class="form-select" [(ngModel)]="f.nivel">
                <option value="">— Selecciona —</option>
                @for (n of options.niveles; track n) {
                  <option [value]="n">{{ n }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Ubicación exacta</label>
              <input type="text" class="form-input" [(ngModel)]="f.ubicacion" placeholder="Ej: Nave 3 – máquina #7" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Descripción <span class="req">*</span></label>
            <textarea class="form-textarea" [(ngModel)]="f.descripcion" rows="4"
              placeholder="Describa detalladamente la condición insegura observada…"></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Acción inmediata tomada</label>
            <textarea class="form-textarea" [(ngModel)]="f.accion" rows="2"
              placeholder="Indique si se tomó alguna acción correctiva inmediata…"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="close.emit()">Cancelar</button>
          <button class="btn-submit" (click)="submit()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Enviar Reporte
          </button>
        </div>
      </div>
    </div>
  `
})
export class NewReportModalComponent {
  @Input() options: SstOptions = { sedes: [], plantas: [], riesgos: [], estados: [], niveles: [] };
  @Output() close        = new EventEmitter<void>();
  @Output() submitReport = new EventEmitter<NewReportForm>();

  errors: string[] = [];

  f: NewReportForm = {
    fecha: new Date().toISOString().slice(0, 10),
    sede: '', planta: '', riesgo: '', nivel: '',
    descripcion: '', accion: '', reportador: '', cargo: '', ubicacion: ''
  };

  onOverlay(e: MouseEvent) {
    if (e.target === e.currentTarget) this.close.emit();
  }

  submit() {
    this.errors = [];
    if (!this.f.fecha)       this.errors.push('La fecha es obligatoria.');
    if (!this.f.sede)        this.errors.push('Selecciona la sede.');
    if (!this.f.planta)      this.errors.push('Selecciona el área / planta.');
    if (!this.f.reportador)  this.errors.push('El nombre de quien reporta es obligatorio.');
    if (!this.f.riesgo)      this.errors.push('Selecciona el tipo de riesgo.');
    if (!this.f.nivel)       this.errors.push('Selecciona el nivel de riesgo.');
    if (!this.f.descripcion) this.errors.push('La descripción es obligatoria.');
    if (this.errors.length) return;
    this.submitReport.emit({ ...this.f });
  }
}
