import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Phone, Mail, Calendar, Search, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "@/hooks/use-toast";


const Enquiries = () => {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Define cycles
  const statusCycle: Record<string, string> = {
    New: "In Progress",
    "In Progress": "Closed",
    Closed: "New",
  };

  const priorityCycle: Record<string, string> = {
    Low: "Medium",
    Medium: "High",
    High: "Low",
  };


  const fetchEnquiries = async () => {
    try {
      const res = await axiosInstance.get('/enquiry');
      if (res.data?.result) {
        // Map API response to match your UI structure
        const formatted = res.data.result.map((item: any) => ({
          id: item._id,
          name: item.name,
          email: item.email,
          mobile: item.mobile,
          propertyId: item.property?.[0]?._id || "-",
          propertyName: item.property?.[0]?.name || "-",
          message: item.property?.[0]?.description || "No message",
          status: formatStatus(item.status),
          priority: formatPriority(item.priority),
          source: "API", // you can replace if API sends this
          createdAt: item.createdAt,
          followUpDate: item.followUpDate || null,
        }));
        setEnquiries(formatted);
      }
    } catch (error) {
      console.error("Error fetching enquiries:", error);
    }
  };
  // Fetch enquiries from API
  useEffect(() => {


    fetchEnquiries();
  }, []);

  // Handler for updating status
  const handleStatusClick = async (id: string, currentStatus: string) => {
    const newStatus = statusCycle[currentStatus] || "New";

    // Update UI instantly
    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: newStatus } : e
      )
    );

    // Optionally call API to update in backend
    try {
      await axiosInstance.put(`/enquiry/${id}`, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };


  // Handler for updating priority
  const handlePriorityClick = async (id: string, currentPriority: string) => {
    const newPriority = priorityCycle[currentPriority] || "Low";

    setEnquiries((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, priority: newPriority } : e
      )
    );

    try {
      await axiosInstance.put(`/enquiry/${id}`, { priority: newPriority });
    } catch (error) {
      console.error("Error updating priority:", error);
    }
  };


  const handleDeleteEnquiry = async (enquiryId: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      const res = await axiosInstance.delete(`/enquiry/${enquiryId}`);
      // Remove the deleted enquiry from state
      fetchEnquiries()
      toast({
        title: "Enquiry Delete successfully!",
        description: res?.data.msg || "Something went wrong!",

      });
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      toast({
        title: "Faild to delete!",
        description: error?.response?.data.msg || "Something went wrong!",
        variant: "destructive",
      });
    }
  };


  // Helper to normalize status
  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "New";
      case "progress":
        return "In Progress";
      case "closed":
        return "Closed";
      default:
        return "Unknown";
    }
  };

  // Helper to normalize priority
  const formatPriority = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "High";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Unknown";
    }
  };

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.propertyName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || enquiry.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewEnquiry = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-accent text-accent-foreground";
      case "In Progress":
        return "bg-warning text-warning-foreground";
      case "Closed":
        return "bg-success text-success-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-destructive text-destructive-foreground";
      case "Medium":
        return "bg-warning text-warning-foreground";
      case "Low":
        return "bg-success text-success-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* --- Filters --- */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-header">Enquiries</h1>
          <p className="text-muted-foreground">
            View and manage all property enquiries from potential clients
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search enquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* --- Table --- */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-card-header">
              All Enquiries
            </CardTitle>
            <Badge variant="outline" className="bg-muted/50">
              {filteredEnquiries.length} Total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact Details</TableHead>
                <TableHead>Property Interest</TableHead>
                <TableHead>Status & Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[80px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-card-header">
                        {enquiry.name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {enquiry.email}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {enquiry.mobile}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-card-header">
                        {enquiry.propertyName}
                      </div>
                      {/* <div className="text-sm text-muted-foreground">
                        ID: {enquiry.propertyId}
                      </div> */}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge
                        onClick={() => handleStatusClick(enquiry.id, enquiry.status)}
                        className={`${getStatusColor(enquiry.status)} text-xs px-2 py-1 mx-1 cursor-pointer`}
                      >
                        {enquiry.status}
                      </Badge>
                      <Badge
                        onClick={() => handlePriorityClick(enquiry.id, enquiry.priority)}
                        className={`text-xs px-2 py-1 cursor-pointer`}
                      >
                        {enquiry.priority}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(enquiry.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewEnquiry(enquiry)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteEnquiry(enquiry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- View Enquiry Modal --- */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-card-header">
              Enquiry Details
            </DialogTitle>
          </DialogHeader>
          {selectedEnquiry && (
            <div className="space-y-6">
              {/* Left side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p>Name: {selectedEnquiry.name}</p>
                  <p>Email: {selectedEnquiry.email}</p>
                  <p>Phone: {selectedEnquiry.mobile}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Property</h3>
                  <p>{selectedEnquiry.propertyName}</p>
                  <p>ID: {selectedEnquiry.propertyId}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Message</h3>
                <div className="bg-muted/50 p-3 rounded">
                  {selectedEnquiry.message}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enquiries;
