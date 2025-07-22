import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Star, Hammer, UserPlus, Clock, Settings, ChevronRight, Users } from "lucide-react";
import VolunteerCheckinModal from "../components/modals/volunteer-checkin-modal";
import GuestRegistrationModal from "../components/modals/guest-registration-modal";
import EmployeeClockModal from "../components/modals/employee-clock-modal";
import ManageDataModal from "../components/modals/manage-data-modal";

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const navigationCards = [
    {
      id: "volunteer",
      title: "Volunteer Check-In",
      subtitle: "Sign in and out volunteers",
      icon: Hammer,
      color: "bg-brand-blue",
      hoverColor: "hover:shadow-lg hover:shadow-blue-100",
    },
    {
      id: "guest",
      title: "Guest Registration",
      subtitle: "Register new guests",
      icon: UserPlus,
      color: "bg-brand-green",
      hoverColor: "hover:shadow-lg hover:shadow-green-100",
    },
    {
      id: "employee",
      title: "Employee Clock",
      subtitle: "Time tracking for staff",
      icon: Clock,
      color: "bg-brand-purple",
      hoverColor: "hover:shadow-lg hover:shadow-purple-100",
    },
    {
      id: "manage",
      title: "Manage & Data",
      subtitle: "Manage people and view data",
      icon: Settings,
      color: "bg-brand-red",
      hoverColor: "hover:shadow-lg hover:shadow-red-100",
    },
  ];

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Check-In Dashboard</h1>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center shadow-lg">
              <Star className="text-white text-2xl" size={32} fill="currentColor" />
            </div>
          </div>
          <h2 className="text-lg font-medium text-gray-700 mb-2">Check into the North Star House!</h2>
          <p className="text-sm text-gray-500">Quick access to all check-in features</p>
        </div>

        {/* Navigation Cards */}
        <div className="space-y-4">
          {navigationCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card
                key={card.id}
                className={`p-4 cursor-pointer transition-all duration-200 ${card.hoverColor} border border-gray-200 shadow-sm hover:shadow-md`}
                onClick={() => openModal(card.id)}
                role="button"
                tabIndex={0}
                aria-label={`Open ${card.title.toLowerCase()}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal(card.id);
                  }
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${card.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="text-white text-lg" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.subtitle}</p>
                  </div>
                  <ChevronRight className="text-gray-400" size={20} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <VolunteerCheckinModal 
        isOpen={activeModal === "volunteer"} 
        onClose={closeModal} 
      />
      <GuestRegistrationModal 
        isOpen={activeModal === "guest"} 
        onClose={closeModal} 
      />
      <EmployeeClockModal 
        isOpen={activeModal === "employee"} 
        onClose={closeModal} 
      />
      <ManageDataModal 
        isOpen={activeModal === "manage"} 
        onClose={closeModal} 
      />
    </div>
  );
}
