import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LogIn, LogOut, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLiveTime } from "../../hooks/use-live-time";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmployeeClockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeClockModal({ isOpen, onClose }: EmployeeClockModalProps) {
  const [employeeName, setEmployeeName] = useState("");
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("new");
  const [isListening, setIsListening] = useState(false);
  const { currentTime, currentDate } = useLiveTime();
  const { toast } = useToast();

  // Fetch returning staff names
  const { data: staffNames = [], isLoading: loadingNames } = useQuery<string[]>({
    queryKey: ["/api/staff-names"],
    enabled: isOpen,
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      date: string;
      timeIn?: string;
      timeOut?: string;
      notes?: string;
    }) => {
      const response = await apiRequest("POST", "/api/employee-clock", data);
      return response.json();
    },
    onSuccess: (_, variables) => {
      const action = variables.timeIn ? "in" : "out";
      toast({
        title: "Success",
        description: `Clocked ${action} successfully!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-clock"] });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clock in/out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setEmployeeName("");
    setNotes("");
    setActiveTab("new");
    setIsListening(false);
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNotes(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: "Could not capture speech. Please try typing instead.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleReturningStaffSelect = (name: string) => {
    setEmployeeName(name);
    setActiveTab("new");
  };

  const handleClockIn = () => {
    if (!employeeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    createStaffMutation.mutate({
      name: employeeName.trim(),
      date: now.toLocaleDateString(),
      timeIn: now.toLocaleTimeString(),
      notes: notes.trim() || undefined,
    });
  };

  const handleClockOut = () => {
    if (!employeeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    createStaffMutation.mutate({
      name: employeeName.trim(),
      date: now.toLocaleDateString(),
      timeOut: now.toLocaleTimeString(),
      notes: notes.trim() || undefined,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Clock</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Live Timestamp */}
          <div className="text-center">
            <div className="text-2xl font-mono font-semibold text-gray-900">
              {currentTime}
            </div>
            <div className="text-sm text-gray-500">
              {currentDate}
            </div>
          </div>

          {/* Employee Name */}
          <div>
            <Label htmlFor="employeeName">Your Name</Label>
            <Input
              id="employeeName"
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="Enter your full name or select from list below"
              className="mt-2"
            />
          </div>

          {/* Staff Names List */}
          {staffNames.length > 0 && (
            <div>
              <Label className="text-sm font-medium">
                Quick Select Staff/Tour Guides
              </Label>
              <ScrollArea className="h-24 w-full border rounded-md p-2 mt-2">
                <div className="space-y-1">
                  {staffNames.map((name: string) => (
                    <Button
                      key={name}
                      variant="ghost"
                      className="w-full justify-start text-left text-sm p-2"
                      onClick={() => setEmployeeName(name)}
                    >
                      {name}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Clock In/Out Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleClockIn}
              disabled={createStaffMutation.isPending}
              className="bg-brand-green hover:bg-green-600 text-white py-4 font-medium"
            >
              Clock In
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={createStaffMutation.isPending}
              className="bg-brand-red hover:bg-red-600 text-white py-4 font-medium"
            >
              Clock Out
            </Button>
          </div>

          {/* Notes Field */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <div className="relative mt-2">
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="pr-12 focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
                placeholder="Add any notes about your shift, or click the microphone to speak..."
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute right-2 top-2 h-8 w-8 p-0 ${
                  isListening ? "text-red-500" : "text-gray-400 hover:text-brand-purple"
                }`}
                onClick={startSpeechRecognition}
                disabled={isListening}
                title={isListening ? "Listening..." : "Click to speak"}
              >
                <Mic size={16} className={isListening ? "animate-pulse" : ""} />
              </Button>
            </div>
            {isListening && (
              <p className="text-sm text-red-500 mt-1">🎤 Listening... Speak now!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}