"use client"

import { useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TYPE_OPTIONS = [
  { value: "all", label: "Todos los eventos" },
  { value: "workshop", label: "Workshop" },
  { value: "charla", label: "Charla" },
  { value: "hackathon", label: "Hackathon" },
  { value: "copa", label: "Copa" },
  { value: "networking", label: "Networking" },
  { value: "otro", label: "Otro" },
] as const

const MONTH_OPTIONS = [
  { value: "all", label: "Todos los meses" },
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
] as const

export function EventFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get("type") || "all"
  const currentMonth = searchParams.get("month") || "all"

  const updateParams = (key: "type" | "month", value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`?${params.toString()}`)
  }

  const selectClasses =
    "h-10 rounded-xl border border-white/10 bg-black/40 text-white focus:border-white/30 focus:bg-white/5 focus:ring-2 focus:ring-white/5 min-w-[180px]"

  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-2">
        <label htmlFor="filter-type" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 px-1">
          Filtro por Tipo
        </label>
        <Select value={currentType} onValueChange={(v) => updateParams("type", v)}>
          <SelectTrigger className={selectClasses} id="filter-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#0D0D0D] text-white">
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="filter-month" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 px-1">
          Filtro por Mes
        </label>
        <Select value={currentMonth} onValueChange={(v) => updateParams("month", v)}>
          <SelectTrigger className={selectClasses} id="filter-month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[#0D0D0D] text-white">
            {MONTH_OPTIONS.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="focus:bg-white/10 focus:text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
