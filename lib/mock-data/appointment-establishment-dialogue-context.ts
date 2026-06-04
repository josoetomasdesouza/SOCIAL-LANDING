export interface EstablishmentDialogueOperational {
  liveState: string
  placeHint: string
  momentHint?: string
  hoursHint?: string
  openingHours: string
}

export interface EstablishmentDialogueArrival {
  addressLine: string
  parkingHint?: string
  referenceHint?: string
}

export interface EstablishmentDialogueContext {
  brandName: string
  operational: EstablishmentDialogueOperational
  arrival: EstablishmentDialogueArrival
  serviceNames: string[]
}
