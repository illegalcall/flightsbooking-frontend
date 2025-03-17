"use client";

import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SeatLockProps {
  initialMinutes: number;
  onExpire: () => void;
  onExtend?: () => void;
  className?: string;
}

export function SeatLock({ 
  initialMinutes = 15, 
  onExpire, 
  onExtend,
  className 
}: SeatLockProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(initialMinutes * 60);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [showCriticalWarning, setShowCriticalWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage (0-100)
  const calculateProgress = () => {
    return (remainingSeconds / (initialMinutes * 60)) * 100;
  };

  // Determine color based on remaining time
  const getColor = () => {
    if (remainingSeconds <= 60) return "bg-red-500";
    if (remainingSeconds <= 300) return "bg-orange-400";
    return "bg-green-500";
  };

  useEffect(() => {
    // Create audio element for alerts
    audioRef.current = new Audio("/alert.mp3");
    
    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          onExpire();
          return 0;
        }
        
        // Show warning at 5 minutes
        if (prev === 300) {
          setShowWarningDialog(true);
          // Play sound
          audioRef.current?.play().catch(() => {
            // Handle any errors with audio playback
          });
        }
        
        // Show critical warning at 1 minute
        if (prev === 60) {
          setShowCriticalWarning(true);
          // Play sound
          audioRef.current?.play().catch(() => {
            // Handle any errors with audio playback
          });
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExtendTime = () => {
    // Add 5 more minutes
    setRemainingSeconds(prev => prev + 300);
    setShowWarningDialog(false);
    setShowCriticalWarning(false);
    
    if (onExtend) {
      onExtend();
    }
  };
  
  const handleDismissWarning = () => {
    setShowWarningDialog(false);
  };
  
  const handleDismissCritical = () => {
    setShowCriticalWarning(false);
  };

  return (
    <>
      <div className={`flex items-center gap-3 ${className}`}>
        <Progress 
          value={calculateProgress()} 
          className={`w-24 h-2 transition-colors ${getColor()}`} 
        />
        <Badge 
          variant="outline" 
          className={`transition-colors ${
            remainingSeconds <= 60 ? "text-red-600 border-red-600" : 
            remainingSeconds <= 300 ? "text-orange-600 border-orange-600" : ""
          }`}
        >
          <span className="mr-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-timer">
              <path d="M10 2h4" />
              <path d="M12 14v-4" />
              <path d="M12 14v-4" />
              <circle cx="12" cy="14" r="8" />
            </svg>
          </span>
          Booking reserved for {formatTime(remainingSeconds)}
        </Badge>
      </div>

      {/* 5-Minute Warning Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your seat reservation is expiring soon</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4">Your selected seats and prices are reserved for 5 more minutes. 
              If you don&apos;t complete your booking, these seats will be released to other customers.</p>
            <Progress 
              value={calculateProgress()} 
              className="w-full h-2 bg-orange-100" 
            />
            <p className="mt-4 text-sm text-muted-foreground text-center">{formatTime(remainingSeconds)} remaining</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDismissWarning}
            >
              Continue Without Extending
            </Button>
            <Button onClick={handleExtendTime}>
              Extend Reservation (+ 5 Minutes)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 1-Minute Critical Warning Dialog */}
      <Dialog open={showCriticalWarning} onOpenChange={setShowCriticalWarning}>
        <DialogContent className="border-red-400">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-triangle">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                Critical: Reservation Expiring
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-red-600 font-semibold">Your seat reservation is about to expire in 1 minute!</p>
            <p className="mb-4">Complete your booking now or extend your reservation time to avoid losing your selected seats.</p>
            <Progress 
              value={calculateProgress()} 
              className="w-full h-2 bg-red-100" 
            />
            <p className="mt-4 text-sm text-red-600 text-center font-bold">{formatTime(remainingSeconds)} remaining</p>
          </div>
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDismissCritical}
            >
              Continue Without Extending
            </Button>
            <Button 
              onClick={handleExtendTime}
              className="bg-red-600 hover:bg-red-700"
            >
              Extend Reservation Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 