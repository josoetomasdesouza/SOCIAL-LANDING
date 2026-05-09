"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, CreditCard, QrCode, Phone, Mail, MapPin, Clock, Calendar, User, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// ========================================
// CONFIRMACAO GENERICA
// ========================================
interface ConfirmationScreenProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  details: Array<{ label: string; value: string }>
  primaryAction?: { label: string; onClick: () => void; href?: string }
  secondaryAction?: { label: string; onClick: () => void; href?: string }
}

export function ConfirmationScreen({
  icon,
  title,
  subtitle,
  details,
  primaryAction,
  secondaryAction
}: ConfirmationScreenProps) {
  return (
    <div className="text-center py-6 space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        {icon}
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      
      <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-3">
        {details.map((detail, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{detail.label}</span>
            <span className="font-medium text-foreground">{detail.value}</span>
          </div>
        ))}
      </div>
      
      <div className="flex gap-3">
        {secondaryAction && (
          <Button variant="outline" className="flex-1" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          primaryAction.href ? (
            <Button className="flex-1 gap-2" asChild>
              <a href={primaryAction.href} target="_blank" rel="noopener noreferrer" onClick={primaryAction.onClick}>
                <Phone className="w-4 h-4" />
                {primaryAction.label}
              </a>
            </Button>
          ) : (
            <Button className="flex-1 gap-2" onClick={primaryAction.onClick}>
              <Phone className="w-4 h-4" />
              {primaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  )
}

// ========================================
// CHECKOUT DE ECOMMERCE
// ========================================
interface EcommerceCheckoutProps {
  items: Array<{ name: string; image: string; price: number; quantity: number }>
  onComplete: () => void
  onBack: () => void
}

export function EcommerceCheckout({ items, onComplete, onBack }: EcommerceCheckoutProps) {
  const [step, setStep] = useState<"address" | "payment" | "confirmation">("address")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cep: "",
    address: "",
    number: "",
    complement: ""
  })
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 15.90
  const discount = paymentMethod === "pix" ? subtotal * 0.05 : 0
  const total = subtotal + shipping - discount
  
  if (step === "confirmation") {
    return (
      <ConfirmationScreen
        icon={<Check className="w-10 h-10 text-green-600" />}
        title="Pedido confirmado!"
        subtitle="Voce recebera um email com os detalhes"
        details={[
          { label: "Numero do pedido", value: `#${Math.random().toString(36).substr(2, 9).toUpperCase()}` },
          { label: "Total", value: `R$ ${total.toFixed(2).replace(".", ",")}` },
          { label: "Forma de pagamento", value: paymentMethod === "pix" ? "PIX" : "Cartao de credito" },
          { label: "Previsao de entrega", value: "3-5 dias uteis" }
        ]}
        primaryAction={{ label: "WhatsApp", onClick: onComplete }}
        secondaryAction={{ label: "Fechar", onClick: onComplete }}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "address" ? "bg-accent text-accent-foreground" : "bg-green-500 text-white"}`}>
          {step === "address" ? "1" : <Check className="w-4 h-4" />}
        </div>
        <div className="w-12 h-0.5 bg-border" />
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "payment" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
          2
        </div>
      </div>
      
      {step === "address" ? (
        <>
          <h3 className="font-semibold">Dados de entrega</h3>
          
          <div className="space-y-3">
            <Input
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <Input
              placeholder="CEP"
              value={formData.cep}
              onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
            />
            <Input
              placeholder="Endereco"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Numero"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              />
              <Input
                placeholder="Complemento"
                value={formData.complement}
                onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
              />
            </div>
          </div>
          
          <Button className="w-full h-12" onClick={() => setStep("payment")}>
            Continuar
          </Button>
        </>
      ) : (
        <>
          <h3 className="font-semibold">Forma de pagamento</h3>
          
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod("card")}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                paymentMethod === "card" ? "border-accent bg-accent/5" : "border-border"
              }`}
            >
              <CreditCard className="w-6 h-6 text-accent" />
              <div className="text-left flex-1">
                <p className="font-medium">Cartao de credito</p>
                <p className="text-sm text-muted-foreground">Ate 12x sem juros</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === "card" ? "border-accent bg-accent" : "border-muted-foreground"}`}>
                {paymentMethod === "card" && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
            
            <button
              onClick={() => setPaymentMethod("pix")}
              className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                paymentMethod === "pix" ? "border-accent bg-accent/5" : "border-border"
              }`}
            >
              <QrCode className="w-6 h-6 text-accent" />
              <div className="text-left flex-1">
                <p className="font-medium">PIX</p>
                <p className="text-sm text-green-600 font-medium">5% de desconto</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === "pix" ? "border-accent bg-accent" : "border-muted-foreground"}`}>
                {paymentMethod === "pix" && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          </div>
          
          {/* Resumo */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete</span>
              <span>R$ {shipping.toFixed(2).replace(".", ",")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto PIX</span>
                <span>-R$ {discount.toFixed(2).replace(".", ",")}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
          
          <Button className="w-full h-12" onClick={() => setStep("confirmation")}>
            {paymentMethod === "pix" ? "Gerar QR Code PIX" : "Finalizar compra"}
          </Button>
        </>
      )}
    </div>
  )
}

// ========================================
// CHECKOUT DE RESTAURANTE (DELIVERY)
// ========================================
interface DeliveryInfoType {
  estimatedTime: string
  deliveryFee: number
  freeDeliveryMinimum?: number
}

interface RestaurantCheckoutItem {
  name: string
  image?: string
  price: number
  quantity: number
  note?: string
}

interface RestaurantCheckoutProps {
  items: RestaurantCheckoutItem[]
  deliveryInfo: DeliveryInfoType
  restaurantName?: string
  whatsappNumber?: string
  onComplete: () => void
  onBack: () => void
}

export function RestaurantCheckout({ items, deliveryInfo, restaurantName = "Restaurante", whatsappNumber, onComplete, onBack }: RestaurantCheckoutProps) {
  const [step, setStep] = useState<"address" | "payment" | "confirmation">("address")
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery")
  const [paymentMethod, setPaymentMethod] = useState("PIX")
  const [formData, setFormData] = useState({ name: "", address: "", complement: "", phone: "", note: "" })
  
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const meetsMinimumOrder = deliveryType === "pickup" || subtotal >= deliveryInfo.minOrder
  const isFreeDelivery = deliveryInfo.freeDeliveryMinimum ? subtotal >= deliveryInfo.freeDeliveryMinimum : false
  const deliveryFee = deliveryType === "delivery" && !isFreeDelivery ? deliveryInfo.deliveryFee : 0
  const total = subtotal + deliveryFee
  const canContinue = Boolean(formData.name.trim() && formData.phone.trim() && (deliveryType === "pickup" || formData.address.trim()) && meetsMinimumOrder)
  const orderSummary = [
    `Ola! Quero fazer um pedido no ${restaurantName}:`,
    "",
    ...items.map((item) => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}${item.note ? `\n  Obs: ${item.note}` : ""}`),
    "",
    `Tipo: ${deliveryType === "delivery" ? "Entrega" : "Retirada"}`,
    deliveryType === "delivery" ? `Endereco: ${formData.address}${formData.complement ? ` - ${formData.complement}` : ""}` : "Retirada no local",
    `Cliente: ${formData.name}`,
    `Telefone: ${formData.phone}`,
    `Pagamento: ${paymentMethod}`,
    formData.note ? `Observacoes: ${formData.note}` : "",
    `Total: R$ ${total.toFixed(2).replace(".", ",")}`,
  ].filter(Boolean).join("\n")
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(orderSummary)}`
    : undefined
  
  if (step === "confirmation") {
    return (
      <ConfirmationScreen
        icon={<Check className="w-10 h-10 text-green-600" />}
        title="Pedido recebido!"
        subtitle={deliveryType === "delivery" ? "Estamos preparando seu pedido" : "Aguardamos voce para retirada"}
        details={[
          { label: "Numero do pedido", value: `#${Math.floor(Math.random() * 9000) + 1000}` },
          { label: "Total", value: `R$ ${total.toFixed(2).replace(".", ",")}` },
          { label: "Tempo estimado", value: deliveryType === "delivery" ? deliveryInfo.estimatedTime : "20-25 min" },
          { label: "Entrega", value: deliveryType === "pickup" ? "Retirada" : isFreeDelivery ? "Gratis" : `R$ ${deliveryFee.toFixed(2).replace(".", ",")}` },
          { label: "Pagamento", value: paymentMethod }
        ]}
        primaryAction={{ label: "Enviar WhatsApp", href: whatsappHref, onClick: onComplete }}
        secondaryAction={{ label: "Fechar", onClick: onComplete }}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Itens resumidos */}
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-muted-foreground">Seu pedido</h4>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
            <span>R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
          </div>
        ))}
      </div>
      
      {step === "address" ? (
        <>
          {/* Tipo de entrega */}
          <div className="flex gap-2">
            <button
              onClick={() => setDeliveryType("delivery")}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                deliveryType === "delivery" ? "border-accent bg-accent/10 text-accent" : "border-border"
              }`}
            >
              Delivery
            </button>
            <button
              onClick={() => setDeliveryType("pickup")}
              className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-colors ${
                deliveryType === "pickup" ? "border-accent bg-accent/10 text-accent" : "border-border"
              }`}
            >
              Retirada
            </button>
          </div>
          
          {deliveryType === "delivery" && (
            <div className="space-y-3">
              <Input
                placeholder="Endereco completo"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
              <Input
                placeholder="Complemento (apt, bloco...)"
                value={formData.complement}
                onChange={(e) => setFormData(prev => ({ ...prev, complement: e.target.value }))}
              />
            </div>
          )}

          <Input
            placeholder="Seu nome"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          
          <Input
            placeholder="WhatsApp para contato"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          />
          
          <Input
            placeholder="Observacoes do pedido (opcional)"
            value={formData.note}
            onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
          />
          
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>
            {deliveryType === "delivery" && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de entrega</span>
                <span>R$ {deliveryFee.toFixed(2).replace(".", ",")}</span>
              </div>
            )}
            {deliveryType === "delivery" && !meetsMinimumOrder && (
              <p className="text-xs text-destructive">
                Pedido minimo para entrega: R$ {deliveryInfo.minOrder.toFixed(2).replace(".", ",")}
              </p>
            )}
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
          
          <Button className="w-full h-12" onClick={() => setStep("payment")} disabled={!canContinue}>
            Escolher pagamento
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Forma de pagamento</h3>
            <Button variant="ghost" size="sm" onClick={onBack}>
              Voltar ao carrinho
            </Button>
          </div>
          
          <div className="space-y-2">
            {["PIX", "Cartao na entrega", "Dinheiro"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-colors ${
                  paymentMethod === method ? "border-accent bg-accent/10 text-accent" : "border-border hover:border-accent"
                }`}
              >
                <span>{method}</span>
                <Check className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
          <Button className="w-full h-12" onClick={() => setStep("confirmation")}>
            Gerar resumo do pedido
          </Button>
        </>
      )}
    </div>
  )
}

// ========================================
// FORMULARIO DE AGENDAMENTO DE VISITA (IMOVEIS)
// ========================================
interface ScheduleVisitFormProps {
  propertyTitle: string
  propertyAddress?: string
  onComplete: () => void
  onBack?: () => void
}

export function ScheduleVisitForm({ propertyTitle, propertyAddress, onComplete, onBack }: ScheduleVisitFormProps) {
  const [step, setStep] = useState<"form" | "confirmation">("form")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
  
  // Gera datas dinamicamente (proximos 4 dias uteis)
  const generateAvailableDates = () => {
    const dates = []
    const today = new Date()
    let count = 1
    while (dates.length < 4) {
      const date = new Date(today)
      date.setDate(today.getDate() + count)
      const dayOfWeek = date.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push({
          date: date.toISOString().split("T")[0],
          label: date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
        })
      }
      count++
    }
    return dates
  }
  
  const availableDates = generateAvailableDates()
  
  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
  
  if (step === "confirmation") {
    return (
      <ConfirmationScreen
        icon={<Check className="w-10 h-10 text-green-600" />}
        title="Visita agendada!"
        subtitle="Enviamos os detalhes por email"
        details={[
          { label: "Imovel", value: propertyTitle },
          ...(propertyAddress ? [{ label: "Endereco", value: propertyAddress }] : []),
          { label: "Data", value: availableDates.find(d => d.date === selectedDate)?.label || selectedDate },
          { label: "Horario", value: selectedTime }
        ]}
        primaryAction={{ label: "WhatsApp", onClick: onComplete }}
        secondaryAction={{ label: "Fechar", onClick: onComplete }}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="p-4 bg-secondary/50 rounded-xl">
        <p className="font-medium">{propertyTitle}</p>
        {propertyAddress && <p className="text-sm text-muted-foreground">{propertyAddress}</p>}
      </div>
      
      <div>
        <h4 className="font-medium mb-3">Escolha uma data</h4>
        <div className="grid grid-cols-2 gap-2">
          {availableDates.map((d) => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`py-3 rounded-xl border text-sm transition-colors ${
                selectedDate === d.date ? "border-accent bg-accent/10 text-accent" : "border-border"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
      
      {selectedDate && (
        <div>
          <h4 className="font-medium mb-3">Escolha um horario</h4>
          <div className="grid grid-cols-3 gap-2">
            {availableTimes.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`py-2 rounded-lg border text-sm transition-colors ${
                  selectedTime === time ? "border-accent bg-accent/10 text-accent" : "border-border"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {selectedTime && (
        <div className="space-y-3">
          <h4 className="font-medium">Seus dados</h4>
          <Input
            placeholder="Nome completo"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              placeholder="Telefone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <Input
            placeholder="Mensagem (opcional)"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          />
        </div>
      )}
      
      <Button 
        className="w-full h-12" 
        onClick={() => setStep("confirmation")}
        disabled={!selectedDate || !selectedTime || !formData.name || !formData.phone}
      >
        Confirmar visita
      </Button>
    </div>
  )
}

// ========================================
// CHECKOUT DE INGRESSOS (EVENTOS)
// ========================================
interface TicketCheckoutProps {
  eventName: string
  eventDate: string
  eventTime: string
  eventLocation: string
  ticketPrice: number
  ticketName?: string
  onComplete: () => void
  onBack?: () => void
}

export function TicketCheckout({ eventName, eventDate, eventTime, eventLocation, ticketPrice, ticketName = "Ingresso Inteira", onComplete, onBack }: TicketCheckoutProps) {
  const [step, setStep] = useState<"quantity" | "data" | "payment" | "confirmation">("quantity")
  const [quantity, setQuantity] = useState(1)
  const [formData, setFormData] = useState({ name: "", email: "", cpf: "" })
  
  const serviceFee = ticketPrice * 0.1 * quantity
  const total = ticketPrice * quantity + serviceFee
  
  const formattedDate = new Date(eventDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "long"
  })
  
  if (step === "confirmation") {
    return (
      <ConfirmationScreen
        icon={<Check className="w-10 h-10 text-green-600" />}
        title="Ingresso confirmado!"
        subtitle="Enviamos o e-ticket por email"
        details={[
          { label: "Evento", value: eventName },
          { label: "Data", value: `${formattedDate} as ${eventTime}` },
          { label: "Local", value: eventLocation },
          { label: "Ingresso", value: `${quantity}x ${ticketName}` },
          { label: "Total pago", value: `R$ ${total.toFixed(2).replace(".", ",")}` }
        ]}
        primaryAction={{ label: "Ver ingresso", onClick: onComplete }}
        secondaryAction={{ label: "Fechar", onClick: onComplete }}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="p-4 bg-secondary/50 rounded-xl">
        <p className="font-medium">{eventName}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>{formattedDate}</span>
          <span>•</span>
          <span>{eventTime}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{eventLocation}</p>
      </div>
      
      {step === "quantity" && (
        <>
          <div className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div>
              <p className="font-medium">{ticketName}</p>
              <p className="font-bold text-accent">R$ {ticketPrice.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                -
              </button>
              <span className="w-8 text-center font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{quantity}x {ticketName}</span>
              <span>R$ {(ticketPrice * quantity).toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de servico</span>
              <span>R$ {serviceFee.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span>Total</span>
              <span>R$ {total.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
          
          <Button className="w-full h-12" onClick={() => setStep("data")}>
            Continuar
          </Button>
        </>
      )}
      
      {step === "data" && (
        <>
          <h3 className="font-semibold">Dados do comprador</h3>
          <div className="space-y-3">
            <Input
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            <Input
              placeholder="CPF"
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
            />
          </div>
          <Button className="w-full h-12" onClick={() => setStep("payment")}>
            Ir para pagamento
          </Button>
        </>
      )}
      
      {step === "payment" && (
        <>
          <h3 className="font-semibold">Pagamento</h3>
          <div className="space-y-3">
            <button
              onClick={() => setStep("confirmation")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent transition-colors"
            >
              <CreditCard className="w-6 h-6 text-accent" />
              <span className="flex-1 text-left">Cartao de credito</span>
            </button>
            <button
              onClick={() => setStep("confirmation")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent transition-colors"
            >
              <QrCode className="w-6 h-6 text-accent" />
              <div className="flex-1 text-left">
                <span>PIX</span>
                <Badge className="ml-2 bg-green-100 text-green-700 text-xs">5% off</Badge>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ========================================
// FORMULARIO DE MATRICULA (ACADEMIA)
// ========================================
interface GymSignupFormProps {
  planName: string
  planPrice: number
  planPeriod?: string
  onComplete: () => void
  onBack?: () => void
}

export function GymSignupForm({ planName, planPrice, planPeriod = "mes", onComplete, onBack }: GymSignupFormProps) {
  const [step, setStep] = useState<"form" | "payment" | "confirmation">("form")
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", cpf: "", birthdate: ""
  })
  
  if (step === "confirmation") {
    return (
      <ConfirmationScreen
        icon={<Check className="w-10 h-10 text-green-600" />}
        title="Bem-vindo!"
        subtitle="Sua matricula foi concluida"
        details={[
          { label: "Plano", value: planName },
          { label: "Valor", value: `R$ ${planPrice.toFixed(2).replace(".", ",")}/${planPeriod}` },
          { label: "Inicio", value: "Imediato" },
          { label: "Proximo pagamento", value: planPeriod === "mes" ? "Em 30 dias" : "Em 1 ano" }
        ]}
        primaryAction={{ label: "WhatsApp", onClick: onComplete }}
        secondaryAction={{ label: "Fechar", onClick: onComplete }}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="p-4 bg-accent/10 rounded-xl">
        <p className="font-semibold">{planName}</p>
        <p className="text-2xl font-bold text-accent">
          R$ {planPrice.toFixed(2).replace(".", ",")}<span className="text-sm font-normal text-muted-foreground">/{planPeriod}</span>
        </p>
      </div>
      
      {step === "form" && (
        <>
          <h3 className="font-semibold">Dados pessoais</h3>
          <div className="space-y-3">
            <Input
              placeholder="Nome completo"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Data de nascimento"
                value={formData.birthdate}
                onChange={(e) => setFormData(prev => ({ ...prev, birthdate: e.target.value }))}
              />
            </div>
            <Input
              placeholder="CPF"
              value={formData.cpf}
              onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
            />
          </div>
          
          <Button className="w-full h-12" onClick={() => setStep("payment")}>
            Continuar
          </Button>
        </>
      )}
      
      {step === "payment" && (
        <>
          <h3 className="font-semibold">Forma de pagamento</h3>
          <div className="space-y-3">
            <button
              onClick={() => setStep("confirmation")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent transition-colors"
            >
              <CreditCard className="w-6 h-6 text-accent" />
              <span className="flex-1 text-left">Debito automatico</span>
            </button>
            <button
              onClick={() => setStep("confirmation")}
              className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-accent transition-colors"
            >
              <QrCode className="w-6 h-6 text-accent" />
              <span className="flex-1 text-left">PIX</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// ========================================
// CONFIRMACAO DE CONSULTA (SAUDE/PROFISSIONAIS)
// ========================================
interface AppointmentConfirmationProps {
  professionalName: string
  professionalAvatar?: string
  professionalRole?: string
  serviceName?: string
  date: string
  time: string
  price?: number
  onClose: () => void
}

export function AppointmentConfirmation({
  professionalName,
  professionalAvatar,
  professionalRole,
  serviceName,
  date,
  time,
  price,
  onClose
}: AppointmentConfirmationProps) {
  // Se nao tiver serviceName, usa professionalRole
  const displayService = serviceName || professionalRole || "Consulta"
  const [step, setStep] = useState<"confirm" | "success">("confirm")
  const [formData, setFormData] = useState({ name: "", phone: "", note: "" })
  
  const formattedDate = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long"
  })
  
  if (step === "success") {
    return (
      <ConfirmationScreen
        icon={<Check className="w-10 h-10 text-green-600" />}
        title="Agendamento confirmado!"
        subtitle="Enviamos um lembrete por SMS"
        details={[
          { label: "Profissional", value: professionalName },
          { label: "Servico", value: displayService },
          { label: "Data", value: formattedDate },
          { label: "Horario", value: time },
          ...(price ? [{ label: "Valor", value: `R$ ${price.toFixed(2).replace(".", ",")}` }] : [])
        ]}
        primaryAction={{ label: "WhatsApp", onClick: onClose }}
        secondaryAction={{ label: "Adicionar ao calendario", onClick: onClose }}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-xl">
        {professionalAvatar && (
          <div className="w-14 h-14 rounded-full overflow-hidden">
            <Image src={professionalAvatar} alt={professionalName} width={56} height={56} className="object-cover" />
          </div>
        )}
        <div>
          <p className="font-semibold">{professionalName}</p>
          <p className="text-sm text-muted-foreground">{displayService}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
          <Calendar className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="text-sm font-medium">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
          <Clock className="w-5 h-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Horario</p>
            <p className="text-sm font-medium">{time}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium">Confirme seus dados</h4>
        <Input
          placeholder="Nome completo"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Telefone (WhatsApp)"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
        />
        <Input
          placeholder="Observacoes (opcional)"
          value={formData.note}
          onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
        />
      </div>
      
      {price && (
        <div className="flex justify-between items-center p-4 bg-accent/10 rounded-xl">
          <span className="text-muted-foreground">Valor da consulta</span>
          <span className="text-xl font-bold text-accent">R$ {price.toFixed(2).replace(".", ",")}</span>
        </div>
      )}
      
      <Button 
        className="w-full h-12" 
        onClick={() => setStep("success")}
        disabled={!formData.name || !formData.phone}
      >
        Confirmar agendamento
      </Button>
    </div>
  )
}

// ========================================
// CHECKOUT DE CURSOS (EDUCACAO)
// ========================================
interface CourseCheckoutProps {
  courseName: string
  courseThumbnail: string
  instructorName: string
  price: number
  onComplete: () => void
  onBack: () => void
}

export function CourseCheckout({ courseName, courseThumbnail, instructorName, price, onComplete, onBack }: CourseCheckoutProps) {
  const [step, setStep] = useState<"payment" | "confirmation">("payment")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card")
  const [formData, setFormData] = useState({ name: "", email: "", cpf: "" })
  
  const discount = paymentMethod === "pix" ? price * 0.05 : 0
  const total = price - discount
  
  if (step === "confirmation") {
    return (
      <ConfirmationScreen
        icon={<Check className="w-10 h-10 text-green-600" />}
        title="Matricula confirmada!"
        subtitle="Acesse o curso agora mesmo"
        details={[
          { label: "Curso", value: courseName },
          { label: "Instrutor", value: instructorName },
          { label: "Valor pago", value: `R$ ${total.toFixed(2).replace(".", ",")}` },
          { label: "Acesso", value: "Vitalicio" }
        ]}
        primaryAction={{ label: "Acessar curso", onClick: onComplete }}
        secondaryAction={{ label: "Fechar", onClick: onComplete }}
      />
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Resumo do curso */}
      <div className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
        <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image src={courseThumbnail} alt={courseName} fill className="object-cover" />
        </div>
        <div>
          <p className="font-medium text-foreground line-clamp-2">{courseName}</p>
          <p className="text-sm text-muted-foreground">{instructorName}</p>
        </div>
      </div>
      
      {/* Dados do aluno */}
      <div className="space-y-3">
        <h4 className="font-medium">Dados do aluno</h4>
        <Input
          placeholder="Nome completo"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
        <Input
          placeholder="CPF"
          value={formData.cpf}
          onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
        />
      </div>
      
      {/* Forma de pagamento */}
      <div className="space-y-3">
        <h4 className="font-medium">Forma de pagamento</h4>
        <button
          onClick={() => setPaymentMethod("card")}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
            paymentMethod === "card" ? "border-accent bg-accent/5" : "border-border"
          }`}
        >
          <CreditCard className="w-6 h-6 text-accent" />
          <div className="text-left flex-1">
            <p className="font-medium">Cartao de credito</p>
            <p className="text-sm text-muted-foreground">Ate 12x sem juros</p>
          </div>
        </button>
        
        <button
          onClick={() => setPaymentMethod("pix")}
          className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
            paymentMethod === "pix" ? "border-accent bg-accent/5" : "border-border"
          }`}
        >
          <QrCode className="w-6 h-6 text-accent" />
          <div className="text-left flex-1">
            <p className="font-medium">PIX</p>
            <p className="text-sm text-green-600 font-medium">5% de desconto</p>
          </div>
        </button>
      </div>
      
      {/* Resumo */}
      <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>R$ {price.toFixed(2).replace(".", ",")}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Desconto PIX</span>
            <span>-R$ {discount.toFixed(2).replace(".", ",")}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
          <span>Total</span>
          <span className="text-accent">R$ {total.toFixed(2).replace(".", ",")}</span>
        </div>
      </div>
      
      <Button className="w-full h-12" onClick={() => setStep("confirmation")}>
        {paymentMethod === "pix" ? "Gerar QR Code PIX" : "Finalizar compra"}
      </Button>
      
      <p className="text-xs text-center text-muted-foreground">
        Garantia de 7 dias. Se nao gostar, devolvemos seu dinheiro.
      </p>
    </div>
  )
}


