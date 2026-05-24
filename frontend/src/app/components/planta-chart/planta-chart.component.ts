import { Component, Input, OnChanges, AfterViewInit, OnDestroy, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { Report } from '../../models/sst.models';

const P_COLORS = ['#f97316','#ef4444','#a855f7','#4f8ef7','#22c55e','#f59e0b','#06b6d4','#84cc16'];

@Component({
  selector: 'app-planta-chart',
  standalone: true,
  template: `
    <div class="chart-card" style="height:100%">
      <div class="chart-card-header">
        <div class="chart-card-title">Reportes por Área / Planta
          <span>Acumulado del período filtrado</span>
        </div>
      </div>
      <div class="chart-wrap chart-wrap-bar">
        <canvas #canvas></canvas>
      </div>
    </div>
  `
})
export class PlantaChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() reportes: Report[] = [];
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  private ready = false;

  ngAfterViewInit() { this.ready = true; this.build(); }
  ngOnChanges(_: SimpleChanges) { if (this.ready) this.build(); }
  ngOnDestroy() { this.chart?.destroy(); }

  private build() {
    const map: Record<string, number> = {};
    this.reportes.forEach(r => { map[r.planta] = (map[r.planta] || 0) + 1; });
    const labels = Object.keys(map).sort((a, b) => map[b] - map[a]);
    const vals   = labels.map(k => map[k]);
    this.chart?.destroy();
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: { labels, datasets: [{ data: vals, backgroundColor: P_COLORS.slice(0, labels.length), borderRadius: 6, borderSkipped: false }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.x} reportes` } } },
        scales: {
          x: { beginAtZero: true, grid: { color: 'rgba(255,255,255,.05)' }, ticks: { color: '#8892a4', stepSize: 1 } },
          y: { grid: { display: false }, ticks: { color: '#e2e8f0', font: { size: 11 } } }
        }
      }
    });
  }
}
