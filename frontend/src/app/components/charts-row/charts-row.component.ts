import {
  Component, Input, OnChanges, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { Report, TendenciaData } from '../../models/sst.models';

const RIESGO_COLORS: Record<string, string> = {
  'Mecánico': '#f97316', 'Biológico': '#22c55e', 'Químico': '#a855f7',
  'Ergonómico': '#4f8ef7', 'Locativo': '#f59e0b', 'Eléctrico': '#ef4444', 'Psicosocial': '#06b6d4'
};

@Component({
  selector: 'app-charts-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="charts-row">

      <!-- Donut: tipo de riesgo -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-card-title">Reportes por Tipo de Riesgo
            <span>Distribución acumulada del período</span>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas #canvasRiesgo></canvas>
          <div class="doughnut-center">
            <div class="dc-val">{{ reportes.length }}</div>
            <div class="dc-lbl">reportes</div>
          </div>
        </div>
        <div class="chart-legend">
          @for (item of riesgoLegend; track item.label) {
            <div class="legend-item">
              <div class="legend-dot" [style.background]="item.color"></div>
              <span style="color:var(--text)">{{ item.label }}</span>
              <span style="margin-left:auto;font-weight:700" [style.color]="item.color">{{ item.value }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Donut: sede -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-card-title">Distribución por Sede
            <span>Álamos vs El Dorado</span>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas #canvasSede></canvas>
          <div class="doughnut-center">
            <div class="dc-val">2</div>
            <div class="dc-lbl">sedes</div>
          </div>
        </div>
        <div class="chart-legend">
          @for (item of sedeLegend; track item.label) {
            <div class="legend-item" style="flex:1 1 45%">
              <div class="legend-dot" [style.background]="item.color"></div>
              <span style="color:var(--text)">{{ item.label }}</span>
              <span style="margin-left:auto;font-weight:700" [style.color]="item.color">{{ item.value }}</span>
            </div>
          }
        </div>
      </div>

      <!-- Line: tendencia mensual -->
      <div class="chart-card">
        <div class="chart-card-header">
          <div class="chart-card-title">Tendencia Mensual
            <span>Reportes abiertos vs cerrados</span>
          </div>
          <div class="trend-filters">
            <button class="filter-btn" [class.active]="trendMode==='all'"    (click)="setTrend('all')">Todo</button>
            <button class="filter-btn" [class.active]="trendMode==='open'"   (click)="setTrend('open')">Abiertos</button>
            <button class="filter-btn" [class.active]="trendMode==='closed'" (click)="setTrend('closed')">Cerrados</button>
          </div>
        </div>
        <div class="chart-wrap chart-wrap-line">
          <canvas #canvasTrend></canvas>
        </div>
      </div>

    </div>
  `
})
export class ChartsRowComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() reportes: Report[] = [];
  @Input() tendencia: TendenciaData = { meses: [], abiertos: [], cerrados: [] };

  @ViewChild('canvasRiesgo') canvasRiesgo!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasSede')   canvasSede!: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasTrend')  canvasTrend!: ElementRef<HTMLCanvasElement>;

  riesgoLegend: { label: string; color: string; value: number }[] = [];
  sedeLegend:   { label: string; color: string; value: number }[] = [];
  trendMode = 'all';

  private chartRiesgo: Chart | null = null;
  private chartSede:   Chart | null = null;
  private chartTrend:  Chart | null = null;
  private ready = false;

  ngAfterViewInit() { this.ready = true; this.build(); }
  ngOnChanges(_: SimpleChanges) { if (this.ready) this.build(); }
  ngOnDestroy() { [this.chartRiesgo, this.chartSede, this.chartTrend].forEach(c => c?.destroy()); }

  build() {
    this.buildRiesgo();
    this.buildSede();
    this.buildTrend();
  }

  private buildRiesgo() {
    const map: Record<string, number> = {};
    this.reportes.forEach(r => { map[r.riesgo] = (map[r.riesgo] || 0) + 1; });
    const labels = Object.keys(map);
    const vals   = labels.map(k => map[k]);
    const colors = labels.map(k => RIESGO_COLORS[k] || '#8892a4');
    this.riesgoLegend = labels.map((l, i) => ({ label: l, color: colors[i], value: vals[i] }));
    this.chartRiesgo?.destroy();
    this.chartRiesgo = new Chart(this.canvasRiesgo.nativeElement, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: vals, backgroundColor: colors, borderWidth: 2, borderColor: '#1e2130', hoverOffset: 6 }] },
      options: { cutout: '70%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  private buildSede() {
    const alamos = this.reportes.filter(r => r.sede === 'ALAMOS').length;
    const dorado = this.reportes.filter(r => r.sede === 'DORADO').length;
    this.sedeLegend = [
      { label: 'Álamos',    color: '#4f8ef7', value: alamos },
      { label: 'El Dorado', color: '#f97316', value: dorado },
    ];
    this.chartSede?.destroy();
    this.chartSede = new Chart(this.canvasSede.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Álamos', 'El Dorado'],
        datasets: [{ data: [alamos, dorado], backgroundColor: ['#4f8ef7','#f97316'], borderWidth: 2, borderColor: '#1e2130', hoverOffset: 6 }]
      },
      options: { cutout: '70%', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }

  private buildTrend() {
    this.chartTrend?.destroy();
    this.chartTrend = new Chart(this.canvasTrend.nativeElement, {
      type: 'line',
      data: {
        labels: this.tendencia.meses,
        datasets: [
          { label: 'Abiertos', data: this.tendencia.abiertos, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,.08)', tension: .4, borderWidth: 2, pointRadius: 4, fill: true },
          { label: 'Cerrados', data: this.tendencia.cerrados, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,.06)', tension: .4, borderWidth: 2, pointRadius: 4, fill: true },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { color: '#8892a4', boxWidth: 12, font: { size: 11 } } }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#8892a4' } },
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#8892a4' } }
        }
      }
    });
  }

  setTrend(mode: string) {
    this.trendMode = mode;
    if (!this.chartTrend) return;
    const ds = this.chartTrend.data.datasets;
    ds[0].hidden = mode === 'closed';
    ds[1].hidden = mode === 'open';
    this.chartTrend.update();
  }
}
