/** @enum */
export const AgentTypes = {
  ORCHESTRATOR: 'orchestrator',
  RESELLER: 'reseller',
  TENANT: 'tenant',
  PARTNER: 'partner',
  PROVIDER: 'provider',
};

/** @enum */
export const ServerStatuses = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  NEW: 'new',
  DELETED: 'deleted',
};

/** @enum */
export const DiscountStatuses = {
  ACTIVE: 'active',
  SCHEDULED: 'scheduled',
  DELETED: 'deleted',
};

/** @enum */
export const DiscountStatusesForUser = {
  USED: 'used',
  AVAILABLE_PERSONAL: 'available_personal',
  AVAILABLE_GENERAL: 'available_general',
};

/** @enum */
export const PersonalCodeStatuses = {
  ACTIVE: 'active',
  USED: 'used',
  SUSPENDED: 'suspended',
};
