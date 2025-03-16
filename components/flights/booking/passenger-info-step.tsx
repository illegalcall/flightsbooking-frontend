"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { saveBookingData, getBookingData } from "@/utils/localStorage";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface PassengerInfoStepProps {
  onComplete: (data: Partial<{
    passengers: PassengerFormData[];
  }>) => void;
  onBack: () => void;
}

// Define passenger schema with Zod
const passengerSchema = z.object({
  title: z.enum(["mr", "mrs", "ms", "dr"], {
    required_error: "Please select a title",
  }),
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
  nationality: z.string().min(2, {
    message: "Please select a nationality.",
  }),
  passportNumber: z.string().min(5, {
    message: "Passport number must be at least 5 characters.",
  }),
  passportExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Please enter a valid date in YYYY-MM-DD format.",
  }),
});

const passengersFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1),
});

type PassengerFormData = z.infer<typeof passengerSchema>;
type PassengersFormValues = z.infer<typeof passengersFormSchema>;

export function PassengerInfoStep({ onComplete, onBack }: PassengerInfoStepProps) {
  const [passengerCount, setPassengerCount] = useState(1);
  const [isValidating, setIsValidating] = useState(false);

  // Initialize the form with default values or values from localStorage
  const form = useForm<PassengersFormValues>({
    resolver: zodResolver(passengersFormSchema),
    defaultValues: {
      passengers: [
        {
          title: "mr",
          firstName: "",
          lastName: "",
          dateOfBirth: "",
          nationality: "",
          passportNumber: "",
          passportExpiry: "",
        },
      ],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    name: "passengers",
    control: form.control,
  });

  // Load saved passenger data from localStorage on component mount
  useEffect(() => {
    const savedData = getBookingData();
    if (savedData.passengers && savedData.passengers.length > 0) {
      try {
        // Pre-fill form with saved passenger data
        const passengersData = savedData.passengers.map(passenger => ({
          title: passenger.title as "mr" | "mrs" | "ms" | "dr",
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          dateOfBirth: passenger.dateOfBirth,
          nationality: passenger.nationality,
          passportNumber: passenger.passportNumber,
          passportExpiry: passenger.passportExpiry,
        }));
        
        form.reset({ passengers: passengersData });
        
        // Update passenger count
        setPassengerCount(savedData.passengers.length);
      } catch (error) {
        console.error("Error loading saved passenger data:", error);
      }
    }
  }, [form]);

  const addPassenger = () => {
    append({
      title: "mr",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      nationality: "",
      passportNumber: "",
      passportExpiry: "",
    });
    setPassengerCount(passengerCount + 1);
  };

  const removePassenger = (index: number) => {
    remove(index);
    setPassengerCount(passengerCount - 1);
  };

  const onSubmit = async (data: PassengersFormValues) => {
    setIsValidating(true);
    
    try {
      // Save to localStorage with type assertion
      saveBookingData({ passengers: data.passengers as any });
      
      // Proceed to next step
      onComplete(data);
    } catch (error) {
      console.error('Error saving passenger information:', error);
      toast({
        title: "An error occurred",
        description: "Could not save passenger information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Simple list of nationalities for the demo
  const nationalities = [
    "American", "British", "Canadian", "Australian", 
    "German", "French", "Italian", "Spanish", 
    "Japanese", "Chinese", "Indian", "Brazilian"
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Passenger Information</h2>
      <p className="text-muted-foreground">
        Please enter the details for each passenger exactly as they appear on their passport or ID.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {fields.map((field, index) => (
            <Card key={field.id} className="shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Passenger {index + 1}</CardTitle>
                  {index > 0 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removePassenger(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`passengers.${index}.title`}
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-1 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mr" />
                            </FormControl>
                            <FormLabel className="font-normal">Mr</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-1 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="mrs" />
                            </FormControl>
                            <FormLabel className="font-normal">Mrs</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-1 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="ms" />
                            </FormControl>
                            <FormLabel className="font-normal">Ms</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-1 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="dr" />
                            </FormControl>
                            <FormLabel className="font-normal">Dr</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`passengers.${index}.firstName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`passengers.${index}.lastName`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`passengers.${index}.dateOfBirth`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`passengers.${index}.nationality`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nationality</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select nationality" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nationalities.map((nationality) => (
                              <SelectItem key={nationality} value={nationality}>
                                {nationality}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <h4 className="font-medium">Travel Document Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`passengers.${index}.passportNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passport Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Passport number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`passengers.${index}.passportExpiry`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passport Expiry Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {passengerCount < 9 && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addPassenger}
            >
              Add Another Passenger
            </Button>
          )}

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isValidating}>
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Continue to Seat Selection"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 