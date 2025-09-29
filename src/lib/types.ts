// ====================================================================================
// Data Models (Tipos)
// Estes tipos são gerados a partir das entidades Kotlin do backend para garantir
// a consistência entre o frontend e o backend.
// ====================================================================================

// --- Tipos Base Abstratos ---

export interface AbstractEntity {
  id: number;
}

export interface AbstractFullEntity extends AbstractEntity {
  createdAt: number; // Representado como timestamp (Date.time)
  updatedAt: number; // Representado como timestamp (Date.time)
  deletedAt: number; // Representado como timestamp (Date.time)
}

export interface AbstractCodeNameEntity extends AbstractFullEntity {
  code: string;
  name: string;
}

// --- Entidades Principais ---

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  groups?: UserGroup[];
  emailVerified: boolean;
  enabled: boolean;
  sendEmail: boolean;
  createdTimestamp: number;
}

export interface Customer extends AbstractCodeNameEntity {
  companyName?: string;
  addresses?: CustomerAddress[];
  cnpj?: string;
  document?: string;
  observation?: string;
  creditLimit?: number;
  creditLimitExpiration?: number; // timestamp
  registerDate?: number; // timestamp
  foundationDate?: number; // timestamp
  region?: string;
  latitude?: number;
  longitude?: number;
  active: boolean;
  customerGroup?: UserGroup;
  contacts?: CustomerContact[];
  team?: Team;
  tags?: CustomerTag[];
}

export interface Seller extends AbstractCodeNameEntity {
  nickname?: string;
  userId?: string;
  user?: User;
  teams?: Team[];
}

export interface Team extends AbstractCodeNameEntity {
  active: boolean;
  sellers?: Seller[];
}

export interface Pipeline extends AbstractCodeNameEntity {
  active: boolean;
  team: Team;
  stages?: Stage[];
}

export interface Stage extends AbstractCodeNameEntity {
  pipeline: Pipeline;
  position: number;
  color: number; // Long
  icon?: string;
}

export type OpportunityStatus = "OPEN" | "WON" | "LOST";

export interface Opportunity extends AbstractFullEntity {
  customer: Customer;
  stage?: Stage;
  pipelineId?: number;
  status: OpportunityStatus;
  contactDate?: number; // timestamp
  items?: OpportunityItem[];
}

export interface Campaign extends AbstractCodeNameEntity {
  starts?: number; // timestamp
  ends?: number; // timestamp
  customerTags?: CustomerTag[];
  products?: Product[];
}

export interface InvoiceHeader extends AbstractFullEntity {
  invoiceKey?: string;
  invoiceKeyDate?: number; // timestamp
  customer: Customer;
  series: string;
  document: string;
  issuanceDate?: number; // timestamp
  saleTax?: number;
  netAmount?: number;
  netWeight?: number;
  grossWeight?: number;
  items?: InvoiceItem[];
}

// --- Entidades de Relacionamento e Suporte ---

export interface CustomerAddress extends AbstractAddress {
  customer: Customer;
}

export interface CustomerContact extends AbstractContact {
  customer: Customer;
}

export interface OpportunityItem extends AbstractFullEntity {
  opportunity: Opportunity;
  product: Product;
  quantity: number;
  price: number;
  discount: number;
}

export interface InvoiceItem extends AbstractFullEntity {
  invoiceHeader: InvoiceHeader;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  tax: number;
  discount: number;
}

export interface Product extends AbstractCodeNameEntity {
    // Adicionar campos da entidade Product
}

export interface CustomerTag extends AbstractCodeNameEntity {
    // Adicionar campos da entidade CustomerTag
}

export interface UserGroup {
  id: string;
  name?: string;
  path?: string;
  roles?: Role[];
  attributes?: Record<string, any>;
}

export interface Role {
  id: string;
  // Adicionar outros campos se necessário
}


// --- Tipos Abstratos Genéricos (usados acima) ---

export interface AbstractAddress extends AbstractFullEntity {
  addressType: AddressType;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zip: string;
  reference?: string;
  latitude?: number;
  longitude?: number;
}

export interface AbstractContact extends AbstractFullEntity {
  contactType: ContactType;
  contact: string;
  observation?: string;
}

export interface AddressType extends AbstractCodeNameEntity {
    // Adicionar campos da entidade AddressType
}

export interface ContactType extends AbstractCodeNameEntity {
    // Adicionar campos da entidade ContactType
}