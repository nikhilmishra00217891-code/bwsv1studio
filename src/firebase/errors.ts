
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const operation = context.operation.toUpperCase();
    const path = context.path;
    const message = `FirestoreError: Missing or insufficient permissions. The following ${operation} request on '${path}' was denied.`;
    
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
