"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveBookingData, getBookingData } from "@/utils/localStorage";
import { useEffect } from "react";

interface ContactInfoStepProps {
  onComplete: (data: Partial<{
    contactInfo: ContactFormData;
  }>) => void;
  onBack: () => void;
}

// Define contact schema with Zod
const contactFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneCountryCode: z.string().min(1, {
    message: "Please select a country code.",
  }),
  phoneNumber: z.string().min(5, {
    message: "Please enter a valid phone number.",
  }),
  address: z.object({
    street: z.string().min(1, {
      message: "Please enter your street address.",
    }),
    city: z.string().min(1, {
      message: "Please enter your city.",
    }),
    state: z.string().optional(),
    postalCode: z.string().min(1, {
      message: "Please enter your postal code.",
    }),
    country: z.string().min(1, {
      message: "Please select your country.",
    }),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, {
      message: "Please enter a name for your emergency contact.",
    }),
    relationship: z.string().min(1, {
      message: "Please specify the relationship.",
    }),
    phoneCountryCode: z.string().min(1, {
      message: "Please select a country code.",
    }),
    phoneNumber: z.string().min(5, {
      message: "Please enter a valid phone number.",
    }),
  }),
  preferences: z.object({
    receivePromotions: z.boolean().default(false),
    receiveFlightUpdates: z.boolean().default(true),
  }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

// Sample country codes for phone numbers
const COUNTRY_CODES = [
  { value: "1", label: "United States (+1)" },
  { value: "44", label: "United Kingdom (+44)" },
  { value: "61", label: "Australia (+61)" },
  { value: "33", label: "France (+33)" },
  { value: "49", label: "Germany (+49)" },
  { value: "81", label: "Japan (+81)" },
  { value: "86", label: "China (+86)" },
  { value: "91", label: "India (+91)" },
];

// Sample countries for address
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", 
  "Germany", "France", "Japan", "China", "India", "Brazil"
];

export function ContactInfoStep({ onComplete, onBack }: ContactInfoStepProps) {
  // Initialize the form with default values
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: "",
      phoneCountryCode: "1",
      phoneNumber: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      emergencyContact: {
        name: "",
        relationship: "",
        phoneCountryCode: "1",
        phoneNumber: "",
      },
      preferences: {
        receivePromotions: false,
        receiveFlightUpdates: true,
      },
    },
    mode: "onChange",
  });

  // Load saved contact data from localStorage on component mount
  useEffect(() => {
    const savedData = getBookingData();
    if (savedData.contactInfo) {
      form.reset(savedData.contactInfo);
    }
  }, [form]);

  const onSubmit = (data: ContactFormData) => {
    // Save to localStorage with type assertion
    saveBookingData({ contactInfo: data as any });
    
    // Continue to the next step
    onComplete({ contactInfo: data });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Contact Information</h2>
      <p className="text-muted-foreground">
        Please provide your contact details for flight updates and emergency purposes.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Primary Contact</h3>
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="phoneCountryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_CODES.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address</h3>
            
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input placeholder="State or province (optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact.relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Spouse, Parent, Friend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact.phoneCountryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRY_CODES.map((code) => (
                          <SelectItem key={code.value} value={code.value}>
                            {code.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContact.phoneNumber"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Communication Preferences</h3>
            
            <FormField
              control={form.control}
              name="preferences.receiveFlightUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Receive flight updates and notifications
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Get important information about your flight status, gate changes, and more.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preferences.receivePromotions"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Receive promotional offers and discounts
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Be the first to know about special deals and personalized offers.
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">
              Continue to Payment
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 