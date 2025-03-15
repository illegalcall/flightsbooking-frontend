"use client";

import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function TravelPreferencesForm() {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-4">
          <Label className="text-base">Preferred Seat</Label>
          <RadioGroup defaultValue="window" className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="window" id="window" />
              <Label htmlFor="window">Window</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="middle" id="middle" />
              <Label htmlFor="middle">Middle</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aisle" id="aisle" />
              <Label htmlFor="aisle">Aisle</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label className="text-base">Meal Preference</Label>
          <RadioGroup defaultValue="regular" className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="regular" id="regular" />
              <Label htmlFor="regular">Regular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vegetarian" id="vegetarian" />
              <Label htmlFor="vegetarian">Vegetarian</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="halal" id="halal" />
              <Label htmlFor="halal">Halal</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label className="text-base">Special Assistance</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="wheelchair" />
              <Label htmlFor="wheelchair">Wheelchair assistance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="infant" />
              <Label htmlFor="infant">Traveling with infant</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="assistance" />
              <Label htmlFor="assistance">Special medical assistance</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 