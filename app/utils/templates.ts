const templateToken = /{{\s*([^}]+)\s*}}/g;

export function renderTemplateString(template: string, context: Record<string, unknown>) {
  if (!template || typeof template !== "string") return template;

  return template.replace(templateToken, (_, key: string) => {
    const value = getValueFromContext(context, key.trim());
    return value === undefined ? "" : String(value);
  });
}

export function getValueFromContext(context: Record<string, unknown>, path: string) {
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, context);
}
