import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic } from "lucide-react";

interface VolunteerCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: "firstFloor", label: "First Floor" },
  { id: "secondFloor", label: "Second Floor" },
  { id: "garden", label: "Garden" },
  { id: "maintenance", label: "Maintenance" },
];

const activityData: Record<string, string[]> = {
  firstFloor: ['Kitchen prep', 'Dining setup', 'Reception desk', 'Tour guide', 'Event coordination', 'Cleaning', 'Gift shop', 'Photography'],
  secondFloor: ['Room preparation', 'Bed making', 'Bathroom cleaning', 'Laundry', 'Maintenance check', 'Decoration', 'Window cleaning', 'Inventory'],
  garden: ['Watering plants', 'Weeding', 'Planting', 'Pruning', 'Harvesting', 'Mulching', 'Composting', 'Path maintenance'],
  maintenance: ['Painting', 'Repair work', 'Electrical', 'Plumbing', 'HVAC check', 'Carpentry', 'Groundskeeping', 'Equipment maintenance']
};

export default function VolunteerCheckinModal({ isOpen, onClose }: VolunteerCheckinModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activityDescription, setActivityDescription] = useState("");
  const [volunteerName, setVolunteerName] = useState("");
  const [activeTab, setActiveTab] = useState("new");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  // Fetch returning volunteer names
  const { data: volunteerNames = [], isLoading: loadingNames } = useQuery<string[]>({
    queryKey: ["/api/volunteer-names"],
    enabled: isOpen,
  });

  const createVolunteerMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      date: string;
      timeIn: string;
      area: string;
      activities: string;
    }) => {
      const response = await apiRequest("POST", "/api/volunteer", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Submission received. Thank you!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/volunteer"] });
      resetForm();
      setTimeout(() => onClose(), 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit volunteer check-in. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setSelectedCategory(null);
    setActivityDescription("");
    setVolunteerName("");
    setActiveTab("new");
    setIsListening(false);
  };

  const handleReturningVolunteerSelect = (name: string) => {
    setVolunteerName(name);
    setActiveTab("new");
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
      setActivityDescription(transcript);
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

  const handleSubmit = () => {
    if (!volunteerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedCategory) {
      toast({
        title: "Error",
        description: "Please select a work area.",
        variant: "destructive",
      });
      return;
    }

    if (!activityDescription.trim()) {
      toast({
        title: "Error",
        description: "Please describe what you did or plan to do.",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    createVolunteerMutation.mutate({
      name: volunteerName.trim(),
      date: now.toLocaleDateString(),
      timeIn: now.toLocaleTimeString(),
      area: selectedCategory,
      activities: activityDescription.trim(),
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Volunteer Check-In</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">New Check-In</TabsTrigger>
              <TabsTrigger value="returning">Returning Volunteers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="space-y-4">
              {/* Volunteer Name */}
              <div>
                <Label htmlFor="volunteerName">Your Name</Label>
                <Input
                  id="volunteerName"
                  type="text"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-2"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="returning" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">
                  Select Your Name
                </Label>
                <ScrollArea className="h-32 w-full border rounded-md p-2 mt-2">
                  {loadingNames ? (
                    <div className="text-center text-sm text-gray-500">Loading names...</div>
                  ) : volunteerNames.length === 0 ? (
                    <div className="text-center text-sm text-gray-500">No returning volunteers yet</div>
                  ) : (
                    <div className="space-y-1">
                      {volunteerNames.map((name: string) => (
                        <Button
                          key={name}
                          variant="ghost"
                          className="w-full justify-start text-left"
                          onClick={() => handleReturningVolunteerSelect(name)}
                        >
                          {name}
                        </Button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>

          {/* Category Buttons */}
          <div>
            <Label>Select Area</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className={`p-3 text-center transition-colors duration-200 ${
                    selectedCategory === category.id 
                      ? "bg-brand-blue hover:bg-brand-blue text-white" 
                      : "hover:border-brand-blue hover:bg-blue-50"
                  }`}
                  onClick={() => {
                    setSelectedCategory(category.id);
                  }}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Activity Description */}
          <div>
            <Label htmlFor="activityDescription">Describe what you did or plan to do</Label>
            <div className="relative mt-2">
              <Textarea
                id="activityDescription"
                value={activityDescription}
                onChange={(e) => setActivityDescription(e.target.value)}
                rows={3}
                className="pr-12 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue"
                placeholder="Type what you did or plan to do, or click the microphone to speak..."
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`absolute right-2 top-2 h-8 w-8 p-0 ${
                  isListening ? "text-red-500" : "text-gray-400 hover:text-brand-blue"
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

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={createVolunteerMutation.isPending}
            className="w-full bg-brand-blue hover:bg-blue-600 text-white font-medium py-3"
          >
            {createVolunteerMutation.isPending ? "Submitting..." : "Submit Check-In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}