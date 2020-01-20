export const DDP_APOLLO_SCHEMA_REQUIRED = 'DDP_APOLLO_SCHEMA_REQUIRED';
export const DDP_APOLLO_SCHEMA_AND_GATEWAY = 'DDP_APOLLO_CANNOT_COMBINE_SCHEMA_AND_GATEWAY';

export async function initSchema({
  schema,
  gateway,
}) {
  if (!schema && !gateway) {
    throw new Error(DDP_APOLLO_SCHEMA_REQUIRED);
  }

  if (schema && gateway) {
    throw new Error(DDP_APOLLO_SCHEMA_AND_GATEWAY);
  }

  if (gateway) {
    return gateway.load();
  }

  return { schema };
}
