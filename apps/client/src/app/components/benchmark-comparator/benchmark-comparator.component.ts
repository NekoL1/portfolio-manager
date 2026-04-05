import {
  getVerticalHoverLinePlugin,
  transformTickToAbbreviation
} from '@ghostfolio/common/chart-helper';
import { primaryColorRgb, secondaryColorRgb } from '@ghostfolio/common/config';
import {
  getBackgroundColor,
  getLocale,
  getTextColor,
  parseDate
} from '@ghostfolio/common/helper';
import {
  PortfolioPerformance,
  ToggleOption,
  User,
  LineChartItem
} from '@ghostfolio/common/interfaces';
import { hasPermission, permissions } from '@ghostfolio/common/permissions';
import { internalRoutes } from '@ghostfolio/common/routes/routes';
import { ColorScheme, DateRange } from '@ghostfolio/common/types';
import { registerChartConfiguration } from '@ghostfolio/ui/chart';
import { GfPremiumIndicatorComponent } from '@ghostfolio/ui/premium-indicator';

import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { SymbolProfile } from '@prisma/client';
import {
  Chart,
  ChartData,
  Filler,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  TimeUnit,
  TimeScale,
  Tooltip,
  type TooltipOptions
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import { addIcons } from 'ionicons';
import { arrowForwardOutline } from 'ionicons/icons';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    GfPremiumIndicatorComponent,
    IonIcon,
    MatSelectModule,
    NgxSkeletonLoaderModule,
    ReactiveFormsModule,
    RouterModule
  ],
  selector: 'gf-benchmark-comparator',
  styleUrls: ['./benchmark-comparator.component.scss'],
  templateUrl: './benchmark-comparator.component.html'
})
export class GfBenchmarkComparatorComponent implements OnChanges, OnDestroy {
  @Input() benchmark: Partial<SymbolProfile>;
  @Input() benchmarkDataItems: LineChartItem[] = [];
  @Input() benchmarks: Partial<SymbolProfile>[];
  @Input() colorScheme: ColorScheme;
  @Input() isLoading: boolean;
  @Input() locale = getLocale();
  @Input() performance: PortfolioPerformance;
  @Input() performanceDataItems: LineChartItem[];
  @Input() performanceDateRangeOptions: ToggleOption[] = [];
  @Input() performanceLastUpdatedAt: string;
  @Input() selectedRange: DateRange;
  @Input() user: User;

  @Output() benchmarkChanged = new EventEmitter<string>();
  @Output() selectedRangeChanged = new EventEmitter<DateRange>();

  @ViewChild('chartCanvas') chartCanvas: ElementRef<HTMLCanvasElement>;

  public chart: Chart<'line'>;
  public hasPermissionToAccessAdminControl: boolean;
  public routerLinkAdminControlMarketData =
    internalRoutes.adminControl.subRoutes.marketData.routerLink;

  public constructor() {
    Chart.register(
      annotationPlugin,
      Filler,
      LinearScale,
      LineController,
      LineElement,
      PointElement,
      TimeScale,
      Tooltip
    );

    registerChartConfiguration();

    addIcons({ arrowForwardOutline });
  }

  public ngOnChanges() {
    this.hasPermissionToAccessAdminControl = hasPermission(
      this.user?.permissions,
      permissions.accessAdminControl
    );

    if (this.performanceDataItems?.length) {
      this.initialize();
    }
  }

  public onChangeBenchmark(symbolProfileId: string) {
    this.benchmarkChanged.next(symbolProfileId);
  }

  public onChangeRange(range: DateRange) {
    this.selectedRangeChanged.next(range);
  }

  public ngOnDestroy() {
    this.chart?.destroy();
  }

  public get absoluteChange() {
    return this.performance?.netPerformanceWithCurrencyEffect ?? 0;
  }

  public get changeBadgeClass() {
    if (this.absoluteChange > 0) {
      return 'change-positive';
    } else if (this.absoluteChange < 0) {
      return 'change-negative';
    }

    return 'change-neutral';
  }

  public get changeDirectionSymbol() {
    if (this.absoluteChange > 0) {
      return '↑';
    } else if (this.absoluteChange < 0) {
      return '↓';
    }

    return '•';
  }

  public get currency() {
    return this.user?.settings?.baseCurrency;
  }

  public get formattedAbsoluteChange() {
    return Math.abs(this.absoluteChange).toLocaleString(this.locale, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }

  public get formattedCurrentValue() {
    const currency = this.currency ?? '';

    if (!currency) {
      return '';
    }

    return new Intl.NumberFormat(this.locale, {
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency'
    }).format(this.performance?.currentValueInBaseCurrency ?? 0);
  }

  public get formattedLastUpdatedAt() {
    if (!this.performanceLastUpdatedAt) {
      return '';
    }

    return new Intl.DateTimeFormat(this.locale, {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(parseDate(this.performanceLastUpdatedAt));
  }

  public get formattedPercentageChange() {
    return Math.abs(
      (this.performance?.netPerformancePercentageWithCurrencyEffect ?? 0) * 100
    ).toLocaleString(this.locale, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  }

  public get rangeLabel() {
    return this.performanceDateRangeOptions.find(({ value }) => {
      return value === this.selectedRange;
    })?.label;
  }

  private initialize() {
    const benchmarkDataValues: Record<string, number> = {};
    const currency = this.currency;

    for (const { date, value } of this.benchmarkDataItems) {
      benchmarkDataValues[date] = value;
    }

    const data: ChartData<'line'> = {
      datasets: [
        {
          backgroundColor: `rgba(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b}, 0.16)`,
          borderColor: `rgb(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b})`,
          borderWidth: 2,
          fill: true,
          data: this.performanceDataItems.map(({ date, value }) => {
            return { x: parseDate(date).getTime(), y: value };
          }),
          label: $localize`Portfolio`,
          pointBackgroundColor: `rgb(${primaryColorRgb.r}, ${primaryColorRgb.g}, ${primaryColorRgb.b})`,
          pointHoverRadius: 5,
          pointRadius: (context) => {
            return context.dataIndex === this.performanceDataItems.length - 1
              ? 5
              : 0;
          }
        },
        {
          backgroundColor: `rgb(${secondaryColorRgb.r}, ${secondaryColorRgb.g}, ${secondaryColorRgb.b})`,
          borderColor: `rgb(${secondaryColorRgb.r}, ${secondaryColorRgb.g}, ${secondaryColorRgb.b})`,
          borderWidth: 2,
          data: this.performanceDataItems.map(({ date, value }) => {
            const benchmarkValue = benchmarkDataValues[date];

            return {
              x: parseDate(date).getTime(),
              y:
                benchmarkValue === undefined || benchmarkValue === null
                  ? null
                  : value * (1 + benchmarkValue)
            };
          }),
          hidden: !this.benchmark?.name,
          label: this.benchmark?.name ?? $localize`Benchmark`,
          pointHoverRadius: 3,
          pointRadius: 0,
          spanGaps: true,
          yAxisID: 'yBenchmark'
        }
      ]
    };

    if (this.chartCanvas) {
      if (this.chart) {
        this.chart.data = data;
        this.chart.options.plugins ??= {};
        this.chart.options.plugins.tooltip =
          this.getTooltipPluginConfiguration(currency);
        const xScale = this.chart.options.scales?.['x'] as {
          time?: { unit?: TimeUnit };
        };

        if (xScale?.time) {
          xScale.time.unit = this.getTimeUnit();
        }

        this.chart.update();
      } else {
        this.chart = new Chart(this.chartCanvas.nativeElement, {
          data,
          options: {
            animation: false,
            elements: {
              line: {
                tension: 0
              },
              point: {
                hoverBackgroundColor: getBackgroundColor(this.colorScheme),
                hoverRadius: 4,
                radius: 0
              }
            },
            interaction: { intersect: false, mode: 'index' },
            maintainAspectRatio: true,
            plugins: {
              annotation: {
                annotations: {
                  yAxis: {
                    borderColor: `rgba(${getTextColor(this.colorScheme)}, 0.1)`,
                    borderWidth: 1,
                    scaleID: 'y',
                    type: 'line',
                    value: 0
                  }
                }
              },
              legend: {
                display: false
              },
              tooltip: this.getTooltipPluginConfiguration(currency),
              verticalHoverLine: {
                color: `rgba(${getTextColor(this.colorScheme)}, 0.1)`
              }
            },
            responsive: true,
            scales: {
              x: {
                border: {
                  color: `rgba(${getTextColor(this.colorScheme)}, 0.1)`,
                  width: 1
                },
                display: true,
                grid: {
                  display: false
                },
                type: 'time',
                time: {
                  unit: this.getTimeUnit()
                }
              },
              y: {
                border: {
                  width: 0
                },
                display: true,
                grid: {
                  color: ({ scale, tick }) => {
                    return `rgba(${getTextColor(this.colorScheme)}, ${
                      tick.value === scale.max || tick.value === scale.min
                        ? 0.08
                        : 0.04
                    })`;
                  }
                },
                position: 'left',
                ticks: {
                  callback: (value: number) => {
                    return currency
                      ? `${transformTickToAbbreviation(value)}`
                      : transformTickToAbbreviation(value);
                  },
                  display: true,
                  z: 1
                }
              },
              yBenchmark: {
                border: {
                  width: 0
                },
                display: false,
                position: 'right',
                ticks: {
                  display: false
                }
              }
            }
          },
          plugins: [
            getVerticalHoverLinePlugin(this.chartCanvas, this.colorScheme)
          ],
          type: 'line'
        });
      }
    }
  }

  private getTimeUnit(): TimeUnit {
    switch (this.selectedRange) {
      case '1d':
        return 'hour';
      case '5d':
      case '1m':
        return 'day';
      case '6m':
      case 'ytd':
      case '1y':
        return 'month';
      default:
        return 'year';
    }
  }

  private getTooltipPluginConfiguration(
    currency: string
  ): Partial<TooltipOptions<'line'>> {
    return {
      backgroundColor: getBackgroundColor(this.colorScheme),
      bodyColor: `rgb(${getTextColor(this.colorScheme)})`,
      borderColor: `rgba(${getTextColor(this.colorScheme)}, 0.1)`,
      borderWidth: 1,
      callbacks: {
        label: (context) => {
          let label = context.dataset.label ? `${context.dataset.label}: ` : '';
          const yPoint = context.parsed.y;

          if (yPoint === null) {
            return label;
          }

          if (context.dataset.yAxisID === 'yBenchmark') {
            const index = context.dataIndex;
            const value = (this.benchmarkDataItems[index]?.value ?? 0) * 100;

            return `${label}${value.toLocaleString(this.locale, {
              maximumFractionDigits: 2,
              minimumFractionDigits: 2
            })} %`;
          }

          return `${label}${yPoint.toLocaleString(this.locale, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
          })} ${currency}`;
        },
        title: (contexts) => {
          return new Intl.DateTimeFormat(this.locale, {
            dateStyle: this.selectedRange === '1d' ? 'medium' : 'medium',
            timeStyle: this.selectedRange === '1d' ? 'short' : undefined
          }).format((contexts[0].parsed.x as number) ?? 0);
        }
      } as never,
      caretSize: 0,
      cornerRadius: 2,
      footerColor: `rgb(${getTextColor(this.colorScheme)})`,
      mode: 'index',
      position: 'top',
      titleColor: `rgb(${getTextColor(this.colorScheme)})`,
      usePointStyle: true,
      xAlign: 'center',
      yAlign: 'bottom'
    };
  }
}
