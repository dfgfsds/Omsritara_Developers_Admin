import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Building2, MessageCircle, TrendingUp, Eye, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Enquiries from "./Enquiries";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";



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

const Dashboard = () => {

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [stats, setStats] = useState('' as any);
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


  // Fetch enquiries from API
  useEffect(() => {
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

    fetchEnquiries();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axiosInstance.get('/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

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


  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-card-header">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your property management system.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats?.result && (
          <>
            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Properties
                </CardTitle>
                <Building className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-header">
                  {stats.result.property}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Enquiries
                </CardTitle>
                <MessageCircle className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-header">
                  {stats.result.enquiry}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Available Properties
                </CardTitle>
                <Building2 className="h-5 w-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-header">
                  {stats.result.availablePropety}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sold Properties
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-header">
                  {stats.result.soldProperty}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Enquiries */}
      {/* Recent Enquiries */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-card-header">
            Recent Enquiries
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest enquiries from potential clients
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Status | Priority</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...enquiries].reverse().map((enquiry: any) => (
                  <TableRow key={enquiry.id}>
                    <TableCell className="font-medium">{enquiry.name}</TableCell>
                    <TableCell>{enquiry.email}</TableCell>
                    <TableCell>{enquiry.mobile}</TableCell>
                    <TableCell>{enquiry?.property?.name}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(enquiry.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;