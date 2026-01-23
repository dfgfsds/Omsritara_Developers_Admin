import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axiosInstance";


const PropertyTypes = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ Fetch all property types
  const { data: propertyTypes, isLoading } = useQuery({
    queryKey: ["property-types"],
    queryFn: async () => {
      const res = await axiosInstance.get(`/type/property`);
      return res.data;
    },
  });

  // ✅ Create mutation
  const createMutation = useMutation({
    mutationFn: async (newType: { name: string; description: string }) => {
      return axiosInstance.post(`/type/property`, newType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["property-types"] as any);
      toast({ title: "Property Type Created", description: "Created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // ✅ Update mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedType: any) => {
      return axiosInstance.put(`/type/property/${updatedType.id}`, { name: updatedType?.name, description: updatedType?.description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["property-types"] as any);
      toast({ title: "Property Type Updated", description: "Updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/type/property/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["property-types"] as any);
      toast({ title: "Property Type Deleted", description: "Deleted successfully" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateMutation.mutate({ id: editingType._id, name: formData?.name, description: formData?.description });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (type: any) => {
    setEditingType(type);
    setFormData({ name: type.name, description: type.description });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this amenity?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingType(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-header">Property Types</h1>
          <p className="text-muted-foreground">Manage property types</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Property Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-card">
            <DialogHeader>
              <DialogTitle>
                {editingType ? "Edit Property Type" : "Add New Property Type"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90 shadow-primary">
                  {editingType ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>All Property Types</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertyTypes?.result?.map((type: any) => (
                  <TableRow key={type.id}>
                    <TableCell>{type.name}</TableCell>
                    <TableCell>{type.description}</TableCell>
                    {/* <TableCell>
                      <Badge
                        className={
                          type.status === "Active"
                            ? "bg-success text-success-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {type.status}
                      </Badge>
                    </TableCell> */}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(type._id)}
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

export default PropertyTypes;