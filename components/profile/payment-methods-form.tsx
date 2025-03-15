"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Trash2 } from "lucide-react";

// Mock saved payment methods
const savedPaymentMethods = [
  {
    id: "1",
    cardType: "Visa",
    lastFour: "4242",
    expiryMonth: "12",
    expiryYear: "2025",
    isDefault: true,
  },
  {
    id: "2",
    cardType: "Mastercard",
    lastFour: "5555",
    expiryMonth: "10",
    expiryYear: "2024",
    isDefault: false,
  },
];

export function PaymentMethodsForm() {
  const [selectedCard, setSelectedCard] = useState(savedPaymentMethods[0].id);
  const [showNewCardForm, setShowNewCardForm] = useState(false);

  const handleAddNewCard = () => {
    setShowNewCardForm(true);
  };

  const handleCancelNewCard = () => {
    setShowNewCardForm(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Saved Payment Methods</CardTitle>
          <CardDescription>
            Select your default payment method or add a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedCard} onValueChange={setSelectedCard} className="space-y-4">
            {savedPaymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between space-x-2 border p-4 rounded-md">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={`card-${method.id}`} />
                  <Label htmlFor={`card-${method.id}`} className="flex items-center space-x-4">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <span className="font-medium">
                        {method.cardType} ending in {method.lastFour}
                      </span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        (Expires {method.expiryMonth}/{method.expiryYear})
                      </span>
                      {method.isDefault && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                  </Label>
                </div>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </RadioGroup>
          
          {!showNewCardForm && (
            <Button onClick={handleAddNewCard} variant="outline" className="mt-4">
              + Add new payment method
            </Button>
          )}
        </CardContent>
      </Card>

      {showNewCardForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Add New Payment Method</CardTitle>
            <CardDescription>
              Add a new credit or debit card
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" placeholder="John Doe" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryMonth">Expiry Month</Label>
                  <Select>
                    <SelectTrigger id="expiryMonth">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = (i + 1).toString().padStart(2, "0");
                        return (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expiryYear">Expiry Year</Label>
                  <Select>
                    <SelectTrigger id="expiryYear">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => {
                        const year = (new Date().getFullYear() + i).toString();
                        return (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="123" maxLength={3} />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="setAsDefault"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="setAsDefault" className="text-sm font-normal">
                  Set as default payment method
                </Label>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={handleCancelNewCard}>
              Cancel
            </Button>
            <Button>
              Add Card
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
} 