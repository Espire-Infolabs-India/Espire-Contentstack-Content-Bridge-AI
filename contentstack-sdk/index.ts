// contentstack-api.ts
export interface ContentstackConfig {
  apiKey: string; // Delivery/API key
  deliveryToken: string; // Delivery token
  cmaToken?: string; // CMA token for management API
  environment: string; // environment name (e.g., "staging" or "production")
}

// Fetch a single entry dynamically using config
export async function getEntry({
  contentTypeUid,
  entryUid,
  config,
}: {
  contentTypeUid: string;
  entryUid: string;
  config: ContentstackConfig;
}) {
  const url = `https://cdn.contentstack.io/v3/content_types/${contentTypeUid}/entries/${entryUid}?environment=${config.environment}`;
  const response = await fetch(url, {
    headers: {
      api_key: config.apiKey,
      access_token: config.deliveryToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching entry: ${response.statusText}`);
  }

  const data = await response.json();
  return data.entry;
}

// Fetch all content types dynamically using config
export async function getContentTypes({
  includeGlobalFieldSchema = true,
  config,
}: {
  includeGlobalFieldSchema?: boolean;
  config: ContentstackConfig;
}) {
  const url = `https://api.contentstack.io/v3/content_types/?include_global_field_schema=${includeGlobalFieldSchema}`;
  const response = await fetch(url, {
    headers: {
      api_key: config.apiKey,
      authorization: config.cmaToken || "", // CMA token required for management API
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching content types: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content_types;
}

// Recursively resolve nested entries using the dynamic config
export async function resolveNestedEntry(
  entry: any,
  config: ContentstackConfig
): Promise<any> {
  async function resolveDeep(obj: any): Promise<any> {
    if (Array.isArray(obj)) return Promise.all(obj.map(resolveDeep));

    if (obj && typeof obj === "object") {
      if (obj.uid && obj._content_type_uid) {
        try {
          const resolved = await getEntry({
            contentTypeUid: obj._content_type_uid,
            entryUid: obj.uid,
            config,
          });
          return resolveDeep(resolved);
        } catch (err) {
          console.error(
            `❌ Failed to resolve entry for ${obj._content_type_uid}/${obj.uid}:`,
            err
          );
          return obj;
        }
      }

      const resolvedObj: any = {};
      for (const key of Object.keys(obj)) {
        resolvedObj[key] = await resolveDeep(obj[key]);
      }
      return resolvedObj;
    }

    return obj;
  }

  return resolveDeep(entry);
}

// Fetch a content type and resolve nested entries dynamically
export async function getContentType(
  contentType: string,
  config: ContentstackConfig
) {
  try {
    const content_types = await getContentTypes({
      includeGlobalFieldSchema: true,
      config,
    });
    const pageContentTypes = content_types.filter(
      (ct: any) => ct.uid === contentType
    );

    const resolvedEntries = await Promise.all(
      pageContentTypes.map((entry: any) => resolveNestedEntry(entry, config))
    );

    return resolvedEntries;
  } catch (err) {
    console.error("❌ Error fetching entries:", err);
    return [];
  }
}
