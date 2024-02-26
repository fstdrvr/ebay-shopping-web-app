import { Component, OnInit } from '@angular/core';
import { ProductSearchService } from '../product-search.service';
import { DetailSearchService } from '../detail-search.service';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit{
  display: any;
  constructor(
    private ProductSearchService: ProductSearchService,
    private DetailSearchService: DetailSearchService)
    {
    this.ProductSearchService.showTable$.subscribe((data) =>{
      this.display = data;})

    this.ProductSearchService.showDetail$.subscribe((data) =>{
      this.display = data;})

    this.DetailSearchService.showTable$.subscribe((data) =>{
      this.display = data;})

    this.DetailSearchService.showDetail$.subscribe((data) =>{
      this.display = data;})
  }

  ngOnInit(): void {}
}
