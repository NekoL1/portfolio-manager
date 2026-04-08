import { ImpersonationStorageService } from '@ghostfolio/client/services/impersonation-storage.service';
import { UserService } from '@ghostfolio/client/services/user/user.service';
import {
  AssetProfileIdentifier,
  PortfolioPosition,
  ToggleOption,
  User
} from '@ghostfolio/common/interfaces';
import { hasPermission, permissions } from '@ghostfolio/common/permissions';
import { internalRoutes } from '@ghostfolio/common/routes/routes';
import { HoldingType, HoldingsViewMode } from '@ghostfolio/common/types';
import { GfHoldingsTableComponent } from '@ghostfolio/ui/holdings-table';
import { DataService } from '@ghostfolio/ui/services';
import { GfToggleComponent } from '@ghostfolio/ui/toggle';
import { GfTreemapChartComponent } from '@ghostfolio/ui/treemap-chart';

import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router, RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { gridOutline, reorderFourOutline } from 'ionicons/icons';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    GfHoldingsTableComponent,
    GfToggleComponent,
    GfTreemapChartComponent,
    IonIcon,
    MatButtonModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'gf-home-holdings',
  styleUrls: ['./home-holdings.scss'],
  templateUrl: './home-holdings.html'
})
export class GfHomeHoldingsComponent implements OnInit {
  public static DEFAULT_HOLDINGS_VIEW_MODE: HoldingsViewMode = 'TABLE';
  private static readonly HOLDINGS_STREAM_RECONNECT_DELAY_IN_MILLISECONDS = 5000;

  public deviceType: string;
  public hasImpersonationId: boolean;
  public hasPermissionToAccessHoldingsChart: boolean;
  public hasPermissionToCreateActivity: boolean;
  public holdings: PortfolioPosition[];
  public holdingType: HoldingType = 'ACTIVE';
  public holdingTypeOptions: ToggleOption[] = [
    { label: $localize`Active`, value: 'ACTIVE' },
    { label: $localize`Closed`, value: 'CLOSED' }
  ];
  public routerLinkPortfolioActivities =
    internalRoutes.portfolio.subRoutes.activities.routerLink;
  public user: User;
  public viewModeFormControl = new FormControl<HoldingsViewMode>(
    GfHomeHoldingsComponent.DEFAULT_HOLDINGS_VIEW_MODE
  );

  private holdingsStreamReconnectTimeout?: ReturnType<typeof setTimeout>;
  private holdingsStreamSubscription?: Subscription;

  public constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dataService: DataService,
    private destroyRef: DestroyRef,
    private deviceService: DeviceDetectorService,
    private impersonationStorageService: ImpersonationStorageService,
    private router: Router,
    private userService: UserService
  ) {
    addIcons({ gridOutline, reorderFourOutline });

    this.destroyRef.onDestroy(() => {
      this.stopHoldingsStream();
    });
  }

  public ngOnInit() {
    this.deviceType = this.deviceService.getDeviceInfo().deviceType;

    this.impersonationStorageService
      .onChangeHasImpersonation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((impersonationId) => {
        this.hasImpersonationId = !!impersonationId;
      });

    this.userService.stateChanged
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state?.user) {
          this.user = state.user;

          this.hasPermissionToAccessHoldingsChart = hasPermission(
            this.user.permissions,
            permissions.accessHoldingsChart
          );

          this.hasPermissionToCreateActivity = hasPermission(
            this.user.permissions,
            permissions.createActivity
          );

          this.initialize();

          this.changeDetectorRef.markForCheck();
        }
      });

    this.viewModeFormControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((holdingsViewMode) => {
        this.dataService
          .putUserSetting({ holdingsViewMode })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => {
            this.userService
              .get(true)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe((user) => {
                this.user = user;

                this.changeDetectorRef.markForCheck();
              });
          });
      });
  }

  public onChangeHoldingType(aHoldingType: HoldingType) {
    this.holdingType = aHoldingType;

    this.initialize();
  }

  public onHoldingClicked({ dataSource, symbol }: AssetProfileIdentifier) {
    if (dataSource && symbol) {
      this.router.navigate([], {
        queryParams: { dataSource, symbol, holdingDetailDialog: true }
      });
    }
  }

  private fetchHoldings() {
    return this.dataService.fetchPortfolioHoldings(
      this.getHoldingsRequestParams()
    );
  }

  private getHoldingsRequestParams() {
    const filters = this.userService.getFilters();

    if (this.holdingType === 'CLOSED') {
      filters.push({ id: 'CLOSED', type: 'HOLDING_TYPE' });
    }

    return {
      filters,
      range: this.user?.settings?.dateRange
    };
  }

  private initialize() {
    this.stopHoldingsStream();

    this.viewModeFormControl.disable({ emitEvent: false });

    if (
      this.hasPermissionToAccessHoldingsChart &&
      this.holdingType === 'ACTIVE'
    ) {
      this.viewModeFormControl.enable({ emitEvent: false });

      this.viewModeFormControl.setValue(
        this.deviceType === 'mobile'
          ? GfHomeHoldingsComponent.DEFAULT_HOLDINGS_VIEW_MODE
          : this.user?.settings?.holdingsViewMode ||
              GfHomeHoldingsComponent.DEFAULT_HOLDINGS_VIEW_MODE,
        { emitEvent: false }
      );
    } else if (this.holdingType === 'CLOSED') {
      this.viewModeFormControl.setValue(
        GfHomeHoldingsComponent.DEFAULT_HOLDINGS_VIEW_MODE,
        { emitEvent: false }
      );
    }

    this.holdings = undefined;

    this.fetchHoldings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ holdings }) => {
        this.holdings = holdings;

        this.startHoldingsStream();

        this.changeDetectorRef.markForCheck();
      });
  }

  private startHoldingsStream() {
    this.stopHoldingsStream();

    this.holdingsStreamSubscription = this.dataService
      .streamPortfolioHoldings(this.getHoldingsRequestParams())
      .subscribe({
        error: () => {
          this.holdingsStreamReconnectTimeout = setTimeout(() => {
            this.startHoldingsStream();
          }, GfHomeHoldingsComponent.HOLDINGS_STREAM_RECONNECT_DELAY_IN_MILLISECONDS);
        },
        next: ({ holdings }) => {
          this.holdings = holdings;

          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private stopHoldingsStream() {
    this.holdingsStreamSubscription?.unsubscribe();
    this.holdingsStreamSubscription = undefined;

    if (this.holdingsStreamReconnectTimeout) {
      clearTimeout(this.holdingsStreamReconnectTimeout);
      this.holdingsStreamReconnectTimeout = undefined;
    }
  }
}
