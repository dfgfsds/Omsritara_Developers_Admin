import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash2, Eye, MapPin, Ruler, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axiosInstance";
import Select from "react-select";
import axios from "axios";


const Properties = () => {

  const propertyStatusCycle: Record<string, string> = {
    available: "sold",
    sold: "under_construction",
    under_construction: "available",
  };
  const [properties, setProperties] = useState<any[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "",
    },
    area_size: "",
    price: "",
    image_url: [],
    mape_url: "",
    media_url: "",
    amenities: [],
    status: "available",
    owner_name: "",
    pincode: ""
  });


  const { toast } = useToast();
  const [propertyTypes, setPropertyTypes] = useState<any[]>([]);
  const [amenitiesList, setAmenitiesList] = useState<any[]>([]);


  const fetchPropertyTypes = async () => {
    try {
      const res = await axiosInstance.get("/type/property/");
      setPropertyTypes(res.data?.result || []); // adjust based on API response
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch property types",
        variant: "destructive",
      });
    }
  };

  const fetchAmenities = async () => {
    try {
      const res = await axiosInstance.get("/amenities/"); // adjust endpoint if different
      setAmenitiesList(res.data?.result || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch amenities",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await axiosInstance.get("/property");
      setProperties(res.data?.result || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const propertyData = {
      ...formData,
      area_size: parseInt(formData.area_size),
      price: parseFloat(formData.price),
      image_url: formData.image_url,
      amenities: formData.amenities,
    };

    try {
      if (editingProperty) {
        // Update
        await axiosInstance.put(`/property/${editingProperty._id}`, propertyData);
        toast({ title: "Updated", description: "Property updated successfully" });
      } else {
        // Create
        await axiosInstance.post(`/property`, propertyData);
        toast({ title: "Created", description: "Property created successfully" });
      }
      setIsDialogOpen(false);
      setEditingProperty(null);
      fetchProperties(); // refresh list
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while saving property",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (property: any) => {
    setEditingProperty(property);

    setFormData({
      name: property.name,
      type: property.type?._id,
      description: property.description || "",
      location: {
        address: property.location.address,
        city: property.location.city,
        state: property.location.state,
        country: property.location.country,
      },
      area_size: property.area_size.toString(),
      price: property.price.toString(),
      image_url: Array.isArray(property.image_url) ? property.image_url : [],
      mape_url: property?.mape_url || "",
      media_url: property.media_url || "",
      amenities: property.amenities?.map((ame: any) => ame?._id) || [],
      status: property.status,
      owner_name: property.owner_name || "",
      pincode: property.pincode || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this property?");
    if (!confirmDelete) return;

    try {
      await axiosInstance.delete(`/property/${id}`);
      toast({ title: "Deleted", description: "Property deleted successfully" });
      fetchProperties();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const handleStatusClick = async (id: string, currentStatus: string) => {
    const newStatus =
      propertyStatusCycle[currentStatus.toLowerCase()] || "available";

    // update UI immediately
    setProperties((prev) =>
      prev.map((p) =>
        p._id === id ? { ...p, status: newStatus } : p
      )
    );

    // update backend
    try {
      await axiosInstance.put(`/property/${id}`, { status: newStatus });
      toast({ title: "Updated", description: `Status changed to ${newStatus}` });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-success text-success-foreground";
      case "sold":
        return "bg-secondary text-secondary-foreground";
      case "under_construction":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const options = amenitiesList.map((a: any) => ({
    value: a._id,
    label: a.name,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-card-header">Properties</h1>
          <p className="text-muted-foreground">Manage your property portfolio</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 shadow-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl bg-card max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-card-header">
                {editingProperty ? "Edit Property" : "Add New Property"}
              </DialogTitle>
            </DialogHeader>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                  required
                  className="border rounded px-2 py-2 w-full"
                >
                  <option value="">Select Property Type</option>
                  {propertyTypes.map((type: any) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Area Size (sq.ft)</Label>
                  <Input
                    placeholder="Area Size (sq.ft)"
                    type="number"
                    value={formData.area_size}
                    onChange={(e) => setFormData((p) => ({ ...p, area_size: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    placeholder="Price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    required
                  />
                </div>


              </div>
              {/* Location Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.location.address}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        location: { ...p.location, address: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        location: { ...p.location, city: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.location.state}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        location: { ...p.location, state: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    value={formData.location.country}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        location: { ...p.location, country: e.target.value },
                      }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={formData.pincode}
                  onChange={(e) => setFormData((p) => ({ ...p, pincode: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Map URL</Label>
                <Input
                  value={formData.mape_url}
                  onChange={(e) => setFormData((p) => ({ ...p, mape_url: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Media URL</Label>
                <Input
                  value={formData.media_url}
                  onChange={(e) => setFormData((p) => ({ ...p, media_url: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Amenities</label>
                <Select
                  isMulti
                  options={options}
                  value={options.filter((opt) => formData.amenities.includes(opt.value))}
                  onChange={(selected: any) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      amenities: selected.map((opt: any) => opt.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label>Images</Label>
                <Input
                  type="file"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files) return;

                    const previews: string[] = [];

                    // Add local previews first
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i];
                      const localUrl = URL.createObjectURL(file);
                      previews.push(localUrl);

                      // Update state immediately for preview
                      setFormData((prev: any) => ({
                        ...prev,
                        image_url: [...(prev.image_url || []), localUrl],
                      }));

                      // Upload to server
                      const formDataUpload = new FormData();
                      formDataUpload.append("files", file);

                      try {
                        const res = await axios.post(
                          "https://uploads.ftdigitalsolutions.org/files/upload",
                          formDataUpload,
                          {
                            headers: { "Content-Type": "multipart/form-data" },
                          }
                        );

                        const uploadedUrl = res.data.result[0].upload_url;

                        // Replace local preview with uploaded URL
                        setFormData((prev: any) => ({
                          ...prev,
                          image_url: prev.image_url.map((img: string) =>
                            img === localUrl ? uploadedUrl : img
                          ),
                        }));
                      } catch (err) {
                        toast({
                          title: "Error",
                          description: `Failed to upload ${file.name}`,
                          variant: "destructive",
                        });
                      }
                    }
                  }}
                />

                {/* Preview images */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(formData.image_url) &&
                    formData.image_url.map((url: string, idx: number) => (
                      <div key={idx} className="relative">
                        <img
                          src={url}
                          alt={`uploaded-${idx}`}
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev: any) => ({
                              ...prev,
                              image_url: prev.image_url.filter((_: string, i: number) => i !== idx),
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </div>


              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Owner</Label>
                <Input
                  value={formData.owner_name}
                  onChange={(e) => setFormData((p) => ({ ...p, owner_name: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1 bg-gradient-primary hover:opacity-90">
                  {editingProperty ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
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
          <CardTitle className="text-xl text-card-header">All Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price & Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.name}</TableCell>
                  <TableCell>{property.type?.name}</TableCell>
                  <TableCell>
                    {property.location?.city}, {property.location?.state}
                  </TableCell>
                  <TableCell>
                    {formatPrice(property.price)} <br /> {property.area_size} sq.ft
                  </TableCell>
                  <TableCell>
                    <Badge
                      onClick={() => handleStatusClick(property._id, property.status)}
                      className={`${getStatusColor(property.status)} capitalize cursor-pointer`}
                    >
                      {property.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(property)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(property._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div >
  );
};

export default Properties;
