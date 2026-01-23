import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axiosInstance";


type Amenity = {
  id: number;
  name: string;
  description: string;
};

const Amenities = () => {
  const [amenities, setAmenities] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { toast } = useToast();

  // Fetch amenities
  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get<any>('/amenities');
      setAmenities(res.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch amenities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Submit form (create / update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAmenity) {
        // Update
        const res = await axiosInstance.put(`/amenities/${editingAmenity._id}`, formData);
        fetchAmenities()
        toast({ title: "Updated", description: "Amenity updated successfully" });
      } else {
        // Create
        const res = await axiosInstance.post('/amenities', formData);
        fetchAmenities()
        toast({ title: "Created", description: "Amenity created successfully" });
      }
      setIsDialogOpen(false);
      setEditingAmenity(null);
      setFormData({ name: "", description: "" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save amenity",
        variant: "destructive",
      });
    }
  };

  // Edit handler
  const handleEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setFormData({ name: amenity.name, description: amenity.description });
    setIsDialogOpen(true);
  };

  // Delete handler
  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this amenity?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/amenities/${id}`);
      fetchAmenities();
      toast({ title: "Deleted", description: "Amenity deleted successfully" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete amenity",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-header">Amenities</h1>
          <p className="text-muted-foreground">
            Manage amenities available across your properties
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Amenity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-card">
            <DialogHeader>
              <DialogTitle className="text-card-header">
                {editingAmenity ? "Edit Amenity" : "Add New Amenity"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Amenity Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Swimming Pool"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the amenity"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary hover:opacity-90"
                >
                  {editingAmenity ? "Update Amenity" : "Create Amenity"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-xl text-card-header">
            All Amenities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading amenities...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Amenity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {amenities?.result?.map((amenity) => (
                  <TableRow key={amenity.id}>
                    <TableCell>
                      <div className="font-medium text-card-header">
                        {amenity.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {amenity.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(amenity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(amenity._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Amenities;
