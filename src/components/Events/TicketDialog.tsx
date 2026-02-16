import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import type { TicketType } from "@/types/event"

interface TicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ticket?: TicketType | null
  onSave: (ticket: TicketType) => void
}

interface TicketFormState {
  name: string
  quantity: string
  isUnlimited: boolean
  grossPrice: string
  displayPrice: string
  description: string
  // Settings
  hasSalesPeriod: boolean
  saleStartDate: Date | undefined
  saleEndDate: Date | undefined
  hasValidityPeriod: boolean
  validityStartDate: Date | undefined
  validityEndDate: Date | undefined
  hasPurchaseLimit: boolean
  minPerOrder: string
  maxPerOrder: string
  sellInBundles: boolean
  bundleSize: string
}

const defaultFormState: TicketFormState = {
  name: "",
  quantity: "100",
  isUnlimited: false,
  grossPrice: "",
  displayPrice: "",
  description: "",
  hasSalesPeriod: false,
  saleStartDate: undefined,
  saleEndDate: undefined,
  hasValidityPeriod: false,
  validityStartDate: undefined,
  validityEndDate: undefined,
  hasPurchaseLimit: false,
  minPerOrder: "1",
  maxPerOrder: "10",
  sellInBundles: false,
  bundleSize: "2",
}

// Fee configuration (can be moved to config/env later)
const PLATFORM_FEE_PERCENT = 0.10 // 10%
const PLATFORM_FEE_FIXED = 0.99 // $0.99

// Calculate display price from gross price (gross + fees)
function calculateDisplayPrice(grossPrice: number): number {
  if (grossPrice <= 0) return 0
  const displayPrice = grossPrice * (1 + PLATFORM_FEE_PERCENT) + PLATFORM_FEE_FIXED
  return Math.round(displayPrice * 100) / 100 // Round to 2 decimal places
}

export function TicketDialog({ open, onOpenChange, ticket, onSave }: TicketDialogProps) {
  const [form, setForm] = useState<TicketFormState>(defaultFormState)
  const [showSettings, setShowSettings] = useState(false)

  const isEditing = !!ticket

  // Reset form when dialog opens/closes or ticket changes
  useEffect(() => {
    if (open && ticket) {
      setForm({
        name: ticket.name,
        quantity: ticket.quantity.toString(),
        isUnlimited: ticket.isUnlimited || false,
        grossPrice: ticket.grossPrice?.toString() || ticket.price.toString(),
        displayPrice: ticket.displayPrice?.toString() || ticket.price.toString(),
        description: ticket.description || "",
        hasSalesPeriod: ticket.hasSalesPeriod || false,
        saleStartDate: ticket.saleStartDate,
        saleEndDate: ticket.saleEndDate,
        hasValidityPeriod: ticket.hasValidityPeriod || false,
        validityStartDate: ticket.validityStartDate,
        validityEndDate: ticket.validityEndDate,
        hasPurchaseLimit: ticket.hasPurchaseLimit || false,
        minPerOrder: ticket.minPerOrder?.toString() || "1",
        maxPerOrder: ticket.maxPerOrder?.toString() || "10",
        sellInBundles: ticket.sellInBundles || false,
        bundleSize: ticket.bundleSize?.toString() || "2",
      })
      // Show settings if any are enabled
      if (ticket.hasSalesPeriod || ticket.hasValidityPeriod || ticket.hasPurchaseLimit || ticket.sellInBundles) {
        setShowSettings(true)
      }
    } else if (open && !ticket) {
      setForm(defaultFormState)
      setShowSettings(false)
    }
  }, [open, ticket])

  const handleSave = () => {
    const grossPrice = parseFloat(form.grossPrice) || 0
    const displayPrice = parseFloat(form.displayPrice) || grossPrice

    const ticketData: TicketType = {
      id: ticket?.id || String(Date.now()),
      name: form.name,
      price: displayPrice, // Use display price as the main price
      quantity: form.isUnlimited ? 999999 : (parseInt(form.quantity) || 100),
      description: form.description || undefined,
      isUnlimited: form.isUnlimited,
      grossPrice: grossPrice,
      displayPrice: displayPrice,
      hasSalesPeriod: form.hasSalesPeriod,
      saleStartDate: form.hasSalesPeriod ? form.saleStartDate : undefined,
      saleEndDate: form.hasSalesPeriod ? form.saleEndDate : undefined,
      hasValidityPeriod: form.hasValidityPeriod,
      validityStartDate: form.hasValidityPeriod ? form.validityStartDate : undefined,
      validityEndDate: form.hasValidityPeriod ? form.validityEndDate : undefined,
      hasPurchaseLimit: form.hasPurchaseLimit,
      minPerOrder: form.hasPurchaseLimit ? parseInt(form.minPerOrder) || 1 : undefined,
      maxPerOrder: form.hasPurchaseLimit ? parseInt(form.maxPerOrder) || 10 : undefined,
      sellInBundles: form.sellInBundles,
      bundleSize: form.sellInBundles ? parseInt(form.bundleSize) || 2 : undefined,
    }
    onSave(ticketData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:rounded-full">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Ticket" : "Add Ticket"}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-5 py-4">
          {/* Ticket Name */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-name">Ticket Name</Label>
            <Input
              id="ticket-name"
              placeholder="e.g., General Admission"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Quantity with Unlimited Toggle */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ticket-quantity">QTY</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="unlimited-toggle" className="text-sm text-muted-foreground">
                  Unlimited
                </Label>
                <Switch
                  id="unlimited-toggle"
                  checked={form.isUnlimited}
                  onCheckedChange={(checked) => setForm({ ...form, isUnlimited: checked })}
                />
              </div>
            </div>
            <Input
              id="ticket-quantity"
              type="number"
              min="1"
              placeholder="100"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              disabled={form.isUnlimited}
              className={form.isUnlimited ? "opacity-50" : ""}
            />
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="gross-price">Gross Price ($)</Label>
              <Input
                id="gross-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.grossPrice}
                onChange={(e) => {
                  const grossPrice = e.target.value
                  const grossPriceNum = parseFloat(grossPrice) || 0
                  const calculatedDisplayPrice = calculateDisplayPrice(grossPriceNum)
                  setForm({
                    ...form,
                    grossPrice,
                    displayPrice: calculatedDisplayPrice > 0 ? calculatedDisplayPrice.toFixed(2) : "",
                  })
                }}
              />
              <p className="text-xs text-muted-foreground">Price before fees</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="display-price">Display Price ($)</Label>
              <Input
                id="display-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.displayPrice}
                onChange={(e) => setForm({ ...form, displayPrice: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Price shown to buyers</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-description">Description</Label>
            <Textarea
              id="ticket-description"
              placeholder="Describe what's included with this ticket..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="min-h-24 resize-none"
            />
          </div>

          {/* Ticket Settings Collapsible */}
          <div className="border rounded-lg">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="font-medium">Ticket Settings</span>
              {showSettings ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showSettings && (
              <div className="px-4 pb-4 space-y-5 border-t">
                {/* Limit Sales Period */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Limit Sales Period</Label>
                    <Switch
                      checked={form.hasSalesPeriod}
                      onCheckedChange={(checked) => setForm({ ...form, hasSalesPeriod: checked })}
                    />
                  </div>
                  {form.hasSalesPeriod && (
                    <div className="flex items-center gap-2 mt-3">
                      <DateTimePicker
                        value={form.saleStartDate}
                        onChange={(date) => setForm({ ...form, saleStartDate: date })}
                        showTime={true}
                      />
                      <span className="text-muted-foreground">—</span>
                      <DateTimePicker
                        value={form.saleEndDate}
                        onChange={(date) => setForm({ ...form, saleEndDate: date })}
                        showTime={true}
                        minDate={form.saleStartDate}
                      />
                    </div>
                  )}
                </div>

                {/* Limit Ticket Validity */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Limit Ticket Validity</Label>
                    <Switch
                      checked={form.hasValidityPeriod}
                      onCheckedChange={(checked) => setForm({ ...form, hasValidityPeriod: checked })}
                    />
                  </div>
                  {form.hasValidityPeriod && (
                    <div className="flex items-center gap-2 mt-3">
                      <DateTimePicker
                        value={form.validityStartDate}
                        onChange={(date) => setForm({ ...form, validityStartDate: date })}
                        showTime={true}
                      />
                      <span className="text-muted-foreground">—</span>
                      <DateTimePicker
                        value={form.validityEndDate}
                        onChange={(date) => setForm({ ...form, validityEndDate: date })}
                        showTime={true}
                        minDate={form.validityStartDate}
                      />
                    </div>
                  )}
                </div>

                {/* Limit Purchase Quantity */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium">Limit Purchase Quantity</Label>
                    <Switch
                      checked={form.hasPurchaseLimit}
                      onCheckedChange={(checked) => setForm({ ...form, hasPurchaseLimit: checked })}
                    />
                  </div>
                  {form.hasPurchaseLimit && (
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Min</Label>
                        <Input
                          type="number"
                          min="1"
                          value={form.minPerOrder}
                          onChange={(e) => setForm({ ...form, minPerOrder: e.target.value })}
                          placeholder="1"
                          className="w-20"
                        />
                      </div>
                      <span className="text-muted-foreground">—</span>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Max</Label>
                        <Input
                          type="number"
                          min="1"
                          value={form.maxPerOrder}
                          onChange={(e) => setForm({ ...form, maxPerOrder: e.target.value })}
                          placeholder="1000"
                          className="w-20"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sell in Bundles - appears under purchase limit */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dashed">
                    <Checkbox
                      id="sell-bundles"
                      checked={form.sellInBundles}
                      onCheckedChange={(checked) => setForm({ ...form, sellInBundles: checked === true })}
                    />
                    <Label htmlFor="sell-bundles" className="text-sm text-muted-foreground cursor-pointer">
                      Sell in Bundles
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-6">
                    Enable minimum purchase greater than 1 to sell in bundles
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={!form.name}>
            {isEditing ? "Save Changes" : "Add Ticket"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
