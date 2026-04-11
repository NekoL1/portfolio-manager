import {
  getCurrencySymbol,
  getLocale,
  getLowercase
} from '@ghostfolio/common/helper';
import {
  AssetProfileIdentifier,
  PortfolioPosition
} from '@ghostfolio/common/interfaces';

import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  viewChild
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AssetSubClass } from '@prisma/client';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import { GfEntityLogoComponent } from '../entity-logo/entity-logo.component';
import { GfValueComponent } from '../value/value.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    GfEntityLogoComponent,
    GfValueComponent,
    MatButtonModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    NgxSkeletonLoaderModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'gf-holdings-table',
  styleUrls: ['./holdings-table.component.scss'],
  templateUrl: './holdings-table.component.html'
})
export class GfHoldingsTableComponent {
  public readonly hasPermissionToOpenDetails = input(true);
  public readonly hasPermissionToShowQuantities = input(true);
  public readonly hasPermissionToShowValues = input(true);
  public readonly holdings = input.required<PortfolioPosition[]>();
  public readonly locale = input(getLocale());
  public readonly pageSize = model(Number.MAX_SAFE_INTEGER);
  public readonly baseCurrency = input('');

  public readonly holdingClicked = output<AssetProfileIdentifier>();

  protected readonly paginator = viewChild.required(MatPaginator);
  protected readonly sort = viewChild.required(MatSort);

  protected readonly dataSource = new MatTableDataSource<PortfolioPosition>([]);

  protected readonly displayedColumns = computed(() => {
    const columns = ['icon', 'nameWithSymbol', 'dateOfFirstActivity'];

    if (this.hasPermissionToShowValues()) {
      columns.push('marketPrice');
    }

    if (this.hasPermissionToShowQuantities()) {
      columns.push('quantity');
    }

    if (this.hasPermissionToShowValues()) {
      columns.push('valueInBaseCurrency');
    }

    columns.push('allocationInPercentage');

    if (this.hasPermissionToShowValues()) {
      columns.push('performance');
    }

    columns.push('performanceInPercentage');
    return columns;
  });

  protected readonly ignoreAssetSubClasses: AssetSubClass[] = [
    AssetSubClass.CASH
  ];

  protected readonly isLoading = computed(() => !this.holdings());

  public constructor() {
    this.dataSource.sortingDataAccessor = getLowercase;

    // Reactive data update
    effect(() => {
      this.dataSource.data = this.holdings();
    });

    // Reactive view connection
    effect(() => {
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.sort();
    });
  }

  protected canShowDetails(holding: PortfolioPosition): boolean {
    return (
      this.hasPermissionToOpenDetails() &&
      !this.ignoreAssetSubClasses.includes(holding.assetProfile.assetSubClass)
    );
  }

  protected onOpenHoldingDialog({
    dataSource,
    symbol
  }: AssetProfileIdentifier) {
    this.holdingClicked.emit({ dataSource, symbol });
  }

  protected onShowAllHoldings() {
    this.pageSize.set(Number.MAX_SAFE_INTEGER);

    setTimeout(() => {
      this.dataSource.paginator = this.paginator();
    });
  }

  protected getMoneySymbol(currency: string | undefined) {
    return getCurrencySymbol(currency ?? '', this.locale());
  }

  protected getPerformanceValueClass(value: number | undefined) {
    if (value !== undefined && value > 0) {
      return 'text-success';
    }

    if (value !== undefined && value < 0) {
      return 'text-danger';
    }

    return '';
  }

  protected formatSignedMoneyValue(value: number | undefined) {
    if (value === undefined) {
      return '';
    }

    const sign = value > 0 ? '+' : value < 0 ? '-' : '';
    const symbol = this.getMoneySymbol(this.baseCurrency()).trim();
    const amount = Math.abs(value).toLocaleString(this.locale(), {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });

    return `${sign}${symbol}${amount}`.replace(/\s+/g, '');
  }

  protected formatMoneyValue(
    currency: string | undefined,
    value: number | undefined
  ) {
    if (value === undefined) {
      return '';
    }

    const symbol = this.getMoneySymbol(currency).trim();
    const amount = Math.abs(value).toLocaleString(this.locale(), {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });

    return `${symbol}${amount}`.replace(/\s+/g, '');
  }
}
