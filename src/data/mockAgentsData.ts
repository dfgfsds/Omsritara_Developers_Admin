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

const INITIAL_AGENTS: Agent[] = [];

const INITIAL_PROPERTIES: AgentProperty[] = [];

const INITIAL_ENQUIRIES: AgentEnquiry[] = [];

const AGENTS_STORAGE_KEY = "ost_mock_agents_v2";
const PROPERTIES_STORAGE_KEY = "ost_mock_agent_properties_v2";
const ENQUIRIES_STORAGE_KEY = "ost_mock_agent_enquiries_v2";

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
