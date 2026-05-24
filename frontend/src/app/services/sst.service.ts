import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FilterState, NewReportForm, Report, SstData, SstOptions } from '../models/sst.models';

@Injectable({ providedIn: 'root' })
export class SstService {
  private base = '/api';

  constructor(private http: HttpClient) {}

  getOptions(): Observable<SstOptions> {
    return this.http.get<SstOptions>(`${this.base}/sst_options`);
  }

  getData(f: FilterState): Observable<SstData> {
    let params = new HttpParams();
    if (f.sede   && f.sede   !== 'ALL') params = params.set('sede',   f.sede);
    if (f.planta && f.planta !== 'ALL') params = params.set('planta', f.planta);
    if (f.riesgo && f.riesgo !== 'ALL') params = params.set('riesgo', f.riesgo);
    if (f.estado && f.estado !== 'ALL') params = params.set('estado', f.estado);
    if (f.desde) params = params.set('desde', f.desde);
    if (f.hasta) params = params.set('hasta', f.hasta);
    return this.http.get<SstData>(`${this.base}/sst_data`, { params });
  }

  addReport(form: NewReportForm): Observable<Report> {
    return this.http.post<Report>(`${this.base}/sst_add_report`, form);
  }

  updateReport(id: number, estado: string): Observable<Report> {
    return this.http.put<Report>(`${this.base}/sst_update_report/${id}`, { estado });
  }
}
