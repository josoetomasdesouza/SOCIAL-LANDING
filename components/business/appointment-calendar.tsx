"use client"

import { useState, useMemo } from "react"
import type { RefObject } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Clock, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DayAvailability, Professional, TimeSlot } from "@/lib/business-types"

interface AppointmentCalendarProps {
  professionals?: Professional[]
  availability?: DayAvailability[] | Record<string, string[]>
  selectedProfessionalId?: string
  selectedDate?: string | null
  selectedTime?: string | null
  timeSlotsRef?: RefObject<HTMLDivElement>
  onSelectProfessional?: (id: string) => void
  onSelectDate: (date: string) => void
  onSelectTime: (time: string) => void
  onConfirm?: () => void
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"]
const MONTHS = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
]

function normalizeAvailability(availability?: DayAvailability[] | Record<string, string[]>): DayAvailability[] {
  if (!availability) return []
  if (Array.isArray(availability)) return availability

  return Object.entries(availability).map(([date, times]) => ({
    date,
    slots: times.map((time) => ({ time, available: true })),
  }))
}

export function AppointmentCalendar({
  professionals = [],
  availability,
  selectedProfessionalId,
  selectedDate,
  selectedTime,
  timeSlotsRef,
  onSelectProfessional,
  onSelectDate,
  onSelectTime,
  onConfirm
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const selectedProfessional = professionals.find(p => p.id === selectedProfessionalId)
  const calendarAvailability = normalizeAvailability(selectedProfessional?.availability || availability)

  // Gera dias do mes
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPadding = firstDay.getDay()
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isPast: boolean }> = []
    
    // Dias do mes anterior
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({ date, isCurrentMonth: false, isToday: false, isPast: true })
    }
    
    // Dias do mes atual
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isPast: date < today
      })
    }
    
    // Dias do proximo mes para completar a grade
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false, isToday: false, isPast: false })
    }
    
    return days
  }, [currentMonth])

  // Horarios disponiveis para o dia selecionado
  const availableSlots = useMemo(() => {
    if (!selectedDate) return []
    
    const dayAvailability = calendarAvailability.find(
      a => a.date === selectedDate
    )
    
    return dayAvailability?.slots?.filter(s => s.available) || []
  }, [calendarAvailability, selectedDate])

  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="space-y-6">
      {/* Selecao de profissional */}
      {professionals.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-3">Escolha o profissional</h4>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {professionals.map((professional) => (
            <button
                key={professional.id}
                onClick={() => onSelectProfessional?.(professional.id)}
              disabled={!onSelectProfessional}
                className={`flex-shrink-0 text-center transition-all ${
                  selectedProfessionalId === professional.id ? "scale-105" : ""
                }`}
              >
                <div className={`relative w-16 h-16 rounded-full overflow-hidden ring-2 transition-colors ${
                  selectedProfessionalId === professional.id
                    ? "ring-accent"
                    : "ring-transparent hover:ring-border"
                }`}>
                  <Image
                    src={professional.avatar}
                    alt={professional.name}
                    fill
                    className="object-cover"
                  />
                  {selectedProfessionalId === professional.id && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <Check className="h-6 w-6 text-accent" />
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium text-foreground mt-2 max-w-16 truncate">
                  {professional.name.split(" ")[0]}
                </p>
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-[10px] text-muted-foreground">{professional.rating}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendario */}
      {(professionals.length === 0 || selectedProfessionalId) && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-foreground">Escolha a data</h4>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[140px] text-center">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <Button variant="ghost" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Dias */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateStr = formatDate(day.date)
              const isSelected = selectedDate === dateStr
              const isDisabled = !day.isCurrentMonth || day.isPast
              
              return (
                <button
                  key={index}
                  onClick={() => !isDisabled && onSelectDate(dateStr)}
                  disabled={isDisabled}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-full transition-colors
                    ${isSelected ? "bg-accent text-accent-foreground" : ""}
                    ${day.isToday && !isSelected ? "ring-1 ring-accent" : ""}
                    ${isDisabled ? "text-muted-foreground/30 cursor-not-allowed" : "hover:bg-secondary"}
                    ${!day.isCurrentMonth ? "text-muted-foreground/30" : "text-foreground"}
                  `}
                >
                  {day.date.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Horarios */}
      {selectedDate && (
        <div ref={timeSlotsRef} className="scroll-mt-4">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Horarios disponiveis
          </h4>
          
          {availableSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum horario disponivel para este dia
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => onSelectTime(slot.time)}
                  className={`
                    py-2 px-3 text-sm rounded-lg border transition-colors
                    ${selectedTime === slot.time
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border hover:border-accent hover:bg-accent/5"
                    }
                  `}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Botao de confirmar */}
      {onConfirm && (professionals.length === 0 || selectedProfessionalId) && selectedDate && selectedTime && (
        <Button onClick={onConfirm} className="w-full h-12 text-base font-medium">
          Confirmar agendamento
        </Button>
      )}
    </div>
  )
}
