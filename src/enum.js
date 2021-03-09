/** @enum */
export const ToggleValues = {
  ON: '1',
  OFF: null,
};

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
  EXPIRED: 'expired',
  DISABLED: 'disabled',
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
  STOPPED: 'stopped',
  USAGE_LIMIT_REACHED: 'usage_limit_reached',
};
