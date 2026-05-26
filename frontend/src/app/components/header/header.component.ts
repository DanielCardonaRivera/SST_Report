import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header>
      <div class="logo-area">
        <div class="logo-badge">SST</div>
      </div>
      <div class="header-center">
        <h1>Gestión de Seguridad Laboral</h1>
        <p>Reporte y seguimiento de condiciones inseguras · TEXTILES S.A. 2026</p>
      </div>
      <div class="header-right">
        <div class="api-status">
          <span class="api-dot" [class.connected]="connected"></span>
          <span class="api-label" [class.connected]="connected">
            {{ connected ? 'API conectada · localhost:5000' : 'Conectando…' }}
          </span>
        </div>
        <button class="btn-primary" (click)="newReport.emit()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Reportar Condición Insegura
        </button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  @Input() connected = false;
  @Output() newReport = new EventEmitter<void>();
}
