import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup} from '@angular/forms';
import { ProductSearchService } from '../product-search.service';
import { filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.css']
})
export class SearchFormComponent implements OnInit, AfterViewInit{
  zip = new FormControl('');
  searchForm = new FormGroup({
    keyword: new FormControl(''),
    location: new FormControl('Current'),
    zip: new FormControl({ value: '', disabled: true})
  });

  constructor(private productSearch: ProductSearchService) {}
  
  zipCodes = [];
  ipLocation= '';
  customZip = false;
  formValidated = false;

  ngOnInit(): void {
    this.productSearch.getLocation().subscribe((response:any) => {
      this.ipLocation = response.postal;
      if (this.ipLocation && /^\d{5}$/.test(this.ipLocation)) {
        let currentLocation = document.getElementById('currentLocation') as HTMLInputElement;
        currentLocation.checked = true;
      } else {
        let currentLocation = document.getElementById('currentLocation') as HTMLInputElement;
        currentLocation.disabled = true;
        this.customZip = true;
      }
    });

    this.zip.valueChanges.pipe(
      filter((value) => {console.error(1); return value != null}),
      distinctUntilChanged(),
      debounceTime(250),
      switchMap((value) => this.productSearch.getAutocomplete(value))
    ).subscribe((response: any) => {
      this.zipCodes = [];
      this.zipCodes = response.postalCodes.map((item: any) => item.postalCode);
    });
    
  }

  ngAfterViewInit(): void {
    this.searchForm.valueChanges.subscribe((value) => {
      let keyword = value.keyword;
      let location = value.location;
      let zip = value.zip;
      if (location == "Current"){
        this.searchForm.get('zip')?.patchValue('', {emitEvent: false});
        this.remove_zip_warning();
        if (keyword && keyword.trim() !== ""){
          this.formValidated = true;
          this.remove_keyword_warning();
        } else{
          this.formValidated = false;
          this.set_keyword_warning();
        }
      } else {
        this.searchForm.get('zip')?.enable({emitEvent: false});
        if (zip && keyword && keyword.trim() !== "" && /^\d{5}$/.test(zip)){
          this.formValidated = true;
          this.ipLocation = zip;
          this.remove_keyword_warning();
          this.remove_zip_warning();
        } else{
          this.formValidated = false;
          if (!keyword || keyword.trim() == ""){
            this.set_keyword_warning();
          } else {
            this.remove_keyword_warning();
          }
          if (!zip || !/^\d{5}$/.test(zip)){
            this.set_zip_warning();
          } else {
            this.remove_zip_warning();
          }
        }
      }
      if (zip != null) {
        this.productSearch.getAutocomplete(zip).pipe(
          distinctUntilChanged(),
          debounceTime(250)
        ).subscribe((response: any) => {
          this.zipCodes = [];
          this.zipCodes = response.postalCodes.map((item: any) => item.postalCode);
        });
      }
    });
  }

  async onSubmit(){
    this.productSearch.clearTable();
    let query = this.searchForm.value;
    let keyword = query.keyword!;
    let category = document.getElementById('category') as HTMLInputElement
    let category_selection = category.value;
    let conditions = [];
    let condition_new = document.getElementById('conditionNew') as HTMLInputElement;
    if (condition_new.checked) {
      conditions.push('New');
    }
    let condition_used = document.getElementById('conditionUsed') as HTMLInputElement;
    if (condition_used.checked) {  
      conditions.push('Used');
    }
    let condition_unspecified = document.getElementById('conditionUnspecified') as HTMLInputElement;
    if (condition_unspecified.checked) {  
      conditions.push('Unspecified');
    }
    let shipping = [];
    let shipping_local = document.getElementById('localPickup') as HTMLInputElement;
    if (shipping_local.checked) {  
    shipping.push('localPickup');
    }
    let shipping_free = document.getElementById('freeShipping') as HTMLInputElement;
    if (shipping_free.checked) {  
    shipping.push('freeShipping');
    }
    let distance = document.getElementById('distance') as HTMLInputElement;
    let distance_selection = Number(distance.value) || 10;
    this.productSearch.getSearchresult(keyword,category_selection,conditions,shipping,distance_selection,this.ipLocation);
  }

  set_keyword_warning() {
    let keywordWarning = document.getElementById('keywordWarning') as HTMLInputElement;
    let keywordInput = document.getElementById('keyword') as HTMLInputElement;
    keywordWarning.classList.remove("hidden");
    keywordInput.style.borderColor = "red";
  }

  remove_keyword_warning() {
    let keywordWarning = document.getElementById('keywordWarning') as HTMLInputElement;
    let keywordInput = document.getElementById('keyword') as HTMLInputElement;
    keywordWarning.classList.add("hidden");
    keywordInput.style.borderColor = "black";
  }

  set_zip_warning() {
    let zipWarning = document.getElementById('zipWarning') as HTMLInputElement;
    let zipInput = document.getElementById('Zip') as HTMLInputElement;
    zipWarning.classList.remove("hidden");
    zipInput.style.borderColor = "red";
  }

  remove_zip_warning() {
    let zipWarning = document.getElementById('zipWarning') as HTMLInputElement;
    let zipInput = document.getElementById('Zip') as HTMLInputElement;
    zipWarning.classList.add("hidden");
    zipInput.style.borderColor = "black";
  }

  clearForm() {
    this.searchForm.reset();
    let currentLocation = document.getElementById('currentLocation') as HTMLInputElement;
    currentLocation.checked = true;
    this.searchForm.get('location')?.setValue('Current');
    this.searchForm.get('zip')?.disable();
    this.customZip = false;
    this.formValidated = false;
    this.remove_keyword_warning();
    this.remove_zip_warning();
    this.productSearch.clearTable();
  }
}
