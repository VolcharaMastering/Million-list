export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Million List API",
    version: "1.0.0",
    description: "API for items list and selection (available vs selected panels).",
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        description: "Returns service health status.",
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string", example: "ok" } },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },
    "/items": {
      get: {
        summary: "List available items",
        description:
          "Returns a page of items excluding those already selected. Used for the available (left) panel. Supports pagination, search by id, and sort order.",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Page size",
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 },
            description: "Number of items to skip",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", maxLength: 50 },
            description: "Filter by id (substring match)",
          },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"], default: "asc" },
            description: "Sort by id",
          },
        ],
        responses: {
          "200": {
            description: "Page of items",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ItemsPage" },
              },
            },
          },
          "400": {
            description: "Invalid query parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: "Add new items",
        description:
          "Creates items by id. Body is an array of ids (max 1000). Returns added ids and those that already existed.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { type: "integer", minimum: 1 },
                minItems: 1,
                maxItems: 1000,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Items created. Some ids may already have existed.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    added: {
                      type: "array",
                      items: { type: "integer" },
                      description: "Ids that were inserted",
                    },
                    alreadyExists: {
                      type: "array",
                      items: { type: "integer" },
                      description: "Ids that were already in the table",
                    },
                    invalid: {
                      type: "array",
                      description: "Request elements that were not valid ids",
                    },
                  },
                  required: ["added", "alreadyExists"],
                },
              },
            },
          },
          "400": {
            description: "Body not an array, too long, or no valid ids / all duplicates",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/items/selected/order": {
      get: {
        summary: "Get selected ids in order",
        description:
          "Returns the full list of selected ids in user-defined order (e.g. for restore on page refresh).",
        responses: {
          "200": {
            description: "Ordered list of selected ids",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    orderedIds: {
                      type: "array",
                      items: { type: "integer" },
                    },
                  },
                  required: ["orderedIds"],
                },
              },
            },
          },
        },
      },
    },
    "/items/selected": {
      get: {
        summary: "List selected items",
        description:
          "Returns a page of selected items in user order. Used for the selected (right) panel. Supports pagination and search by id.",
        parameters: [
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
            description: "Page size",
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 },
            description: "Number of items to skip",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", maxLength: 50 },
            description: "Filter by id (substring match)",
          },
        ],
        responses: {
          "200": {
            description: "Page of selected items",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ItemsPage" },
              },
            },
          },
          "400": {
            description: "Invalid query parameters",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        summary: "Add ids to selection",
        description: "Adds given ids to the selected set. Max 1000 ids per request.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  ids: {
                    type: "array",
                    items: { type: "integer", minimum: 1 },
                    minItems: 1,
                    maxItems: 1000,
                  },
                },
                required: ["ids"],
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Ids added to selection",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    added: {
                      type: "array",
                      items: { type: "integer" },
                    },
                  },
                  required: ["added"],
                },
              },
            },
          },
          "400": {
            description: "Invalid body (e.g. empty or invalid ids)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Reorder selection",
        description:
          "Sets the selected list to the given ordered ids. Order is preserved.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  orderedIds: {
                    type: "array",
                    items: { type: "integer", minimum: 1 },
                    minItems: 1,
                    maxItems: 1000,
                  },
                },
                required: ["orderedIds"],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Selection order updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    orderedIds: {
                      type: "array",
                      items: { type: "integer" },
                    },
                  },
                  required: ["orderedIds"],
                },
              },
            },
          },
          "400": {
            description: "Invalid body",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Item: {
        type: "object",
        properties: { id: { type: "integer", description: "Item id" } },
        required: ["id"],
      },
      ItemsPage: {
        type: "object",
        properties: {
          total: { type: "integer", description: "Total count for the query" },
          limit: { type: "integer", description: "Page size" },
          offset: { type: "integer", description: "Offset used" },
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Item" },
          },
        },
        required: ["total", "limit", "offset", "items"],
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
          details: { type: "object" },
        },
      },
    },
  },
} as const;
