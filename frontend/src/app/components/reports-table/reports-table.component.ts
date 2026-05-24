import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Report } from '../../models/sst.models';

const RIESGO_BADGE: Record<string, string> = {
  'Mecánico': 'badge-orange', 'Biológico': 'badge-green', 'Químico': 'badge-purple',
  'Ergonómico': 'badge-blue', 'Locativo': 'badge-yellow', 'Eléctrico': 'badge-red', 'Psicosocial': 'badge-cyan'
};
const ESTADO_BADGE: Record<string, string> = {
  'Abierto': 'badge-red', 'En gestión': 'badge-yellow', 'Cerrado': 'badge-green'
};

@Component({
  selector: 'app-reports-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="table-card">
      <div class="table-header-bar">
        <div class="title">Registro de Reportes SST</div>
        <input class="table-search" type="text" placeholder="Buscar reporte, área, riesgo…"
               [(ngModel)]="query" (input)="onSearch()" />
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th (click)="sort('id')">#</th>
              <th (click)="sort('fecha')">Fecha</th>
              <th (click)="sort('sede')">Sede</th>
              <th (click)="sort('planta')">Área</th>
              <th (click)="sort('riesgo')">Tipo Riesgo</th>
              <th>Descripción</th>
              <th (click)="sort('estado')">Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            @for (r of paged; track r.id) {
              <tr>
                <td style="color:var(--muted);font-weight:600">{{ padId(r.id) }}</td>
                <td>{{ r.fecha }}</td>
                <td><span class="badge" [class]="r.sede === 'ALAMOS' ? 'badge-blue' : 'badge-orange'">
                  {{ r.sede === 'ALAMOS' ? 'Álamos' : 'Dorado' }}
                </span></td>
                <td>{{ r.planta }}</td>
                <td><span class="badge" [class]="riesgoBadge(r.riesgo)">{{ r.riesgo }}</span></td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;color:var(--muted)">
                  {{ r.descripcion.slice(0,55) }}…
                </td>
                <td><span class="badge" [class]="estadoBadge(r.estado)">{{ r.estado }}</span></td>
                <td>
                  <button class="ver-btn" (click)="viewDetail.emit(r)">Ver</button>
                </td>
              </tr>
            }
            @if (paged.length === 0) {
              <tr><td colspan="8" style="text-align:center;color:var(--muted);padding:24px">Sin resultados</td></tr>
            }
          </tbody>
        </table>
      </div>
      <div class="table-pagination">
        <span>Mostrando {{ paged.length }} de {{ filtered.length }} registros</span>
        <div class="page-btns">
          @if (page > 1) {
            <button class="page-btn" (click)="go(page - 1)">‹</button>
          }
          @for (p of pageNums; track p) {
            <button class="page-btn" [class.active]="p === page" (click)="go(p)">{{ p }}</button>
          }
          @if (page < totalPages) {
            <button class="page-btn" (click)="go(page + 1)">›</button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ver-btn {
      background: rgba(79,142,247,.12); border: 1px solid rgba(79,142,247,.25);
      border-radius: 6px; color: #4f8ef7; padding: 3px 10px; font-size: 11px; cursor: pointer;
      transition: background .12s;
    }
    .ver-btn:hover { background: rgba(79,142,247,.25); }
  `]
})
export class ReportsTableComponent implements OnChanges {
  @Input() reportes: Report[] = [];
  @Output() viewDetail = new EventEmitter<Report>();

  query = '';
  sortKey = '';
  sortAsc = true;
  page = 1;
  readonly PAGE = 8;

  get filtered(): Report[] {
    const q = this.query.toLowerCase();
    let rows = q
      ? this.reportes.filter(r =>
          r.descripcion.toLowerCase().includes(q) ||
          r.planta.toLowerCase().includes(q) ||
          r.riesgo.toLowerCase().includes(q) ||
          r.reportador.toLowerCase().includes(q) ||
          String(r.id).includes(q)
        )
      : [...this.reportes];
    if (this.sortKey) {
      rows = rows.sort((a, b) => {
        const va = (a as unknown as Record<string, unknown>)[this.sortKey];
        const vb = (b as unknown as Record<string, unknown>)[this.sortKey];
        if (typeof va === 'number' && typeof vb === 'number') return this.sortAsc ? va - vb : vb - va;
        return this.sortAsc
          ? String(va).localeCompare(String(vb))
          : String(vb).localeCompare(String(va));
      });
    }
    return rows;
  }

  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.PAGE)); }
  get paged()      { return this.filtered.slice((this.page - 1) * this.PAGE, this.page * this.PAGE); }
  get pageNums()   {
    const p = this.page, t = this.totalPages;
    return Array.from({ length: Math.min(5, t) }, (_, i) => Math.max(1, Math.min(t - 4, p - 2)) + i);
  }

  ngOnChanges() { this.page = 1; }
  onSearch()    { this.page = 1; }
  go(p: number) { this.page = Math.min(Math.max(1, p), this.totalPages); }

  sort(key: string) {
    if (this.sortKey === key) this.sortAsc = !this.sortAsc;
    else { this.sortKey = key; this.sortAsc = true; }
    this.page = 1;
  }

  padId(id: number)         { return '#' + String(id).padStart(3, '0'); }
  riesgoBadge(r: string)    { return RIESGO_BADGE[r] || 'badge-blue'; }
  estadoBadge(e: string)    { return ESTADO_BADGE[e] || 'badge-blue'; }
}
