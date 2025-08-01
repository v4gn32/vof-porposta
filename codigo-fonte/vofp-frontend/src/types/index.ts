export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  cnpj?: string;
  address: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'infraestrutura' | 'helpdesk' | 'nuvem' | 'backup' | 'cabeamento' | 'outros';
  unit: string;
  createdAt: Date;
}

export interface ProposalItem {
  serviceId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Proposal {
  id: string;
  clientId: string;
  number: string;
  title: string;
  description: string;
  items: ProposalItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'rascunho' | 'enviada' | 'aprovada' | 'recusada';
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface ProposalWithDetails extends Proposal {
  client: Client;
  services: Service[];
}