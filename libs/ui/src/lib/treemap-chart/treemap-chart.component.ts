import { getTooltipOptions } from '@ghostfolio/common/chart-helper';
import { getLocale } from '@ghostfolio/common/helper';
import {
  AssetProfileIdentifier,
  PortfolioPosition
} from '@ghostfolio/common/interfaces';
import { ColorScheme, DateRange } from '@ghostfolio/common/types';

import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';
import { DataSource } from '@prisma/client';
import type { ChartData, TooltipModel, TooltipOptions } from 'chart.js';
import { LinearScale } from 'chart.js';
import { Chart, Tooltip } from 'chart.js';
import { TreemapController, TreemapElement } from 'chartjs-chart-treemap';
import { isUUID } from 'class-validator';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

import type {
  GfTreemapScriptableContext,
  GfTreemapDataPoint,
  GfTreemapTooltipItem
} from './interfaces/interfaces';

const FONT_FAMILY = `'InterVariable', 'Inter', sans-serif`;
const NEGATIVE_COLORS = ['#df726c', '#e7a59f', '#efcbc6'];
const POSITIVE_COLORS = ['#cbe4cf', '#89c791', '#74bc80'];
const NEUTRAL_COLOR = '#d5dae1';
const TILE_TEXT_COLOR = '#12151d';
const TREEMAP_TOOLTIP_CLASS_NAME = 'treemap-chart__tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NgxSkeletonLoaderModule],
  selector: 'gf-treemap-chart',
  styleUrls: ['./treemap-chart.component.scss'],
  templateUrl: './treemap-chart.component.html'
})
export class GfTreemapChartComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() baseCurrency: string;
  @Input() colorScheme: ColorScheme;
  @Input() cursor: string;
  @Input() dateRange: DateRange;
  @Input() holdings: PortfolioPosition[];
  @Input() locale = getLocale();

  @Output() treemapChartClicked = new EventEmitter<AssetProfileIdentifier>();

  @ViewChild('chartCanvas') chartCanvas: ElementRef<HTMLCanvasElement>;

  public chart: Chart<'treemap'>;
  public isLoading = true;
  private document = inject(DOCUMENT);

  public constructor() {
    Chart.register(LinearScale, Tooltip, TreemapController, TreemapElement);
  }
  public ngAfterViewInit() {
    if (this.holdings) {
      this.initialize();
    }
  }

  public ngOnChanges() {
    if (this.holdings) {
      this.initialize();
    }
  }

  public ngOnDestroy() {
    this.chart?.destroy();
    this.getTooltipElement()?.remove();
  }

  private getPerformancePercent(position: PortfolioPosition) {
    return (
      Math.round(
        (position.netPerformancePercentWithCurrencyEffect ?? 0) * 10000
      ) / 100
    );
  }

  private getPrimaryLabel(position: PortfolioPosition) {
    const { name, symbol } = position;

    if (symbol?.toLowerCase() === 'bitcoin') {
      return 'BTC';
    }

    if (isUUID(symbol)) {
      return name ?? symbol;
    }

    return symbol.replace(/\.[A-Z]{2,4}$/i, '');
  }

  private getColor({ performancePercent }: { performancePercent: number }) {
    if (Math.abs(performancePercent) < Number.EPSILON) {
      return {
        backgroundColor: NEUTRAL_COLOR,
        fontColor: TILE_TEXT_COLOR
      };
    }

    if (performancePercent > 0) {
      const colorIndex =
        performancePercent >= 3 ? 2 : performancePercent >= 2 ? 1 : 0;

      return {
        backgroundColor: POSITIVE_COLORS[colorIndex],
        fontColor: TILE_TEXT_COLOR
      };
    }

    const colorIndex =
      performancePercent <= -3 ? 0 : performancePercent <= -2 ? 1 : 2;

    return {
      backgroundColor: NEGATIVE_COLORS[colorIndex],
      fontColor: TILE_TEXT_COLOR
    };
  }

  private getPositionFromTreemapItem(
    dataset: { data?: unknown[] },
    dataIndex: number
  ) {
    return (dataset.data?.[dataIndex] as GfTreemapDataPoint | undefined)?._data;
  }

  private getEffectiveColorScheme(): ColorScheme {
    return this.isDarkTheme() ? 'DARK' : 'LIGHT';
  }

  private isDarkTheme() {
    return (
      this.colorScheme === 'DARK' ||
      this.document?.body?.classList.contains('theme-dark')
    );
  }

  private getTileBorderColor() {
    return this.isDarkTheme() ? '#0f141b' : '#ffffff';
  }

  private escapeHtml(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat(this.locale, {
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: 'currency'
    }).format(value);
  }

  private formatQuantity(quantity: number) {
    const maximumFractionDigits = Number.isInteger(quantity)
      ? 0
      : quantity < 10
        ? 4
        : 2;

    return quantity.toLocaleString(this.locale, {
      maximumFractionDigits,
      minimumFractionDigits: 0
    });
  }

  private getShareLabel(quantity: number) {
    return quantity === 1 ? 'share' : 'shares';
  }

  private getTooltipElement() {
    return this.chartCanvas?.nativeElement.parentElement?.querySelector(
      `.${TREEMAP_TOOLTIP_CLASS_NAME}`
    ) as HTMLDivElement | null;
  }

  private getTooltipMarkup(position: PortfolioPosition) {
    const allocationInPercentage = `${(position.allocationInPercentage * 100).toFixed(2)}%`;
    const name = this.escapeHtml(position.name ?? position.symbol ?? '');
    const performancePercent = this.getPerformancePercent(position);
    const performanceDirection =
      performancePercent > 0
        ? 'positive'
        : performancePercent < 0
          ? 'negative'
          : 'neutral';
    const performanceArrow =
      performancePercent > 0 ? '↑' : performancePercent < 0 ? '↓' : '•';
    const performanceValue = `${performanceArrow}${Math.abs(performancePercent).toFixed(2)}%`;
    const quantityLabel = `${this.formatQuantity(position.quantity)} ${this.getShareLabel(position.quantity)}`;
    const priceCurrency =
      position.assetProfile?.currency || position.currency || this.baseCurrency;
    const valueInPortfolio =
      position.valueInBaseCurrency !== null &&
      position.valueInBaseCurrency !== undefined
        ? this.formatCurrency(position.valueInBaseCurrency, this.baseCurrency)
        : '—';
    const todayPrice =
      position.marketPrice !== null && position.marketPrice !== undefined
        ? this.formatCurrency(position.marketPrice, priceCurrency)
        : '—';

    return `
      <div class="${TREEMAP_TOOLTIP_CLASS_NAME}__header">
        <div class="${TREEMAP_TOOLTIP_CLASS_NAME}__title">${name}</div>
        <div class="${TREEMAP_TOOLTIP_CLASS_NAME}__pill ${TREEMAP_TOOLTIP_CLASS_NAME}__pill--${performanceDirection}">
          ${this.escapeHtml(performanceValue)}
        </div>
      </div>
      <div class="${TREEMAP_TOOLTIP_CLASS_NAME}__divider"></div>
      <div class="${TREEMAP_TOOLTIP_CLASS_NAME}__row">
        <span>In your portfolio</span>
        <strong>${this.escapeHtml(allocationInPercentage)}</strong>
      </div>
      <div class="${TREEMAP_TOOLTIP_CLASS_NAME}__row">
        <span>Value (${this.escapeHtml(quantityLabel)})</span>
        <strong>${this.escapeHtml(valueInPortfolio)}</strong>
      </div>
      <div class="${TREEMAP_TOOLTIP_CLASS_NAME}__row">
        <span>Today's price</span>
        <strong>${this.escapeHtml(todayPrice)}</strong>
      </div>
    `;
  }

  private renderExternalTooltip({
    chart,
    tooltip
  }: {
    chart: Chart<'treemap'>;
    tooltip: TooltipModel<'treemap'>;
  }) {
    const parentElement = chart.canvas.parentElement;

    if (!parentElement) {
      return;
    }

    let tooltipElement = this.getTooltipElement();

    if (!tooltipElement) {
      tooltipElement = this.document.createElement('div');
      tooltipElement.className = TREEMAP_TOOLTIP_CLASS_NAME;
      parentElement.appendChild(tooltipElement);
    }

    if (!tooltip || tooltip.opacity === 0 || !tooltip.dataPoints?.length) {
      tooltipElement.style.opacity = '0';
      return;
    }

    const { dataIndex, dataset, raw } = tooltip
      .dataPoints[0] as GfTreemapTooltipItem;
    const position =
      this.getPositionFromTreemapItem(dataset, dataIndex) ?? raw?._data;

    if (!position) {
      tooltipElement.style.opacity = '0';
      return;
    }

    tooltipElement.innerHTML = this.getTooltipMarkup(position);
    tooltipElement.style.opacity = '1';

    requestAnimationFrame(() => {
      const horizontalPadding = 16;
      const verticalPadding = 12;
      const tooltipWidth = tooltipElement.offsetWidth;
      const tooltipHeight = tooltipElement.offsetHeight;
      const centeredLeft = Math.min(
        Math.max(tooltip.caretX, tooltipWidth / 2 + horizontalPadding),
        parentElement.clientWidth - tooltipWidth / 2 - horizontalPadding
      );
      const shouldPlaceBelow =
        tooltip.caretY - tooltipHeight - 16 < verticalPadding;
      const anchoredTop = shouldPlaceBelow
        ? Math.min(
            tooltip.caretY + 16,
            parentElement.clientHeight - tooltipHeight - verticalPadding
          )
        : Math.max(tooltip.caretY - 16, tooltipHeight + verticalPadding);

      tooltipElement.dataset.placement = shouldPlaceBelow ? 'below' : 'above';
      tooltipElement.style.left = `${centeredLeft}px`;
      tooltipElement.style.top = `${anchoredTop}px`;
    });
  }

  private shouldDisplayPrimaryLabel(dataPoint: GfTreemapDataPoint) {
    const minSide = Math.min(dataPoint.w ?? 0, dataPoint.h ?? 0);

    return (
      minSide >= 42 && (dataPoint.w ?? 0) >= 58 && (dataPoint.h ?? 0) >= 36
    );
  }

  private shouldDisplaySecondaryLabel(dataPoint: GfTreemapDataPoint) {
    const minSide = Math.min(dataPoint.w ?? 0, dataPoint.h ?? 0);

    return (
      minSide >= 74 && (dataPoint.w ?? 0) >= 96 && (dataPoint.h ?? 0) >= 54
    );
  }

  private initialize() {
    this.isLoading = true;

    const data: ChartData<'treemap'> = {
      datasets: [
        {
          backgroundColor: (context: GfTreemapScriptableContext) => {
            const performancePercent = this.getPerformancePercent(
              context.raw._data
            );

            const { backgroundColor } = this.getColor({ performancePercent });

            return backgroundColor;
          },
          borderColor: this.getTileBorderColor(),
          borderRadius: 11,
          borderWidth: 1.35,
          key: 'allocationInPercentage',
          labels: {
            align: 'center',
            color: (context: GfTreemapScriptableContext) => {
              const performancePercent = this.getPerformancePercent(
                context.raw._data
              );

              const { fontColor } = this.getColor({ performancePercent });

              return fontColor;
            },
            display: true,
            font: [
              {
                family: FONT_FAMILY,
                lineHeight: 1.02,
                size: 25,
                weight: 400
              },
              {
                family: FONT_FAMILY,
                lineHeight: 1.18,
                size: 12,
                weight: 400
              }
            ],
            formatter: ({ raw }: GfTreemapScriptableContext) => {
              const allocation = raw._data.allocationInPercentage ?? 0;
              const performancePercent = this.getPerformancePercent(raw._data);
              const formattedPerformance = `${performancePercent > 0 ? '+' : ''}${performancePercent.toFixed(allocation < 0.01 ? 1 : 2)}%`;
              const primaryLabel = this.getPrimaryLabel(raw._data);

              if (allocation < 0.0065 || !this.shouldDisplayPrimaryLabel(raw)) {
                return '';
              }

              if (
                allocation < 0.016 ||
                !this.shouldDisplaySecondaryLabel(raw)
              ) {
                return [primaryLabel];
              }

              return [primaryLabel, formattedPerformance];
            },
            hoverColor: undefined,
            overflow: 'fit',
            padding: 7,
            position: 'middle'
          },
          spacing: 1,
          // @ts-expect-error: should be PortfolioPosition[]
          tree: this.holdings
        }
      ]
    };

    if (this.chartCanvas) {
      if (this.chart) {
        this.chart.data = data;
        this.chart.options.plugins ??= {};
        this.chart.options.plugins.tooltip =
          this.getTooltipPluginConfiguration();

        this.chart.update();
      } else {
        this.chart = new Chart<'treemap'>(this.chartCanvas.nativeElement, {
          data,
          options: {
            animation: false,
            maintainAspectRatio: false,
            onClick: (_, activeElements, chart: Chart<'treemap'>) => {
              try {
                const dataIndex = activeElements[0].index;
                const datasetIndex = activeElements[0].datasetIndex;
                const position = this.getPositionFromTreemapItem(
                  chart.data.datasets[datasetIndex],
                  dataIndex
                );

                if (!position) {
                  return;
                }

                const dataSource: DataSource = position.dataSource;
                const symbol: string = position.symbol;

                this.treemapChartClicked.emit({ dataSource, symbol });
              } catch {}
            },
            onHover: (event, chartElement) => {
              if (this.cursor) {
                (event.native?.target as HTMLElement).style.cursor =
                  chartElement[0] ? this.cursor : 'default';
              }
            },
            plugins: {
              tooltip: this.getTooltipPluginConfiguration()
            },
            responsive: true
          },
          type: 'treemap'
        });
      }
    }

    this.isLoading = false;

    requestAnimationFrame(() => {
      this.chart?.resize();
      this.chart?.update('none');
    });
  }

  private getTooltipPluginConfiguration(): Partial<TooltipOptions<'treemap'>> {
    return {
      ...getTooltipOptions({
        colorScheme: this.getEffectiveColorScheme(),
        currency: this.baseCurrency,
        locale: this.locale
      }),
      enabled: false,
      external: (context) => {
        this.renderExternalTooltip({
          chart: context.chart as Chart<'treemap'>,
          tooltip: context.tooltip as TooltipModel<'treemap'>
        });
      },
      // @ts-expect-error: no need to set all attributes in callbacks
      callbacks: {
        label: ({ dataIndex, dataset, raw }: GfTreemapTooltipItem) => {
          const position =
            this.getPositionFromTreemapItem(dataset, dataIndex) ?? raw?._data;

          if (!position) {
            return [];
          }

          const allocationInPercentage = `${(position.allocationInPercentage * 100).toFixed(2)}%`;
          const name = position.name;
          const symbol = position.symbol;
          const performancePercent = this.getPerformancePercent(position);
          const sign = performancePercent > 0 ? '+' : '';
          const netPerformanceInPercentageWithSign = `${sign}${performancePercent.toFixed(2)}%`;

          if (position.valueInBaseCurrency !== null) {
            const value = position.valueInBaseCurrency;

            return [
              `${name ?? symbol} (${allocationInPercentage})`,
              `${value?.toLocaleString(this.locale, {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              })} ${this.baseCurrency}`,
              '',
              $localize`Change` + ' (' + $localize`Performance` + ')',
              `${sign}${position.netPerformanceWithCurrencyEffect.toLocaleString(
                this.locale,
                {
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2
                }
              )} ${this.baseCurrency} (${netPerformanceInPercentageWithSign})`
            ];
          } else {
            return [
              `${name ?? symbol} (${allocationInPercentage})`,
              '',
              $localize`Performance`,
              netPerformanceInPercentageWithSign
            ];
          }
        },
        title: () => {
          return '';
        }
      },
      xAlign: 'center',
      yAlign: 'center'
    };
  }
}
