import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DetailSearchService {

  constructor(private http: HttpClient) { }
  private searchDetails = new Subject();
  public searchDetails$ = this.searchDetails.asObservable();
  details: any;
  private showDetail = new Subject();
  public showDetail$ = this.showDetail.asObservable()
  private showTable = new Subject();
  public showTable$ = this.showTable.asObservable();

  async getDetail(itemId: string) {
    const response:any = await lastValueFrom(this.http.get('https://kinetic-hydra-176707.wl.r.appspot.com/findsingleitem'+ '?itemId=' + itemId));
    this.details = response.Item;
    this.searchDetails.next(this.details);
    this.showDetail.next('detail')
  }

  loadDetails() {
    this.searchDetails.next(this.details);
  }
  
  returnToTable() {
    this.showTable.next('table');
  }
}
