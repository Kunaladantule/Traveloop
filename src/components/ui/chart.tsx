// components/ui/chart.tsx
"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// ─────────────────────────────────────────────────────────────
// 🎨 Chart Theme Configuration (Light Theme)
// ─────────────────────────────────────────────────────────────
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    icon?: React.ComponentType<any>
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

// ─────────────────────────────────────────────────────────────
// 📊 Chart Container (Light Theme Base)
// ─────────────────────────────────────────────────────────────
function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          // Light theme base
          "bg-white rounded-2xl border border-slate-200 shadow-sm shadow-slate-200/50 p-4",
          
          // Chart-specific overrides for Recharts elements
          "[&_.recharts-cartesian-axis-tick_text]:fill-slate-600 [&_.recharts-cartesian-axis-tick_text]:text-sm [&_.recharts-cartesian-axis-tick_text]:font-medium",
          "[&_.recharts-cartesian-grid_line]:stroke-slate-200",
          "[&_.recharts-tooltip-cursor]:fill-indigo-50",
          "[&_.recharts-legend-item-text]:text-slate-700 [&_.recharts-legend-item-text]:text-sm",
          
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

// ─────────────────────────────────────────────────────────────
// 🎨 Chart Style Injector (CSS Variables for Colors)
// ─────────────────────────────────────────────────────────────
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, c]) => c.theme ?? c.color)
  if (!colorConfig.length) return null

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart="${id}"] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}`
          )
          .join("\n"),
      }}
    />
  )
}

// ─────────────────────────────────────────────────────────────
// 💬 Chart Tooltip (Light Theme + Larger Text)
// ─────────────────────────────────────────────────────────────
const ChartTooltip = RechartsPrimitive.Tooltip

interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean
  payload?: any[]
  indicator?: "line" | "dot" | "dashed" | "none"
  hideLabel?: boolean
  label?: any
  labelFormatter?: (label: any, payload: any[]) => React.ReactNode
  formatter?: any
  color?: string
  nameKey?: string
  labelKey?: string
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  label,
  labelFormatter,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) return null
    const [item] = payload
    const key = `${labelKey ?? item?.dataKey ?? item?.name ?? "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value = !labelKey && typeof label === "string" ? (config[label]?.label ?? label) : itemConfig?.label

    if (labelFormatter) return <div className="font-semibold text-slate-900">{labelFormatter(value, payload)}</div>
    if (!value) return null
    return <div className="font-semibold text-slate-900">{value}</div>
  }, [label, labelFormatter, payload, hideLabel, config, labelKey])

  if (!active || !payload?.length) return null

  return (
    <div
      className={cn(
        // Light theme tooltip
        "min-w-40 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-200/50",
        className
      )}
    >
      <div className="grid gap-2">
        {!hideLabel && tooltipLabel}
        
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color ?? item.payload?.fill ?? item.color

            return (
              <div key={index} className="flex items-center gap-3">
                {/* Indicator */}
                {!itemConfig?.icon && indicator !== "none" && (
                  <div
                    className={cn(
                      "shrink-0 rounded-full",
                      indicator === "dot" && "h-3 w-3",
                      indicator === "line" && "h-4 w-0.5",
                      indicator === "dashed" && "h-4 w-0.5 border-[1.5px] border-dashed"
                    )}
                    style={{ backgroundColor: indicator === "dot" ? indicatorColor : undefined, borderColor: indicatorColor }}
                  />
                )}
                {itemConfig?.icon && <itemConfig.icon className="h-4 w-4 text-slate-500" />}
                
                {/* Label + Value */}
                <div className="flex flex-1 items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">{itemConfig?.label ?? item.name}</span>
                  {item.value != null && (
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {typeof item.value === "number" ? item.value.toLocaleString() : String(item.value)}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 📋 Chart Legend (Light Theme + Readable)
// ─────────────────────────────────────────────────────────────
const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> & { nameKey?: string } & RechartsPrimitive.DefaultLegendContentProps) {
  const { config } = useChart()

  if (!payload?.length) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-4 py-3",
        verticalAlign === "top" ? "pb-2" : "pt-2",
        className
      )}
    >
      {payload
        .filter((item) => item.type !== "none")
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <div key={index} className="flex items-center gap-2">
              {/* Color indicator */}
              {itemConfig?.icon ? (
                <itemConfig.icon className="h-4 w-4 text-slate-500" />
              ) : (
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              )}
              {/* Label */}
              <span className="text-sm font-medium text-slate-700">{itemConfig?.label ?? item.value}</span>
            </div>
          )
        })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 🔍 Helper: Get config from payload
// ─────────────────────────────────────────────────────────────
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== "object" || payload === null) return undefined

  const payloadPayload = "payload" in payload && typeof payload.payload === "object" ? payload.payload : undefined
  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === "string") {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (payloadPayload && key in payloadPayload && typeof payloadPayload[key as keyof typeof payloadPayload] === "string") {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}