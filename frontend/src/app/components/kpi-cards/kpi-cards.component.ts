import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KpiData } from '../../models/sst.models';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-label">Total Reportes</div>
        <div class="kpi-val" style="color:var(--accent)">{{ kpis.total }}</div>
        <div class="kpi-sub">acumulado período</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Abiertos</div>
        <div class="kpi-val" style="color:var(--red)">{{ kpis.abiertos }}</div>
        <div class="kpi-sub">
          <span class="down">{{ kpis.total ? ((kpis.abiertos / kpis.total) * 100 | number:'1.0-0') + '%' : '0%' }}</span>
          del total
        </div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Índice Frecuencia (IF)</div>
        <div class="kpi-val" style="color:var(--orange)">{{ kpis.IF }}</div>
        <div class="kpi-sub">acc. × 200.000 / h-h</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Índice Severidad (IS)</div>
        <div class="kpi-val" style="color:var(--yellow)">{{ kpis.IS }}</div>
        <div class="kpi-sub">días × 200.000 / h-h</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Índ. Lesión Incap. (ILI)</div>
        <div class="kpi-val" style="color:var(--purple)">{{ kpis.ILI }}</div>
        <div class="kpi-sub">IF × IS / 1.000</div>
      </div>
    </div>
  `
})
export class KpiCardsComponent {
  @Input() kpis: KpiData = { total: 0, abiertos: 0, IF: 0, IS: 0, ILI: 0 };
}
