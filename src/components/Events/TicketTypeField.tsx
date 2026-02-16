import { Plus, Trash2 } from "lucide-react"
import { useFieldArray, type Control } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { generateTicketId } from "@/data/dummyEvents"

interface TicketTypeFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
}

export function TicketTypeField({ control }: TicketTypeFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "tickets",
  })

  const addTicket = () => {
    append({
      id: generateTicketId(),
      name: "",
      price: 0,
      quantity: 100,
      description: "",
    })
  }

  return (
    <div className="ticket-types">
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">
          No ticket types added. Add a ticket type to start selling.
        </p>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="ticket-types__item">
          <FormField
            control={control}
            name={`tickets.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Ticket name (e.g., VIP)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`tickets.${index}.price`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Price"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`tickets.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addTicket}
        className="ticket-types__add"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Ticket Type
      </Button>
    </div>
  )
}

export default TicketTypeField
