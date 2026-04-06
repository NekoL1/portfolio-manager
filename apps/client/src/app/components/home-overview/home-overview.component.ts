import { LayoutService } from '@ghostfolio/client/core/layout.service';
import { ImpersonationStorageService } from '@ghostfolio/client/services/impersonation-storage.service';
import { UserService } from '@ghostfolio/client/services/user/user.service';
import { NUMERICAL_PRECISION_THRESHOLD_6_FIGURES } from '@ghostfolio/common/config';
import {
  AssetProfileIdentifier,
  LineChartItem,
  PortfolioPerformance,
  User
} from '@ghostfolio/common/interfaces';
import { hasPermission, permissions } from '@ghostfolio/common/permissions';
import { internalRoutes } from '@ghostfolio/common/routes/routes';
import { PerformanceCalculationType } from '@ghostfolio/common/types/performance-calculation-type.type';
import { GfLineChartComponent } from '@ghostfolio/ui/line-chart';
import { DataService } from '@ghostfolio/ui/services';
import { GfValueComponent } from '@ghostfolio/ui/value';

import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { DeviceDetectorService } from 'ngx-device-detector';
import { forkJoin } from 'rxjs';

@Component({
  imports: [
    CommonModule,
    GfLineChartComponent,
    GfValueComponent,
    MatButtonModule,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'gf-home-overview',
  styleUrls: ['./home-overview.scss'],
  templateUrl: './home-overview.html'
})
export class GfHomeOverviewComponent implements OnInit {
  public contributionDataItems: LineChartItem[];
  public deviceType: string;
  public errors: AssetProfileIdentifier[];
  public hasError: boolean;
  public hasImpersonationId: boolean;
  public hasPermissionToCreateActivity: boolean;
  public historicalDataItems: LineChartItem[];
  public isAllTimeHigh: boolean;
  public isAllTimeLow: boolean;
  public isLoadingPerformance = true;
  public mwrPerformance: PortfolioPerformance;
  public performanceLabel = $localize`Portfolio Value`;
  public precision = 2;
  public contributionLabel = $localize`Contributions`;
  public twrPerformance: PortfolioPerformance;
  public routerLinkAccounts = internalRoutes.accounts.routerLink;
  public routerLinkPortfolio = internalRoutes.portfolio.routerLink;
  public routerLinkPortfolioActivities =
    internalRoutes.portfolio.subRoutes.activities.routerLink;
  public showDetails = false;
  public unit: string;
  public user: User;

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private destroyRef: DestroyRef,
    private deviceService: DeviceDetectorService,
    private impersonationStorageService: ImpersonationStorageService,
    private layoutService: LayoutService,
    private userService: UserService
  ) {
    this.userService.stateChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.hasPermissionToCreateActivity = hasPermission(
            this.user.permissions,
            permissions.createActivity
          );

          this.update();
        }
      });
  }

  public ngOnInit() {
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;

    this.showDetails =
      !this.user.settings.isRestrictedView &&
      this.user.settings.viewMode !== 'ZEN';

    this.unit = this.showDetails ? this.user.settings.baseCurrency : '%';

    this.impersonationStorageService
      .onChangeHasImpersonation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((impersonationId) => {
        this.hasImpersonationId = !!impersonationId;

        this.changeDetectorRef.markForCheck();
      });

    this.layoutService.shouldReloadContent$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.update();
      });
  }

  private update() {
    this.contributionDataItems = null;
    this.historicalDataItems = null;
    this.isLoadingPerformance = true;
    this.mwrPerformance = undefined;
    this.twrPerformance = undefined;

    forkJoin({
      mwr: this.dataService.fetchPortfolioPerformance({
        calculationType: PerformanceCalculationType.MWR,
        range: this.user?.settings?.dateRange
      }),
      twr: this.dataService.fetchPortfolioPerformance({
        calculationType: PerformanceCalculationType.TWR,
        range: this.user?.settings?.dateRange
      })
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ mwr, twr }) => {
        this.errors = this.mergeErrors([twr.errors, mwr.errors]);
        this.mwrPerformance = mwr.performance;
        this.twrPerformance = twr.performance;

        this.historicalDataItems = twr.chart.map(
          ({ date, valueWithCurrencyEffect }) => {
            return {
              date,
              value: valueWithCurrencyEffect
            };
          }
        );

        this.contributionDataItems = twr.chart.map(
          ({ date, totalInvestmentValueWithCurrencyEffect }) => {
            return {
              date,
              value: totalInvestmentValueWithCurrencyEffect
            };
          }
        );

        if (
          this.deviceType === 'mobile' &&
          this.twrPerformance.currentValueInBaseCurrency >=
            NUMERICAL_PRECISION_THRESHOLD_6_FIGURES
        ) {
          this.precision = 0;
        }

        this.isLoadingPerformance = false;

        this.changeDetectorRef.markForCheck();
      });

    this.changeDetectorRef.markForCheck();
  }

  private mergeErrors(errorsList: AssetProfileIdentifier[][] = []) {
    const errorMap = new Map<string, AssetProfileIdentifier>();

    for (const errors of errorsList) {
      for (const error of errors ?? []) {
        errorMap.set(`${error.dataSource}:${error.symbol}`, error);
      }
    }

    return Array.from(errorMap.values());
  }

  public isPositivePerformance(performance: PortfolioPerformance) {
    return (performance?.netPerformancePercentageWithCurrencyEffect ?? 0) >= 0;
  }
}
