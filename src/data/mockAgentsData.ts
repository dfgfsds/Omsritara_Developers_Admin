// src/data/mockAgentsData.ts

export interface Agent {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  status: "active" | "inactive";
  role: {
    _id: string;
    name: "agent";
  };
  createdAt: string;
  propertiesCount: number;
  enquiriesCount: number;
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

const INITIAL_AGENTS: Agent[] = [
  {
    _id: "agent_001",
    name: "Ramesh Kumar",
    email: "ramesh.agent@omsritara.com",
    mobile: "9876543210",
    password: "agent123",
    status: "active",
    role: { _id: "role_agent_01", name: "agent" },
    createdAt: "2024-01-15T09:30:00.000Z",
    propertiesCount: 4,
    enquiriesCount: 6,
    city: "Chennai",
    bio: "Senior Commercial & Luxury Villa Property Advisor with 6+ years experience in South Chennai.",
  },
  {
    _id: "agent_002",
    name: "Priya Sharma",
    email: "priya.agent@omsritara.com",
    mobile: "9845123456",
    password: "agent123",
    status: "active",
    role: { _id: "role_agent_01", name: "agent" },
    createdAt: "2024-02-10T11:00:00.000Z",
    propertiesCount: 3,
    enquiriesCount: 5,
    city: "Coimbatore",
    bio: "Specialist in gated community plots, modern duplexes, and residential investments.",
  },
  {
    _id: "agent_003",
    name: "Karthik Raja",
    email: "karthik.agent@omsritara.com",
    mobile: "9789012345",
    password: "agent123",
    status: "inactive", // Soft-deleted agent
    role: { _id: "role_agent_01", name: "agent" },
    createdAt: "2023-11-20T14:15:00.000Z",
    propertiesCount: 2,
    enquiriesCount: 2,
    city: "Madurai",
    bio: "Residential plot specialist. (Account temporarily deactivated / soft-deleted by Admin).",
  },
];

const INITIAL_PROPERTIES: AgentProperty[] = [
  {
    _id: "prop_ag_101",
    name: "Sri Tara Grand Villa - Phase 1",
    type: "Villa",
    price: "₹ 1.25 Cr",
    location: "OMR, Navalur, Chennai",
    status: "available",
    agentId: "agent_001",
    agentName: "Ramesh Kumar",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    createdAt: "2024-02-01T10:00:00.000Z",
  },
  {
    _id: "prop_ag_102",
    name: "Tara Sapphire Elegance 3BHK",
    type: "Apartment",
    price: "₹ 82 Lakhs",
    location: "Perungudi, Chennai",
    status: "available",
    agentId: "agent_001",
    agentName: "Ramesh Kumar",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
    createdAt: "2024-02-15T12:00:00.000Z",
  },
  {
    _id: "prop_ag_103",
    name: "Greenfield Commercial Hub",
    type: "Commercial",
    price: "₹ 2.40 Cr",
    location: "Guindy Tech Park, Chennai",
    status: "under_construction",
    agentId: "agent_001",
    agentName: "Ramesh Kumar",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    createdAt: "2024-03-01T08:30:00.000Z",
  },
  {
    _id: "prop_ag_104",
    name: "Coastal Breeze Premium Penthouse",
    type: "Penthouse",
    price: "₹ 1.85 Cr",
    location: "ECR, Palavakkam, Chennai",
    status: "sold",
    agentId: "agent_001",
    agentName: "Ramesh Kumar",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    createdAt: "2024-01-20T16:00:00.000Z",
  },
  {
    _id: "prop_ag_201",
    name: "Tara Royal Meadows Gated Plots",
    type: "Plot",
    price: "₹ 45 Lakhs",
    location: "Avinashi Road, Coimbatore",
    status: "available",
    agentId: "agent_002",
    agentName: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    createdAt: "2024-02-18T10:00:00.000Z",
  },
  {
    _id: "prop_ag_202",
    name: "Hillview Luxury Duplex 4BHK",
    type: "Villa",
    price: "₹ 1.40 Cr",
    location: "Saravanampatti, Coimbatore",
    status: "under_construction",
    agentId: "agent_002",
    agentName: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80",
    createdAt: "2024-03-05T14:30:00.000Z",
  },
  {
    _id: "prop_ag_203",
    name: "Orchid Heights Garden Flat",
    type: "Apartment",
    price: "₹ 65 Lakhs",
    location: "RS Puram, Coimbatore",
    status: "sold",
    agentId: "agent_002",
    agentName: "Priya Sharma",
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=600&q=80",
    createdAt: "2024-01-10T11:20:00.000Z",
  },
  {
    _id: "prop_ag_301",
    name: "Meenakshi Heritage Plots",
    type: "Plot",
    price: "₹ 38 Lakhs",
    location: "KK Nagar, Madurai",
    status: "available",
    agentId: "agent_003",
    agentName: "Karthik Raja",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80",
    createdAt: "2023-12-05T09:00:00.000Z",
  },
  {
    _id: "prop_ag_302",
    name: "Temple City Comfort Villas",
    type: "Villa",
    price: "₹ 75 Lakhs",
    location: "Pasumalai, Madurai",
    status: "sold",
    agentId: "agent_003",
    agentName: "Karthik Raja",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    createdAt: "2023-12-15T15:00:00.000Z",
  },
];

const INITIAL_ENQUIRIES: AgentEnquiry[] = [
  {
    _id: "enq_ag_001",
    name: "Muthu Kumaran",
    email: "muthu.k@gmail.com",
    mobile: "9443123456",
    propertyName: "Sri Tara Grand Villa - Phase 1",
    propertyId: "prop_ag_101",
    status: "In Progress",
    priority: "High",
    createdAt: "2024-03-20T10:15:00.000Z",
    message: "Interested in the 4BHK layout and corner plot options. Can I arrange a site visit this weekend?",
    agentId: "agent_001",
  },
  {
    _id: "enq_ag_002",
    name: "Anand Natarajan",
    email: "anand.nat@yahoo.com",
    mobile: "9840987654",
    propertyName: "Tara Sapphire Elegance 3BHK",
    propertyId: "prop_ag_102",
    status: "New",
    priority: "Medium",
    createdAt: "2024-03-22T14:30:00.000Z",
    message: "Looking for an apartment ready to move in Perungudi with 2 covered car parks.",
    agentId: "agent_001",
  },
  {
    _id: "enq_ag_003",
    name: "Deepak S",
    email: "deepak.tech@rediffmail.com",
    mobile: "9790112233",
    propertyName: "Greenfield Commercial Hub",
    propertyId: "prop_ag_103",
    status: "New",
    priority: "High",
    createdAt: "2024-03-21T16:00:00.000Z",
    message: "Need 2500 sq ft office space on 3rd floor. Please send floor plan and price breakdown.",
    agentId: "agent_001",
  },
  {
    _id: "enq_ag_004",
    name: "Suresh Babu",
    email: "suresh.b@gmail.com",
    mobile: "9841223344",
    propertyName: "Sri Tara Grand Villa - Phase 1",
    propertyId: "prop_ag_101",
    status: "Closed",
    priority: "Low",
    createdAt: "2024-02-14T09:00:00.000Z",
    message: "Requested brochure. Site visit completed, client deferred purchase to Q3.",
    agentId: "agent_001",
  },
  {
    _id: "enq_ag_005",
    name: "Kavitha R",
    email: "kavitha.r@gmail.com",
    mobile: "9488334455",
    propertyName: "Tara Royal Meadows Gated Plots",
    propertyId: "prop_ag_201",
    status: "In Progress",
    priority: "High",
    createdAt: "2024-03-19T11:45:00.000Z",
    message: "Looking for East-facing 1800 sq ft residential plot with DTCP approval.",
    agentId: "agent_002",
  },
  {
    _id: "enq_ag_006",
    name: "Balaji V",
    email: "balaji.v@outlook.com",
    mobile: "9600123456",
    propertyName: "Hillview Luxury Duplex 4BHK",
    propertyId: "prop_ag_202",
    status: "New",
    priority: "Medium",
    createdAt: "2024-03-21T18:20:00.000Z",
    message: "Kindly share the construction schedule, bank loan approval tie-ups, and handover date.",
    agentId: "agent_002",
  },
  {
    _id: "enq_ag_007",
    name: "Vigneshwaran P",
    email: "vicky.p@gmail.com",
    mobile: "9894001122",
    propertyName: "Meenakshi Heritage Plots",
    propertyId: "prop_ag_301",
    status: "Closed",
    priority: "Low",
    createdAt: "2024-01-10T12:00:00.000Z",
    message: "Enquired about plot 14. Deal closed and registered.",
    agentId: "agent_003",
  },
];

const AGENTS_STORAGE_KEY = "ost_mock_agents_v1";
const PROPERTIES_STORAGE_KEY = "ost_mock_agent_properties_v1";
const ENQUIRIES_STORAGE_KEY = "ost_mock_agent_enquiries_v1";

// Helpers
export const getStoredAgents = (): Agent[] => {
  try {
    const raw = localStorage.getItem(AGENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(INITIAL_AGENTS));
      return INITIAL_AGENTS;
    }
    const parsed: Agent[] = JSON.parse(raw);
    let updated = false;
    parsed.forEach((ag) => {
      if (!ag.password) {
        ag.password = "agent123";
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_AGENTS;
  }
};

export const saveStoredAgents = (agents: Agent[]): void => {
  try {
    localStorage.setItem(AGENTS_STORAGE_KEY, JSON.stringify(agents));
  } catch (e) {
    console.error("Failed to save agents to localStorage", e);
  }
};

export const addStoredAgent = (newAgentData: {
  name: string;
  email: string;
  mobile: string;
  password?: string;
  city?: string;
  bio?: string;
}): Agent => {
  const agents = getStoredAgents();
  const newAgent: Agent = {
    _id: `agent_${Date.now()}`,
    name: newAgentData.name.trim(),
    email: newAgentData.email.trim().toLowerCase(),
    mobile: newAgentData.mobile.trim(),
    password: newAgentData.password?.trim() || "agent123",
    status: "active",
    role: { _id: "role_agent_01", name: "agent" },
    createdAt: new Date().toISOString(),
    propertiesCount: 0,
    enquiriesCount: 0,
    city: newAgentData.city || "Tamil Nadu",
    bio: newAgentData.bio || "Real Estate Advisor at OST Developers.",
  };

  const updated = [newAgent, ...agents];
  saveStoredAgents(updated);
  return newAgent;
};

export const updateStoredAgent = (
  id: string,
  updates: Partial<Pick<Agent, "name" | "email" | "mobile" | "password" | "status" | "city" | "bio">>
): Agent | null => {
  const agents = getStoredAgents();
  const index = agents.findIndex((a) => a._id === id);
  if (index === -1) return null;

  const current = agents[index];
  const updatedAgent: Agent = {
    ...current,
    ...updates,
    name: updates.name ? updates.name.trim() : current.name,
    email: updates.email ? updates.email.trim().toLowerCase() : current.email,
    mobile: updates.mobile ? updates.mobile.trim() : current.mobile,
  };

  agents[index] = updatedAgent;
  saveStoredAgents(agents);
  return updatedAgent;
};

export const softDeleteStoredAgent = (id: string): Agent | null => {
  // Soft delete sets status to 'inactive'
  return updateStoredAgent(id, { status: "inactive" });
};

export const restoreStoredAgent = (id: string): Agent | null => {
  // Restore sets status to 'active'
  return updateStoredAgent(id, { status: "active" });
};

// Properties helpers
export const getStoredProperties = (): AgentProperty[] => {
  try {
    const raw = localStorage.getItem(PROPERTIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROPERTIES_STORAGE_KEY, JSON.stringify(INITIAL_PROPERTIES));
      return INITIAL_PROPERTIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROPERTIES;
  }
};

export const getAgentProperties = (agentId: string): AgentProperty[] => {
  const props = getStoredProperties();
  return props.filter((p) => p.agentId === agentId);
};

// Enquiries helpers
export const getStoredEnquiries = (): AgentEnquiry[] => {
  try {
    const raw = localStorage.getItem(ENQUIRIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(INITIAL_ENQUIRIES));
      return INITIAL_ENQUIRIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ENQUIRIES;
  }
};

export const getAgentEnquiries = (agentId: string): AgentEnquiry[] => {
  const enqs = getStoredEnquiries();
  return enqs.filter((e) => e.agentId === agentId);
};

export const updateAgentEnquiryStatus = (
  id: string,
  status: "New" | "In Progress" | "Closed"
): void => {
  const enqs = getStoredEnquiries();
  const idx = enqs.findIndex((e) => e._id === id);
  if (idx !== -1) {
    enqs[idx].status = status;
    try {
      localStorage.setItem(ENQUIRIES_STORAGE_KEY, JSON.stringify(enqs));
    } catch (e) {
      console.error(e);
    }
  }
};
