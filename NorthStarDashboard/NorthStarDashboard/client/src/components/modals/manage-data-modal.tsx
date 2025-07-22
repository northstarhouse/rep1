import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, Clock, Download, BarChart3, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ManageDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Person {
  id: number;
  name: string;
  email?: string;
  type: 'volunteer' | 'guest' | 'staff';
  area?: string;
  reason?: string;
  date: string;
  timeIn?: string;
  timeOut?: string;
}

interface Stats {
  volunteers: number;
  guests: number;
  hours: number;
}

export default function ManageDataModal({ isOpen, onClose }: ManageDataModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch people data
  const { data: people = [], isLoading: peopleLoading } = useQuery<Person[]>({
    queryKey: ["/api/people"],
    enabled: isOpen,
  });

  // Fetch statistics
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: isOpen,
  });

  // Delete person mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      await apiRequest("DELETE", `/api/people/${type}/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Person deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/people"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete person.",
        variant: "destructive",
      });
    },
  });

  const filteredPeople = people.filter(person =>
    person.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (person: Person) => {
    if (confirm(`Are you sure you want to delete ${person.name}?`)) {
      deleteMutation.mutate({ type: person.type, id: person.id });
    }
  };

  const handleEdit = (person: Person) => {
    toast({
      title: "Edit Feature",
      description: "Edit functionality would be implemented here.",
    });
  };

  const handleExport = (dataType: string) => {
    // Simulate CSV export
    toast({
      title: "Export Started",
      description: `Exporting ${dataType} data as CSV...`,
    });
  };

  const getPersonTypeBadge = (type: string) => {
    const configs = {
      volunteer: { label: "Volunteer", className: "bg-blue-100 text-blue-800" },
      guest: { label: "Guest", className: "bg-green-100 text-green-800" },
      staff: { label: "Staff", className: "bg-purple-100 text-purple-800" },
    };
    
    const config = configs[type as keyof typeof configs] || configs.guest;
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getLastActivity = (person: Person) => {
    const date = new Date(person.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "1 day ago";
    return `${diffDays - 1} days ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage & Data</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="people" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="people">People List</TabsTrigger>
            <TabsTrigger value="reporting">Reporting Dashboard</TabsTrigger>
            <TabsTrigger value="exports">Data Exports</TabsTrigger>
          </TabsList>

          {/* People List Tab */}
          <TabsContent value="people" className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-medium text-gray-900">People Directory</h4>
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 focus:ring-2 focus:ring-brand-red"
              />
            </div>

            {peopleLoading ? (
              <div className="text-center py-8">Loading people...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPeople.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          {searchQuery ? "No people found matching your search." : "No people registered yet."}
                        </td>
                      </tr>
                    ) : (
                      filteredPeople.map((person) => (
                        <tr key={`${person.type}-${person.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {person.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getPersonTypeBadge(person.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {person.email || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getLastActivity(person)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(person)}
                              className="text-brand-red hover:text-red-700"
                            >
                              <Edit size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(person)}
                              className="text-gray-400 hover:text-gray-600"
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          {/* Reporting Dashboard Tab */}
          <TabsContent value="reporting" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="text-brand-blue text-2xl" size={32} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Total Volunteers</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.volunteers || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserPlus className="text-brand-green text-2xl" size={32} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Guests This Month</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.guests || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="text-brand-purple text-2xl" size={32} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Hours Logged</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.hours || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Activity Overview</h4>
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <BarChart3 className="text-4xl text-gray-400 mb-4 mx-auto" size={64} />
                <p className="text-gray-600">Chart visualization would be implemented here</p>
                <p className="text-sm text-gray-500 mt-2">Using Chart.js or similar library</p>
              </div>
            </div>
          </TabsContent>

          {/* Data Exports Tab */}
          <TabsContent value="exports" className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">Export Data</h4>
              <p className="text-gray-600">Download CSV files of your data sheets.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => handleExport("volunteers")}
                className="p-4 h-auto flex flex-col items-start space-y-2 hover:border-brand-red hover:bg-red-50"
              >
                <Download className="text-brand-red" size={24} />
                <div className="text-left">
                  <h5 className="font-medium text-gray-900">Volunteers</h5>
                  <p className="text-sm text-gray-600">Export volunteer check-in data</p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport("guests")}
                className="p-4 h-auto flex flex-col items-start space-y-2 hover:border-brand-red hover:bg-red-50"
              >
                <Download className="text-brand-red" size={24} />
                <div className="text-left">
                  <h5 className="font-medium text-gray-900">Guests</h5>
                  <p className="text-sm text-gray-600">Export guest registration data</p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleExport("staff")}
                className="p-4 h-auto flex flex-col items-start space-y-2 hover:border-brand-red hover:bg-red-50"
              >
                <Download className="text-brand-red" size={24} />
                <div className="text-left">
                  <h5 className="font-medium text-gray-900">Staff</h5>
                  <p className="text-sm text-gray-600">Export staff clock data</p>
                </div>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}