import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchFormComponent } from './search-form/search-form.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { SearchResultComponent } from './search-result/search-result.component';
import { SearchDetailComponent } from './search-detail/search-detail.component';
import { SearchComponent } from './search/search.component';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgxPaginationModule } from 'ngx-pagination';
import { WishListComponent } from './wish-list/wish-list.component';
import { WishComponent } from './wish/wish.component';
@NgModule({
  declarations: [
    AppComponent,
    SearchFormComponent,
    NavBarComponent,
    SearchResultComponent,
    SearchDetailComponent,
    SearchComponent,
    WishListComponent,
    WishComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatTabsModule,
    BrowserAnimationsModule,
    RoundProgressModule,
    NgxPaginationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
