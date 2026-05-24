import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Report } from '../../models/sst.models';

const NIVEL_COLOR: Record<string, string> = {
  'Bajo': '#22c55e', 'Medio': '#f59e0b', 'Alto': '#f97316', 'Crítico': '#ef4444'
};
const ESTADO_BADGE: Record<string, string> = {
  'Abierto': 'badge-red', 'En gestión': 'badge-yellow', 'Cerrado': 'badge-green'
};
const RIESGO_BADGE: Record<string, string> = {
  'Mecánico': 'badge-orange', 'Biológico': 'badge-green', 'Químico': 'badge-purple',
  'Ergonómico': 'badge-blue', 'Locativo': 'badge-yellow', 'Eléctrico': 'badge-red', 'Psicosocial': 'badge-cyan'
};

@Component({
  selector: 'app-report-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay open" (click)="onOverlay($event)">
      <div class="modal modal-wide" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div>
            <div class="modal-title">Detalle del Reporte {{ padId(report.id) }}</div>
            <div class="modal-sub">
              {{ report.fecha }} · {{ report.planta }} · {{ report.sede === 'ALAMOS' ? 'Sede Álamos' : 'Sede El Dorado' }}
            </div>
          </div>
          <button class="modal-close" (click)="close.emit()">✕</button>
        </div>
        <div class="modal-body" style="gap:12px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="detail-field">
              <div class="detail-field-label">Reportado por</div>
              <div class="detail-field-val">{{ report.reportador }}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Cargo</div>
              <div class="detail-field-val">{{ report.cargo || '—' }}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Tipo de Riesgo</div>
              <div class="detail-field-val">
                <span class="badge" [class]="riesgoBadge(report.riesgo)">{{ report.riesgo }}</span>
              </div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Nivel de Riesgo</div>
              <div class="detail-field-val" [style.color]="nivelColor(report.nivel)" style="font-weight:700">
                {{ report.nivel }}
              </div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Ubicación exacta</div>
              <div class="detail-field-val">{{ report.ubicacion || '—' }}</div>
            </div>
            <div class="detail-field">
              <div class="detail-field-label">Estado actual</div>
              <div class="detail-field-val">
                <span class="badge" [class]="estadoBadge(report.estado)">{{ report.estado }}</span>
              </div>
            </div>
          </div>
          <div class="detail-block">
            <div class="detail-block-label">Descripción de la condición insegura</div>
            <div class="detail-block-val">{{ report.descripcion }}</div>
          </div>
          <div class="detail-block">
            <div class="detail-block-label">Acción inmediata tomada</div>
            <div class="detail-block-val">{{ report.accion || 'Ninguna acción reportada.' }}</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" (click)="close.emit()">Cerrar</button>
          @if (report.estado !== 'Cerrado') {
            <button class="btn-submit" [style.background]="btnGradient()" (click)="changeStatus()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              {{ report.estado === 'Abierto' ? 'Marcar en gestión' : 'Marcar como cerrado' }}
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class ReportDetailModalComponent {
  @Input() report!: Report;
  @Output() close        = new EventEmitter<void>();
  @Output() statusChange = new EventEmitter<{ id: number; estado: string }>();

  onOverlay(e: MouseEvent) { if (e.target === e.currentTarget) this.close.emit(); }

  changeStatus() {
    const next = this.report.estado === 'Abierto' ? 'En gestión' : 'Cerrado';
    this.statusChange.emit({ id: this.report.id, estado: next });
  }

  btnGradient() {
    return this.report.estado === 'Abierto'
      ? 'linear-gradient(135deg,#f59e0b,#d97706)'
      : 'linear-gradient(135deg,#22c55e,#16a34a)';
  }

  padId(id: number)      { return '#' + String(id).padStart(3, '0'); }
  nivelColor(n: string)  { return NIVEL_COLOR[n] || '#8892a4'; }
  riesgoBadge(r: string) { return RIESGO_BADGE[r] || 'badge-blue'; }
  estadoBadge(e: string) { return ESTADO_BADGE[e] || 'badge-blue'; }
}
