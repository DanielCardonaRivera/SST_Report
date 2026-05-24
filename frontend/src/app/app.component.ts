import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SstService } from './services/sst.service';
import { FilterState, KpiData, NewReportForm, Report, SstOptions, TendenciaData } from './models/sst.models';
import { HeaderComponent } from './components/header/header.component';
import { FilterBarComponent } from './components/filter-bar/filter-bar.component';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { ChartsRowComponent } from './components/charts-row/charts-row.component';
import { PlantaChartComponent } from './components/planta-chart/planta-chart.component';
import { ReportsTableComponent } from './components/reports-table/reports-table.component';
import { NewReportModalComponent } from './components/new-report-modal/new-report-modal.component';
import { ReportDetailModalComponent } from './components/report-detail-modal/report-detail-modal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    FilterBarComponent,
    KpiCardsComponent,
    ChartsRowComponent,
    PlantaChartComponent,
    ReportsTableComponent,
    NewReportModalComponent,
    ReportDetailModalComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  reportes: Report[]      = [];
  kpis: KpiData           = { total: 0, abiertos: 0, IF: 0, IS: 0, ILI: 0 };
  tendencia: TendenciaData = { meses: [], abiertos: [], cerrados: [] };
  options: SstOptions     = { sedes: [], plantas: [], riesgos: [], estados: [], niveles: [] };
  filters: FilterState    = { sede: 'ALL', planta: 'ALL', riesgo: 'ALL', estado: 'ALL', desde: '2026-01-01', hasta: '2026-05-14' };

  connected      = false;
  showNewModal   = false;
  selectedReport: Report | null = null;
  toastVisible   = false;
  toastMsg       = '';
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private sst: SstService) {}

  ngOnInit() {
    this.sst.getOptions().subscribe({
      next: opts => { this.options = opts; this.connected = true; this.loadData(); },
      error: ()  => { this.connected = false; this.toast('Error conectando al servidor. Verifica que el backend esté activo.'); }
    });
  }

  loadData() {
    this.sst.getData(this.filters).subscribe({
      next: d => { this.reportes = d.reportes; this.kpis = d.kpis; this.tendencia = d.tendencia; },
      error: () => this.toast('Error cargando datos.')
    });
  }

  onFilterChange(f: FilterState) { this.filters = f; this.loadData(); }
  onViewDetail(r: Report)        { this.selectedReport = r; }

  onSubmitReport(form: NewReportForm) {
    this.sst.addReport(form).subscribe({
      next: created => {
        this.showNewModal = false;
        this.loadData();
        this.toast(`Reporte #${String(created.id).padStart(3, '0')} registrado correctamente`);
      },
      error: () => this.toast('Error al registrar el reporte.')
    });
  }

  onStatusChange(payload: { id: number; estado: string }) {
    this.sst.updateReport(payload.id, payload.estado).subscribe({
      next: () => { this.selectedReport = null; this.loadData(); this.toast('Estado actualizado correctamente'); },
      error: () => this.toast('Error al actualizar el estado.')
    });
  }

  toast(msg: string) {
    this.toastMsg = msg;
    this.toastVisible = true;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3500);
  }
}
