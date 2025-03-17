"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { saveBookingData } from "@/utils/localStorage";

interface AddonsStepProps {
  onComplete: (data: { addons: AddonSelection[] }) => void;
  onBack: () => void;
}

interface AddonOption {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "checkbox" | "radio";
  group?: string;
  options?: {
    id: string;
    name: string;
    price: number;
  }[];
}

interface AddonSelection {
  id: string;
  selected: boolean;
  optionId?: string;
  price: number;
  quantity?: number;
}

// Mock data for add-ons
const MOCK_ADDONS: AddonOption[] = [
  {
    id: "meal",
    name: "Special Meal",
    description: "Select your preferred meal option",
    price: 0,
    type: "radio",
    group: "meal",
    options: [
      { id: "regular", name: "Regular Meal", price: 0 },
      { id: "vegetarian", name: "Vegetarian", price: 0 },
      { id: "vegan", name: "Vegan", price: 5 },
      { id: "gluten-free", name: "Gluten Free", price: 5 },
      { id: "kosher", name: "Kosher", price: 10 },
      { id: "halal", name: "Halal", price: 10 },
    ]
  },
  {
    id: "baggage",
    name: "Extra Baggage",
    description: "Add an extra checked bag (23kg)",
    price: 60,
    type: "checkbox"
  },
  {
    id: "priority",
    name: "Priority Boarding",
    description: "Be among the first to board the plane",
    price: 25,
    type: "checkbox"
  },
  {
    id: "lounge",
    name: "Lounge Access",
    description: "Enjoy comfortable seating, complimentary snacks, and Wi-Fi before your flight",
    price: 45,
    type: "checkbox"
  },
  {
    id: "wifi",
    name: "In-flight Wi-Fi",
    description: "Stay connected throughout your journey",
    price: 15,
    type: "checkbox"
  },
  {
    id: "insurance",
    name: "Travel Insurance",
    description: "Comprehensive coverage for your trip",
    price: 35,
    type: "checkbox"
  }
];

export function AddonsStep({ onComplete, onBack }: AddonsStepProps) {
  const [selectedAddons, setSelectedAddons] = useState<AddonSelection[]>([
    { id: "meal", selected: true, optionId: "regular", price: 0 },
    { id: "baggage", selected: false, price: 60 },
    { id: "priority", selected: false, price: 25 },
    { id: "lounge", selected: false, price: 45 },
    { id: "wifi", selected: false, price: 15 },
    { id: "insurance", selected: false, price: 35 },
  ]);

  const handleCheckboxChange = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.map(addon => 
        addon.id === addonId 
          ? { ...addon, selected: !addon.selected } 
          : addon
      )
    );
  };

  const handleRadioChange = (addonId: string, optionId: string, price: number) => {
    setSelectedAddons(prev => 
      prev.map(addon => 
        addon.id === addonId 
          ? { ...addon, selected: true, optionId, price } 
          : addon
      )
    );
  };

  const getTotalPrice = () => {
    return selectedAddons
      .filter(addon => addon.selected)
      .reduce((total, addon) => total + addon.price, 0);
  };

  const handleContinue = () => {
    // Filter only the selected addons
    const selectedAddonsList = selectedAddons.filter(addon => addon.selected);
    
    // Map to the format expected by the API
    const formattedAddons = selectedAddonsList.map(addon => ({
      id: addon.id,
      selected: addon.selected,
      optionId: addon.optionId,
      price: addon.price,
      quantity: 1 // Default to 1 for now
    }));
    
    // Save to localStorage
    saveBookingData({ addons: formattedAddons });
    
    // Continue to next step
    onComplete({ addons: formattedAddons });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Additional Services</h2>
      <p className="text-muted-foreground">
        Enhance your journey with these optional services.
      </p>

      <div className="space-y-4">
        {MOCK_ADDONS.map((addon) => (
          <Card key={addon.id}>
            <CardContent className="p-6">
              {addon.type === "checkbox" ? (
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id={addon.id}
                    checked={selectedAddons.find(a => a.id === addon.id)?.selected || false}
                    onCheckedChange={() => handleCheckboxChange(addon.id)}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label 
                        htmlFor={addon.id}
                        className="font-medium cursor-pointer"
                      >
                        {addon.name}
                      </Label>
                      <span className="font-medium">${addon.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{addon.description}</p>
                  </div>
                </div>
              ) : addon.type === "radio" && addon.options ? (
                <div className="space-y-3">
                  <h3 className="font-medium">{addon.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{addon.description}</p>
                  
                  <RadioGroup 
                    value={selectedAddons.find(a => a.id === addon.id)?.optionId}
                    onValueChange={(value) => {
                      const option = addon.options?.find(o => o.id === value);
                      if (option) {
                        handleRadioChange(addon.id, value, option.price);
                      }
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addon.options.map((option) => (
                        <div 
                          key={option.id} 
                          className="flex items-center justify-between space-x-2 border rounded-md p-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option.id} id={`${addon.id}-${option.id}`} />
                            <Label htmlFor={`${addon.id}-${option.id}`}>{option.name}</Label>
                          </div>
                          <span className="text-sm font-medium">
                            {option.price > 0 ? `+$${option.price}` : "Included"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg bg-muted p-4">
        <div className="flex justify-between items-center font-medium">
          <span>Total for additional services:</span>
          <span>${getTotalPrice()}</span>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleContinue}>
          Continue to Contact Information
        </Button>
      </div>
    </div>
  );
} 