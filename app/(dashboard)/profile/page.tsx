"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PersonalInfoForm } from "@/components/profile/personal-info-form";
import { AddressForm } from "@/components/profile/address-form";
import { PaymentMethodsForm } from "@/components/profile/payment-methods-form";
import { TravelPreferencesForm } from "@/components/profile/travel-preferences-form";
import { BookingHistory } from "@/components/profile/booking-history";
import { toast } from "sonner";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  
  // Mock user data - In a real application, this would come from an API or state management
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "", // URL would go here
    initials: "JD"
  };

  const handleSaveChanges = () => {
    // This would save the current tab's form data
    toast.success("Changes saved successfully!");
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile sidebar */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xl">{user.initials}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 text-center">
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" className="w-full">
                  Change Avatar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="address">Address</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <TabsContent value="personal">
                    <PersonalInfoForm />
                  </TabsContent>
                  
                  <TabsContent value="address">
                    <AddressForm />
                  </TabsContent>
                  
                  <TabsContent value="payment">
                    <PaymentMethodsForm />
                  </TabsContent>
                  
                  <TabsContent value="preferences">
                    <TravelPreferencesForm />
                  </TabsContent>
                  
                  <TabsContent value="bookings">
                    <BookingHistory />
                  </TabsContent>
                </div>
              </Tabs>
              
              {activeTab !== "bookings" && (
                <>
                  <Separator className="my-6" />
                  <div className="flex justify-end">
                    <Button variant="outline" className="mr-2">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveChanges}>
                      Save Changes
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 