import { Component, OnInit } from '@angular/core';
import { DetailSearchService } from '../detail-search.service';

@Component({
  selector: 'app-wish',
  templateUrl: './wish.component.html',
  styleUrls: ['./wish.component.css']
})

export class WishComponent implements OnInit{
  display: any = 'table';
  constructor(
    private DetailSearchService: DetailSearchService){
    this.DetailSearchService.showTable$.subscribe((data) =>{
      this.display = data;})

    this.DetailSearchService.showDetail$.subscribe((data) =>{
      this.display = data;})
  }

  ngOnInit(): void {}
}