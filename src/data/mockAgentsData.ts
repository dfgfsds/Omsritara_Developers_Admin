// Agent and Portal Data Models (100% Dynamic API Entities)

export interface Agent {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  status: "active" | "inactive";
  role?: {
    _id: string;
    name: string;
  } | string;
  createdAt: string;
  propertiesCount?: number;
  enquiriesCount?: number;
  bio?: string;
  city?: string;
}

export interface AgentProperty {
  _id: string;
  name: string;
  type: string;
  price: string;
  location: string;
  status: "available" | "under_construction" | "sold";
  agentId: string;
  agentName?: string;
  image?: string;
  createdAt: string;
}

export interface AgentEnquiry {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  propertyName: string;
  propertyId: string;
  status: "New" | "In Progress" | "Closed";
  priority: "High" | "Medium" | "Low";
  createdAt: string;
  message: string;
  agentId: string;
}
