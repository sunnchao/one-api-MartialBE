'use client';

import React from 'react';
import { Card, Skeleton, Typography } from 'antd';
import { ApexOptions } from 'apexcharts';

import Chart from 'react-apexcharts';

const { Title } = Typography;

interface ApexChartsProps {
  isLoading: boolean;
  chartDatas: {
    options?: ApexOptions;
    series?: any[];
    type?: 'line' | 'area' | 'bar' | 'pie' | 'donut' | 'radialBar' | 'scatter' | 'bubble' | 'heatmap' | 'candlestick' | 'boxPlot' | 'radar' | 'polarArea' | 'rangeBar' | 'rangeArea' | 'treemap';
    height?: string | number;
  };
  title?: string;
  id?: string;
  decimal?: number;
  unit?: string;
}

function clonePlain<T>(input: T, seen = new WeakMap<object, any>()): T {
  if (input === null || input === undefined) return input;
  const inputType = typeof input;
  if (inputType !== 'object' && inputType !== 'function') return input;
  if (input instanceof Date) return new Date(input.getTime()) as T;
  if (Array.isArray(input)) {
    const out: any[] = [];
    for (const item of input) out.push(clonePlain(item, seen));
    return out as T;
  }
  if (inputType === 'function') return input;

  const obj = input as unknown as object;
  const existing = seen.get(obj);
  if (existing) return existing as T;

  const out: Record<string, any> = {};
  seen.set(obj, out);
  for (const key of Object.keys(obj as any)) {
    out[key] = clonePlain((obj as any)[key], seen);
  }
  return out as T;
}

export default function ApexCharts({ isLoading, chartDatas, title }: ApexChartsProps) {
  const safeOptions = chartDatas?.options ? clonePlain(chartDatas.options) : undefined;
  const safeSeries = chartDatas?.series ? clonePlain(chartDatas.series) : undefined;

  return (
    <Card 
        variant="borderless"
        style={{ 
            borderRadius: 8,
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'
        }}
    >
      <Skeleton loading={isLoading} active paragraph={{ rows: 10 }}>
        {title && <Title level={4}>{title}</Title>}
        <div style={{ minHeight: 480 }}>
            {safeOptions && safeSeries && (
                <Chart
                    options={safeOptions}
                    series={safeSeries}
                    type={chartDatas.type || 'line'}
                    height={chartDatas.height || 480}
                    width="100%"
                />
            )}
        </div>
      </Skeleton>
    </Card>
  );
}
