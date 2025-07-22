import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface GuestRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const visitPurposes = [
  { value: "wedding", label: "Wedding Tour" },
  { value: "historic", label: "Historic Tour" },
  { value: "volunteer", label: "Volunteer Interest" },
  { value: "donation", label: "Making Donation" },
  { value: "other", label: "Other" },
];

const tourGuides = [
  { value: "sarah", label: "Sarah Johnson" },
  { value: "mike", label: "Mike Chen" },
  { value: "emily", label: "Emily Davis" },
];

export default function GuestRegistrationModal({ isOpen, onClose }: GuestRegistrationModalProps) {
  const [visitPurpose, setVisitPurpose] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [joinNewsletter, setJoinNewsletter] = useState(false);
  const [brideName, setBrideName] = useState("");
  const [groomName, setGroomName] = useState("");
  const [weddingEmail, setWeddingEmail] = useState("");
  const [tourGuide, setTourGuide] = useState("");
  const { toast } = useToast();

  const createGuestMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      reason: string;
      joinNewsletter: boolean;
      brideName?: string;
      groomName?: string;
      tourGuide?: string;
      date: string;
    }) => {
      const response = await apiRequest("POST", "/api/guest", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Submission received. Thank you!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guest"] });
      resetForm();
      setTimeout(() => onClose(), 2000);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setVisitPurpose("");
    setFullName("");
    setEmail("");
    setJoinNewsletter(false);
    setBrideName("");
    setGroomName("");
    setWeddingEmail("");
    setTourGuide("");
  };

  const handleSubmit = () => {
    if (!visitPurpose) {
      toast({
        title: "Error",
        description: "Please select a purpose of visit.",
        variant: "destructive",
      });
      return;
    }

    if (visitPurpose === "wedding") {
      if (!brideName.trim() || !groomName.trim() || !weddingEmail.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all wedding tour fields.",
          variant: "destructive",
        });
        return;
      }

      createGuestMutation.mutate({
        name: `${brideName.trim()} & ${groomName.trim()}`,
        email: weddingEmail.trim(),
        reason: visitPurpose,
        joinNewsletter: false,
        brideName: brideName.trim(),
        groomName: groomName.trim(),
        tourGuide: tourGuide || undefined,
        date: new Date().toLocaleDateString(),
      });
    } else {
      if (!fullName.trim() || !email.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      createGuestMutation.mutate({
        name: fullName.trim(),
        email: email.trim(),
        reason: visitPurpose,
        joinNewsletter,
        date: new Date().toLocaleDateString(),
      });
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Guest Registration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Purpose of Visit */}
          <div>
            <Label htmlFor="visitPurpose">Purpose of Visit</Label>
            <Select value={visitPurpose} onValueChange={setVisitPurpose}>
              <SelectTrigger className="mt-2 focus:ring-2 focus:ring-brand-green">
                <SelectValue placeholder="Select purpose..." />
              </SelectTrigger>
              <SelectContent>
                {visitPurposes.map((purpose) => (
                  <SelectItem key={purpose.value} value={purpose.value}>
                    {purpose.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Wedding Tour Fields */}
          {visitPurpose === "wedding" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="brideName">Bride's Name</Label>
                <input
                  id="brideName"
                  type="text"
                  value={brideName}
                  onChange={(e) => setBrideName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green mt-2"
                />
              </div>
              <div>
                <Label htmlFor="groomName">Groom's Name</Label>
                <input
                  id="groomName"
                  type="text"
                  value={groomName}
                  onChange={(e) => setGroomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green mt-2"
                />
              </div>
              <div>
                <Label htmlFor="weddingEmail">Email Address</Label>
                <input
                  id="weddingEmail"
                  type="email"
                  value={weddingEmail}
                  onChange={(e) => setWeddingEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green mt-2"
                />
              </div>
              <div>
                <Label htmlFor="tourGuide">Scheduled Tour Guide</Label>
                <Select value={tourGuide} onValueChange={setTourGuide}>
                  <SelectTrigger className="mt-2 focus:ring-2 focus:ring-brand-green">
                    <SelectValue placeholder="Select guide..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tourGuides.map((guide) => (
                      <SelectItem key={guide.value} value={guide.value}>
                        {guide.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* General Fields */}
          {visitPurpose && visitPurpose !== "wedding" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green mt-2"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-brand-green mt-2"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="joinNewsletter"
                  checked={joinNewsletter}
                  onCheckedChange={(checked) => setJoinNewsletter(checked as boolean)}
                />
                <Label htmlFor="joinNewsletter" className="text-sm">
                  Join Newsletter
                </Label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={createGuestMutation.isPending || !visitPurpose}
            className="w-full bg-brand-green hover:bg-green-600 text-white font-medium py-3"
          >
            {createGuestMutation.isPending ? "Registering..." : "Register Guest"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}